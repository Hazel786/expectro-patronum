"""
Main Window - The magical GUI for Expecto Patronum
"""

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from datetime import datetime

from .trading_tab import TradingTab
from .portfolio_tab import PortfolioTab
from .charts_tab import ChartsTab

class MainWindow:
    """Main application window with Harry Potter theme"""
    
    def __init__(self, root, trading_engine, portfolio, market_data):
        self.root = root
        self.trading_engine = trading_engine
        self.portfolio = portfolio
        self.market_data = market_data
        
        # Harry Potter color scheme
        self.colors = {
            'bg_dark': '#1a1a2e',      # Dark magical blue
            'bg_medium': '#16213e',     # Medium blue
            'bg_light': '#0f3460',      # Light blue
            'accent': '#e94560',        # Magical red
            'text': '#ffffff',          # White text
            'text_secondary': '#a8a8a8', # Gray text
            'success': '#4ade80',       # Green for profits
            'danger': '#f87171',        # Red for losses
            'warning': '#fbbf24'        # Yellow for warnings
        }
        
        self.setup_window()
        self.create_widgets()
        self.setup_styles()
        
        # Start GUI updates
        self.update_displays()
    
    def setup_window(self):
        """Setup the main window"""
        self.root.title("Expecto Patronum - Magical Trading Agent")
        self.root.configure(bg=self.colors['bg_dark'])
        
        # Configure grid weights
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(0, weight=1)
    
    def create_widgets(self):
        """Create the main GUI widgets"""
        # Main container
        self.main_frame = tk.Frame(self.root, bg=self.colors['bg_dark'])
        self.main_frame.grid(row=0, column=0, sticky='nsew', padx=10, pady=10)
        self.main_frame.grid_rowconfigure(1, weight=1)
        self.main_frame.grid_columnconfigure(0, weight=1)
        
        # Header
        self.create_header()
        
        # Notebook for tabs
        self.notebook = ttk.Notebook(self.main_frame)
        self.notebook.grid(row=1, column=0, sticky='nsew', pady=(10, 0))
        
        # Create tabs
        self.trading_tab = TradingTab(self.notebook, self.trading_engine, self.market_data)
        self.portfolio_tab = PortfolioTab(self.notebook, self.portfolio, self.market_data)
        self.charts_tab = ChartsTab(self.notebook, self.market_data)
        
        # Add tabs to notebook
        self.notebook.add(self.trading_tab.frame, text="🦌 Trading Spells")
        self.notebook.add(self.portfolio_tab.frame, text="📜 Portfolio")
        self.notebook.add(self.charts_tab.frame, text="📊 Charts")
        
        # Status bar
        self.create_status_bar()
    
    def create_header(self):
        """Create the header with title and status"""
        header_frame = tk.Frame(self.main_frame, bg=self.colors['bg_medium'], height=80)
        header_frame.grid(row=0, column=0, sticky='ew', pady=(0, 10))
        header_frame.grid_propagate(False)
        header_frame.grid_columnconfigure(1, weight=1)
        
        # Title
        title_label = tk.Label(
            header_frame,
            text="🦌 Expecto Patronum Trading Agent",
            font=('Arial', 16, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['accent']
        )
        title_label.grid(row=0, column=0, padx=20, pady=10, sticky='w')
        
        # Status indicators
        status_frame = tk.Frame(header_frame, bg=self.colors['bg_medium'])
        status_frame.grid(row=0, column=1, padx=20, pady=10, sticky='e')
        
        # Engine status
        self.engine_status = tk.Label(
            status_frame,
            text="⚡ Engine: Active",
            font=('Arial', 10),
            bg=self.colors['bg_medium'],
            fg=self.colors['success']
        )
        self.engine_status.grid(row=0, column=0, padx=(0, 20))
        
        # Market data status
        self.market_status = tk.Label(
            status_frame,
            text="📡 Market: Connected",
            font=('Arial', 10),
            bg=self.colors['bg_medium'],
            fg=self.colors['success']
        )
        self.market_status.grid(row=0, column=1, padx=(0, 20))
        
        # Last update time
        self.last_update_label = tk.Label(
            status_frame,
            text="🕐 Last Update: --",
            font=('Arial', 10),
            bg=self.colors['bg_medium'],
            fg=self.colors['text_secondary']
        )
        self.last_update_label.grid(row=0, column=2)
    
    def create_status_bar(self):
        """Create the status bar"""
        status_bar = tk.Frame(self.main_frame, bg=self.colors['bg_medium'], height=30)
        status_bar.grid(row=2, column=0, sticky='ew', pady=(10, 0))
        status_bar.grid_propagate(False)
        status_bar.grid_columnconfigure(1, weight=1)
        
        # Session info
        session_label = tk.Label(
            status_bar,
            text="Session: 0 trades | P&L: $0.00",
            font=('Arial', 9),
            bg=self.colors['bg_medium'],
            fg=self.colors['text_secondary']
        )
        session_label.grid(row=0, column=0, padx=10, pady=5, sticky='w')
        
        # Version info
        version_label = tk.Label(
            status_bar,
            text="Expecto Patronum v1.0 | Harry Potter Trading Magic",
            font=('Arial', 9),
            bg=self.colors['bg_medium'],
            fg=self.colors['text_secondary']
        )
        version_label.grid(row=0, column=1, padx=10, pady=5, sticky='e')
        
        self.session_label = session_label
    
    def setup_styles(self):
        """Setup custom styles for the GUI"""
        style = ttk.Style()
        
        # Configure notebook style
        style.configure('TNotebook', background=self.colors['bg_dark'])
        style.configure('TNotebook.Tab', 
                       background=self.colors['bg_medium'],
                       foreground=self.colors['text'],
                       padding=[10, 5])
        style.map('TNotebook.Tab',
                 background=[('selected', self.colors['accent'])],
                 foreground=[('selected', self.colors['text'])])
    
    def update_displays(self):
        """Update all displays with current data"""
        try:
            # Update status indicators
            self.update_status_indicators()
            
            # Update session info
            self.update_session_info()
            
            # Update tab displays
            self.trading_tab.update_display()
            self.portfolio_tab.update_display()
            self.charts_tab.update_display()
            
            # Schedule next update
            self.root.after(5000, self.update_displays)
            
        except Exception as e:
            print(f"Error updating displays: {e}")
    
    def update_status_indicators(self):
        """Update status indicators"""
        try:
            # Engine status
            if self.trading_engine.running:
                self.engine_status.config(text="⚡ Engine: Active", fg=self.colors['success'])
            else:
                self.engine_status.config(text="⚡ Engine: Inactive", fg=self.colors['danger'])
            
            # Market data status
            prices = self.market_data.get_all_prices()
            if prices:
                self.market_status.config(text="📡 Market: Connected", fg=self.colors['success'])
            else:
                self.market_status.config(text="📡 Market: Disconnected", fg=self.colors['danger'])
            
            # Last update time
            current_time = datetime.now().strftime("%H:%M:%S")
            self.last_update_label.config(text=f"🕐 Last Update: {current_time}")
            
        except Exception as e:
            print(f"Error updating status indicators: {e}")
    
    def update_session_info(self):
        """Update session information"""
        try:
            stats = self.trading_engine.get_session_stats()
            portfolio_stats = self.portfolio.get_portfolio_stats()
            
            session_text = f"Session: {stats['total_trades']} trades | P&L: ${portfolio_stats['total_pnl']:,.2f}"
            self.session_label.config(text=session_text)
            
        except Exception as e:
            print(f"Error updating session info: {e}")
    
    def show_message(self, title: str, message: str, message_type: str = "info"):
        """Show a message box"""
        if message_type == "error":
            messagebox.showerror(title, message)
        elif message_type == "warning":
            messagebox.showwarning(title, message)
        else:
            messagebox.showinfo(title, message)
    
    def show_spell_result(self, result: dict):
        """Show the result of a cast spell"""
        if result['success']:
            self.show_message("✨ Spell Cast Successfully!", result['message'], "info")
        else:
            self.show_message("❌ Spell Backfired!", result['message'], "error")