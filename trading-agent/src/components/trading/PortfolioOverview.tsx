import React from 'react';
import { Portfolio } from '@/types/trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  Target,
  Activity
} from 'lucide-react';
import { formatCurrency, formatPercentage, getChangeColor, cn } from '@/lib/utils';

interface PortfolioOverviewProps {
  portfolio: Portfolio;
  className?: string;
}

export default function PortfolioOverview({ portfolio, className }: PortfolioOverviewProps) {
  const positionValue = portfolio.totalValue - portfolio.cashBalance;
  const cashPercentage = (portfolio.cashBalance / portfolio.totalValue) * 100;
  const positionPercentage = 100 - cashPercentage;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            <span>Portfolio</span>
          </span>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Total Value */}
        <div className="text-center">
          <div className="text-3xl font-bold text-white">
            {formatCurrency(portfolio.totalValue)}
          </div>
          <div className={cn("text-sm font-medium", getChangeColor(portfolio.dailyPnL))}>
            {formatPercentage(portfolio.dailyReturn)} today
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          {/* Total P&L */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {portfolio.totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-slate-300">Total P&L</span>
            </div>
            <div className={cn("text-sm font-semibold", getChangeColor(portfolio.totalPnL))}>
              {portfolio.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.totalPnL)}
            </div>
          </div>

          {/* Daily P&L */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-slate-300">Daily P&L</span>
            </div>
            <div className={cn("text-sm font-semibold", getChangeColor(portfolio.dailyPnL))}>
              {portfolio.dailyPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.dailyPnL)}
            </div>
          </div>

          {/* Cash Balance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-slate-300">Cash</span>
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {formatCurrency(portfolio.cashBalance)}
            </div>
          </div>

          {/* Positions Value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-slate-300">Positions</span>
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {formatCurrency(positionValue)}
            </div>
          </div>
        </div>

        {/* Allocation Chart */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-300">Allocation</div>
          
          {/* Cash Allocation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Cash</span>
              <span className="text-slate-300">{cashPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${cashPercentage}%` }}
              />
            </div>
          </div>

          {/* Positions Allocation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Positions</span>
              <span className="text-slate-300">{positionPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${positionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <div className="text-sm font-semibold text-white">
              {formatPercentage(portfolio.totalReturn, 1)}
            </div>
            <div className="text-xs text-slate-400">Total Return</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-white">
              {portfolio.winRate.toFixed(0)}%
            </div>
            <div className="text-xs text-slate-400">Win Rate</div>
          </div>
        </div>

        {/* Position Count */}
        {portfolio.positions.length > 0 && (
          <div className="pt-2 border-t border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Active Positions</span>
              <Badge variant="secondary" className="text-xs">
                {portfolio.positions.length}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}