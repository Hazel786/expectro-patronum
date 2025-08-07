"""
Recall API Connector - Modular integration for Recall API
"""

import json
import urllib.request
import urllib.parse
import urllib.error
from typing import Dict, Optional, List, Any
import logging
from datetime import datetime
import threading
import time

class RecallAPIConnector:
    """Modular connector for Recall API integration"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the Recall API connector
        
        Args:
            config: Configuration dictionary with API settings
        """
        # Default configuration
        self.default_config = {
            'api_base_url': 'https://api.recall.ai/v1',
            'api_key': None,
            'competition_id': None,
            'user_id': None,
            'timeout': 30,
            'retry_attempts': 3,
            'retry_delay': 1,
            'enable_logging': True,
            'auto_sync': False,
            'sync_interval': 60  # seconds
        }
        
        # Merge provided config with defaults
        self.config = {**self.default_config, **(config or {})}
        
        # Connection state
        self.connected = False
        self.last_sync = None
        self.sync_thread = None
        self.running = False
        
        # Portfolio cache
        self.portfolio_cache = {}
        self.competition_status_cache = {}
        
        # Setup logging
        if self.config['enable_logging']:
            logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Start auto-sync if enabled
        if self.config['auto_sync']:
            self.start_auto_sync()
    
    def connect_to_recall(self) -> Dict[str, Any]:
        """
        Connect to Recall API and authenticate
        
        Returns:
            Dict containing connection status and details
        """
        try:
            if not self.config['api_key']:
                return {
                    'success': False,
                    'message': 'API key not configured. Please set api_key in config.',
                    'connected': False
                }
            
            # Test connection by making a simple API call
            test_url = f"{self.config['api_base_url']}/health"
            headers = self._get_headers()
            
            response = self._make_request(test_url, headers=headers, method='GET')
            
            if response and response.get('status') == 'healthy':
                self.connected = True
                self.logger.info("✅ Successfully connected to Recall API")
                return {
                    'success': True,
                    'message': 'Successfully connected to Recall API',
                    'connected': True,
                    'api_version': response.get('version', 'unknown'),
                    'timestamp': datetime.now().isoformat()
                }
            else:
                self.connected = False
                return {
                    'success': False,
                    'message': 'Failed to connect to Recall API. Check your configuration.',
                    'connected': False,
                    'error': response.get('error', 'Unknown error') if response else 'No response'
                }
                
        except Exception as e:
            self.connected = False
            self.logger.error(f"Error connecting to Recall API: {e}")
            return {
                'success': False,
                'message': f'Connection error: {str(e)}',
                'connected': False,
                'error': str(e)
            }
    
    def submit_order_to_competition(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit a trading order to the Recall competition
        
        Args:
            order_data: Order details including symbol, amount, type, etc.
        
        Returns:
            Dict containing submission status and order details
        """
        try:
            if not self.connected:
                connect_result = self.connect_to_recall()
                if not connect_result['success']:
                    return {
                        'success': False,
                        'message': 'Not connected to Recall API',
                        'order_id': None
                    }
            
            if not self.config['competition_id']:
                return {
                    'success': False,
                    'message': 'Competition ID not configured',
                    'order_id': None
                }
            
            # Prepare order payload
            order_payload = {
                'competition_id': self.config['competition_id'],
                'user_id': self.config['user_id'],
                'symbol': order_data.get('symbol'),
                'amount': order_data.get('amount'),
                'order_type': order_data.get('type', 'MARKET'),  # MARKET, LIMIT, etc.
                'side': order_data.get('side', 'BUY'),  # BUY, SELL
                'timestamp': datetime.now().isoformat(),
                'metadata': {
                    'source': 'expecto_patronum',
                    'spell_cast': order_data.get('spell', 'UNKNOWN'),
                    'portfolio_value': order_data.get('portfolio_value'),
                    'risk_score': order_data.get('risk_score', 0.0)
                }
            }
            
            # Submit order
            url = f"{self.config['api_base_url']}/competitions/{self.config['competition_id']}/orders"
            headers = self._get_headers()
            
            response = self._make_request(
                url, 
                headers=headers, 
                method='POST', 
                data=json.dumps(order_payload)
            )
            
            if response and response.get('success'):
                order_id = response.get('order_id')
                self.logger.info(f"✅ Order submitted successfully: {order_id}")
                return {
                    'success': True,
                    'message': 'Order submitted to competition successfully',
                    'order_id': order_id,
                    'competition_id': self.config['competition_id'],
                    'timestamp': datetime.now().isoformat(),
                    'order_details': response.get('order_details', {})
                }
            else:
                error_msg = response.get('error', 'Unknown error') if response else 'No response'
                self.logger.error(f"❌ Order submission failed: {error_msg}")
                return {
                    'success': False,
                    'message': f'Order submission failed: {error_msg}',
                    'order_id': None,
                    'error': error_msg
                }
                
        except Exception as e:
            self.logger.error(f"Error submitting order: {e}")
            return {
                'success': False,
                'message': f'Order submission error: {str(e)}',
                'order_id': None,
                'error': str(e)
            }
    
    def get_competition_status(self) -> Dict[str, Any]:
        """
        Get current competition status and leaderboard
        
        Returns:
            Dict containing competition status and details
        """
        try:
            if not self.connected:
                connect_result = self.connect_to_recall()
                if not connect_result['success']:
                    return {
                        'success': False,
                        'message': 'Not connected to Recall API',
                        'status': None
                    }
            
            if not self.config['competition_id']:
                return {
                    'success': False,
                    'message': 'Competition ID not configured',
                    'status': None
                }
            
            # Get competition status
            url = f"{self.config['api_base_url']}/competitions/{self.config['competition_id']}/status"
            headers = self._get_headers()
            
            response = self._make_request(url, headers=headers, method='GET')
            
            if response:
                # Cache the status
                self.competition_status_cache = response
                self.logger.info("📊 Competition status updated")
                
                return {
                    'success': True,
                    'message': 'Competition status retrieved successfully',
                    'status': response,
                    'timestamp': datetime.now().isoformat(),
                    'competition_id': self.config['competition_id']
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to retrieve competition status',
                    'status': None
                }
                
        except Exception as e:
            self.logger.error(f"Error getting competition status: {e}")
            return {
                'success': False,
                'message': f'Status retrieval error: {str(e)}',
                'status': None,
                'error': str(e)
            }
    
    def sync_portfolio_with_api(self, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synchronize local portfolio with Recall API
        
        Args:
            portfolio_data: Local portfolio data to sync
        
        Returns:
            Dict containing sync status and details
        """
        try:
            if not self.connected:
                connect_result = self.connect_to_recall()
                if not connect_result['success']:
                    return {
                        'success': False,
                        'message': 'Not connected to Recall API',
                        'synced': False
                    }
            
            if not self.config['competition_id']:
                return {
                    'success': False,
                    'message': 'Competition ID not configured',
                    'synced': False
                }
            
            # Prepare portfolio payload
            portfolio_payload = {
                'competition_id': self.config['competition_id'],
                'user_id': self.config['user_id'],
                'total_value': portfolio_data.get('total_value', 0),
                'cash': portfolio_data.get('cash', 0),
                'total_pnl': portfolio_data.get('total_pnl', 0),
                'total_pnl_percent': portfolio_data.get('total_pnl_percent', 0),
                'positions': portfolio_data.get('positions', []),
                'trades_count': portfolio_data.get('trades_count', 0),
                'win_rate': portfolio_data.get('win_rate', 0),
                'last_updated': datetime.now().isoformat(),
                'metadata': {
                    'source': 'expecto_patronum',
                    'session_duration': portfolio_data.get('session_duration'),
                    'risk_level': portfolio_data.get('risk_level', 'medium')
                }
            }
            
            # Sync portfolio
            url = f"{self.config['api_base_url']}/competitions/{self.config['competition_id']}/portfolio"
            headers = self._get_headers()
            
            response = self._make_request(
                url, 
                headers=headers, 
                method='PUT', 
                data=json.dumps(portfolio_payload)
            )
            
            if response and response.get('success'):
                self.last_sync = datetime.now()
                self.portfolio_cache = portfolio_data
                self.logger.info("🔄 Portfolio synchronized with Recall API")
                
                return {
                    'success': True,
                    'message': 'Portfolio synchronized successfully',
                    'synced': True,
                    'timestamp': self.last_sync.isoformat(),
                    'sync_details': response.get('sync_details', {})
                }
            else:
                error_msg = response.get('error', 'Unknown error') if response else 'No response'
                self.logger.error(f"❌ Portfolio sync failed: {error_msg}")
                return {
                    'success': False,
                    'message': f'Portfolio sync failed: {error_msg}',
                    'synced': False,
                    'error': error_msg
                }
                
        except Exception as e:
            self.logger.error(f"Error syncing portfolio: {e}")
            return {
                'success': False,
                'message': f'Portfolio sync error: {str(e)}',
                'synced': False,
                'error': str(e)
            }
    
    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for API requests"""
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'ExpectoPatronum/1.0'
        }
        
        if self.config['api_key']:
            headers['Authorization'] = f'Bearer {self.config["api_key"]}'
        
        return headers
    
    def _make_request(self, url: str, headers: Dict[str, str], 
                     method: str = 'GET', data: str = None) -> Optional[Dict]:
        """Make HTTP request with retry logic"""
        for attempt in range(self.config['retry_attempts']):
            try:
                req = urllib.request.Request(url, headers=headers, method=method)
                
                if data:
                    req.data = data.encode('utf-8')
                
                with urllib.request.urlopen(req, timeout=self.config['timeout']) as response:
                    response_data = response.read()
                    return json.loads(response_data.decode('utf-8'))
                    
            except urllib.error.HTTPError as e:
                self.logger.warning(f"HTTP error (attempt {attempt + 1}): {e.code} - {e.reason}")
                if attempt == self.config['retry_attempts'] - 1:
                    return {'success': False, 'error': f'HTTP {e.code}: {e.reason}'}
                    
            except urllib.error.URLError as e:
                self.logger.warning(f"URL error (attempt {attempt + 1}): {e.reason}")
                if attempt == self.config['retry_attempts'] - 1:
                    return {'success': False, 'error': f'URL error: {e.reason}'}
                    
            except Exception as e:
                self.logger.warning(f"Request error (attempt {attempt + 1}): {e}")
                if attempt == self.config['retry_attempts'] - 1:
                    return {'success': False, 'error': str(e)}
            
            # Wait before retry
            if attempt < self.config['retry_attempts'] - 1:
                time.sleep(self.config['retry_delay'])
        
        return None
    
    def start_auto_sync(self):
        """Start automatic portfolio synchronization"""
        if self.sync_thread and self.sync_thread.is_alive():
            return
        
        self.running = True
        self.sync_thread = threading.Thread(target=self._auto_sync_loop, daemon=True)
        self.sync_thread.start()
        self.logger.info("🔄 Auto-sync started")
    
    def stop_auto_sync(self):
        """Stop automatic portfolio synchronization"""
        self.running = False
        if self.sync_thread and self.sync_thread.is_alive():
            self.sync_thread.join(timeout=5)
        self.logger.info("🛑 Auto-sync stopped")
    
    def _auto_sync_loop(self):
        """Background loop for automatic synchronization"""
        while self.running:
            try:
                # Get competition status
                self.get_competition_status()
                time.sleep(self.config['sync_interval'])
            except Exception as e:
                self.logger.error(f"Auto-sync error: {e}")
                time.sleep(self.config['sync_interval'])
    
    def update_config(self, new_config: Dict[str, Any]):
        """Update configuration settings"""
        self.config.update(new_config)
        self.logger.info("⚙️ Configuration updated")
        
        # Reconnect if API key changed
        if 'api_key' in new_config:
            self.connected = False
            self.connect_to_recall()
    
    def get_connection_status(self) -> Dict[str, Any]:
        """Get current connection status"""
        return {
            'connected': self.connected,
            'last_sync': self.last_sync.isoformat() if self.last_sync else None,
            'auto_sync_running': self.running,
            'competition_id': self.config['competition_id'],
            'api_base_url': self.config['api_base_url']
        }
    
    def disconnect(self):
        """Disconnect from Recall API"""
        self.stop_auto_sync()
        self.connected = False
        self.logger.info("🔌 Disconnected from Recall API")