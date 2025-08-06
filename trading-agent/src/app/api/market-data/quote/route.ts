import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/services/marketDataService';

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

    // Validate symbol format (basic validation)
    if (!/^[A-Z]{1,5}$/.test(symbol.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid symbol format' },
        { status: 400 }
      );
    }

    const quote = await marketDataService.getQuote(symbol.toUpperCase());

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found for symbol' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);

  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    if (symbols.length === 0 || symbols.length > 10) {
      return NextResponse.json(
        { error: 'Symbols array must contain 1-10 symbols' },
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

    const quotes = await marketDataService.getMultipleQuotes(
      symbols.map((s: string) => s.toUpperCase())
    );

    return NextResponse.json({ quotes });

  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}