"""
Trading Engine - The magical core of Expecto Patronum
Handles all trading operations with Harry Potter spell names
"""

import time
import threading
from datetime import datetime
from typing import Dict, List, Optional
import logging

class TradingEngine:
    """Magical trading engine that executes trades using Harry Potter spells"""
    
    def __init__(self, market_data, portfolio, risk_manager, db_manager, recall_connector=None):
        self.market_data = market_data
        self.portfolio = portfolio
        self.risk_manager = risk_manager
        self.db_manager = db_manager
        self.recall_connector = recall_connector  # Recall API connector
        self.running = False
        self.lock = threading.Lock()
        
        # Trading spells mapping
        self.spells = {
            'EXPECTO_LONG': self._cast_expecto_long,
            'EXPECTO_SHORT': self._cast_expecto_short,
            'FINITE_INCANTATEM': self._cast_finite_incantatem,
            'ALOHOMORA': self._cast_alohomora,  # Open position
            'COLLOPORTUS': self._cast_colloportus,  # Close position
            'LUMOS': self._cast_lumos,  # Light up portfolio
            'NOX': self._cast_nox  # Darken portfolio
        }
        
        # Trading session stats
        self.session_stats = {
            'total_trades': 0,
            'successful_trades': 0,
            'failed_trades': 0,
            'total_pnl': 0.0,
            'start_time': datetime.now()
        }
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def start(self):
        """Start the magical trading engine"""
        with self.lock:
            if not self.running:
                self.running = True
                self.logger.info("🦌 Expecto Patronum trading engine activated!")
                return True
        return False
    
    def stop(self):
        """Stop the magical trading engine"""
        with self.lock:
            if self.running:
                self.running = False
                self.logger.info("🛡️ Trading engine deactivated")
                return True
        return False
    
    def cast_spell(self, spell_name: str, symbol: str, amount: float, **kwargs) -> Dict:
        """
        Cast a trading spell to execute trades
        
        Args:
            spell_name: The magical spell to cast
            symbol: Cryptocurrency symbol (e.g., 'bitcoin')
            amount: Amount to trade
            **kwargs: Additional spell parameters
        
        Returns:
            Dict containing spell result
        """
        if not self.running:
            return {
                'success': False,
                'message': '❌ Trading engine is not active. Cast Lumos to activate!',
                'spell': spell_name
            }
        
        if spell_name not in self.spells:
            return {
                'success': False,
                'message': f'❌ Unknown spell: {spell_name}. Check your spell book!',
                'spell': spell_name
            }
        
        try:
            # Get current price
            current_price = self.market_data.get_price(symbol)
            if not current_price:
                return {
                    'success': False,
                    'message': f'❌ Cannot get price for {symbol}. Market data unavailable.',
                    'spell': spell_name
                }
            
            # Execute the spell
            result = self.spells[spell_name](symbol, amount, current_price, **kwargs)
            
            # Update session stats
            self.session_stats['total_trades'] += 1
            if result['success']:
                self.session_stats['successful_trades'] += 1
            else:
                self.session_stats['failed_trades'] += 1
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error casting spell {spell_name}: {e}")
            return {
                'success': False,
                'message': f'❌ Spell backfired: {str(e)}',
                'spell': spell_name
            }
    
    def _cast_expecto_long(self, symbol: str, amount: float, price: float, **kwargs) -> Dict:
        """Cast Expecto Long spell to open a long position"""
        try:
            # Check risk management
            risk_check = self.risk_manager.check_position_limit(symbol, 'LONG', amount, price)
            if not risk_check['allowed']:
                return {
                    'success': False,
                    'message': f'🛡️ Risk management blocked: {risk_check["reason"]}',
                    'spell': 'EXPECTO_LONG'
                }
            
            # Execute long position
            trade_result = self.portfolio.open_long_position(symbol, amount, price)
            
            if trade_result['success']:
                # Log trade to database
                self.db_manager.log_trade(
                    symbol=symbol,
                    action='LONG',
                    amount=amount,
                    price=price,
                    timestamp=datetime.now(),
                    trade_id=trade_result['trade_id']
                )
                
                return {
                    'success': True,
                    'message': f'🦌 Expecto Long cast successfully! Opened {amount} {symbol} at ${price:,.2f}',
                    'trade_id': trade_result['trade_id'],
                    'spell': 'EXPECTO_LONG'
                }
            else:
                return {
                    'success': False,
                    'message': f'❌ Expecto Long failed: {trade_result["message"]}',
                    'spell': 'EXPECTO_LONG'
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': f'❌ Expecto Long backfired: {str(e)}',
                'spell': 'EXPECTO_LONG'
            }
    
    def _cast_expecto_short(self, symbol: str, amount: float, price: float, **kwargs) -> Dict:
        """Cast Expecto Short spell to open a short position"""
        try:
            # Check risk management
            risk_check = self.risk_manager.check_position_limit(symbol, 'SHORT', amount, price)
            if not risk_check['allowed']:
                return {
                    'success': False,
                    'message': f'🛡️ Risk management blocked: {risk_check["reason"]}',
                    'spell': 'EXPECTO_SHORT'
                }
            
            # Execute short position
            trade_result = self.portfolio.open_short_position(symbol, amount, price)
            
            if trade_result['success']:
                # Log trade to database
                self.db_manager.log_trade(
                    symbol=symbol,
                    action='SHORT',
                    amount=amount,
                    price=price,
                    timestamp=datetime.now(),
                    trade_id=trade_result['trade_id']
                )
                
                return {
                    'success': True,
                    'message': f'🦌 Expecto Short cast successfully! Opened {amount} {symbol} at ${price:,.2f}',
                    'trade_id': trade_result['trade_id'],
                    'spell': 'EXPECTO_SHORT'
                }
            else:
                return {
                    'success': False,
                    'message': f'❌ Expecto Short failed: {trade_result["message"]}',
                    'spell': 'EXPECTO_SHORT'
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': f'❌ Expecto Short backfired: {str(e)}',
                'spell': 'EXPECTO_SHORT'
            }
    
    def _cast_finite_incantatem(self, symbol: str, amount: float, price: float, **kwargs) -> Dict:
        """Cast Finite Incantatem to close positions"""
        try:
            position_type = kwargs.get('position_type', 'ALL')  # ALL, LONG, SHORT
            
            # Close positions
            close_result = self.portfolio.close_positions(symbol, position_type, price)
            
            if close_result['success']:
                # Log trade to database
                for trade in close_result['closed_trades']:
                    self.db_manager.log_trade(
                        symbol=symbol,
                        action=f'CLOSE_{trade["type"]}',
                        amount=trade['amount'],
                        price=price,
                        timestamp=datetime.now(),
                        trade_id=trade['trade_id']
                    )
                
                return {
                    'success': True,
                    'message': f'🛡️ Finite Incantatem cast! Closed {close_result["total_amount"]} {symbol} positions',
                    'closed_trades': close_result['closed_trades'],
                    'spell': 'FINITE_INCANTATEM'
                }
            else:
                return {
                    'success': False,
                    'message': f'❌ Finite Incantatem failed: {close_result["message"]}',
                    'spell': 'FINITE_INCANTATEM'
                }
                
        except Exception as e:
            return {
                'success': False,
                'message': f'❌ Finite Incantatem backfired: {str(e)}',
                'spell': 'FINITE_INCANTATEM'
            }
    
    def _cast_alohomora(self, symbol: str, amount: float, price: float, **kwargs) -> Dict:
        """Cast Alohomora to unlock and open any position"""
        position_type = kwargs.get('position_type', 'LONG')
        if position_type == 'LONG':
            return self._cast_expecto_long(symbol, amount, price, **kwargs)
        else:
            return self._cast_expecto_short(symbol, amount, price, **kwargs)
    
    def _cast_colloportus(self, symbol: str, amount: float, price: float, **kwargs) -> Dict:
        """Cast Colloportus to lock and close positions"""
        return self._cast_finite_incantatem(symbol, amount, price, **kwargs)
    
    def _cast_lumos(self, symbol: str, amount: float, price: float, **kwargs) -> Dict:
        """Cast Lumos to light up the portfolio and activate trading"""
        self.start()
        return {
            'success': True,
            'message': '✨ Lumos! Trading engine activated and portfolio illuminated!',
            'spell': 'LUMOS'
        }
    
    def _cast_nox(self, symbol: str, amount: float, price: float, **kwargs) -> Dict:
        """Cast Nox to darken the portfolio and deactivate trading"""
        self.stop()
        return {
            'success': True,
            'message': '🌙 Nox! Trading engine deactivated and portfolio darkened.',
            'spell': 'NOX'
        }
    
    def get_session_stats(self) -> Dict:
        """Get current trading session statistics"""
        duration = datetime.now() - self.session_stats['start_time']
        return {
            **self.session_stats,
            'duration': str(duration).split('.')[0],
            'success_rate': (self.session_stats['successful_trades'] / max(1, self.session_stats['total_trades'])) * 100
        }
    
    def get_available_spells(self) -> List[str]:
        """Get list of available trading spells"""
        return list(self.spells.keys())
    
    def set_recall_connector(self, recall_connector):
        """Set the Recall API connector"""
        self.recall_connector = recall_connector
        self.logger.info("🔗 Recall API connector set")
    
    def submit_trade_to_recall(self, trade_data: Dict) -> Dict:
        """Submit a trade to Recall API competition"""
        if not self.recall_connector:
            return {
                'success': False,
                'message': 'Recall API connector not configured'
            }
        
        try:
            # Get current portfolio data for context
            portfolio_stats = self.portfolio.get_portfolio_stats()
            
            # Prepare order data for Recall API
            order_data = {
                'symbol': trade_data.get('symbol'),
                'amount': trade_data.get('amount'),
                'type': 'MARKET',
                'side': 'BUY' if trade_data.get('spell') == 'EXPECTO_LONG' else 'SELL',
                'spell': trade_data.get('spell'),
                'portfolio_value': portfolio_stats.get('cash', 0),
                'risk_score': 0.0  # Could be calculated based on position size
            }
            
            # Submit to Recall API
            result = self.recall_connector.submit_order_to_competition(order_data)
            
            if result['success']:
                self.logger.info(f"✅ Trade submitted to Recall competition: {result.get('order_id')}")
            else:
                self.logger.warning(f"⚠️ Failed to submit trade to Recall: {result.get('message')}")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error submitting trade to Recall: {e}")
            return {
                'success': False,
                'message': f'Error submitting to Recall: {str(e)}'
            }
    
    def sync_portfolio_with_recall(self) -> Dict:
        """Synchronize portfolio with Recall API"""
        if not self.recall_connector:
            return {
                'success': False,
                'message': 'Recall API connector not configured'
            }
        
        try:
            # Get current portfolio data
            portfolio_stats = self.portfolio.get_portfolio_stats()
            portfolio_value = self.portfolio.get_portfolio_value({})
            
            # Prepare portfolio data for sync
            portfolio_data = {
                'total_value': portfolio_value.get('total_value', 0),
                'cash': portfolio_value.get('cash', 0),
                'total_pnl': portfolio_stats.get('total_pnl', 0),
                'total_pnl_percent': portfolio_stats.get('total_pnl_percent', 0),
                'positions': self.portfolio.get_positions(),
                'trades_count': portfolio_stats.get('total_trades', 0),
                'win_rate': (portfolio_stats.get('winning_trades', 0) / max(1, portfolio_stats.get('total_trades', 1))) * 100,
                'session_duration': str(datetime.now() - self.session_stats['start_time']).split('.')[0],
                'risk_level': 'medium'  # Could be calculated based on risk metrics
            }
            
            # Sync with Recall API
            result = self.recall_connector.sync_portfolio_with_api(portfolio_data)
            
            if result['success']:
                self.logger.info("🔄 Portfolio synchronized with Recall API")
            else:
                self.logger.warning(f"⚠️ Portfolio sync failed: {result.get('message')}")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error syncing portfolio with Recall: {e}")
            return {
                'success': False,
                'message': f'Error syncing with Recall: {str(e)}'
            }
    
    def get_recall_competition_status(self) -> Dict:
        """Get Recall competition status"""
        if not self.recall_connector:
            return {
                'success': False,
                'message': 'Recall API connector not configured'
            }
        
        try:
            result = self.recall_connector.get_competition_status()
            
            if result['success']:
                self.logger.info("📊 Recall competition status retrieved")
            else:
                self.logger.warning(f"⚠️ Failed to get competition status: {result.get('message')}")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error getting Recall competition status: {e}")
            return {
                'success': False,
                'message': f'Error getting competition status: {str(e)}'
            }