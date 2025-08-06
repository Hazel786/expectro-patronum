import React from 'react';
import { AISignal } from '@/types/trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Shield,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsightsProps {
  signals: AISignal[];
  symbol: string;
  magicMode: boolean;
  className?: string;
}

export default function AIInsights({ signals, symbol, magicMode, className }: AIInsightsProps) {
  const currentSignal = signals.find(s => s.symbol === symbol);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'SELL': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>AI Insights</span>
          </span>
          {magicMode && (
            <Badge className="bg-purple-600 text-white">
              Magic Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentSignal ? (
          <>
            {/* Main Signal */}
            <div className="text-center space-y-3">
              <div className={cn("inline-flex items-center space-x-2 px-4 py-2 rounded-lg border", getActionColor(currentSignal.action))}>
                {currentSignal.action === 'BUY' ? (
                  <TrendingUp className="h-5 w-5" />
                ) : currentSignal.action === 'SELL' ? (
                  <TrendingDown className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <span className="font-semibold">{currentSignal.action} Signal</span>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">
                  {Math.round(currentSignal.confidence * 100)}%
                </div>
                <div className="text-sm text-slate-400">Confidence</div>
              </div>
            </div>

            {/* Signal Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Risk Level</span>
                <div className="flex items-center space-x-2">
                  <Shield className={cn("h-4 w-4", getRiskColor(currentSignal.riskLevel))} />
                  <span className={cn("text-sm font-medium", getRiskColor(currentSignal.riskLevel))}>
                    {currentSignal.riskLevel}
                  </span>
                </div>
              </div>

              {currentSignal.targetPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Target Price</span>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">
                      ${currentSignal.targetPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {currentSignal.stopLoss && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Stop Loss</span>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-white">
                      ${currentSignal.stopLoss.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Indicators */}
            {currentSignal.technicalIndicators && currentSignal.technicalIndicators.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-slate-300">Technical Indicators</div>
                <div className="space-y-2">
                  {currentSignal.technicalIndicators.slice(0, 3).map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{indicator.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getActionColor(indicator.signal))}
                        >
                          {indicator.signal}
                        </Badge>
                        <span className="text-slate-300">
                          {Math.round(indicator.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-300">AI Analysis</div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentSignal.reasoning}
                </p>
              </div>
            </div>

            {/* Magic Mode Actions */}
            {magicMode && currentSignal.action !== 'HOLD' && (
              <div className="pt-4 border-t border-slate-700">
                <Button 
                  className={cn(
                    "w-full",
                    currentSignal.action === 'BUY' 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  Execute AI {currentSignal.action} Signal
                </Button>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Magic Mode will execute this trade automatically
                </p>
              </div>
            )}

          </>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Loading AI analysis for {symbol}...</p>
            <p className="text-xs mt-2">Analyzing market conditions and technical indicators</p>
          </div>
        )}

        {/* Educational Tooltip */}
        <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-300">
              <strong>How it works:</strong> Our AI analyzes multiple technical indicators, 
              market sentiment, and historical patterns to generate trading signals with 
              confidence scores.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}