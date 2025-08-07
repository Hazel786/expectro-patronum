"""
Trading Tab - Cast magical trading spells
"""

import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime

class TradingTab:
    """Trading tab with Harry Potter spell buttons"""
    
    def __init__(self, parent, trading_engine, market_data):
        self.parent = parent
        self.trading_engine = trading_engine
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
        """Create the trading tab widgets"""
        self.frame = tk.Frame(self.parent, bg=self.colors['bg_dark'])
        
        # Configure grid
        self.frame.grid_rowconfigure(1, weight=1)
        self.frame.grid_columnconfigure(0, weight=1)
        self.frame.grid_columnconfigure(1, weight=1)
        
        # Header
        self.create_header()
        
        # Main content
        self.create_trading_panel()
        self.create_market_panel()
        
        # Log area
        self.create_log_area()
    
    def create_header(self):
        """Create the trading tab header"""
        header_frame = tk.Frame(self.frame, bg=self.colors['bg_medium'], height=60)
        header_frame.grid(row=0, column=0, columnspan=2, sticky='ew', pady=(0, 10))
        header_frame.grid_propagate(False)
        
        title_label = tk.Label(
            header_frame,
            text="🦌 Cast Your Trading Spells",
            font=('Arial', 14, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['accent']
        )
        title_label.pack(side='left', padx=20, pady=15)
        
        # Quick stats
        stats_frame = tk.Frame(header_frame, bg=self.colors['bg_medium'])
        stats_frame.pack(side='right', padx=20, pady=15)
        
        self.available_cash_label = tk.Label(
            stats_frame,
            text="💰 Available: $10,000.00",
            font=('Arial', 10),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        )
        self.available_cash_label.pack(side='left', padx=(0, 20))
        
        self.open_positions_label = tk.Label(
            stats_frame,
            text="📊 Open Positions: 0",
            font=('Arial', 10),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        )
        self.open_positions_label.pack(side='left')
    
    def create_trading_panel(self):
        """Create the trading spells panel"""
        trading_frame = tk.Frame(self.frame, bg=self.colors['bg_medium'])
        trading_frame.grid(row=1, column=0, sticky='nsew', padx=(0, 5))
        trading_frame.grid_columnconfigure(0, weight=1)
        
        # Trading controls
        controls_frame = tk.Frame(trading_frame, bg=self.colors['bg_medium'])
        controls_frame.grid(row=0, column=0, sticky='ew', padx=20, pady=20)
        controls_frame.grid_columnconfigure(1, weight=1)
        
        # Symbol selection
        tk.Label(
            controls_frame,
            text="🔮 Cryptocurrency:",
            font=('Arial', 11, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        ).grid(row=0, column=0, sticky='w', pady=(0, 5))
        
        self.symbol_var = tk.StringVar(value='bitcoin')
        self.symbol_combo = ttk.Combobox(
            controls_frame,
            textvariable=self.symbol_var,
            values=['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot', 'binancecoin', 'ripple', 'dogecoin'],
            state='readonly',
            font=('Arial', 10)
        )
        self.symbol_combo.grid(row=0, column=1, sticky='ew', pady=(0, 15))
        
        # Amount input
        tk.Label(
            controls_frame,
            text="📏 Amount:",
            font=('Arial', 11, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['text']
        ).grid(row=1, column=0, sticky='w', pady=(0, 5))
        
        self.amount_var = tk.StringVar(value='0.1')
        self.amount_entry = tk.Entry(
            controls_frame,
            textvariable=self.amount_var,
            font=('Arial', 10),
            bg=self.colors['bg_light'],
            fg=self.colors['text'],
            insertbackground=self.colors['text']
        )
        self.amount_entry.grid(row=1, column=1, sticky='ew', pady=(0, 15))
        
        # Current price display
        self.price_label = tk.Label(
            controls_frame,
            text="💎 Current Price: $0.00",
            font=('Arial', 11),
            bg=self.colors['bg_medium'],
            fg=self.colors['accent']
        )
        self.price_label.grid(row=2, column=0, columnspan=2, sticky='w', pady=(0, 20))
        
        # Spell buttons
        spells_frame = tk.Frame(trading_frame, bg=self.colors['bg_medium'])
        spells_frame.grid(row=1, column=0, sticky='ew', padx=20, pady=(0, 20))
        spells_frame.grid_columnconfigure(0, weight=1)
        spells_frame.grid_columnconfigure(1, weight=1)
        spells_frame.grid_columnconfigure(2, weight=1)
        
        # Expecto Long button
        self.long_button = tk.Button(
            spells_frame,
            text="🦌 EXPECTO LONG",
            font=('Arial', 12, 'bold'),
            bg=self.colors['success'],
            fg=self.colors['text'],
            command=self.cast_expecto_long,
            relief='flat',
            padx=20,
            pady=10
        )
        self.long_button.grid(row=0, column=0, padx=5, pady=5, sticky='ew')
        
        # Expecto Short button
        self.short_button = tk.Button(
            spells_frame,
            text="🦌 EXPECTO SHORT",
            font=('Arial', 12, 'bold'),
            bg=self.colors['danger'],
            fg=self.colors['text'],
            command=self.cast_expecto_short,
            relief='flat',
            padx=20,
            pady=10
        )
        self.short_button.grid(row=0, column=1, padx=5, pady=5, sticky='ew')
        
        # Finite Incantatem button
        self.close_button = tk.Button(
            spells_frame,
            text="🛡️ FINITE INCANTATEM",
            font=('Arial', 12, 'bold'),
            bg=self.colors['warning'],
            fg=self.colors['text'],
            command=self.cast_finite_incantatem,
            relief='flat',
            padx=20,
            pady=10
        )
        self.close_button.grid(row=0, column=2, padx=5, pady=5, sticky='ew')
        
        # Additional spells
        extra_spells_frame = tk.Frame(trading_frame, bg=self.colors['bg_medium'])
        extra_spells_frame.grid(row=2, column=0, sticky='ew', padx=20, pady=(0, 20))
        extra_spells_frame.grid_columnconfigure(0, weight=1)
        extra_spells_frame.grid_columnconfigure(1, weight=1)
        
        # Lumos button
        self.lumos_button = tk.Button(
            extra_spells_frame,
            text="✨ LUMOS (Activate)",
            font=('Arial', 10, 'bold'),
            bg=self.colors['accent'],
            fg=self.colors['text'],
            command=self.cast_lumos,
            relief='flat',
            padx=15,
            pady=8
        )
        self.lumos_button.grid(row=0, column=0, padx=5, pady=5, sticky='ew')
        
        # Nox button
        self.nox_button = tk.Button(
            extra_spells_frame,
            text="🌙 NOX (Deactivate)",
            font=('Arial', 10, 'bold'),
            bg=self.colors['bg_light'],
            fg=self.colors['text'],
            command=self.cast_nox,
            relief='flat',
            padx=15,
            pady=8
        )
        self.nox_button.grid(row=0, column=1, padx=5, pady=5, sticky='ew')
    
    def create_market_panel(self):
        """Create the market information panel"""
        market_frame = tk.Frame(self.frame, bg=self.colors['bg_medium'])
        market_frame.grid(row=1, column=1, sticky='nsew', padx=(5, 0))
        market_frame.grid_columnconfigure(0, weight=1)
        
        # Market header
        market_header = tk.Label(
            market_frame,
            text="📊 Market Overview",
            font=('Arial', 12, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['accent']
        )
        market_header.grid(row=0, column=0, sticky='w', padx=20, pady=(20, 10))
        
        # Market data display
        self.market_text = tk.Text(
            market_frame,
            height=15,
            width=40,
            font=('Consolas', 9),
            bg=self.colors['bg_light'],
            fg=self.colors['text'],
            insertbackground=self.colors['text'],
            relief='flat',
            padx=10,
            pady=10
        )
        self.market_text.grid(row=1, column=0, sticky='nsew', padx=20, pady=(0, 20))
        
        # Scrollbar for market text
        market_scrollbar = tk.Scrollbar(market_frame, orient='vertical', command=self.market_text.yview)
        market_scrollbar.grid(row=1, column=1, sticky='ns', pady=(0, 20))
        self.market_text.configure(yscrollcommand=market_scrollbar.set)
    
    def create_log_area(self):
        """Create the trading log area"""
        log_frame = tk.Frame(self.frame, bg=self.colors['bg_medium'])
        log_frame.grid(row=2, column=0, columnspan=2, sticky='ew', pady=(10, 0))
        log_frame.grid_columnconfigure(0, weight=1)
        
        # Log header
        log_header = tk.Label(
            log_frame,
            text="📜 Trading Log",
            font=('Arial', 12, 'bold'),
            bg=self.colors['bg_medium'],
            fg=self.colors['accent']
        )
        log_header.grid(row=0, column=0, sticky='w', padx=20, pady=(20, 10))
        
        # Log text area
        self.log_text = tk.Text(
            log_frame,
            height=8,
            font=('Consolas', 9),
            bg=self.colors['bg_light'],
            fg=self.colors['text'],
            insertbackground=self.colors['text'],
            relief='flat',
            padx=10,
            pady=10
        )
        self.log_text.grid(row=1, column=0, sticky='ew', padx=20, pady=(0, 20))
        
        # Scrollbar for log
        log_scrollbar = tk.Scrollbar(log_frame, orient='vertical', command=self.log_text.yview)
        log_scrollbar.grid(row=1, column=1, sticky='ns', pady=(0, 20))
        self.log_text.configure(yscrollcommand=log_scrollbar.set)
    
    def cast_expecto_long(self):
        """Cast Expecto Long spell"""
        try:
            symbol = self.symbol_var.get()
            amount = float(self.amount_var.get())
            
            if amount <= 0:
                messagebox.showerror("Error", "Amount must be greater than 0")
                return
            
            result = self.trading_engine.cast_spell('EXPECTO_LONG', symbol, amount)
            self.log_spell_result(result)
            
        except ValueError:
            messagebox.showerror("Error", "Please enter a valid amount")
        except Exception as e:
            messagebox.showerror("Error", f"Spell failed: {str(e)}")
    
    def cast_expecto_short(self):
        """Cast Expecto Short spell"""
        try:
            symbol = self.symbol_var.get()
            amount = float(self.amount_var.get())
            
            if amount <= 0:
                messagebox.showerror("Error", "Amount must be greater than 0")
                return
            
            result = self.trading_engine.cast_spell('EXPECTO_SHORT', symbol, amount)
            self.log_spell_result(result)
            
        except ValueError:
            messagebox.showerror("Error", "Please enter a valid amount")
        except Exception as e:
            messagebox.showerror("Error", f"Spell failed: {str(e)}")
    
    def cast_finite_incantatem(self):
        """Cast Finite Incantatem spell"""
        try:
            symbol = self.symbol_var.get()
            result = self.trading_engine.cast_spell('FINITE_INCANTATEM', symbol, 0)
            self.log_spell_result(result)
            
        except Exception as e:
            messagebox.showerror("Error", f"Spell failed: {str(e)}")
    
    def cast_lumos(self):
        """Cast Lumos spell"""
        try:
            result = self.trading_engine.cast_spell('LUMOS', '', 0)
            self.log_spell_result(result)
            
        except Exception as e:
            messagebox.showerror("Error", f"Spell failed: {str(e)}")
    
    def cast_nox(self):
        """Cast Nox spell"""
        try:
            result = self.trading_engine.cast_spell('NOX', '', 0)
            self.log_spell_result(result)
            
        except Exception as e:
            messagebox.showerror("Error", f"Spell failed: {str(e)}")
    
    def log_spell_result(self, result: dict):
        """Log spell result to the trading log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        status = "✅" if result['success'] else "❌"
        
        log_entry = f"[{timestamp}] {status} {result['spell']}: {result['message']}\n"
        
        self.log_text.insert(tk.END, log_entry)
        self.log_text.see(tk.END)
        
        # Show message box
        if result['success']:
            messagebox.showinfo("✨ Spell Cast!", result['message'])
        else:
            messagebox.showerror("❌ Spell Backfired!", result['message'])
    
    def update_display(self):
        """Update the trading tab display"""
        try:
            # Update current price
            symbol = self.symbol_var.get()
            price = self.market_data.get_price(symbol)
            if price:
                self.price_label.config(text=f"💎 Current Price: ${price:,.2f}")
            
            # Update market overview
            self.update_market_overview()
            
            # Update portfolio info
            self.update_portfolio_info()
            
        except Exception as e:
            print(f"Error updating trading display: {e}")
    
    def update_market_overview(self):
        """Update market overview display"""
        try:
            self.market_text.delete(1.0, tk.END)
            
            prices = self.market_data.get_all_prices()
            if not prices:
                self.market_text.insert(tk.END, "📡 Connecting to market...\n")
                return
            
            self.market_text.insert(tk.END, "🪙 Top Cryptocurrencies:\n\n")
            
            for coin_id, data in prices.items():
                price = data['price']
                change = data['change_24h']
                change_symbol = "📈" if change >= 0 else "📉"
                change_color = self.colors['success'] if change >= 0 else self.colors['danger']
                
                line = f"{coin_id.upper()}: ${price:,.2f} {change_symbol} {change:+.2f}%\n"
                self.market_text.insert(tk.END, line)
            
            self.market_text.insert(tk.END, f"\n🕐 Last Update: {datetime.now().strftime('%H:%M:%S')}")
            
        except Exception as e:
            print(f"Error updating market overview: {e}")
    
    def update_portfolio_info(self):
        """Update portfolio information"""
        try:
            # This would be updated from the main window
            pass
        except Exception as e:
            print(f"Error updating portfolio info: {e}")