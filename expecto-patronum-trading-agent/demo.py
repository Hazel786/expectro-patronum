#!/usr/bin/env python3
"""
Expecto Patronum Trading Agent - Demo Script
Demonstrates the key features of the magical trading agent
"""

import sys
import os
import time
from datetime import datetime

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def demo_trading_spells():
    """Demonstrate the trading spells"""
    print("🪄 Trading Spells Demonstration")
    print("=" * 50)
    
    try:
        from src.core.trading_engine import TradingEngine
        from src.core.portfolio import Portfolio
        from src.core.risk_manager import RiskManager
        from src.core.market_data_provider import MarketDataProvider
        from src.database.database_manager import DatabaseManager
        
        # Initialize components
        print("🔧 Initializing magical components...")
        db_manager = DatabaseManager("demo.db")
        market_data = MarketDataProvider()
        portfolio = Portfolio(db_manager)
        risk_manager = RiskManager()
        trading_engine = TradingEngine(market_data, portfolio, risk_manager, db_manager)
        
        # Activate trading engine
        print("✨ Casting LUMOS to activate trading engine...")
        result = trading_engine.cast_spell('LUMOS', '', 0)
        print(f"   Result: {result['message']}")
        
        # Wait for market data
        print("📡 Waiting for market data...")
        time.sleep(5)
        
        # Demo trading spells
        print("\n🦌 Casting EXPECTO LONG spell...")
        result = trading_engine.cast_spell('EXPECTO_LONG', 'bitcoin', 0.01)
        print(f"   Result: {result['message']}")
        
        print("\n🦌 Casting EXPECTO SHORT spell...")
        result = trading_engine.cast_spell('EXPECTO_SHORT', 'ethereum', 0.1)
        print(f"   Result: {result['message']}")
        
        # Show portfolio
        print("\n📜 Portfolio Status:")
        stats = portfolio.get_portfolio_stats()
        print(f"   Cash: ${stats['cash']:,.2f}")
        print(f"   Total P&L: ${stats['total_pnl']:,.2f}")
        print(f"   Open Positions: {stats['open_positions']}")
        
        # Close positions
        print("\n🛡️ Casting FINITE INCANTATEM to close positions...")
        result = trading_engine.cast_spell('FINITE_INCANTATEM', 'bitcoin', 0)
        print(f"   Result: {result['message']}")
        
        # Deactivate
        print("\n🌙 Casting NOX to deactivate...")
        result = trading_engine.cast_spell('NOX', '', 0)
        print(f"   Result: {result['message']}")
        
        # Cleanup
        market_data.stop()
        db_manager.close()
        os.remove("demo.db")
        
        print("\n✅ Demo completed successfully!")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")

def demo_risk_management():
    """Demonstrate risk management features"""
    print("\n🛡️ Risk Management Demonstration")
    print("=" * 50)
    
    try:
        from src.core.risk_manager import RiskManager
        
        risk_manager = RiskManager()
        
        # Test position limits
        print("🔍 Testing position limits...")
        result = risk_manager.check_position_limit('bitcoin', 'LONG', 0.1, 50000.0)
        print(f"   Small position: {result['message']}")
        
        result = risk_manager.check_position_limit('bitcoin', 'LONG', 10.0, 50000.0)
        print(f"   Large position: {result['message']}")
        
        # Test leverage limits
        print("\n⚖️ Testing leverage limits...")
        result = risk_manager.check_position_limit('bitcoin', 'SHORT', 1.0, 50000.0)
        print(f"   Short position: {result['message']}")
        
        # Show risk limits
        print("\n📊 Current Risk Limits:")
        limits = risk_manager.get_risk_limits()
        print(f"   Max position size: {limits['max_position_size']:.1%}")
        print(f"   Max total exposure: {limits['max_total_exposure']:.1%}")
        print(f"   Max daily loss: {limits['max_daily_loss']:.1%}")
        print(f"   Max leverage: {limits['max_leverage']}x")
        
        print("\n✅ Risk management demo completed!")
        
    except Exception as e:
        print(f"❌ Risk management demo failed: {e}")

def demo_market_data():
    """Demonstrate market data features"""
    print("\n📡 Market Data Demonstration")
    print("=" * 50)
    
    try:
        from src.core.market_data_provider import MarketDataProvider
        
        market_data = MarketDataProvider()
        
        # Wait for data
        print("⏳ Waiting for market data...")
        time.sleep(3)
        
        # Get prices
        print("\n💰 Current Prices:")
        prices = market_data.get_all_prices()
        for coin_id, data in list(prices.items())[:5]:  # Show first 5
            price = data['price']
            change = data['change_24h']
            change_symbol = "📈" if change >= 0 else "📉"
            print(f"   {coin_id.upper()}: ${price:,.2f} {change_symbol} {change:+.2f}%")
        
        # Get market summary
        print("\n📊 Market Summary:")
        summary = market_data.get_market_summary()
        print(f"   Total coins: {summary['total_coins']}")
        print(f"   Total market cap: ${summary['total_market_cap']:,.0f}")
        
        # Stop
        market_data.stop()
        
        print("\n✅ Market data demo completed!")
        
    except Exception as e:
        print(f"❌ Market data demo failed: {e}")

def main():
    """Run all demonstrations"""
    print("🦌 Expecto Patronum Trading Agent - Feature Demonstration")
    print("=" * 60)
    print("This demo showcases the magical features of the trading agent")
    print("No real money is involved - all trades are simulated!")
    print("=" * 60)
    
    # Run demonstrations
    demo_trading_spells()
    demo_risk_management()
    demo_market_data()
    
    print("\n" + "=" * 60)
    print("🎉 All demonstrations completed!")
    print("\n🚀 To run the full application:")
    print("   python main.py")
    print("\n📚 For more information, see README.md")
    print("=" * 60)

if __name__ == "__main__":
    main()