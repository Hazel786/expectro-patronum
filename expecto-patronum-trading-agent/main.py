#!/usr/bin/env python3
"""
Expecto Patronum - Magical Crypto Trading Agent
A Harry Potter-themed cryptocurrency trading simulator
"""

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.gui.main_window import MainWindow
from src.core.trading_engine import TradingEngine
from src.core.portfolio import Portfolio
from src.core.risk_manager import RiskManager
from src.core.market_data_provider import MarketDataProvider
from src.core.recall_api_connector import RecallAPIConnector
from src.database.database_manager import DatabaseManager

class ExpectoPatronumApp:
    """Main application class for the Expecto Patronum trading agent"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.setup_main_window()
        
        # Initialize core components
        self.db_manager = DatabaseManager()
        self.market_data = MarketDataProvider()
        self.portfolio = Portfolio(self.db_manager)
        self.risk_manager = RiskManager()
        
        # Initialize Recall API connector (optional)
        self.recall_connector = None
        try:
            # You can load config from config/recall_api_config.py
            # from config.recall_api_config import get_config
            # recall_config = get_config('default')
            # self.recall_connector = RecallAPIConnector(recall_config)
            pass
        except Exception as e:
            print(f"⚠️ Recall API connector not initialized: {e}")
        
        self.trading_engine = TradingEngine(
            self.market_data, 
            self.portfolio, 
            self.risk_manager,
            self.db_manager,
            self.recall_connector
        )
        
        # Initialize GUI
        self.main_window = MainWindow(
            self.root, 
            self.trading_engine, 
            self.portfolio,
            self.market_data
        )
        
        # Start background tasks
        self.start_background_tasks()
    
    def setup_main_window(self):
        """Setup the main application window with Harry Potter theme"""
        self.root.title("Expecto Patronum - Magical Trading Agent")
        self.root.geometry("1200x800")
        self.root.configure(bg='#1a1a2e')  # Dark magical blue
        
        # Set window icon (if available)
        try:
            self.root.iconbitmap('assets/patronus.ico')
        except:
            pass
        
        # Configure style
        style = ttk.Style()
        style.theme_use('clam')
        
        # Harry Potter color scheme
        style.configure('Magical.TFrame', background='#1a1a2e')
        style.configure('Magical.TLabel', 
                       background='#1a1a2e', 
                       foreground='#e94560',
                       font=('Arial', 10, 'bold'))
        style.configure('Magical.TButton',
                       background='#16213e',
                       foreground='#e94560',
                       font=('Arial', 10, 'bold'))
        
        # Center window on screen
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (1200 // 2)
        y = (self.root.winfo_screenheight() // 2) - (800 // 2)
        self.root.geometry(f"1200x800+{x}+{y}")
    
    def start_background_tasks(self):
        """Start background tasks for real-time data updates"""
        def update_market_data():
            while True:
                try:
                    self.market_data.update_prices()
                    time.sleep(30)  # Update every 30 seconds
                except Exception as e:
                    print(f"Error updating market data: {e}")
                    time.sleep(60)  # Wait longer on error
        
        def update_gui():
            while True:
                try:
                    self.main_window.update_displays()
                    time.sleep(5)  # Update GUI every 5 seconds
                except Exception as e:
                    print(f"Error updating GUI: {e}")
                    time.sleep(10)
        
        # Start background threads
        market_thread = threading.Thread(target=update_market_data, daemon=True)
        gui_thread = threading.Thread(target=update_gui, daemon=True)
        
        market_thread.start()
        gui_thread.start()
    
    def run(self):
        """Start the application"""
        try:
            print("🦌 Expecto Patronum Trading Agent Starting...")
            print("✨ Welcome to the magical world of crypto trading!")
            self.root.mainloop()
        except KeyboardInterrupt:
            print("\n🛡️ Closing Expecto Patronum...")
        except Exception as e:
            print(f"❌ Error running application: {e}")
            messagebox.showerror("Error", f"Application error: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Cleanup resources before exit"""
        try:
            if hasattr(self, 'trading_engine'):
                self.trading_engine.stop()
            if hasattr(self, 'db_manager'):
                self.db_manager.close()
            print("🧹 Cleanup completed")
        except Exception as e:
            print(f"Error during cleanup: {e}")

def main():
    """Main entry point"""
    try:
        app = ExpectoPatronumApp()
        app.run()
    except Exception as e:
        print(f"❌ Failed to start Expecto Patronum: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()