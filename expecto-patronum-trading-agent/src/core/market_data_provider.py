"""
Market Data Provider - Magical price fetching from CoinGecko
"""

import urllib.request
import urllib.parse
import json
import time
import threading
from typing import Dict, Optional, List
import logging
from datetime import datetime, timedelta

class MarketDataProvider:
    """Magical market data provider that fetches real-time crypto prices"""
    
    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        self.prices = {}  # symbol -> price data
        self.price_history = {}  # symbol -> list of price points
        self.last_update = {}
        self.update_interval = 30  # seconds
        self.session = None
        
        # Supported cryptocurrencies
        self.supported_coins = {
            'bitcoin': 'bitcoin',
            'btc': 'bitcoin',
            'ethereum': 'ethereum', 
            'eth': 'ethereum',
            'cardano': 'cardano',
            'ada': 'cardano',
            'solana': 'solana',
            'sol': 'solana',
            'polkadot': 'polkadot',
            'dot': 'polkadot',
            'binancecoin': 'binancecoin',
            'bnb': 'binancecoin',
            'ripple': 'ripple',
            'xrp': 'ripple',
            'dogecoin': 'dogecoin',
            'doge': 'dogecoin'
        }
        
        # Initialize price history storage
        for coin_id in set(self.supported_coins.values()):
            self.price_history[coin_id] = []
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Start background price updates
        self.running = True
        self.update_thread = threading.Thread(target=self._background_updates, daemon=True)
        self.update_thread.start()
    
    def _background_updates(self):
        """Background thread for updating prices"""
        while self.running:
            try:
                self.update_prices()
                time.sleep(self.update_interval)
            except Exception as e:
                self.logger.error(f"Error in background price updates: {e}")
                time.sleep(60)  # Wait longer on error
    
    def _make_request(self, url: str, params: Dict = None) -> Optional[Dict]:
        """Make HTTP request using urllib"""
        try:
            if params:
                query_string = urllib.parse.urlencode(params)
                url = f"{url}?{query_string}"
            
            # Create request with headers
            req = urllib.request.Request(url)
            req.add_header('User-Agent', 'ExpectoPatronum/1.0')
            
            # Make request
            with urllib.request.urlopen(req, timeout=10) as response:
                data = response.read()
                return json.loads(data.decode('utf-8'))
                
        except Exception as e:
            self.logger.error(f"Request failed: {e}")
            return None
    
    def update_prices(self) -> bool:
        """Update prices for all supported cryptocurrencies"""
        try:
            # Get list of coin IDs
            coin_ids = list(set(self.supported_coins.values()))
            coin_ids_str = ','.join(coin_ids)
            
            # Fetch current prices
            url = f"{self.base_url}/simple/price"
            params = {
                'ids': coin_ids_str,
                'vs_currencies': 'usd',
                'include_24hr_change': 'true',
                'include_market_cap': 'true'
            }
            
            data = self._make_request(url, params)
            if not data:
                return False
            
            current_time = datetime.now()
            
            # Update prices
            for coin_id, price_data in data.items():
                if 'usd' in price_data:
                    price = price_data['usd']
                    change_24h = price_data.get('usd_24h_change', 0)
                    market_cap = price_data.get('usd_market_cap', 0)
                    
                    self.prices[coin_id] = {
                        'price': price,
                        'change_24h': change_24h,
                        'market_cap': market_cap,
                        'timestamp': current_time
                    }
                    
                    # Store price history (keep last 1000 points)
                    self.price_history[coin_id].append({
                        'price': price,
                        'timestamp': current_time
                    })
                    
                    if len(self.price_history[coin_id]) > 1000:
                        self.price_history[coin_id] = self.price_history[coin_id][-1000:]
                    
                    self.last_update[coin_id] = current_time
            
            self.logger.info(f"Updated prices for {len(data)} cryptocurrencies")
            return True
            
        except Exception as e:
            self.logger.error(f"Error updating prices: {e}")
            return False
    
    def get_price(self, symbol: str) -> Optional[float]:
        """Get current price for a symbol"""
        try:
            # Normalize symbol
            symbol_lower = symbol.lower()
            coin_id = self.supported_coins.get(symbol_lower)
            
            if not coin_id:
                self.logger.warning(f"Unsupported symbol: {symbol}")
                return None
            
            if coin_id not in self.prices:
                return None
            
            return self.prices[coin_id]['price']
            
        except Exception as e:
            self.logger.error(f"Error getting price for {symbol}: {e}")
            return None
    
    def get_price_data(self, symbol: str) -> Optional[Dict]:
        """Get complete price data for a symbol"""
        try:
            symbol_lower = symbol.lower()
            coin_id = self.supported_coins.get(symbol_lower)
            
            if not coin_id or coin_id not in self.prices:
                return None
            
            return self.prices[coin_id].copy()
            
        except Exception as e:
            self.logger.error(f"Error getting price data for {symbol}: {e}")
            return None
    
    def get_price_history(self, symbol: str, hours: int = 24) -> List[Dict]:
        """Get price history for a symbol"""
        try:
            symbol_lower = symbol.lower()
            coin_id = self.supported_coins.get(symbol_lower)
            
            if not coin_id or coin_id not in self.price_history:
                return []
            
            # Filter history by time
            cutoff_time = datetime.now() - timedelta(hours=hours)
            history = [
                point for point in self.price_history[coin_id]
                if point['timestamp'] >= cutoff_time
            ]
            
            return history
            
        except Exception as e:
            self.logger.error(f"Error getting price history for {symbol}: {e}")
            return []
    
    def get_all_prices(self) -> Dict:
        """Get prices for all supported cryptocurrencies"""
        return self.prices.copy()
    
    def get_supported_symbols(self) -> List[str]:
        """Get list of supported symbols"""
        return list(self.supported_coins.keys())
    
    def add_symbol_alias(self, alias: str, coin_id: str):
        """Add a new symbol alias"""
        self.supported_coins[alias.lower()] = coin_id
        self.logger.info(f"Added symbol alias: {alias} -> {coin_id}")
    
    def get_market_summary(self) -> Dict:
        """Get market summary with top gainers/losers"""
        try:
            summary = {
                'total_coins': len(self.prices),
                'last_update': datetime.now(),
                'top_gainers': [],
                'top_losers': [],
                'total_market_cap': 0
            }
            
            # Sort by 24h change
            sorted_coins = sorted(
                self.prices.items(),
                key=lambda x: x[1]['change_24h'],
                reverse=True
            )
            
            # Top gainers (top 5)
            summary['top_gainers'] = [
                {
                    'symbol': coin_id,
                    'price': data['price'],
                    'change_24h': data['change_24h']
                }
                for coin_id, data in sorted_coins[:5]
            ]
            
            # Top losers (bottom 5)
            summary['top_losers'] = [
                {
                    'symbol': coin_id,
                    'price': data['price'],
                    'change_24h': data['change_24h']
                }
                for coin_id, data in sorted_coins[-5:]
            ]
            
            # Total market cap
            summary['total_market_cap'] = sum(
                data['market_cap'] for data in self.prices.values()
            )
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Error getting market summary: {e}")
            return {}
    
    def stop(self):
        """Stop the market data provider"""
        self.running = False
        if self.update_thread.is_alive():
            self.update_thread.join(timeout=5)
        self.logger.info("Market data provider stopped")