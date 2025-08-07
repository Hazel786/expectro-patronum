"""
Portfolio Tab - Display portfolio information and positions
"""

import tkinter as tk
from tkinter import ttk
from datetime import datetime

class PortfolioTab:
    """Portfolio tab showing positions and portfolio value"""
    
    def __init__(self, parent, portfolio, market_data):
        self.parent = parent
        self.portfolio = portfolio
        self.market_data = market_data
        
        # Harry Potter color scheme
        self.colors = {
            'bg_dark': '#1a1a2e',
            'bg_medium': '#16213e',
            'bg_light': '#0f3460',
            'accent': '#e94560',
            'text': '#ffffff',
            'text_secondary': '#a8a8a8',
            'success': '#4ade80',
            'danger': '#f87171',
            'warning': '#fbbf24'
        }
        
        self.create_widgets()
    
    def create_widgets(self):
        """Create the portfolio tab widgets"""
        self.frame = tk.Frame(self.parent, bg=self.colors['bg_dark'])
        
        # Configure grid
        self.frame.grid_rowconfigure(1, weight=1)
        self.frame.grid_columnconfigure(0, weight=1)
        self.frame.grid_columnconfigure(1, weight=1)
        
        # Header
        self.create_header()
        
        # Portfolio overview
        self.create_portfolio_overview()
        
        # Positions list
        self.create_positions_list()
    
    def create_header(self):
        """Create the portfolio tab header"""
        header_frame = tk.Frame(self.frame, bg=self.colors['bg_medium'], height=60)
        header_frame.grid(row=0, column=0, columnspan=2, sticky='ew', pady=(0, 10))
        header_frame.grid_propagate(False)
        
        title_label = tk.Label(
            header_frame,
            text="📜 Your Magical Portfolio",
            font=('Arial', 14, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['accent']
        )
        title_label.pack(side='left', padx=20, pady=15)
        
        # Portfolio stats
        stats_frame = tk.Frame(header_frame, bg=self.colors['bg_medium'])
        stats_frame.pack(side='right', padx=20, pady=15)
        
        self.total_value_label = tk.Label(
            stats_frame,
            text="💰 Total Value: $10,000.00",
            font=('Arial', 10, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['success']
        )
        self.total_value_label.pack(side='left', padx=(0, 20))
        
        self.total_pnl_label = tk.Label(
            stats_frame,
            text="📊 Total P&L: $0.00 (0.00%)",
            font=('Arial', 10),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        )
        self.total_pnl_label.pack(side='left')
    
    def create_portfolio_overview(self):
        """Create portfolio overview panel"""
        overview_frame = tk.Frame(self.frame, bg=self.colors['bg_medium'])
        overview_frame.grid(row=1, column=0, sticky='nsew', padx=(0, 5))
        overview_frame.grid_columnconfigure(0, weight=1)
        
        # Overview header
        overview_header = tk.Label(
            overview_frame,
            text="📊 Portfolio Overview",
            font=('Arial', 12, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['accent']
        )
        overview_header.grid(row=0, column=0, sticky='w', padx=20, pady=(20, 10))
        
        # Portfolio details
        details_frame = tk.Frame(overview_frame, bg=self.colors['bg_medium'])
        details_frame.grid(row=1, column=0, sticky='ew', padx=20, pady=(0, 20))
        details_frame.grid_columnconfigure(1, weight=1)
        
        # Cash
        tk.Label(
            details_frame,
            text="💵 Cash:",
            font=('Arial', 11, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        ).grid(row=0, column=0, sticky='w', pady=5)
        
        self.cash_label = tk.Label(
            details_frame,
            text="$10,000.00",
            font=('Arial', 11),
            bg=self.colors['bg_medium'],
            fg=self.colors['success']
        )
        self.cash_label.grid(row=0, column=1, sticky='w', padx=(10, 0), pady=5)
        
        # Total P&L
        tk.Label(
            details_frame,
            text="📈 Total P&L:",
            font=('Arial', 11, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        ).grid(row=1, column=0, sticky='w', pady=5)
        
        self.pnl_label = tk.Label(
            details_frame,
            text="$0.00 (0.00%)",
            font=('Arial', 11),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        )
        self.pnl_label.grid(row=1, column=1, sticky='w', padx=(10, 0), pady=5)
        
        # Win rate
        tk.Label(
            details_frame,
            text="🎯 Win Rate:",
            font=('Arial', 11, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        ).grid(row=2, column=0, sticky='w', pady=5)
        
        self.win_rate_label = tk.Label(
            details_frame,
            text="0.00%",
            font=('Arial', 11),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        )
        self.win_rate_label.grid(row=2, column=1, sticky='w', padx=(10, 0), pady=5)
        
        # Total trades
        tk.Label(
            details_frame,
            text="🔄 Total Trades:",
            font=('Arial', 11, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        ).grid(row=3, column=0, sticky='w', pady=5)
        
        self.total_trades_label = tk.Label(
            details_frame,
            text="0",
            font=('Arial', 11),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        )
        self.total_trades_label.grid(row=3, column=1, sticky='w', padx=(10, 0), pady=5)
        
        # Open positions
        tk.Label(
            details_frame,
            text="📊 Open Positions:",
            font=('Arial', 11, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        ).grid(row=4, column=0, sticky='w', pady=5)
        
        self.open_positions_label = tk.Label(
            details_frame,
            text="0",
            font=('Arial', 11),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        )
        self.open_positions_label.grid(row=4, column=1, sticky='w', padx=(10, 0), pady=5)
        
        # Session stats
        session_frame = tk.Frame(overview_frame, bg=self.colors['bg_light'])
        session_frame.grid(row=2, column=0, sticky='ew', padx=20, pady=(0, 20))
        session_frame.grid_columnconfigure(0, weight=1)
        
        session_header = tk.Label(
            session_frame,
            text="⚡ Session Statistics",
            font=('Arial', 11, 'bold'),
            bg=self.colors['bg_light'],
            fg=self.colors['accent']
        )
        session_header.grid(row=0, column=0, sticky='w', padx=10, pady=(10, 5))
        
        self.session_stats_label = tk.Label(
            session_frame,
            text="Duration: 00:00:00 | Trades: 0 | Success Rate: 0.00%",
            font=('Arial', 9),
            bg=self.colors['bg_light'],
            fg=self.colors['text_secondary']
        )
        self.session_stats_label.grid(row=1, column=0, sticky='w', padx=10, pady=(0, 10))
    
    def create_positions_list(self):
        """Create positions list panel"""
        positions_frame = tk.Frame(self.frame, bg=self.colors['bg_medium'])
        positions_frame.grid(row=1, column=1, sticky='nsew', padx=(5, 0))
        positions_frame.grid_columnconfigure(0, weight=1)
        positions_frame.grid_rowconfigure(1, weight=1)
        
        # Positions header
        positions_header = tk.Label(
            positions_frame,
            text="📋 Open Positions",
            font=('Arial', 12, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['accent']
        )
        positions_header.grid(row=0, column=0, sticky='w', padx=20, pady=(20, 10))
        
        # Create Treeview for positions
        columns = ('Symbol', 'Type', 'Amount', 'Entry Price', 'Current Price', 'P&L', 'P&L %')
        self.positions_tree = ttk.Treeview(
            positions_frame,
            columns=columns,
            show='headings',
            height=15
        )
        
        # Configure columns
        for col in columns:
            self.positions_tree.heading(col, text=col)
            self.positions_tree.column(col, width=100, anchor='center')
        
        # Configure Treeview style
        style = ttk.Style()
        style.configure("Treeview",
                       background=self.colors['bg_light'],
                       foreground=self.colors['text'],
                       fieldbackground=self.colors['bg_light'],
                       rowheight=25)
        style.configure("Treeview.Heading",
                       background=self.colors['bg_medium'],
                       foreground=self.colors['accent'],
                       relief='flat')
        
        self.positions_tree.grid(row=1, column=0, sticky='nsew', padx=20, pady=(0, 20))
        
        # Scrollbar for positions
        positions_scrollbar = ttk.Scrollbar(positions_frame, orient='vertical', command=self.positions_tree.yview)
        positions_scrollbar.grid(row=1, column=1, sticky='ns', pady=(0, 20))
        self.positions_tree.configure(yscrollcommand=positions_scrollbar.set)
        
        # No positions message
        self.no_positions_label = tk.Label(
            positions_frame,
            text="No open positions",
            font=('Arial', 11),
            bg=self.colors['bg_medium'],
            fg=self.colors['text_secondary']
        )
        self.no_positions_label.grid(row=1, column=0, padx=20, pady=20)
    
    def update_display(self):
        """Update the portfolio tab display"""
        try:
            # Get current prices
            current_prices = {}
            for symbol in self.portfolio.positions.keys():
                price = self.market_data.get_price(symbol)
                if price:
                    current_prices[symbol] = price
            
            # Update portfolio value
            portfolio_value = self.portfolio.get_portfolio_value(current_prices)
            self.update_portfolio_overview(portfolio_value)
            
            # Update positions list
            self.update_positions_list(current_prices)
            
        except Exception as e:
            print(f"Error updating portfolio display: {e}")
    
    def update_portfolio_overview(self, portfolio_value: dict):
        """Update portfolio overview with current values"""
        try:
            # Update total value
            total_value = portfolio_value['total_value']
            self.total_value_label.config(text=f"💰 Total Value: ${total_value:,.2f}")
            
            # Update cash
            cash = portfolio_value['cash']
            self.cash_label.config(text=f"${cash:,.2f}")
            
            # Update P&L
            total_pnl = portfolio_value['total_pnl']
            total_pnl_percent = portfolio_value['total_pnl_percent']
            
            pnl_color = self.colors['success'] if total_pnl >= 0 else self.colors['danger']
            self.pnl_label.config(
                text=f"${total_pnl:,.2f} ({total_pnl_percent:+.2f}%)",
                fg=pnl_color
            )
            self.total_pnl_label.config(
                text=f"📊 Total P&L: ${total_pnl:,.2f} ({total_pnl_percent:+.2f}%)",
                fg=pnl_color
            )
            
            # Update portfolio stats
            stats = self.portfolio.get_portfolio_stats()
            self.win_rate_label.config(text=f"{stats['winning_trades'] / max(1, stats['total_trades']) * 100:.2f}%")
            self.total_trades_label.config(text=str(stats['total_trades']))
            self.open_positions_label.config(text=str(stats['open_positions']))
            
        except Exception as e:
            print(f"Error updating portfolio overview: {e}")
    
    def update_positions_list(self, current_prices: dict):
        """Update the positions list"""
        try:
            # Clear existing items
            for item in self.positions_tree.get_children():
                self.positions_tree.delete(item)
            
            # Get all positions
            all_positions = self.portfolio.get_positions()
            open_positions = [p for p in all_positions if p['status'] == 'OPEN']
            
            if not open_positions:
                self.no_positions_label.grid()
                self.positions_tree.grid_remove()
            else:
                self.no_positions_label.grid_remove()
                self.positions_tree.grid()
                
                # Add positions to tree
                for position in open_positions:
                    symbol = position['symbol']
                    position_type = position['type']
                    amount = position['amount']
                    entry_price = position['entry_price']
                    
                    # Get current price
                    current_price = current_prices.get(symbol, entry_price)
                    
                    # Calculate P&L
                    if position_type == 'LONG':
                        pnl = (current_price - entry_price) * amount
                    else:  # SHORT
                        pnl = (entry_price - current_price) * amount
                    
                    pnl_percent = (pnl / (entry_price * amount)) * 100
                    
                    # Determine P&L color
                    pnl_color = self.colors['success'] if pnl >= 0 else self.colors['danger']
                    
                    # Insert into tree
                    item = self.positions_tree.insert('', 'end', values=(
                        symbol.upper(),
                        position_type,
                        f"{amount:.4f}",
                        f"${entry_price:,.2f}",
                        f"${current_price:,.2f}",
                        f"${pnl:,.2f}",
                        f"{pnl_percent:+.2f}%"
                    ))
                    
                    # Color the row based on P&L
                    if pnl >= 0:
                        self.positions_tree.tag_configure('positive', foreground=self.colors['success'])
                        self.positions_tree.item(item, tags=('positive',))
                    else:
                        self.positions_tree.tag_configure('negative', foreground=self.colors['danger'])
                        self.positions_tree.item(item, tags=('negative',))
            
        except Exception as e:
            print(f"Error updating positions list: {e}")