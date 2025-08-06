import { v4 as uuidv4 } from 'uuid';
import { 
  Order, 
  Position, 
  Portfolio, 
  Trade, 
  OrderType, 
  OrderSide, 
  OrderStatus,
  MarketData,
  RiskMetrics,
  UserPreferences 
} from '@/types/trading';
import { marketDataService } from './marketDataService';

class TradingEngine {
  private portfolios: Map<string, Portfolio> = new Map();
  private orders: Map<string, Order> = new Map();
  private trades: Map<string, Trade> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();
  
  // Commission rates
  private readonly COMMISSION_RATE = 0.001; // 0.1% commission
  private readonly MIN_COMMISSION = 1.0;

  constructor() {
    this.initializeDemoPortfolio();
  }

  // Initialize a demo portfolio for testing
  private initializeDemoPortfolio(): void {
    const demoPortfolio: Portfolio = {
      id: 'demo-portfolio',
      userId: 'demo-user',
      totalValue: 100000,
      cashBalance: 100000,
      positions: [],
      totalPnL: 0,
      dailyPnL: 0,
      totalReturn: 0,
      dailyReturn: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      winRate: 0,
      lastUpdated: new Date(),
    };

    this.portfolios.set('demo-portfolio', demoPortfolio);

    const demoPreferences: UserPreferences = {
      riskTolerance: 'MODERATE',
      maxDailyLoss: 5000,
      maxPositionSize: 10000,
      enableAITrading: true,
      enableNotifications: true,
      preferredTimeframes: ['1min', '5min', '15min', '1hr', '1day'],
      watchlist: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'],
    };

    this.userPreferences.set('demo-user', demoPreferences);
  }

  // Create a new order
  async createOrder(
    portfolioId: string,
    symbol: string,
    side: OrderSide,
    type: OrderType,
    quantity: number,
    price?: number,
    stopPrice?: number
  ): Promise<Order> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // Validate order parameters
    this.validateOrder(portfolio, symbol, side, type, quantity, price, stopPrice);

    const order: Order = {
      id: uuidv4(),
      symbol,
      side,
      type,
      quantity,
      price,
      stopPrice,
      status: 'PENDING',
      timestamp: new Date(),
      filledQuantity: 0,
      commission: 0,
    };

    this.orders.set(order.id, order);

    // For market orders, execute immediately
    if (type === 'MARKET') {
      await this.executeOrder(order.id);
    } else {
      // For limit orders, we would normally wait for market conditions
      // For demo purposes, let's simulate execution with some delay
      setTimeout(() => this.checkAndExecuteOrder(order.id), 1000);
    }

