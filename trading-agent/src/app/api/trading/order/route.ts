import { NextRequest, NextResponse } from 'next/server';
import { tradingEngine } from '@/services/tradingEngine';
import { OrderType, OrderSide } from '@/types/trading';

// Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      portfolioId = 'demo-portfolio',
      symbol, 
      side, 
      type, 
      quantity, 
      price, 
      stopPrice 
    } = body;

    // Validate required fields
    if (!symbol || !side || !type || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, side, type, quantity' },
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

    // Validate side
    if (!['BUY', 'SELL'].includes(side.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid side. Must be "BUY" or "SELL"' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LIMIT'].includes(type.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid order type. Must be "MARKET", "LIMIT", "STOP_LOSS", or "STOP_LIMIT"' },
        { status: 400 }
      );
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    // Validate price for limit orders
    if (type.toUpperCase() === 'LIMIT' && (!price || typeof price !== 'number' || price <= 0)) {
      return NextResponse.json(
        { error: 'Limit orders require a valid price' },
        { status: 400 }
      );
    }

    // Validate stop price for stop orders
    if (['STOP_LOSS', 'STOP_LIMIT'].includes(type.toUpperCase()) && 
        (!stopPrice || typeof stopPrice !== 'number' || stopPrice <= 0)) {
      return NextResponse.json(
        { error: 'Stop orders require a valid stop price' },
        { status: 400 }
      );
    }

    const order = await tradingEngine.createOrder(
      portfolioId,
      symbol.toUpperCase(),
      side.toUpperCase() as OrderSide,
      type.toUpperCase() as OrderType,
      quantity,
      price,
      stopPrice
    );

    return NextResponse.json(order, { status: 201 });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get orders for a portfolio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId') || 'demo-portfolio';
    const orderId = searchParams.get('orderId');

    if (orderId) {
      // Get specific order
      const order = tradingEngine.getOrder(orderId);
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(order);
    } else {
      // Get all orders for portfolio
      const orders = tradingEngine.getOrdersForPortfolio(portfolioId);
      return NextResponse.json({ orders });
    }

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cancel an order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const success = tradingEngine.cancelOrder(orderId);

    if (!success) {
      return NextResponse.json(
        { error: 'Order not found or cannot be cancelled' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Order cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}