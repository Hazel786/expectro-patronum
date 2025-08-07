import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface ChartWidgetProps {
  symbol: string;
  height?: number;
}

export default function ChartWidget({ symbol, height = 400 }: ChartWidgetProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#4b5563',
      },
      timeScale: {
        borderColor: '#4b5563',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Load data
    loadChartData();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height]);

  useEffect(() => {
    loadChartData();
  }, [symbol]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      
      // Fetch chart data from API
      const response = await fetch(`/api/market-data/chart?symbol=${symbol}&interval=daily`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (candlestickSeriesRef.current && data.data) {
          // Convert data format for lightweight-charts
          const chartData = data.data.map((item: any) => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }));
          
          candlestickSeriesRef.current.setData(chartData);
        }
      } else {
        // Use mock data as fallback
        generateMockData();
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    if (!candlestickSeriesRef.current) return;

    const mockData: CandlestickData[] = [];
    const basePrice = 150;
    let currentPrice = basePrice;
    
    // Generate 100 days of mock data
    for (let i = 100; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const open = currentPrice;
      const change = (Math.random() - 0.5) * 10;
      const close = Math.max(open + change, 10);
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      mockData.push({
        time: Math.floor(date.getTime() / 1000) as any,
        open,
        high,
        low,
        close,
      });
      
      currentPrice = close;
    }
    
    candlestickSeriesRef.current.setData(mockData);
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-slate-400">Loading chart...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={chartContainerRef} 
        className="w-full rounded-lg"
        style={{ height: `${height}px` }}
      />
      
      {/* Chart Controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-1">
          <span className="text-xs text-slate-300">{symbol}</span>
        </div>
      </div>
    </div>
  );
}