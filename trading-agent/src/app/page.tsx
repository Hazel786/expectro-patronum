'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, TrendingUp, Zap, Shield, Target, Activity } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to dashboard after a brief intro
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Brain className="h-20 w-20 text-blue-500 animate-pulse" />
                <div className="absolute -top-2 -right-2">
                  <Zap className="h-8 w-8 text-yellow-500 animate-bounce" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              AI Trading Agent
            </h1>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Experience the future of trading with our magical, beginner-friendly AI agent. 
              Get real-time insights, automated risk management, and educational guidance.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
              <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Signals</h3>
              <p className="text-slate-400 text-sm">
                Advanced technical analysis with confidence scoring and real-time market insights.
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all">
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Risk Management</h3>
              <p className="text-slate-400 text-sm">
                Automatic position sizing, stop-loss orders, and portfolio risk assessment.
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <Target className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Magic Mode</h3>
              <p className="text-slate-400 text-sm">
                Beginner-friendly mode with educational tooltips and guided trading.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              Start Trading Now
            </button>
            <p className="text-xs text-slate-400 mt-4">
              Demo mode • No real money at risk • Educational purposes
            </p>
          </div>

          {/* Auto-redirect notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2">
              <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
              <span className="text-sm text-slate-300">Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
