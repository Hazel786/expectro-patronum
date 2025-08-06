import React from 'react';
import { MarketData } from '@/types/trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { formatCurrency, formatPercentage, getChangeColor, cn } from '@/lib/utils';

interface WatchlistProps {
  data: MarketData[];
  onSymbolSelect: (symbol: string) => void;
  selectedSymbol: string;
  className?: string;
}

export default function Watchlist({ data, onSymbolSelect, selectedSymbol, className }: WatchlistProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Eye className="h-5 w-5 text-blue-500" />
            <span>Watchlist</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Loading watchlist...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <span>Watchlist</span>
          </span>
          <Badge variant="outline" className="text-xs">
            {data.length} symbols
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {data.map((item, index) => (
          <div
            key={item.symbol}
            onClick={() => onSymbolSelect(item.symbol)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50",
              selectedSymbol === item.symbol 
                ? "bg-blue-600/20 border border-blue-500/50" 
                : "bg-slate-700/30 hover:bg-slate-700/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{item.symbol}</span>
                  {item.changePercent > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : item.changePercent < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-slate-500" />
                  )}
                </div>
                <div className="text-sm text-slate-400">
                  Vol: {(item.volume / 1000000).toFixed(1)}M
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-white">
                  {formatCurrency(item.price)}
                </div>
                <div className={cn("text-sm font-medium", getChangeColor(item.change))}>
                  {formatPercentage(item.changePercent, 2)}
                </div>
              </div>
            </div>
            
            {/* Price Range Bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>${item.low.toFixed(2)}</span>
                <span>${item.high.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-red-500 to-green-500 h-1 rounded-full relative"
                >
                  <div 
                    className="absolute top-0 w-0.5 h-1 bg-white rounded-full"
                    style={{
                      left: `${((item.price - item.low) / (item.high - item.low)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
            
            {selectedSymbol === item.symbol && (
              <div className="mt-2 pt-2 border-t border-slate-600">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Open:</span>
                    <span className="ml-1 text-white">${item.open.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Close:</span>
                    <span className="ml-1 text-white">${item.close.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Add Symbol Button */}
        <div className="pt-4 border-t border-slate-700">
          <button className="w-full p-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors border border-dashed border-slate-600 hover:border-slate-500">
            + Add Symbol
          </button>
        </div>
      </CardContent>
    </Card>
  );
}