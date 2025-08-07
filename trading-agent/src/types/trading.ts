export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: Date;
}

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
}

export interface AISignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  reasoning: string;
  technicalIndicators: TechnicalIndicator[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  targetPrice?: number;
  stopLoss?: number;
  timestamp: Date;
}

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LIMIT';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number; // For limit orders
  stopPrice?: number; // For stop orders
  status: OrderStatus;
  timestamp: Date;
  filledQuantity: number;
  filledPrice?: number;
  commission: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
  side: 'LONG' | 'SHORT';
  openDate: Date;
  stopLoss?: number;
  takeProfit?: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  cashBalance: number;
  positions: Position[];
  totalPnL: number;
  dailyPnL: number;
  totalReturn: number;
  dailyReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  lastUpdated: Date;
}

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  commission: number;
  timestamp: Date;
  pnl?: number;
}

export interface RiskMetrics {
  portfolioRisk: number; // 0-1
  positionRisk: { [symbol: string]: number };
  maxPositionSize: number;
  availableBuyingPower: number;
  marginUsed: number;
  marginAvailable: number;
  dayTradingBuyingPower: number;
}

export interface UserPreferences {
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  maxDailyLoss: number;
  maxPositionSize: number;
  enableAITrading: boolean;
  enableNotifications: boolean;
  preferredTimeframes: string[];
  watchlist: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentimentScore: number; // -1 to 1
  source: string;
  timestamp: Date;
  relatedSymbols: string[];
}

export interface MarketRegime {
  type: 'BULL' | 'BEAR' | 'SIDEWAYS';
  confidence: number;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  timestamp: Date;
}

export interface BacktestResult {
  strategy: string;
  period: {
    start: Date;
    end: Date;
  };
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  trades: Trade[];
}

export interface EducationalTip {
  id: string;
  title: string;
  content: string;
  category: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  trigger: string; // When to show this tip
  hasBeenShown: boolean;
}

export interface CompetitionData {
  userId: string;
  rank: number;
  totalReturn: number;
  trades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  lastUpdated: Date;
}