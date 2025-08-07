'use client';

import { useState, useEffect } from 'react';
import { Portfolio, MarketData, AISignal, Order } from '@/types/trading';
import TradingEngine from '@/components/trading/TradingEngine';
import PortfolioOverview from '@/components/trading/PortfolioOverview';
import Watchlist from '@/components/trading/Watchlist';
import ChartWidget from '@/components/charts/ChartWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Activity, 
  Settings,
  ArrowLeft,
  Zap,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdvancedTradingDashboard() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [watchlistData, setWatchlistData] = useState<MarketData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [currentMarketData, setCurrentMarketData] = useState<MarketData | null>(null);
  const [aiSignal, setAISignal] = useState<AISignal | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Default watchlist symbols
  const defaultWatchlist = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      fetchSymbolData(selectedSymbol);
    }
  }, [selectedSymbol]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      
      // Initialize demo portfolio
      const mockPortfolio: Portfolio = {
        id: 'demo-portfolio',
        userId: 'demo-user',
        totalValue: 125000,
        cashBalance: 45000,
        positions: [
          {
            symbol: 'AAPL',
            quantity: 100,
            averagePrice: 150,
            currentPrice: 155,
            marketValue: 15500,
            unrealizedPnL: 500,
            realizedPnL: 250,
            side: 'LONG',
            openDate: new Date('2024-01-15'),
            stopLoss: 145,
          },
          {
            symbol: 'GOOGL',
            quantity: 50,
            averagePrice: 140,
            currentPrice: 145,
            marketValue: 7250,
            unrealizedPnL: 250,
            realizedPnL: 0,
            side: 'LONG',
            openDate: new Date('2024-01-20'),
          },
          {
            symbol: 'TSLA',
            quantity: 75,
            averagePrice: 200,
            currentPrice: 195,
            marketValue: 14625,
            unrealizedPnL: -375,
            realizedPnL: 0,
            side: 'LONG',
            openDate: new Date('2024-02-01'),
          },
        ],
        totalPnL: 6250,
        dailyPnL: 1250,
        totalReturn: 6.2,
        dailyReturn: 1.0,
        maxDrawdown: -3.2,
        sharpeRatio: 1.4,
        winRate: 68,
        lastUpdated: new Date(),
      };
      
      setPortfolio(mockPortfolio);
      
      // Fetch watchlist data
      await fetchWatchlistData();
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlistData = async () => {
    try {
      // Create mock watchlist data
      const mockWatchlistData: MarketData[] = [
        {
          symbol: 'AAPL',
          price: 155.50,
          change: 2.25,
          changePercent: 1.47,
          volume: 52000000,
          high: 157.20,
          low: 153.10,
          open: 154.00,
          close: 153.25,
          timestamp: new Date(),
        },
        {
          symbol: 'GOOGL',
          price: 145.30,
          change: -1.20,
          changePercent: -0.82,
          volume: 28000000,
          high: 147.50,
          low: 144.80,
          open: 146.50,
          close: 146.50,
          timestamp: new Date(),
        },
        {
          symbol: 'MSFT',
          price: 380.75,
          change: 5.25,
          changePercent: 1.40,
          volume: 35000000,
          high: 382.00,
          low: 378.50,
          open: 379.00,
          close: 375.50,
          timestamp: new Date(),
        },
        {
          symbol: 'TSLA',
          price: 195.80,
          change: -3.45,
          changePercent: -1.73,
          volume: 45000000,
          high: 201.20,
          low: 194.50,
          open: 199.25,
          close: 199.25,
          timestamp: new Date(),
        },
        {
          symbol: 'AMZN',
          price: 142.50,
          change: 1.85,
          changePercent: 1.32,
          volume: 31000000,
          high: 143.75,
          low: 140.25,
          open: 141.00,
          close: 140.65,
          timestamp: new Date(),
        },
      ];
      
      setWatchlistData(mockWatchlistData);
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
    }
  };

  const fetchSymbolData = async (symbol: string) => {
    try {
      // Find market data for selected symbol
      const marketData = watchlistData.find(item => item.symbol === symbol) || {
        symbol,
        price: 150 + Math.random() * 100,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 50000000) + 10000000,
        high: 0,
        low: 0,
        open: 0,
        close: 0,
        timestamp: new Date(),
      };

      // Calculate high/low/open/close if not set
      if (marketData.high === 0) {
        marketData.high = marketData.price + Math.random() * 5;
        marketData.low = marketData.price - Math.random() * 5;
        marketData.open = marketData.price + (Math.random() - 0.5) * 3;
        marketData.close = marketData.price - marketData.change;
      }

      setCurrentMarketData(marketData);

      // Generate AI signal for the symbol
      const mockAISignal: AISignal = {
        symbol,
        action: Math.random() > 0.6 ? 'BUY' : Math.random() > 0.3 ? 'SELL' : 'HOLD',
        confidence: 0.65 + Math.random() * 0.3,
        reasoning: `Technical analysis shows ${symbol} has strong momentum indicators with RSI at ${(30 + Math.random() * 40).toFixed(1)} and moving average convergence suggesting ${Math.random() > 0.5 ? 'bullish' : 'bearish'} sentiment. Volume analysis supports the signal with above-average trading activity.`,
        technicalIndicators: [
          {
            name: 'RSI',
            value: 30 + Math.random() * 40,
            signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
            confidence: 0.7 + Math.random() * 0.3,
          },
          {
            name: 'MACD',
            value: (Math.random() - 0.5) * 2,
            signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
            confidence: 0.6 + Math.random() * 0.3,
          },
        ],
        riskLevel: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW',
        targetPrice: marketData.price * (1 + (Math.random() * 0.1 + 0.02)),
        stopLoss: marketData.price * (1 - (Math.random() * 0.05 + 0.02)),
        timestamp: new Date(),
      };

      setAISignal(mockAISignal);

    } catch (error) {
      console.error('Error fetching symbol data:', error);
    }
  };

  const handleOrderExecuted = (order: Order) => {
    setRecentOrders(prev => [order, ...prev.slice(0, 9)]); // Keep last 10 orders
    
    // Simulate portfolio update
    if (portfolio) {
      const updatedPortfolio = { ...portfolio };
      updatedPortfolio.lastUpdated = new Date();
      
      // Simple portfolio update simulation
      if (order.side === 'BUY' && order.filledPrice) {
        updatedPortfolio.cashBalance -= (order.filledQuantity * order.filledPrice + order.commission);
      } else if (order.side === 'SELL' && order.filledPrice) {
        updatedPortfolio.cashBalance += (order.filledQuantity * order.filledPrice - order.commission);
      }
      
      setPortfolio(updatedPortfolio);
    }
  };

  const handlePortfolioUpdated = (updatedPortfolio: Portfolio) => {
    setPortfolio(updatedPortfolio);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Advanced Trading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Advanced Trading Engine
                </h1>
              </div>
              
              <Badge variant="outline" className="border-green-500 text-green-400">
                LIVE DEMO
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-green-400">Market Open</span>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {selectedSymbol} • {currentMarketData ? `$${currentMarketData.price.toFixed(2)}` : 'Loading...'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Portfolio Overview */}
            {portfolio && (
              <PortfolioOverview 
                portfolio={portfolio} 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700" 
              />
            )}
            
            {/* Watchlist */}
            <Watchlist
              data={watchlistData}
              onSymbolSelect={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700"
            />
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Chart */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>{selectedSymbol} Advanced Chart</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      Real-time
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWidget 
                  symbol={selectedSymbol}
                  height={450}
                />
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  <span>Recent Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.slice(0, 5).map((order, index) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={order.side === 'BUY' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {order.side}
                          </Badge>
                          <span className="font-medium">{order.symbol}</span>
                          <span className="text-sm text-slate-400">{order.quantity} shares</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ${order.filledPrice?.toFixed(2) || 'Pending'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {order.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent orders</p>
                    <p className="text-xs mt-2">Orders will appear here after execution</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Trading Engine */}
          <div className="xl:col-span-1">
            <TradingEngine
              symbol={selectedSymbol}
              marketData={currentMarketData}
              portfolio={portfolio}
              aiSignal={aiSignal || undefined}
              onOrderExecuted={handleOrderExecuted}
              onPortfolioUpdated={handlePortfolioUpdated}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 sticky top-24"
            />
          </div>
        </div>

        {/* Bottom Section - Performance Metrics */}
        <div className="mt-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <span>Trading Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {portfolio && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {portfolio.totalReturn.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-400">Total Return</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {portfolio.sharpeRatio.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-400">Sharpe Ratio</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {portfolio.winRate.toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-400">Win Rate</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">
                      {portfolio.maxDrawdown.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-400">Max Drawdown</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {portfolio.positions.length}
                    </div>
                    <div className="text-sm text-slate-400">Active Positions</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      ${(portfolio.cashBalance / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-slate-400">Available Cash</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}