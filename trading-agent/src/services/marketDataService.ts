import axios from 'axios';
import { MarketData, CandlestickData } from '@/types/trading';

class MarketDataService {
  private apiKey: string;
  private baseUrl: string = 'https://www.alphavantage.co/query';
  private wsConnections: Map<string, WebSocket> = new Map();
  private subscribers: Map<string, Set<(data: MarketData) => void>> = new Map();

  constructor() {
    // In production, this should come from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
  }

  // Get real-time quote for a symbol
  async getQuote(symbol: string): Promise<MarketData | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey,
        },
      });

      const quote = response.data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('No data received');
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        close: parseFloat(quote['08. previous close']),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error fetching quote:', error);
      return this.getMockData(symbol); // Fallback to mock data for demo
    }
  }

  // Get historical candlestick data
  async getCandlestickData(
    symbol: string,
    interval: '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' = 'daily',
    outputSize: 'compact' | 'full' = 'compact'
  ): Promise<CandlestickData[]> {
    try {
      const functionMap = {
        '1min': 'TIME_SERIES_INTRADAY',
        '5min': 'TIME_SERIES_INTRADAY',
        '15min': 'TIME_SERIES_INTRADAY',
        '30min': 'TIME_SERIES_INTRADAY',
        '60min': 'TIME_SERIES_INTRADAY',
        'daily': 'TIME_SERIES_DAILY',
      };

      const params: any = {
        function: functionMap[interval],
        symbol: symbol,
        apikey: this.apiKey,
        outputsize: outputSize,
      };

      if (interval !== 'daily') {
        params.interval = interval;
      }

      const response = await axios.get(this.baseUrl, { params });

      let timeSeries: any;
      if (interval === 'daily') {
        timeSeries = response.data['Time Series (Daily)'];
      } else {
        timeSeries = response.data[`Time Series (${interval})`];
      }

      if (!timeSeries) {
        throw new Error('No time series data received');
      }

      return Object.entries(timeSeries)
        .map(([time, data]: [string, any]) => ({
          time: new Date(time).getTime() / 1000,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume']),
        }))
        .sort((a, b) => a.time - b.time);
    } catch (error) {
      console.error('Error fetching candlestick data:', error);
      return this.getMockCandlestickData(symbol); // Fallback to mock data
    }
  }

  // Subscribe to real-time updates for a symbol
  subscribeToSymbol(symbol: string, callback: (data: MarketData) => void): void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.startRealTimeUpdates(symbol);
    }
    
    this.subscribers.get(symbol)!.add(callback);
  }

  // Unsubscribe from real-time updates
  unsubscribeFromSymbol(symbol: string, callback: (data: MarketData) => void): void {
    const symbolSubscribers = this.subscribers.get(symbol);
    if (symbolSubscribers) {
      symbolSubscribers.delete(callback);
      
      if (symbolSubscribers.size === 0) {
        this.subscribers.delete(symbol);
        this.stopRealTimeUpdates(symbol);
      }
    }
  }

  // Start real-time updates (using polling since Alpha Vantage doesn't have WebSocket)
  private startRealTimeUpdates(symbol: string): void {
    const interval = setInterval(async () => {
      const data = await this.getQuote(symbol);
      if (data) {
        const subscribers = this.subscribers.get(symbol);
        if (subscribers) {
          subscribers.forEach(callback => callback(data));
        }
      }
    }, 5000); // Update every 5 seconds

    // Store interval ID for cleanup
    (this as any)[`interval_${symbol}`] = interval;
  }

  // Stop real-time updates
  private stopRealTimeUpdates(symbol: string): void {
    const intervalId = (this as any)[`interval_${symbol}`];
    if (intervalId) {
      clearInterval(intervalId);
      delete (this as any)[`interval_${symbol}`];
    }
  }

  // Get multiple quotes at once
  async getMultipleQuotes(symbols: string[]): Promise<MarketData[]> {
    const promises = symbols.map(symbol => this.getQuote(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<MarketData> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  // Search for symbols
  async searchSymbols(query: string): Promise<Array<{symbol: string, name: string, type: string}>> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: this.apiKey,
        },
      });

      const matches = response.data.bestMatches || [];
      return matches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
      }));
    } catch (error) {
      console.error('Error searching symbols:', error);
      return this.getMockSearchResults(query);
    }
  }

  // Mock data for demo purposes
  private getMockData(symbol: string): MarketData {
    const basePrice = 100 + Math.random() * 900;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000),
      high: basePrice + Math.random() * 5,
      low: basePrice - Math.random() * 5,
      open: basePrice + (Math.random() - 0.5) * 2,
      close: basePrice - change,
      timestamp: new Date(),
    };
  }

  private getMockCandlestickData(symbol: string): CandlestickData[] {
    const data: CandlestickData[] = [];
    const now = Date.now();
    let price = 100 + Math.random() * 900;

    for (let i = 100; i >= 0; i--) {
      const time = (now - i * 24 * 60 * 60 * 1000) / 1000;
      const open = price;
      const change = (Math.random() - 0.5) * 10;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      data.push({
        time,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 1000000),
      });
      
      price = close;
    }
    
    return data;
  }

  private getMockSearchResults(query: string): Array<{symbol: string, name: string, type: string}> {
    const mockSymbols = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity' },
      { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Equity' },
      { symbol: 'AMZN', name: 'Amazon.com, Inc.', type: 'Equity' },
    ];

    return mockSymbols.filter(item => 
      item.symbol.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get market status
  async getMarketStatus(): Promise<{
    market: string;
    localOpen: string;
    localClose: string;
    currentStatus: 'open' | 'closed';
    notes: string;
  }> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'MARKET_STATUS',
          apikey: this.apiKey,
        },
      });

      const markets = response.data.markets;
      const usMarket = markets.find((market: any) => market.region === 'United States');
      
      return {
        market: usMarket?.market_type || 'US Market',
        localOpen: usMarket?.local_open || '09:30',
        localClose: usMarket?.local_close || '16:00',
        currentStatus: usMarket?.current_status || 'closed',
        notes: usMarket?.notes || '',
      };
    } catch (error) {
      console.error('Error fetching market status:', error);
      return {
        market: 'US Market',
        localOpen: '09:30',
        localClose: '16:00',
        currentStatus: 'open',
        notes: 'Demo mode - market status simulated',
      };
    }
  }

  // Cleanup method
  cleanup(): void {
    // Clear all intervals
    this.subscribers.forEach((_, symbol) => {
      this.stopRealTimeUpdates(symbol);
    });
    
    // Clear all subscribers
    this.subscribers.clear();
    
    // Close WebSocket connections
    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.wsConnections.clear();
  }
}

export const marketDataService = new MarketDataService();