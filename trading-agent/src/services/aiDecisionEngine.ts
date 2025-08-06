import { 
  AISignal, 
  TechnicalIndicator, 
  CandlestickData, 
  MarketData, 
  MarketRegime,
  NewsItem 
} from '@/types/trading';
import { marketDataService } from './marketDataService';

class AIDecisionEngine {
  private readonly RSI_PERIOD = 14;
  private readonly SMA_SHORT_PERIOD = 10;
  private readonly SMA_LONG_PERIOD = 50;
  private readonly MACD_FAST = 12;
  private readonly MACD_SLOW = 26;
  private readonly MACD_SIGNAL = 9;

  // Main method to generate AI trading signal
  async generateSignal(symbol: string): Promise<AISignal> {
    try {
      // Get market data
      const marketData = await marketDataService.getQuote(symbol);
      const candlestickData = await marketDataService.getCandlestickData(symbol, 'daily');
      
      if (!marketData || !candlestickData || candlestickData.length < 50) {
        throw new Error('Insufficient data for analysis');
      }

      // Calculate technical indicators
      const technicalIndicators = this.calculateTechnicalIndicators(candlestickData);
      
      // Analyze market regime
      const marketRegime = this.analyzeMarketRegime(candlestickData);
      
      // Generate trading decision
      const decision = this.makeDecision(technicalIndicators, marketRegime, marketData);
      
      // Calculate confidence based on indicator alignment
      const confidence = this.calculateConfidence(technicalIndicators, marketRegime);
      
      // Generate reasoning
      const reasoning = this.generateReasoning(technicalIndicators, marketRegime, decision);
      
      // Determine risk level
      const riskLevel = this.assessRiskLevel(marketData, marketRegime, confidence);
      
      // Calculate target price and stop loss
      const { targetPrice, stopLoss } = this.calculatePriceTargets(
        marketData, 
        decision.action, 
        technicalIndicators
      );

      return {
        symbol,
        action: decision.action,
        confidence,
        reasoning,
        technicalIndicators,
        riskLevel,
        targetPrice,
        stopLoss,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('Error generating AI signal:', error);
      return this.generateFallbackSignal(symbol);
    }
  }

  // Calculate various technical indicators
  private calculateTechnicalIndicators(data: CandlestickData[]): TechnicalIndicator[] {
    const indicators: TechnicalIndicator[] = [];
    
    // RSI (Relative Strength Index)
    const rsi = this.calculateRSI(data);
    indicators.push({
      name: 'RSI',
      value: rsi,
      signal: rsi > 70 ? 'SELL' : rsi < 30 ? 'BUY' : 'HOLD',
      confidence: rsi > 80 || rsi < 20 ? 0.9 : rsi > 70 || rsi < 30 ? 0.7 : 0.3,
    });

    // Simple Moving Averages
    const smaShort = this.calculateSMA(data, this.SMA_SHORT_PERIOD);
    const smaLong = this.calculateSMA(data, this.SMA_LONG_PERIOD);
    const currentPrice = data[data.length - 1].close;
    
    indicators.push({
      name: 'SMA_10',
      value: smaShort,
      signal: currentPrice > smaShort ? 'BUY' : 'SELL',
      confidence: Math.abs(currentPrice - smaShort) / currentPrice > 0.02 ? 0.7 : 0.4,
    });

    indicators.push({
      name: 'SMA_50',
      value: smaLong,
      signal: currentPrice > smaLong ? 'BUY' : 'SELL',
      confidence: Math.abs(currentPrice - smaLong) / currentPrice > 0.05 ? 0.8 : 0.4,
    });

    // Moving Average Crossover
    indicators.push({
      name: 'MA_CROSSOVER',
      value: smaShort - smaLong,
      signal: smaShort > smaLong ? 'BUY' : 'SELL',
      confidence: Math.abs(smaShort - smaLong) / smaLong > 0.02 ? 0.8 : 0.5,
    });

    // MACD
    const macd = this.calculateMACD(data);
    indicators.push({
      name: 'MACD',
      value: macd.macdLine,
      signal: macd.macdLine > macd.signalLine ? 'BUY' : 'SELL',
      confidence: Math.abs(macd.macdLine - macd.signalLine) > 0.5 ? 0.7 : 0.4,
    });

    // Bollinger Bands
    const bollinger = this.calculateBollingerBands(data);
    const bollingerSignal = currentPrice < bollinger.lower ? 'BUY' : 
                           currentPrice > bollinger.upper ? 'SELL' : 'HOLD';
    indicators.push({
      name: 'BOLLINGER_BANDS',
      value: (currentPrice - bollinger.middle) / bollinger.middle * 100,
      signal: bollingerSignal,
      confidence: bollingerSignal !== 'HOLD' ? 0.6 : 0.2,
    });

    // Volume Analysis
    const volumeSignal = this.analyzeVolume(data);
    indicators.push({
      name: 'VOLUME',
      value: volumeSignal.value,
      signal: volumeSignal.signal,
      confidence: volumeSignal.confidence,
    });

    return indicators;
  }

  // Calculate RSI
  private calculateRSI(data: CandlestickData[], period: number = this.RSI_PERIOD): number {
    if (data.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RSI using the smoothed averages
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Calculate Simple Moving Average
  private calculateSMA(data: CandlestickData[], period: number): number {
    if (data.length < period) return data[data.length - 1].close;
    
    const sum = data.slice(-period).reduce((acc, candle) => acc + candle.close, 0);
    return sum / period;
  }

  // Calculate MACD
  private calculateMACD(data: CandlestickData[]): { macdLine: number; signalLine: number; histogram: number } {
    const emaFast = this.calculateEMA(data, this.MACD_FAST);
    const emaSlow = this.calculateEMA(data, this.MACD_SLOW);
    const macdLine = emaFast - emaSlow;
    
    // For simplicity, using SMA for signal line instead of EMA
    const macdData = data.slice(-this.MACD_SIGNAL).map(() => macdLine);
    const signalLine = macdData.reduce((sum, val) => sum + val, 0) / macdData.length;
    const histogram = macdLine - signalLine;

    return { macdLine, signalLine, histogram };
  }

  // Calculate Exponential Moving Average
  private calculateEMA(data: CandlestickData[], period: number): number {
    if (data.length < period) return data[data.length - 1].close;
    
    const multiplier = 2 / (period + 1);
    let ema = data[0].close;
    
    for (let i = 1; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema;
    }
    
    return ema;
  }

  // Calculate Bollinger Bands
  private calculateBollingerBands(data: CandlestickData[], period: number = 20, stdDev: number = 2): 
    { upper: number; middle: number; lower: number } {
    
    if (data.length < period) {
      const price = data[data.length - 1].close;
      return { upper: price * 1.02, middle: price, lower: price * 0.98 };
    }

    const prices = data.slice(-period).map(d => d.close);
    const sma = prices.reduce((sum, price) => sum + price, 0) / period;
    
    const squaredDiffs = prices.map(price => Math.pow(price - sma, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev),
    };
  }

  // Analyze volume patterns
  private analyzeVolume(data: CandlestickData[]): { value: number; signal: 'BUY' | 'SELL' | 'HOLD'; confidence: number } {
    if (data.length < 10) {
      return { value: 0, signal: 'HOLD', confidence: 0.1 };
    }

    const recentVolume = data.slice(-5).reduce((sum, d) => sum + (d.volume || 0), 0) / 5;
    const avgVolume = data.slice(-20).reduce((sum, d) => sum + (d.volume || 0), 0) / 20;
    
    const volumeRatio = recentVolume / avgVolume;
    const priceChange = (data[data.length - 1].close - data[data.length - 2].close) / data[data.length - 2].close;

    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0.3;

    if (volumeRatio > 1.5) {
      signal = priceChange > 0 ? 'BUY' : 'SELL';
      confidence = 0.7;
    } else if (volumeRatio < 0.7) {
      confidence = 0.2;
    }

    return { value: volumeRatio, signal, confidence };
  }

  // Analyze market regime
  private analyzeMarketRegime(data: CandlestickData[]): MarketRegime {
    if (data.length < 50) {
      return {
        type: 'SIDEWAYS',
        confidence: 0.5,
        volatility: 'MEDIUM',
        trend: 'SIDEWAYS',
        timestamp: new Date(),
      };
    }

    const prices = data.slice(-50).map(d => d.close);
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
    
    // Calculate trend
    const smaShort = this.calculateSMA(data.slice(-20), 10);
    const smaLong = this.calculateSMA(data, 50);
    const trendStrength = (smaShort - smaLong) / smaLong;

    let trend: 'UP' | 'DOWN' | 'SIDEWAYS';
    let type: 'BULL' | 'BEAR' | 'SIDEWAYS';
    
    if (trendStrength > 0.05) {
      trend = 'UP';
      type = 'BULL';
    } else if (trendStrength < -0.05) {
      trend = 'DOWN';
      type = 'BEAR';
    } else {
      trend = 'SIDEWAYS';
      type = 'SIDEWAYS';
    }

    // Calculate volatility
    const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length) * Math.sqrt(252);
    let volatilityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    
    if (volatility < 0.15) {
      volatilityLevel = 'LOW';
    } else if (volatility > 0.30) {
      volatilityLevel = 'HIGH';
    } else {
      volatilityLevel = 'MEDIUM';
    }

    const confidence = Math.abs(trendStrength) * 10; // Scale to 0-1

    return {
      type,
      confidence: Math.min(confidence, 1),
      volatility: volatilityLevel,
      trend,
      timestamp: new Date(),
    };
  }

  // Make trading decision based on indicators
  private makeDecision(
    indicators: TechnicalIndicator[], 
    regime: MarketRegime, 
    marketData: MarketData
  ): { action: 'BUY' | 'SELL' | 'HOLD' } {
    
    let buyScore = 0;
    let sellScore = 0;
    let totalWeight = 0;

    // Weight indicators based on market regime
    const regimeMultiplier = regime.type === 'BULL' ? 1.2 : regime.type === 'BEAR' ? 0.8 : 1.0;

    indicators.forEach(indicator => {
      const weight = indicator.confidence * regimeMultiplier;
      totalWeight += weight;

      if (indicator.signal === 'BUY') {
        buyScore += weight;
      } else if (indicator.signal === 'SELL') {
        sellScore += weight;
      }
    });

    const buyRatio = buyScore / totalWeight;
    const sellRatio = sellScore / totalWeight;

    // Require stronger conviction in volatile markets
    const threshold = regime.volatility === 'HIGH' ? 0.65 : 0.55;

    if (buyRatio > threshold && buyRatio > sellRatio) {
      return { action: 'BUY' };
    } else if (sellRatio > threshold && sellRatio > buyRatio) {
      return { action: 'SELL' };
    } else {
      return { action: 'HOLD' };
    }
  }

  // Calculate overall confidence
  private calculateConfidence(indicators: TechnicalIndicator[], regime: MarketRegime): number {
    const indicatorConfidence = indicators.reduce((sum, ind) => sum + ind.confidence, 0) / indicators.length;
    const regimeConfidence = regime.confidence;
    
    // Combine confidences with weights
    const overallConfidence = (indicatorConfidence * 0.7) + (regimeConfidence * 0.3);
    
    return Math.min(Math.max(overallConfidence, 0), 1);
  }

  // Generate human-readable reasoning
  private generateReasoning(
    indicators: TechnicalIndicator[], 
    regime: MarketRegime, 
    decision: { action: 'BUY' | 'SELL' | 'HOLD' }
  ): string {
    
    const strongIndicators = indicators.filter(ind => ind.confidence > 0.6);
    const supportingIndicators = strongIndicators.filter(ind => ind.signal === decision.action);
    
    let reasoning = `Market Analysis: The current market regime appears to be ${regime.type.toLowerCase()} with ${regime.volatility.toLowerCase()} volatility. `;
    
    if (decision.action !== 'HOLD') {
      reasoning += `Recommending ${decision.action} based on the following signals: `;
      
      supportingIndicators.forEach((indicator, index) => {
        switch (indicator.name) {
          case 'RSI':
            reasoning += `RSI (${indicator.value.toFixed(1)}) suggests the asset is ${indicator.value > 70 ? 'overbought' : indicator.value < 30 ? 'oversold' : 'neutral'}`;
            break;
          case 'MA_CROSSOVER':
            reasoning += `Moving average crossover indicates ${indicator.signal.toLowerCase()} momentum`;
            break;
          case 'MACD':
            reasoning += `MACD shows ${indicator.signal.toLowerCase()} divergence`;
            break;
          case 'BOLLINGER_BANDS':
            reasoning += `Price is ${indicator.value > 0 ? 'above' : 'below'} the Bollinger Band middle line`;
            break;
          case 'VOLUME':
            reasoning += `Volume analysis supports the ${indicator.signal.toLowerCase()} signal`;
            break;
        }
        
        if (index < supportingIndicators.length - 1) {
          reasoning += ', ';
        }
      });
      
      reasoning += '. ';
    } else {
      reasoning += 'Recommending HOLD due to mixed signals and lack of strong directional conviction. ';
    }
    
    reasoning += `Risk level is assessed as ${this.assessRiskLevel({ price: 0 } as MarketData, regime, 0.5).toLowerCase()} given current market conditions.`;
    
    return reasoning;
  }

  // Assess risk level
  private assessRiskLevel(marketData: MarketData, regime: MarketRegime, confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0;
    
    // Volatility contributes to risk
    if (regime.volatility === 'HIGH') riskScore += 3;
    else if (regime.volatility === 'MEDIUM') riskScore += 2;
    else riskScore += 1;
    
    // Low confidence increases risk
    if (confidence < 0.4) riskScore += 2;
    else if (confidence < 0.6) riskScore += 1;
    
    // Market regime affects risk
    if (regime.type === 'BEAR') riskScore += 1;
    
    if (riskScore >= 5) return 'HIGH';
    if (riskScore >= 3) return 'MEDIUM';
    return 'LOW';
  }

  // Calculate price targets
  private calculatePriceTargets(
    marketData: MarketData, 
    action: 'BUY' | 'SELL' | 'HOLD',
    indicators: TechnicalIndicator[]
  ): { targetPrice?: number; stopLoss?: number } {
    
    if (action === 'HOLD') {
      return {};
    }

    const currentPrice = marketData.price;
    const atr = currentPrice * 0.02; // Simplified Average True Range
    
    let targetPrice: number;
    let stopLoss: number;
    
    if (action === 'BUY') {
      targetPrice = currentPrice * 1.03; // 3% target
      stopLoss = currentPrice * 0.98; // 2% stop loss
    } else { // SELL
      targetPrice = currentPrice * 0.97; // 3% target (for short)
      stopLoss = currentPrice * 1.02; // 2% stop loss (for short)
    }
    
    return { targetPrice, stopLoss };
  }

  // Generate fallback signal when analysis fails
  private generateFallbackSignal(symbol: string): AISignal {
    return {
      symbol,
      action: 'HOLD',
      confidence: 0.1,
      reasoning: 'Unable to perform technical analysis due to insufficient data. Recommending HOLD until more data becomes available.',
      technicalIndicators: [],
      riskLevel: 'HIGH',
      timestamp: new Date(),
    };
  }

  // Batch analyze multiple symbols
  async analyzePortfolio(symbols: string[]): Promise<AISignal[]> {
    const promises = symbols.map(symbol => this.generateSignal(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<AISignal> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  // Get educational explanation for a specific indicator
  getIndicatorExplanation(indicatorName: string): string {
    const explanations: { [key: string]: string } = {
      'RSI': 'The Relative Strength Index (RSI) measures the speed and magnitude of recent price changes. Values above 70 typically indicate overbought conditions (potential sell signal), while values below 30 suggest oversold conditions (potential buy signal).',
      'SMA_10': 'The 10-period Simple Moving Average smooths out price data to identify the trend direction. When price is above the SMA, it suggests an upward trend.',
      'SMA_50': 'The 50-period Simple Moving Average is a longer-term trend indicator. It helps identify the overall market direction and acts as dynamic support/resistance.',
      'MA_CROSSOVER': 'Moving Average Crossover occurs when a shorter-period MA crosses above or below a longer-period MA, signaling potential trend changes.',
      'MACD': 'The Moving Average Convergence Divergence (MACD) is a trend-following momentum indicator that shows the relationship between two moving averages.',
      'BOLLINGER_BANDS': 'Bollinger Bands consist of a middle line (SMA) and two outer bands. When price touches the upper band, it may be overbought; when it touches the lower band, it may be oversold.',
      'VOLUME': 'Volume analysis confirms price movements. High volume during price increases suggests strong buying interest, while high volume during declines indicates selling pressure.',
    };
    
    return explanations[indicatorName] || 'This technical indicator helps analyze market trends and potential trading opportunities.';
  }
}

export const aiDecisionEngine = new AIDecisionEngine();