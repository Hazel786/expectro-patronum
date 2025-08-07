#!/usr/bin/env python3
"""
Recall API Integration Demo
Demonstrates how to integrate the Recall API connector with Expecto Patronum
"""

import sys
import os
import time
from datetime import datetime

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def demo_recall_api_connector():
    """Demonstrate the Recall API connector functionality"""
    print("🔗 Recall API Connector Demonstration")
    print("=" * 50)
    
    try:
        from src.core.recall_api_connector import RecallAPIConnector
        from config.recall_api_config import get_config, validate_config
        
        # Get configuration (you would update this with real credentials)
        config = get_config('default')
        
        # Validate configuration
        is_valid, error_msg = validate_config(config)
        if not is_valid:
            print(f"❌ Configuration error: {error_msg}")
            print("💡 Please update config/recall_api_config.py with your API credentials")
            return
        
        # Initialize connector
        print("🔧 Initializing Recall API connector...")
        connector = RecallAPIConnector(config)
        
        # Test connection
        print("\n🔌 Testing connection to Recall API...")
        connection_result = connector.connect_to_recall()
        
        if connection_result['success']:
            print(f"✅ {connection_result['message']}")
            print(f"   API Version: {connection_result.get('api_version', 'unknown')}")
        else:
            print(f"❌ {connection_result['message']}")
            print("💡 This is expected if you haven't set up real API credentials yet")
        
        # Get competition status
        print("\n📊 Getting competition status...")
        status_result = connector.get_competition_status()
        
        if status_result['success']:
            print(f"✅ {status_result['message']}")
            status = status_result['status']
            if status:
                print(f"   Competition: {status.get('name', 'Unknown')}")
                print(f"   Status: {status.get('status', 'Unknown')}")
                print(f"   Participants: {status.get('participant_count', 0)}")
        else:
            print(f"❌ {status_result['message']}")
        
        # Demo order submission
        print("\n📝 Demo order submission...")
        order_data = {
            'symbol': 'bitcoin',
            'amount': 0.01,
            'type': 'MARKET',
            'side': 'BUY',
            'spell': 'EXPECTO_LONG',
            'portfolio_value': 10000.0,
            'risk_score': 0.1
        }
        
        order_result = connector.submit_order_to_competition(order_data)
        
        if order_result['success']:
            print(f"✅ {order_result['message']}")
            print(f"   Order ID: {order_result.get('order_id', 'N/A')}")
        else:
            print(f"❌ {order_result['message']}")
            print("💡 This is expected if you haven't set up real API credentials yet")
        
        # Demo portfolio sync
        print("\n🔄 Demo portfolio synchronization...")
        portfolio_data = {
            'total_value': 10000.0,
            'cash': 9500.0,
            'total_pnl': 500.0,
            'total_pnl_percent': 5.0,
            'positions': [
                {
                    'symbol': 'bitcoin',
                    'type': 'LONG',
                    'amount': 0.01,
                    'entry_price': 50000.0,
                    'current_price': 55000.0,
                    'pnl': 500.0
                }
            ],
            'trades_count': 1,
            'win_rate': 100.0,
            'session_duration': '00:30:00',
            'risk_level': 'low'
        }
        
        sync_result = connector.sync_portfolio_with_api(portfolio_data)
        
        if sync_result['success']:
            print(f"✅ {sync_result['message']}")
            print(f"   Synced at: {sync_result.get('timestamp', 'N/A')}")
        else:
            print(f"❌ {sync_result['message']}")
            print("💡 This is expected if you haven't set up real API credentials yet")
        
        # Show connection status
        print("\n📊 Connection Status:")
        status = connector.get_connection_status()
        print(f"   Connected: {status['connected']}")
        print(f"   Auto-sync: {status['auto_sync_running']}")
        print(f"   Competition ID: {status['competition_id']}")
        print(f"   API Base URL: {status['api_base_url']}")
        
        # Cleanup
        connector.disconnect()
        print("\n✅ Recall API connector demo completed!")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure all modules are available")
    except Exception as e:
        print(f"❌ Demo failed: {e}")

