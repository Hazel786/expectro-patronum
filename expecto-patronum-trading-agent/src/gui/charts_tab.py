"""
Charts Tab - Simple price charts without matplotlib
"""

import tkinter as tk
from tkinter import ttk
from datetime import datetime, timedelta

class ChartsTab:
    """Charts tab with simple text-based price charts"""
    
    def __init__(self, parent, market_data):
        self.parent = parent
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
        """Create the charts tab widgets"""
        self.frame = tk.Frame(self.parent, bg=self.colors['bg_dark'])
        
        # Configure grid
        self.frame.grid_rowconfigure(1, weight=1)
        self.frame.grid_columnconfigure(0, weight=1)
        
        # Header
        self.create_header()
        
        # Chart area
        self.create_chart_area()
    
    def create_header(self):
        """Create the charts tab header"""
        header_frame = tk.Frame(self.frame, bg=self.colors['bg_medium'], height=60)
        header_frame.grid(row=0, column=0, sticky='ew', pady=(0, 10))
        header_frame.grid_propagate(False)
        header_frame.grid_columnconfigure(1, weight=1)
        
        # Title
        title_label = tk.Label(
            header_frame,
            text="📊 Magical Price Charts",
            font=('Arial', 14, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['accent']
        )
        title_label.grid(row=0, column=0, padx=20, pady=15, sticky='w')
        
        # Chart controls
        controls_frame = tk.Frame(header_frame, bg=self.colors['bg_medium'])
        controls_frame.grid(row=0, column=1, padx=20, pady=15, sticky='e')
        
        # Symbol selection
        tk.Label(
            controls_frame,
            text="🔮 Symbol:",
            font=('Arial', 10, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        ).pack(side='left', padx=(0, 5))
        
        self.symbol_var = tk.StringVar(value='bitcoin')
        self.symbol_combo = ttk.Combobox(
            controls_frame,
            textvariable=self.symbol_var,
            values=['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot', 'binancecoin', 'ripple', 'dogecoin'],
            state='readonly',
            font=('Arial', 9),
            width=12
        )
        self.symbol_combo.pack(side='left', padx=(0, 10))
        self.symbol_combo.bind('<<ComboboxSelected>>', self.on_symbol_change)
        
        # Timeframe selection
        tk.Label(
            controls_frame,
            text="⏰ Timeframe:",
            font=('Arial', 10, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        ).pack(side='left', padx=(0, 5))
        
        self.timeframe_var = tk.StringVar(value='24h')
        self.timeframe_combo = ttk.Combobox(
            controls_frame,
            textvariable=self.timeframe_var,
            values=['1h', '6h', '24h', '7d'],
            state='readonly',
            font=('Arial', 9),
            width=8
        )
        self.timeframe_combo.pack(side='left', padx=(0, 10))
        self.timeframe_combo.bind('<<ComboboxSelected>>', self.on_timeframe_change)
        
        # Update button
        self.update_button = tk.Button(
            controls_frame,
            text="🔄 Update Chart",
            font=('Arial', 9, 'bold'),
            bg=self.colors['accent'],
            fg=self.colors['text'],
            command=self.update_chart,
            relief='flat',
            padx=10,
            pady=5
        )
        self.update_button.pack(side='left')
    
    def create_chart_area(self):
        """Create the chart display area"""
        chart_frame = tk.Frame(self.frame, bg=self.colors['bg_medium'])
        chart_frame.grid(row=1, column=0, sticky='nsew', padx=10, pady=(0, 10))
        chart_frame.grid_columnconfigure(0, weight=1)
        chart_frame.grid_rowconfigure(0, weight=1)
        
        # Create text widget for chart display
        self.chart_text = tk.Text(
            chart_frame,
            font=('Consolas', 10),
            bg=self.colors['bg_light'],
            fg=self.colors['text'],
            insertbackground=self.colors['text'],
            relief='flat',
            padx=15,
            pady=15,
            wrap='none'
        )
        self.chart_text.grid(row=0, column=0, sticky='nsew')
        
        # Scrollbars
        v_scrollbar = tk.Scrollbar(chart_frame, orient='vertical', command=self.chart_text.yview)
        v_scrollbar.grid(row=0, column=1, sticky='ns')
        
        h_scrollbar = tk.Scrollbar(chart_frame, orient='horizontal', command=self.chart_text.xview)
        h_scrollbar.grid(row=1, column=0, sticky='ew')
        
        self.chart_text.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        # Initial chart
        self.update_chart()
    
    def on_symbol_change(self, event=None):
        """Handle symbol change"""
        self.update_chart()
    
    def on_timeframe_change(self, event=None):
        """Handle timeframe change"""
        self.update_chart()
    
    def create_text_chart(self, prices: list, timestamps: list) -> str:
        """Create a simple text-based chart"""
        if not prices or len(prices) < 2:
            return "No data available for chart"
        
        # Find min and max for scaling
        min_price = min(prices)
        max_price = max(prices)
        price_range = max_price - min_price
        
        if price_range == 0:
            return "No price variation in selected period"
        
        # Create chart
        chart_lines = []
        chart_lines.append(f"Price Chart - Range: ${min_price:,.2f} to ${max_price:,.2f}")
        chart_lines.append("=" * 60)
        
        # Create simple ASCII chart
        height = 15
        for i in range(height):
            line = ""
            for j, price in enumerate(prices):
                # Normalize price to chart height
                normalized = (price - min_price) / price_range
                chart_pos = int(normalized * (height - 1))
                
                if chart_pos == (height - 1 - i):
                    line += "█"  # Full block for price point
                elif chart_pos > (height - 1 - i):
                    line += "│"  # Vertical line for area below
                else:
                    line += " "  # Empty space
            chart_lines.append(line)
        
        chart_lines.append("=" * 60)
        
        # Add price labels
        price_labels = []
        for i, price in enumerate(prices):
            if i % max(1, len(prices) // 10) == 0:  # Show every 10th price
                price_labels.append(f"${price:,.0f}")
            else:
                price_labels.append("")
        
        # Add time labels
        time_labels = []
        for i, timestamp in enumerate(timestamps):
            if i % max(1, len(timestamps) // 10) == 0:  # Show every 10th timestamp
                if isinstance(timestamp, datetime):
                    time_labels.append(timestamp.strftime("%H:%M"))
                else:
                    time_labels.append(str(timestamp)[:5])
            else:
                time_labels.append("")
        
        # Add labels
        chart_lines.append("Prices: " + " ".join(price_labels))
        chart_lines.append("Times:  " + " ".join(time_labels))
        
        return "\n".join(chart_lines)
    
    def update_chart(self):
        """Update the price chart"""
        try:
            symbol = self.symbol_var.get()
            timeframe = self.timeframe_var.get()
            
            # Clear previous chart
            self.chart_text.delete(1.0, tk.END)
            
            # Get price history
            hours = self.get_hours_from_timeframe(timeframe)
            price_history = self.market_data.get_price_history(symbol, hours)
            
            if not price_history:
                # Show placeholder
                self.chart_text.insert(tk.END, f"No data available for {symbol.upper()}\n")
                self.chart_text.insert(tk.END, "Please wait for market data to load...\n")
                return
            
            # Extract data
            timestamps = [point['timestamp'] for point in price_history]
            prices = [point['price'] for point in price_history]
            
            # Create chart
            chart_content = self.create_text_chart(prices, timestamps)
            
            # Add header
            header = f"{symbol.upper()} Price Chart ({timeframe})\n"
            header += f"Current Price: ${prices[-1]:,.2f}\n"
            header += f"Data Points: {len(prices)}\n"
            header += "-" * 60 + "\n\n"
            
            self.chart_text.insert(tk.END, header)
            self.chart_text.insert(tk.END, chart_content)
            
            # Add statistics
            if len(prices) > 1:
                current_price = prices[-1]
                min_price = min(prices)
                max_price = max(prices)
                price_change = current_price - prices[0]
                price_change_pct = (price_change / prices[0]) * 100
                
                stats = f"\n\n📊 Price Statistics:\n"
                stats += f"Current: ${current_price:,.2f}\n"
                stats += f"High:    ${max_price:,.2f}\n"
                stats += f"Low:     ${min_price:,.2f}\n"
                stats += f"Change:  ${price_change:+,.2f} ({price_change_pct:+.2f}%)\n"
                stats += f"Range:   ${max_price - min_price:,.2f}\n"
                
                self.chart_text.insert(tk.END, stats)
            
        except Exception as e:
            print(f"Error updating chart: {e}")
            self.chart_text.delete(1.0, tk.END)
            self.chart_text.insert(tk.END, f"Error loading chart:\n{str(e)}")
    
    def get_hours_from_timeframe(self, timeframe: str) -> int:
        """Convert timeframe string to hours"""
        timeframe_map = {
            '1h': 1,
            '6h': 6,
            '24h': 24,
            '7d': 168
        }
        return timeframe_map.get(timeframe, 24)
    
    def update_display(self):
        """Update the charts tab display"""
        # Charts are updated on demand, not automatically
        pass