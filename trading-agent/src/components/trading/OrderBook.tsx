import React from 'react';
import { Order } from '@/types/trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface OrderBookProps {
  orders: Order[];
  className?: string;
}

export default function OrderBook({ orders, className }: OrderBookProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FILLED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'CANCELLED':
      case 'REJECTED':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  const recentOrders = orders.slice(-5).reverse(); // Show last 5 orders

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span>Recent Orders</span>
          </span>
          <Badge variant="outline" className="text-xs">
            {orders.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <div
                key={order.id}
                className="bg-slate-700/30 rounded-lg p-3 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{order.symbol}</span>
                    <span className={cn("text-sm font-medium", getSideColor(order.side))}>
                      {order.side}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(order.status))}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Quantity</div>
                    <div className="text-white font-medium">{order.quantity}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Type</div>
                    <div className="text-white font-medium">{order.type}</div>
                  </div>
                </div>

                {order.filledPrice && (
                  <div className="mt-2 pt-2 border-t border-slate-600">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">Filled Price</div>
                        <div className="text-white font-medium">
                          {formatCurrency(order.filledPrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Total</div>
                        <div className="text-white font-medium">
                          {formatCurrency(order.filledPrice * order.filledQuantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{order.timestamp.toLocaleString()}</span>
                  {order.commission > 0 && (
                    <span>Commission: {formatCurrency(order.commission)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No orders yet</p>
            <p className="text-xs mt-2">Your recent orders will appear here</p>
          </div>
        )}

        {orders.length > 5 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View All Orders ({orders.length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}