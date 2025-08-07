'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Portfolio, Order, MarketData, OrderType, OrderSide, AISignal } from '@/types/trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Target,
  Shield,
  Zap,
  DollarSign,
  Percent,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Brain,
  Calculator
} from 'lucide-react';
import { formatCurrency, formatPercentage, getChangeColor, cn } from '@/lib/utils';

interface TradingEngineProps {
  symbol: string;
  marketData: MarketData | null;
  portfolio: Portfolio | null;
  aiSignal?: AISignal;
  onOrderExecuted: (order: Order) => void;
  onPortfolioUpdated: (portfolio: Portfolio) => void;
  className?: string;
}

interface OrderForm {
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce: 'DAY' | 'GTC' | 'IOC' | 'FOK';
}

export default function TradingEngine({
  symbol,
  marketData,
  portfolio,
  aiSignal,
  onOrderExecuted,
  onPortfolioUpdated,
  className
}: TradingEngineProps) {
  const [orderForm, setOrderForm] = useState<OrderForm>({
    side: 'BUY',
    type: 'MARKET',
    quantity: 10,
    timeInForce: 'DAY'
  });
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [positionSizing, setPositionSizing] = useState({
    riskPercent: 2, // 2% of portfolio at risk
    useAIRecommendation: true,
    maxPositionPercent: 10 // Max 10% of portfolio in single position
  });

  // Calculate order metrics
  const orderMetrics = React.useMemo(() => {
    if (!marketData || !portfolio) return null;

    const currentPrice = marketData.price;
    const estimatedPrice = orderForm.type === 'MARKET' ? currentPrice : 
                          orderForm.type === 'LIMIT' ? (orderForm.price || currentPrice) : 
                          currentPrice;

    const totalValue = orderForm.quantity * estimatedPrice;
    const commission = Math.max(totalValue * 0.001, 1.0); // 0.1% commission, min $1
    const totalCost = orderForm.side === 'BUY' ? totalValue + commission : totalValue - commission;

    // Risk calculations
    const stopLossPrice = orderForm.side === 'BUY' ? 
      (orderForm.stopPrice || estimatedPrice * 0.95) :
      (orderForm.stopPrice || estimatedPrice * 1.05);
    
    const riskPerShare = Math.abs(estimatedPrice - stopLossPrice);
    const totalRisk = riskPerShare * orderForm.quantity;
    const riskPercent = (totalRisk / portfolio.totalValue) * 100;

    // Position sizing recommendation
    const maxRiskAmount = portfolio.totalValue * (positionSizing.riskPercent / 100);
    const recommendedQuantity = Math.floor(maxRiskAmount / riskPerShare);
    const maxPositionValue = portfolio.totalValue * (positionSizing.maxPositionPercent / 100);
    const maxQuantityByPosition = Math.floor(maxPositionValue / estimatedPrice);

    return {
      estimatedPrice,
      totalValue,
      commission,
      totalCost,
      riskPerShare,
      totalRisk,
      riskPercent,
      recommendedQuantity: Math.min(recommendedQuantity, maxQuantityByPosition),
      maxQuantityByPosition,
      availableBuyingPower: portfolio.cashBalance,
      marginRequired: orderForm.side === 'SELL' ? 0 : totalCost,
      canAfford: orderForm.side === 'BUY' ? totalCost <= portfolio.cashBalance : true
    };
  }, [orderForm, marketData, portfolio, positionSizing]);

  // Auto-fill AI recommendation
  useEffect(() => {
    if (aiSignal && positionSizing.useAIRecommendation && orderMetrics) {
      setOrderForm(prev => ({
        ...prev,
        side: aiSignal.action === 'HOLD' ? prev.side : aiSignal.action,
        quantity: orderMetrics.recommendedQuantity > 0 ? orderMetrics.recommendedQuantity : prev.quantity,
        stopPrice: aiSignal.stopLoss
      }));
    }
  }, [aiSignal, positionSizing.useAIRecommendation, orderMetrics]);

  // Validate order
  const orderValidation = React.useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!portfolio || !marketData || !orderMetrics) {
      errors.push('Missing required data');
      return { errors, warnings, isValid: false };
    }

    // Basic validations
    if (orderForm.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (orderForm.type === 'LIMIT' && (!orderForm.price || orderForm.price <= 0)) {
      errors.push('Limit orders require a valid price');
    }

    if (['STOP_LOSS', 'STOP_LIMIT'].includes(orderForm.type) && (!orderForm.stopPrice || orderForm.stopPrice <= 0)) {
      errors.push('Stop orders require a valid stop price');
    }

    // Financial validations
    if (orderForm.side === 'BUY' && !orderMetrics.canAfford) {
      errors.push(`Insufficient funds. Need ${formatCurrency(orderMetrics.totalCost)}, have ${formatCurrency(orderMetrics.availableBuyingPower)}`);
    }

    if (orderForm.side === 'SELL') {
      const position = portfolio.positions.find(p => p.symbol === symbol);
      if (!position || position.quantity < orderForm.quantity) {
        errors.push(`Insufficient shares. Need ${orderForm.quantity}, have ${position?.quantity || 0}`);
      }
    }

    // Risk warnings
    if (orderMetrics.riskPercent > 5) {
      warnings.push(`High risk: ${orderMetrics.riskPercent.toFixed(1)}% of portfolio at risk`);
    }

    if (orderForm.quantity > orderMetrics.maxQuantityByPosition) {
      warnings.push(`Large position: Exceeds ${positionSizing.maxPositionPercent}% position limit`);
    }

    // Price warnings
    if (orderForm.type === 'LIMIT' && orderForm.price) {
      const priceDeviation = Math.abs(orderForm.price - marketData.price) / marketData.price * 100;
      if (priceDeviation > 5) {
        warnings.push(`Limit price is ${priceDeviation.toFixed(1)}% away from market price`);
      }
    }

    return {
      errors,
      warnings,
      isValid: errors.length === 0
    };
  }, [orderForm, portfolio, marketData, symbol, orderMetrics, positionSizing.maxPositionPercent]);

  // Execute order
  const executeOrder = useCallback(async () => {
    if (!orderValidation.isValid || !portfolio) return;

    setIsExecuting(true);
    setExecutionStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/trading/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          symbol,
          side: orderForm.side,
          type: orderForm.type,
          quantity: orderForm.quantity,
          price: orderForm.price,
          stopPrice: orderForm.stopPrice,
          timeInForce: orderForm.timeInForce
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setExecutionStatus({
          type: 'success',
          message: `${orderForm.side} order for ${orderForm.quantity} shares of ${symbol} executed successfully!`
        });
        
        onOrderExecuted(result);
        
        // Reset form for next order
        setOrderForm(prev => ({
          ...prev,
          quantity: orderMetrics?.recommendedQuantity || 10
        }));
      } else {
        setExecutionStatus({
          type: 'error',
          message: result.error || 'Failed to execute order'
        });
      }
    } catch (error) {
      setExecutionStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsExecuting(false);
    }
  }, [orderForm, orderValidation.isValid, portfolio, symbol, onOrderExecuted, orderMetrics]);

  // Quick order buttons
  const executeQuickOrder = useCallback(async (side: OrderSide, percentage: number) => {
    if (!portfolio || !marketData || !orderMetrics) return;

    const maxValue = side === 'BUY' ? 
      portfolio.cashBalance * (percentage / 100) :
      (portfolio.positions.find(p => p.symbol === symbol)?.marketValue || 0) * (percentage / 100);
    
    const quantity = Math.floor(maxValue / marketData.price);
    
    if (quantity > 0) {
      setOrderForm(prev => ({
        ...prev,
        side,
        type: 'MARKET',
        quantity
      }));
      
      // Auto-execute after a brief delay
      setTimeout(() => executeOrder(), 500);
    }
  }, [portfolio, marketData, symbol, orderMetrics, executeOrder]);

  if (!marketData) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="text-center py-8">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-400" />
          <p className="text-slate-400">Loading market data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            <span>Trading Engine</span>
          </span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {symbol}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatCurrency(marketData.price)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Execution Status */}
        {executionStatus.type && (
          <div className={cn(
            "p-3 rounded-lg border flex items-center space-x-2",
            executionStatus.type === 'success' && "bg-green-600/10 border-green-600/20 text-green-400",
            executionStatus.type === 'error' && "bg-red-600/10 border-red-600/20 text-red-400",
            executionStatus.type === 'warning' && "bg-yellow-600/10 border-yellow-600/20 text-yellow-400"
          )}>
            {executionStatus.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {executionStatus.type === 'error' && <XCircle className="h-4 w-4" />}
            {executionStatus.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
            <span className="text-sm">{executionStatus.message}</span>
          </div>
        )}

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ai-assisted">AI Assisted</TabsTrigger>
            <TabsTrigger value="quick">Quick Trade</TabsTrigger>
          </TabsList>

          {/* Manual Trading */}
          <TabsContent value="manual" className="space-y-4">
            {/* Order Side */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={orderForm.side === 'BUY' ? 'default' : 'outline'}
                onClick={() => setOrderForm(prev => ({ ...prev, side: 'BUY' }))}
                className={cn(
                  "flex items-center space-x-2",
                  orderForm.side === 'BUY' 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "border-green-600 text-green-400 hover:bg-green-600/10"
                )}
              >
                <TrendingUp className="h-4 w-4" />
                <span>BUY</span>
              </Button>
              <Button
                variant={orderForm.side === 'SELL' ? 'default' : 'outline'}
                onClick={() => setOrderForm(prev => ({ ...prev, side: 'SELL' }))}
                className={cn(
                  "flex items-center space-x-2",
                  orderForm.side === 'SELL' 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "border-red-600 text-red-400 hover:bg-red-600/10"
                )}
              >
                <TrendingDown className="h-4 w-4" />
                <span>SELL</span>
              </Button>
            </div>

            {/* Order Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Order Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LIMIT'] as OrderType[]).map(type => (
                  <Button
                    key={type}
                    variant={orderForm.type === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderForm(prev => ({ ...prev, type }))}
                    className="text-xs"
                  >
                    {type.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Quantity</label>
                {orderMetrics && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOrderForm(prev => ({ 
                      ...prev, 
                      quantity: orderMetrics.recommendedQuantity 
                    }))}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Use Recommended ({orderMetrics.recommendedQuantity})
                  </Button>
                )}
              </div>
              <input
                type="number"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                min="1"
              />
            </div>

            {/* Price inputs */}
            {orderForm.type === 'LIMIT' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Limit Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    value={orderForm.price || ''}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white"
                    step="0.01"
                    placeholder={marketData.price.toFixed(2)}
                  />
                </div>
              </div>
            )}

            {['STOP_LOSS', 'STOP_LIMIT'].includes(orderForm.type) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Stop Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    value={orderForm.stopPrice || ''}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, stopPrice: Number(e.target.value) }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-slate-400 hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
              
              {showAdvanced && (
                <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Time in Force</label>
                    <select
                      value={orderForm.timeInForce}
                      onChange={(e) => setOrderForm(prev => ({ 
                        ...prev, 
                        timeInForce: e.target.value as 'DAY' | 'GTC' | 'IOC' | 'FOK' 
                      }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="DAY">Day Order</option>
                      <option value="GTC">Good Till Cancelled</option>
                      <option value="IOC">Immediate or Cancel</option>
                      <option value="FOK">Fill or Kill</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Risk Management</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400">Risk %</label>
                        <input
                          type="number"
                          value={positionSizing.riskPercent}
                          onChange={(e) => setPositionSizing(prev => ({ 
                            ...prev, 
                            riskPercent: Number(e.target.value) 
                          }))}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                          min="0.1"
                          max="10"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Max Position %</label>
                        <input
                          type="number"
                          value={positionSizing.maxPositionPercent}
                          onChange={(e) => setPositionSizing(prev => ({ 
                            ...prev, 
                            maxPositionPercent: Number(e.target.value) 
                          }))}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                          min="1"
                          max="50"
                          step="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* AI Assisted Trading */}
          <TabsContent value="ai-assisted" className="space-y-4">
            {aiSignal ? (
              <div className="space-y-4">
                <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <span className="font-medium text-purple-300">AI Recommendation</span>
                    <Badge className="bg-purple-600 text-white text-xs">
                      {Math.round(aiSignal.confidence * 100)}% Confidence
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-slate-400">Action</div>
                      <div className={cn(
                        "font-semibold",
                        aiSignal.action === 'BUY' && "text-green-400",
                        aiSignal.action === 'SELL' && "text-red-400",
                        aiSignal.action === 'HOLD' && "text-slate-400"
                      )}>
                        {aiSignal.action}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Risk Level</div>
                      <div className={cn(
                        "font-semibold",
                        aiSignal.riskLevel === 'LOW' && "text-green-400",
                        aiSignal.riskLevel === 'MEDIUM' && "text-yellow-400",
                        aiSignal.riskLevel === 'HIGH' && "text-red-400"
                      )}>
                        {aiSignal.riskLevel}
                      </div>
                    </div>
                  </div>

                  {aiSignal.targetPrice && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-slate-400">Target Price</div>
                        <div className="font-semibold text-blue-400">
                          {formatCurrency(aiSignal.targetPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Stop Loss</div>
                        <div className="font-semibold text-red-400">
                          {aiSignal.stopLoss ? formatCurrency(aiSignal.stopLoss) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-300 bg-slate-800/50 rounded p-2">
                    {aiSignal.reasoning}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use-ai-recommendation"
                    checked={positionSizing.useAIRecommendation}
                    onChange={(e) => setPositionSizing(prev => ({ 
                      ...prev, 
                      useAIRecommendation: e.target.checked 
                    }))}
                    className="rounded"
                  />
                  <label htmlFor="use-ai-recommendation" className="text-sm text-slate-300">
                    Use AI recommendations for position sizing
                  </label>
                </div>

                {aiSignal.action !== 'HOLD' && (
                  <Button
                    onClick={() => {
                      setOrderForm(prev => ({
                        ...prev,
                        side: aiSignal.action,
                        type: 'MARKET',
                        quantity: orderMetrics?.recommendedQuantity || prev.quantity,
                        stopPrice: aiSignal.stopLoss
                      }));
                      executeOrder();
                    }}
                    disabled={isExecuting || !orderValidation.isValid}
                    className={cn(
                      "w-full",
                      aiSignal.action === 'BUY' 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-red-600 hover:bg-red-700"
                    )}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Execute AI {aiSignal.action} Signal
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No AI signal available</p>
                <p className="text-xs mt-2">AI analysis is loading...</p>
              </div>
            )}
          </TabsContent>

          {/* Quick Trade */}
          <TabsContent value="quick" className="space-y-4">
            <div className="text-sm text-slate-400 mb-4">
              Quick trade buttons for instant execution
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-300">Buy Orders</div>
              <div className="grid grid-cols-3 gap-2">
                {[25, 50, 100].map(percentage => (
                  <Button
                    key={`buy-${percentage}`}
                    onClick={() => executeQuickOrder('BUY', percentage)}
                    disabled={isExecuting}
                    className="bg-green-600 hover:bg-green-700 text-xs"
                  >
                    Buy {percentage}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-300">Sell Orders</div>
              <div className="grid grid-cols-3 gap-2">
                {[25, 50, 100].map(percentage => (
                  <Button
                    key={`sell-${percentage}`}
                    onClick={() => executeQuickOrder('SELL', percentage)}
                    disabled={isExecuting}
                    className="bg-red-600 hover:bg-red-700 text-xs"
                  >
                    Sell {percentage}%
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Order Summary */}
        {orderMetrics && (
          <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Order Summary</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Estimated Price</div>
                <div className="text-white font-medium">{formatCurrency(orderMetrics.estimatedPrice)}</div>
              </div>
              <div>
                <div className="text-slate-400">Total Value</div>
                <div className="text-white font-medium">{formatCurrency(orderMetrics.totalValue)}</div>
              </div>
              <div>
                <div className="text-slate-400">Commission</div>
                <div className="text-white font-medium">{formatCurrency(orderMetrics.commission)}</div>
              </div>
              <div>
                <div className="text-slate-400">Total Cost</div>
                <div className="text-white font-medium">{formatCurrency(orderMetrics.totalCost)}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-600">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Risk per Share</div>
                  <div className="text-white font-medium">{formatCurrency(orderMetrics.riskPerShare)}</div>
                </div>
                <div>
                  <div className="text-slate-400">Total Risk</div>
                  <div className={cn(
                    "font-medium",
                    orderMetrics.riskPercent > 5 ? "text-red-400" : 
                    orderMetrics.riskPercent > 2 ? "text-yellow-400" : "text-green-400"
                  )}>
                    {formatCurrency(orderMetrics.totalRisk)} ({orderMetrics.riskPercent.toFixed(1)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Messages */}
        {orderValidation.errors.length > 0 && (
          <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Order Errors</span>
            </div>
            <ul className="text-xs text-red-300 space-y-1">
              {orderValidation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {orderValidation.warnings.length > 0 && (
          <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Warnings</span>
            </div>
            <ul className="text-xs text-yellow-300 space-y-1">
              {orderValidation.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Execute Button */}
        <Button
          onClick={executeOrder}
          disabled={isExecuting || !orderValidation.isValid}
          className={cn(
            "w-full",
            orderForm.side === 'BUY' 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-red-600 hover:bg-red-700"
          )}
        >
          {isExecuting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Executing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {orderForm.side === 'BUY' ? 
                <TrendingUp className="h-4 w-4" /> : 
                <TrendingDown className="h-4 w-4" />
              }
              <span>
                {orderForm.side} {orderForm.quantity} {symbol} @ {orderForm.type}
              </span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}