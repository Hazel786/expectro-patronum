import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/services/marketDataService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || 'daily';
    const outputSize = searchParams.get('outputsize') || 'compact';

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

    // Validate interval
    const validIntervals = ['1min', '5min', '15min', '30min', '60min', 'daily'];
    if (!validIntervals.includes(interval)) {
      return NextResponse.json(
        { error: `Invalid interval. Must be one of: ${validIntervals.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate output size
    if (!['compact', 'full'].includes(outputSize)) {
      return NextResponse.json(
        { error: 'Invalid outputsize. Must be "compact" or "full"' },
        { status: 400 }
      );
    }

    const chartData = await marketDataService.getCandlestickData(
      symbol.toUpperCase(),
      interval as any,
      outputSize as any
    );

    if (!chartData || chartData.length === 0) {
      return NextResponse.json(
        { error: 'No chart data found for symbol' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      interval,
      data: chartData,
      count: chartData.length,
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}