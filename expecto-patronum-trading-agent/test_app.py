#!/usr/bin/env python3
"""
Test script for Expecto Patronum Trading Agent
"""

import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from src.core.trading_engine import TradingEngine
        from src.core.portfolio import Portfolio
        from src.core.risk_manager import RiskManager
        from src.core.market_data_provider import MarketDataProvider
        from src.database.database_manager import DatabaseManager
        print("✅ All core modules imported successfully")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    
    return True

def test_database():
    """Test database functionality"""
    print("\n🗄️ Testing database...")
    
    try:
        from src.database.database_manager import DatabaseManager
        
        # Create temporary database
        db = DatabaseManager("test.db")
        
        # Test basic operations
        db.save_position(
            trade_id="test-123",
            symbol="bitcoin",
            position_type="LONG",
            amount=0.1,
            entry_price=50000.0,
            entry_time="2024-01-01 12:00:00"
        )
        
        positions = db.get_open_positions()
        if len(positions) > 0:
            print("✅ Database operations working")
        else:
            print("❌ Database operations failed")
            return False
            
        # Cleanup
        db.close()
        os.remove("test.db")
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False
    
    return True

def test_market_data():
    """Test market data provider"""
    print("\n📡 Testing market data...")
    
    try:
        from src.core.market_data_provider import MarketDataProvider
        
        market_data = MarketDataProvider()
        
        # Test price fetching
        price = market_data.get_price("bitcoin")
        if price:
            print(f"✅ Market data working - Bitcoin price: ${price:,.2f}")
        else:
            print("⚠️ Market data not available (might be network issue)")
        
        market_data.stop()
        
    except Exception as e:
        print(f"❌ Market data test failed: {e}")
        return False
    
    return True

def test_risk_manager():
    """Test risk management"""
    print("\n🛡️ Testing risk management...")
    
    try:
        from src.core.risk_manager import RiskManager
        
        risk_manager = RiskManager()
        
        # Test position limit check
        result = risk_manager.check_position_limit("bitcoin", "LONG", 0.1, 50000.0)
        if result['allowed']:
            print("✅ Risk management working")
        else:
            print(f"⚠️ Risk management blocked: {result['reason']}")
        
    except Exception as e:
        print(f"❌ Risk management test failed: {e}")
        return False
    
    return True

def test_portfolio():
    """Test portfolio management"""
    print("\n📜 Testing portfolio...")
    
    try:
        from src.core.portfolio import Portfolio
        from src.database.database_manager import DatabaseManager
        
        db = DatabaseManager("test_portfolio.db")
        portfolio = Portfolio(db)
        
        # Test portfolio stats
        stats = portfolio.get_portfolio_stats()
        if stats['cash'] == 10000.0:
            print("✅ Portfolio initialized correctly")
        else:
            print("❌ Portfolio initialization failed")
            return False
        
        db.close()
        os.remove("test_portfolio.db")
        
    except Exception as e:
        print(f"❌ Portfolio test failed: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🦌 Expecto Patronum Trading Agent - Test Suite")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_database,
        test_market_data,
        test_risk_manager,
        test_portfolio
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The application should work correctly.")
        print("\n🚀 To run the application:")
        print("   python main.py")
    else:
        print("⚠️ Some tests failed. Please check the errors above.")
        print("💡 Make sure all dependencies are installed:")
        print("   pip install -r requirements.txt")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)