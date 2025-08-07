import React, { useState } from 'react';
import { Portfolio } from '@/types/trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface TradingPanelProps {
  symbol: string;
  portfolio: Portfolio | null;
  onOrderPlaced: () => void;
  magicMode: boolean;
  className?: string;
}

export default function TradingPanel({ symbol, portfolio, onOrderPlaced, magicMode, className }: TradingPanelProps) {
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!portfolio) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/trading/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          symbol,
          side: orderType,
          type: 'MARKET',
          quantity,
        }),
      });

      if (response.ok) {
        onOrderPlaced();
        // Show success message
        alert(`${orderType} order for ${quantity} shares of ${symbol} placed successfully!`);
      } else {
        const error = await response.json();
        alert(`Error placing order: ${error.error}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            <span>Trade {symbol}</span>
          </span>
          {magicMode && (
            <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
              AI Assisted
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Order Type Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={orderType === 'BUY' ? 'default' : 'outline'}
            onClick={() => setOrderType('BUY')}
            className={cn(
              "flex items-center space-x-2",
              orderType === 'BUY' ? "bg-green-600 hover:bg-green-700" : "border-green-600 text-green-400 hover:bg-green-600/10"
            )}
          >
            <TrendingUp className="h-4 w-4" />
            <span>BUY</span>
          </Button>
          <Button
            variant={orderType === 'SELL' ? 'default' : 'outline'}
            onClick={() => setOrderType('SELL')}
            className={cn(
              "flex items-center space-x-2",
              orderType === 'SELL' ? "bg-red-600 hover:bg-red-700" : "border-red-600 text-red-400 hover:bg-red-600/10"
            )}
          >
            <TrendingDown className="h-4 w-4" />
            <span>SELL</span>
          </Button>
        </div>

        {/* Quantity Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Quantity</label>
          <div className="relative">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter quantity"
              min="1"
            />
            <div className="absolute right-3 top-2 text-sm text-slate-400">
              shares
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-slate-300">Order Summary</div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Symbol</span>
              <span className="text-white">{symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Side</span>
              <span className={cn("font-medium", orderType === 'BUY' ? 'text-green-400' : 'text-red-400')}>
                {orderType}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Quantity</span>
              <span className="text-white">{quantity} shares</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Order Type</span>
              <span className="text-white">Market</span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t border-slate-600 pt-2">
              <span className="text-slate-300">Est. Total</span>
              <span className="text-white">~{formatCurrency(quantity * 150)}</span>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        {portfolio && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Available Cash</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-green-400 font-medium">
                {formatCurrency(portfolio.cashBalance)}
              </span>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          disabled={loading || !portfolio}
          className={cn(
            "w-full",
            orderType === 'BUY' 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-red-600 hover:bg-red-700"
          )}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Placing Order...</span>
            </div>
          ) : (
            `Place ${orderType} Order`
          )}
        </Button>

        {/* Risk Warning */}
        <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-3">
          <div className="text-xs text-yellow-300">
            <strong>Risk Warning:</strong> Trading involves substantial risk of loss. 
            This is a demo environment with simulated funds.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}