def demo_integration_with_trading_engine():
    """Demonstrate integration with the trading engine"""
    print("\n⚡ Trading Engine Integration Demo")
    print("=" * 50)
    
    try:
        from src.core.trading_engine import TradingEngine
        from src.core.portfolio import Portfolio
        from src.core.risk_manager import RiskManager
        from src.core.market_data_provider import MarketDataProvider
        from src.core.recall_api_connector import RecallAPIConnector
        from src.database.database_manager import DatabaseManager
        from config.recall_api_config import get_config
        
        # Initialize components
        print("🔧 Initializing trading components...")
        db_manager = DatabaseManager("demo_integration.db")
        market_data = MarketDataProvider()
        portfolio = Portfolio(db_manager)
        risk_manager = RiskManager()
        
        # Initialize Recall connector (with demo config)
        config = get_config('default')
        recall_connector = RecallAPIConnector(config)
        
        # Create trading engine with Recall connector
        trading_engine = TradingEngine(
            market_data, 
            portfolio, 
            risk_manager,
            db_manager,
            recall_connector
        )
        
        # Activate trading engine
        print("✨ Activating trading engine...")
        trading_engine.start()
        
        # Demo spell casting with Recall integration
        print("\n🦌 Casting EXPECTO LONG with Recall integration...")
        spell_result = trading_engine.cast_spell('EXPECTO_LONG', 'bitcoin', 0.01)
        
        if spell_result['success']:
            print(f"✅ {spell_result['message']}")
            
            # Submit trade to Recall
            print("\n📝 Submitting trade to Recall competition...")
            trade_data = {
                'symbol': 'bitcoin',
                'amount': 0.01,
                'spell': 'EXPECTO_LONG'
            }
            
            recall_result = trading_engine.submit_trade_to_recall(trade_data)
            if recall_result['success']:
                print(f"✅ Trade submitted to Recall: {recall_result.get('order_id', 'N/A')}")
            else:
                print(f"⚠️ Recall submission: {recall_result.get('message', 'Unknown error')}")
            
            # Sync portfolio with Recall
            print("\n🔄 Syncing portfolio with Recall...")
            sync_result = trading_engine.sync_portfolio_with_recall()
            if sync_result['success']:
                print(f"✅ Portfolio synced: {sync_result.get('message', 'Success')}")
            else:
                print(f"⚠️ Portfolio sync: {sync_result.get('message', 'Unknown error')}")
            
            # Get competition status
            print("\n📊 Getting competition status...")
            status_result = trading_engine.get_recall_competition_status()
            if status_result['success']:
                print(f"✅ Competition status: {status_result.get('message', 'Retrieved')}")
            else:
                print(f"⚠️ Status retrieval: {status_result.get('message', 'Unknown error')}")
        
        # Cleanup
        trading_engine.stop()
        market_data.stop()
        db_manager.close()
        recall_connector.disconnect()
        os.remove("demo_integration.db")
        
        print("\n✅ Trading engine integration demo completed!")
        
    except Exception as e:
        print(f"❌ Integration demo failed: {e}")

def show_configuration_guide():
    """Show how to configure the Recall API connector"""
    print("\n📋 Recall API Configuration Guide")
    print("=" * 50)
    
    print("To use the Recall API connector with real credentials:")
    print()
    print("1. 📝 Edit config/recall_api_config.py")
    print("   - Replace 'your_api_key_here' with your actual API key")
    print("   - Replace 'your_competition_id_here' with your competition ID")
    print("   - Replace 'your_user_id_here' with your user ID")
    print()
    print("2. 🔧 Update main.py to load the configuration:")
    print("   ```python")
    print("   from config.recall_api_config import get_config")
    print("   recall_config = get_config('default')")
    print("   self.recall_connector = RecallAPIConnector(recall_config)")
    print("   ```")
    print()
    print("3. 🚀 The trading engine will automatically:")
    print("   - Submit trades to Recall competitions")
    print("   - Sync portfolio data")
    print("   - Get competition status")
    print()
    print("4. 🎯 Available methods:")
    print("   - connect_to_recall()")
    print("   - submit_order_to_competition()")
    print("   - get_competition_status()")
    print("   - sync_portfolio_with_api()")
    print()
    print("5. ⚙️ Configuration options:")
    print("   - api_base_url: API endpoint")
    print("   - timeout: Request timeout")
    print("   - retry_attempts: Number of retries")
    print("   - auto_sync: Enable automatic sync")
    print("   - sync_interval: Sync frequency")

def main():
    """Run all Recall API demonstrations"""
    print("🔗 Recall API Integration - Feature Demonstration")
    print("=" * 60)
    print("This demo showcases the Recall API connector integration")
    print("Note: Real API calls will fail without valid credentials")
    print("=" * 60)
    
    # Run demonstrations
    demo_recall_api_connector()
    demo_integration_with_trading_engine()
    show_configuration_guide()
    
    print("\n" + "=" * 60)
    print("🎉 Recall API integration demo completed!")
    print("\n💡 To use with real credentials:")
    print("   1. Update config/recall_api_config.py")
    print("   2. Uncomment the connector initialization in main.py")
    print("   3. Run the application: python main.py")
    print("=" * 60)

if __name__ == "__main__":
    main()