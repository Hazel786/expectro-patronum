import { NextRequest, NextResponse } from 'next/server';
import { aiDecisionEngine } from '@/services/aiDecisionEngine';

// Generate AI trading signal for a symbol
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Validate symbol format
    if (!/^[A-Z]{1,5}$/.test(symbol.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid symbol format' },
        { status: 400 }
      );
    }

    const signal = await aiDecisionEngine.generateSignal(symbol.toUpperCase());

    return NextResponse.json(signal);

  } catch (error) {
    console.error('Error generating AI signal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Analyze multiple symbols (portfolio analysis)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    if (symbols.length === 0 || symbols.length > 20) {
      return NextResponse.json(
        { error: 'Symbols array must contain 1-20 symbols' },
        { status: 400 }
      );
    }

    // Validate all symbols
    for (const symbol of symbols) {
      if (typeof symbol !== 'string' || !/^[A-Z]{1,5}$/.test(symbol.toUpperCase())) {
        return NextResponse.json(
          { error: `Invalid symbol format: ${symbol}` },
          { status: 400 }
        );
      }
    }

    const signals = await aiDecisionEngine.analyzePortfolio(
      symbols.map((s: string) => s.toUpperCase())
    );

    // Calculate portfolio-level insights
    const buySignals = signals.filter(s => s.action === 'BUY');
    const sellSignals = signals.filter(s => s.action === 'SELL');
    const holdSignals = signals.filter(s => s.action === 'HOLD');

    const averageConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    
    const riskDistribution = {
      LOW: signals.filter(s => s.riskLevel === 'LOW').length,
      MEDIUM: signals.filter(s => s.riskLevel === 'MEDIUM').length,
      HIGH: signals.filter(s => s.riskLevel === 'HIGH').length,
    };

    const portfolioInsight = {
      totalSignals: signals.length,
      actionDistribution: {
        BUY: buySignals.length,
        SELL: sellSignals.length,
        HOLD: holdSignals.length,
      },
      averageConfidence,
      riskDistribution,
      strongestBuySignal: buySignals.length > 0 ? 
        buySignals.reduce((max, signal) => signal.confidence > max.confidence ? signal : max) : null,
      strongestSellSignal: sellSignals.length > 0 ? 
        sellSignals.reduce((max, signal) => signal.confidence > max.confidence ? signal : max) : null,
    };

    return NextResponse.json({
      signals,
      portfolioInsight,
      timestamp: new Date(),
    });

  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}