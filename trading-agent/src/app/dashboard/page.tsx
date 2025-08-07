'use client';

import { useState, useEffect } from 'react';
import { Portfolio, MarketData, AISignal, Order } from '@/types/trading';
import PortfolioOverview from '@/components/trading/PortfolioOverview';
import Watchlist from '@/components/trading/Watchlist';
import TradingPanel from '@/components/trading/TradingPanel';
import AIInsights from '@/components/trading/AIInsights';
import OrderBook from '@/components/trading/OrderBook';
import ChartWidget from '@/components/charts/ChartWidget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Brain,
  Target,
  Shield,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [watchlistData, setWatchlistData] = useState<MarketData[]>([]);
  const [aiSignals, setAISignals] = useState<AISignal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [magicMode, setMagicMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Default watchlist symbols
  const defaultWatchlist = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      
      // Fetch portfolio data
      await fetchPortfolio();
      
      // Fetch watchlist data
      await fetchWatchlistData();
      
      // Fetch AI signals
      await fetchAISignals();
      
      // Fetch orders
      await fetchOrders();
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      // For demo purposes, create a mock portfolio
      const mockPortfolio: Portfolio = {
        id: 'demo-portfolio',
        userId: 'demo-user',
        totalValue: 105000,
        cashBalance: 25000,
        positions: [
          {
            symbol: 'AAPL',
            quantity: 100,
            averagePrice: 150,
            currentPrice: 155,
            marketValue: 15500,
            unrealizedPnL: 500,
            realizedPnL: 0,
            side: 'LONG',
            openDate: new Date('2024-01-15'),
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
        ],
        totalPnL: 5000,
        dailyPnL: 750,
        totalReturn: 5.0,
        dailyReturn: 0.7,
        maxDrawdown: -2.5,
        sharpeRatio: 1.2,
        winRate: 65,
        lastUpdated: new Date(),
      };
      
      setPortfolio(mockPortfolio);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const fetchWatchlistData = async () => {
    try {
      const response = await fetch('/api/market-data/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: defaultWatchlist }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setWatchlistData(data.quotes || []);
      }
    } catch (error) {
      console.error('Error fetching watchlist data:', error);
      // Set mock data as fallback
      setWatchlistData([
        {
          symbol: 'AAPL',
          price: 155.50,
          change: 2.25,
          changePercent: 1.47,
          volume: 50000000,
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
          volume: 25000000,
          high: 147.50,
          low: 144.80,
          open: 146.50,
          close: 146.50,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const fetchAISignals = async () => {
    try {
      const response = await fetch('/api/ai/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: defaultWatchlist }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAISignals(data.signals || []);
      }
    } catch (error) {
      console.error('Error fetching AI signals:', error);
      // Set mock signals as fallback
      setAISignals([
        {
          symbol: 'AAPL',
          action: 'BUY',
          confidence: 0.78,
          reasoning: 'Strong technical indicators with RSI oversold and moving average crossover suggesting upward momentum.',
          technicalIndicators: [],
          riskLevel: 'MEDIUM',
          targetPrice: 165,
          stopLoss: 148,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/trading/order?portfolioId=demo-portfolio');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleOrderPlaced = () => {
    // Refresh orders and portfolio after placing an order
    fetchOrders();
    fetchPortfolio();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your trading dashboard...</p>
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
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  AI Trading Agent
                </h1>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-400">
                DEMO MODE
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/dashboard/advanced', '_blank')}
                className="flex items-center space-x-2 border-purple-500 text-purple-400 hover:bg-purple-600/10"
              >
                <Target className="h-4 w-4" />
                <span>Advanced Engine</span>
              </Button>
              
              <Button
                variant={magicMode ? "default" : "outline"}
                size="sm"
                onClick={() => setMagicMode(!magicMode)}
                className="flex items-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>Magic Mode</span>
              </Button>
              
              <div className="flex items-center space-x-2 text-sm">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-green-400">Market Open</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
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
              onSymbolSelect={handleSymbolSelect}
              selectedSymbol={selectedSymbol}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700"
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>{selectedSymbol} Chart</span>
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
                  height={400}
                />
              </CardContent>
            </Card>

            {/* AI Insights */}
            <AIInsights
              signals={aiSignals.filter(s => s.symbol === selectedSymbol)}
              symbol={selectedSymbol}
              magicMode={magicMode}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700"
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trading Panel */}
            <TradingPanel
              symbol={selectedSymbol}
              portfolio={portfolio}
              onOrderPlaced={handleOrderPlaced}
              magicMode={magicMode}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700"
            />

            {/* Order Book */}
            <OrderBook
              orders={orders}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700"
            />
          </div>
        </div>

        {/* Bottom Section - Detailed Views */}
        <div className="mt-8">
          <Tabs defaultValue="positions" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="positions" className="data-[state=active]:bg-blue-600">
                Positions
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600">
                Orders
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
                History
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="positions" className="mt-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle>Current Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolio?.positions.length ? (
                    <div className="space-y-4">
                      {portfolio.positions.map((position, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div>
                            <h3 className="font-semibold">{position.symbol}</h3>
                            <p className="text-sm text-slate-400">
                              {position.quantity} shares @ ${position.averagePrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${position.marketValue.toLocaleString()}</p>
                            <p className={`text-sm ${position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">No positions yet. Start trading to see your positions here.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length ? (
                    <div className="space-y-4">
                      {orders.map((order, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div>
                            <h3 className="font-semibold">{order.symbol}</h3>
                            <p className="text-sm text-slate-400">
                              {order.side} {order.quantity} @ {order.type}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={order.status === 'FILLED' ? 'default' : order.status === 'PENDING' ? 'secondary' : 'destructive'}
                            >
                              {order.status}
                            </Badge>
                            <p className="text-sm text-slate-400 mt-1">
                              {order.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">No orders yet. Place your first trade to get started!</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle>Trading History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-center py-8">Trade history will appear here once you complete some trades.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolio && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{portfolio.totalReturn.toFixed(1)}%</div>
                        <div className="text-sm text-slate-400">Total Return</div>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">{portfolio.sharpeRatio.toFixed(2)}</div>
                        <div className="text-sm text-slate-400">Sharpe Ratio</div>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">{portfolio.winRate.toFixed(0)}%</div>
                        <div className="text-sm text-slate-400">Win Rate</div>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">{portfolio.maxDrawdown.toFixed(1)}%</div>
                        <div className="text-sm text-slate-400">Max Drawdown</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}