    return order;
  }

  // Validate order before creation
  private validateOrder(
    portfolio: Portfolio,
    symbol: string,
    side: OrderSide,
    type: OrderType,
    quantity: number,
    price?: number,
    stopPrice?: number
  ): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    if (type === 'LIMIT' && !price) {
      throw new Error('Limit orders require a price');
    }

    if ((type === 'STOP_LOSS' || type === 'STOP_LIMIT') && !stopPrice) {
      throw new Error('Stop orders require a stop price');
    }

    // Check buying power for buy orders
    if (side === 'BUY') {
      const estimatedCost = (price || 100) * quantity; // Use price or estimate
      const commission = Math.max(estimatedCost * this.COMMISSION_RATE, this.MIN_COMMISSION);
      const totalCost = estimatedCost + commission;

      if (totalCost > portfolio.cashBalance) {
        throw new Error('Insufficient buying power');
      }
    }

    // Check position availability for sell orders
    if (side === 'SELL') {
      const position = portfolio.positions.find(p => p.symbol === symbol);
      if (!position || position.quantity < quantity) {
        throw new Error('Insufficient position to sell');
      }
    }
  }

  // Execute an order
  async executeOrder(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order || order.status !== 'PENDING') {
      return;
    }

    try {
      // Get current market price
      const marketData = await marketDataService.getQuote(order.symbol);
      if (!marketData) {
        order.status = 'REJECTED';
        return;
      }

      const executionPrice = this.getExecutionPrice(order, marketData);
      const commission = Math.max(executionPrice * order.quantity * this.COMMISSION_RATE, this.MIN_COMMISSION);

      // Update order
      order.status = 'FILLED';
      order.filledQuantity = order.quantity;
      order.filledPrice = executionPrice;
      order.commission = commission;

      // Create trade record
      const trade: Trade = {
        id: uuidv4(),
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: executionPrice,
        commission,
        timestamp: new Date(),
      };

      this.trades.set(trade.id, trade);

      // Update portfolio
      await this.updatePortfolioAfterTrade(trade);

    } catch (error) {
      console.error('Error executing order:', error);
      order.status = 'REJECTED';
    }
  }

  // Get execution price based on order type
  private getExecutionPrice(order: Order, marketData: MarketData): number {
    switch (order.type) {
      case 'MARKET':
        return order.side === 'BUY' ? marketData.price * 1.001 : marketData.price * 0.999; // Simulate slippage
      case 'LIMIT':
        return order.price!;
      case 'STOP_LOSS':
      case 'STOP_LIMIT':
        return marketData.price;
      default:
        return marketData.price;
    }
  }

  // Check and execute pending orders (for limit/stop orders)
  private async checkAndExecuteOrder(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order || order.status !== 'PENDING') {
      return;
    }

    const marketData = await marketDataService.getQuote(order.symbol);
    if (!marketData) {
      return;
    }

    let shouldExecute = false;

    switch (order.type) {
      case 'LIMIT':
        if (order.side === 'BUY' && marketData.price <= order.price!) {
          shouldExecute = true;
        } else if (order.side === 'SELL' && marketData.price >= order.price!) {
          shouldExecute = true;
        }
        break;
      case 'STOP_LOSS':
        if (order.side === 'BUY' && marketData.price >= order.stopPrice!) {
          shouldExecute = true;
        } else if (order.side === 'SELL' && marketData.price <= order.stopPrice!) {
          shouldExecute = true;
        }
        break;
    }

    if (shouldExecute) {
      await this.executeOrder(orderId);
    }
  }

  // Update portfolio after a trade
  private async updatePortfolioAfterTrade(trade: Trade): Promise<void> {
    // Find the portfolio (for demo, we'll use the demo portfolio)
    const portfolio = this.portfolios.get('demo-portfolio');
    if (!portfolio) {
      return;
    }

    const { symbol, side, quantity, price, commission } = trade;

    // Find existing position
    let position = portfolio.positions.find(p => p.symbol === symbol);

    if (side === 'BUY') {
      if (position) {
        // Add to existing position
        const totalCost = position.quantity * position.averagePrice + quantity * price;
        const totalQuantity = position.quantity + quantity;
        position.quantity = totalQuantity;
        position.averagePrice = totalCost / totalQuantity;
      } else {
        // Create new position
        position = {
          symbol,
          quantity,
          averagePrice: price,
          currentPrice: price,
          marketValue: quantity * price,
          unrealizedPnL: 0,
          realizedPnL: 0,
          side: 'LONG',
          openDate: new Date(),
        };
        portfolio.positions.push(position);
      }

      // Decrease cash balance
      portfolio.cashBalance -= (quantity * price + commission);
    } else { // SELL
      if (position) {
        const sellValue = quantity * price;
        const costBasis = quantity * position.averagePrice;
        const realizedPnL = sellValue - costBasis - commission;

        // Update position
        position.quantity -= quantity;
        position.realizedPnL += realizedPnL;

        // If position is closed, remove it
        if (position.quantity <= 0) {
          portfolio.positions = portfolio.positions.filter(p => p.symbol !== symbol);
        }

        // Increase cash balance
        portfolio.cashBalance += (sellValue - commission);

        // Update trade with P&L
        trade.pnl = realizedPnL;
      }
    }

    // Update portfolio metrics
    await this.updatePortfolioMetrics(portfolio);
  }

  // Update portfolio metrics
  private async updatePortfolioMetrics(portfolio: Portfolio): Promise<void> {
    let totalPositionValue = 0;
    let totalUnrealizedPnL = 0;

    // Update current prices and calculate unrealized P&L
    for (const position of portfolio.positions) {
      const marketData = await marketDataService.getQuote(position.symbol);
      if (marketData) {
        position.currentPrice = marketData.price;
        position.marketValue = position.quantity * position.currentPrice;
        position.unrealizedPnL = position.marketValue - (position.quantity * position.averagePrice);
        
        totalPositionValue += position.marketValue;
        totalUnrealizedPnL += position.unrealizedPnL;
      }
    }

    // Calculate total realized P&L
    const totalRealizedPnL = Array.from(this.trades.values())
      .filter(trade => trade.pnl !== undefined)
      .reduce((sum, trade) => sum + (trade.pnl || 0), 0);

    // Update portfolio totals
    portfolio.totalValue = portfolio.cashBalance + totalPositionValue;
    portfolio.totalPnL = totalRealizedPnL + totalUnrealizedPnL;
    portfolio.totalReturn = ((portfolio.totalValue - 100000) / 100000) * 100; // Assuming $100k initial
    portfolio.lastUpdated = new Date();

    // Calculate additional metrics (simplified)
    portfolio.winRate = this.calculateWinRate();
    portfolio.sharpeRatio = this.calculateSharpeRatio();
    portfolio.maxDrawdown = this.calculateMaxDrawdown();
  }

  // Calculate win rate
  private calculateWinRate(): number {
    const completedTrades = Array.from(this.trades.values()).filter(trade => trade.pnl !== undefined);
    if (completedTrades.length === 0) return 0;
    
    const winningTrades = completedTrades.filter(trade => (trade.pnl || 0) > 0);
    return (winningTrades.length / completedTrades.length) * 100;
  }

  // Calculate Sharpe ratio (simplified)
  private calculateSharpeRatio(): number {
    // This is a simplified calculation - in reality, you'd need historical returns
    const portfolio = this.portfolios.get('demo-portfolio');
    if (!portfolio) return 0;
    
    const annualReturn = portfolio.totalReturn;
    const riskFreeRate = 2; // Assume 2% risk-free rate
    const volatility = 15; // Assume 15% volatility for simplification
    
    return (annualReturn - riskFreeRate) / volatility;
  }

  // Calculate maximum drawdown
  private calculateMaxDrawdown(): number {
    // This would require historical portfolio values
    // For now, return a placeholder
    return 0;
  }

  // Get portfolio by ID
  getPortfolio(portfolioId: string): Portfolio | undefined {
    return this.portfolios.get(portfolioId);
  }

  // Get all orders for a portfolio
  getOrdersForPortfolio(portfolioId: string): Order[] {
    // For demo purposes, return all orders
    return Array.from(this.orders.values());
  }

  // Get all trades for a portfolio
  getTradesForPortfolio(portfolioId: string): Trade[] {
    // For demo purposes, return all trades
    return Array.from(this.trades.values());
  }

  // Cancel an order
  cancelOrder(orderId: string): boolean {
    const order = this.orders.get(orderId);
    if (order && order.status === 'PENDING') {
      order.status = 'CANCELLED';
      return true;
    }
    return false;
  }

  // Calculate risk metrics
  calculateRiskMetrics(portfolioId: string): RiskMetrics {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const totalValue = portfolio.totalValue;
    const positionRisk: { [symbol: string]: number } = {};
    let portfolioRisk = 0;

    // Calculate position-level risk
    for (const position of portfolio.positions) {
      const positionValue = Math.abs(position.marketValue);
      const riskPercentage = positionValue / totalValue;
      positionRisk[position.symbol] = riskPercentage;
      portfolioRisk += riskPercentage;
    }

    const userPrefs = this.userPreferences.get(portfolio.userId);
    const maxPositionSize = userPrefs?.maxPositionSize || 10000;

    return {
      portfolioRisk: Math.min(portfolioRisk, 1),
      positionRisk,
      maxPositionSize,
      availableBuyingPower: portfolio.cashBalance,
      marginUsed: 0, // Simplified - not implementing margin trading yet
      marginAvailable: portfolio.cashBalance,
      dayTradingBuyingPower: portfolio.cashBalance * 4, // Simplified PDT calculation
    };
  }

  // Get order by ID
  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  // Update user preferences
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
    const currentPrefs = this.userPreferences.get(userId) || {} as UserPreferences;
    const updatedPrefs = { ...currentPrefs, ...preferences };
    this.userPreferences.set(userId, updatedPrefs);
  }

  // Get user preferences
  getUserPreferences(userId: string): UserPreferences | undefined {
    return this.userPreferences.get(userId);
  }

  // Close position (market sell all shares)
  async closePosition(portfolioId: string, symbol: string): Promise<Order> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const position = portfolio.positions.find(p => p.symbol === symbol);
    if (!position) {
      throw new Error('Position not found');
    }

    return await this.createOrder(
      portfolioId,
      symbol,
      'SELL',
      'MARKET',
      position.quantity
    );
  }

  // Set stop loss for a position
  async setStopLoss(portfolioId: string, symbol: string, stopPrice: number): Promise<Order> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const position = portfolio.positions.find(p => p.symbol === symbol);
    if (!position) {
      throw new Error('Position not found');
    }

    // Update position stop loss
    position.stopLoss = stopPrice;

    // Create stop loss order
    return await this.createOrder(
      portfolioId,
      symbol,
      'SELL',
      'STOP_LOSS',
      position.quantity,
      undefined,
      stopPrice
    );
  }
}

export const tradingEngine = new TradingEngine();