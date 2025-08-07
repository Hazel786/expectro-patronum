"""
Portfolio Management - Magical position tracking and P&L calculations
"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional
import logging

class Portfolio:
    """Magical portfolio manager for tracking positions and calculating P&L"""
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.positions = {}  # symbol -> list of positions
        self.cash = 10000.0  # Starting cash in USD
        self.initial_cash = 10000.0
        
        # Portfolio stats
        self.stats = {
            'total_pnl': 0.0,
            'total_pnl_percent': 0.0,
            'winning_trades': 0,
            'losing_trades': 0,
            'total_trades': 0
        }
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Load existing positions from database
        self._load_positions()
    
    def _load_positions(self):
        """Load existing positions from database"""
        try:
            positions_data = self.db_manager.get_open_positions()
            for position in positions_data:
                symbol = position['symbol']
                if symbol not in self.positions:
                    self.positions[symbol] = []
                
                self.positions[symbol].append({
                    'trade_id': position['trade_id'],
                    'type': position['type'],
                    'amount': position['amount'],
                    'entry_price': position['entry_price'],
                    'entry_time': position['entry_time'],
                    'status': 'OPEN'
                })
        except Exception as e:
            self.logger.error(f"Error loading positions: {e}")
    
    def open_long_position(self, symbol: str, amount: float, price: float) -> Dict:
        """Open a long position"""
        try:
            # Check if we have enough cash
            required_cash = amount * price
            if required_cash > self.cash:
                return {
                    'success': False,
                    'message': f'Insufficient cash. Need ${required_cash:,.2f}, have ${self.cash:,.2f}'
                }
            
            # Generate trade ID
            trade_id = str(uuid.uuid4())
            
            # Create position
            position = {
                'trade_id': trade_id,
                'type': 'LONG',
                'amount': amount,
                'entry_price': price,
                'entry_time': datetime.now(),
                'status': 'OPEN'
            }
            
            # Add to positions
            if symbol not in self.positions:
                self.positions[symbol] = []
            self.positions[symbol].append(position)
            
            # Deduct cash
            self.cash -= required_cash
            
            # Save to database
            self.db_manager.save_position(
                trade_id=trade_id,
                symbol=symbol,
                position_type='LONG',
                amount=amount,
                entry_price=price,
                entry_time=datetime.now()
            )
            
            self.logger.info(f"Opened LONG position: {amount} {symbol} at ${price:,.2f}")
            
            return {
                'success': True,
                'trade_id': trade_id,
                'message': f'Long position opened successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error opening long position: {e}")
            return {
                'success': False,
                'message': f'Error opening position: {str(e)}'
            }
    
    def open_short_position(self, symbol: str, amount: float, price: float) -> Dict:
        """Open a short position"""
        try:
            # For short positions, we need margin (simplified)
            margin_required = amount * price * 0.1  # 10% margin
            if margin_required > self.cash:
                return {
                    'success': False,
                    'message': f'Insufficient margin. Need ${margin_required:,.2f}, have ${self.cash:,.2f}'
                }
            
            # Generate trade ID
            trade_id = str(uuid.uuid4())
            
            # Create position
            position = {
                'trade_id': trade_id,
                'type': 'SHORT',
                'amount': amount,
                'entry_price': price,
                'entry_time': datetime.now(),
                'status': 'OPEN'
            }
            
            # Add to positions
            if symbol not in self.positions:
                self.positions[symbol] = []
            self.positions[symbol].append(position)
            
            # Deduct margin
            self.cash -= margin_required
            
            # Save to database
            self.db_manager.save_position(
                trade_id=trade_id,
                symbol=symbol,
                position_type='SHORT',
                amount=amount,
                entry_price=price,
                entry_time=datetime.now()
            )
            
            self.logger.info(f"Opened SHORT position: {amount} {symbol} at ${price:,.2f}")
            
            return {
                'success': True,
                'trade_id': trade_id,
                'message': f'Short position opened successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error opening short position: {e}")
            return {
                'success': False,
                'message': f'Error opening position: {str(e)}'
            }
    
    def close_positions(self, symbol: str, position_type: str = 'ALL', current_price: float = None) -> Dict:
        """Close positions for a symbol"""
        try:
            if symbol not in self.positions or not self.positions[symbol]:
                return {
                    'success': False,
                    'message': f'No open positions for {symbol}'
                }
            
            closed_trades = []
            total_amount = 0.0
            total_pnl = 0.0
            
            # Filter positions to close
            positions_to_close = []
            for position in self.positions[symbol]:
                if position['status'] == 'OPEN' and (position_type == 'ALL' or position['type'] == position_type):
                    positions_to_close.append(position)
            
            if not positions_to_close:
                return {
                    'success': False,
                    'message': f'No {position_type} positions to close for {symbol}'
                }
            
            # Close each position
            for position in positions_to_close:
                # Calculate P&L
                if position['type'] == 'LONG':
                    pnl = (current_price - position['entry_price']) * position['amount']
                    cash_return = position['amount'] * current_price
                else:  # SHORT
                    pnl = (position['entry_price'] - current_price) * position['amount']
                    cash_return = position['amount'] * position['entry_price'] * 0.1  # Return margin
                
                # Update cash
                self.cash += cash_return
                
                # Mark position as closed
                position['status'] = 'CLOSED'
                position['exit_price'] = current_price
                position['exit_time'] = datetime.now()
                position['pnl'] = pnl
                
                # Update database
                self.db_manager.close_position(
                    trade_id=position['trade_id'],
                    exit_price=current_price,
                    exit_time=datetime.now(),
                    pnl=pnl
                )
                
                closed_trades.append({
                    'trade_id': position['trade_id'],
                    'type': position['type'],
                    'amount': position['amount'],
                    'entry_price': position['entry_price'],
                    'exit_price': current_price,
                    'pnl': pnl
                })
                
                total_amount += position['amount']
                total_pnl += pnl
                
                # Update stats
                self.stats['total_trades'] += 1
                if pnl > 0:
                    self.stats['winning_trades'] += 1
                else:
                    self.stats['losing_trades'] += 1
            
            # Update total P&L
            self.stats['total_pnl'] += total_pnl
            self.stats['total_pnl_percent'] = (self.stats['total_pnl'] / self.initial_cash) * 100
            
            self.logger.info(f"Closed {len(closed_trades)} positions for {symbol}, P&L: ${total_pnl:,.2f}")
            
            return {
                'success': True,
                'closed_trades': closed_trades,
                'total_amount': total_amount,
                'total_pnl': total_pnl,
                'message': f'Closed {len(closed_trades)} positions successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error closing positions: {e}")
            return {
                'success': False,
                'message': f'Error closing positions: {str(e)}'
            }
    
    def get_portfolio_value(self, current_prices: Dict[str, float]) -> Dict:
        """Calculate current portfolio value"""
        try:
            total_value = self.cash
            position_values = {}
            
            for symbol, positions in self.positions.items():
                if symbol in current_prices:
                    current_price = current_prices[symbol]
                    symbol_value = 0.0
                    
                    for position in positions:
                        if position['status'] == 'OPEN':
                            if position['type'] == 'LONG':
                                symbol_value += position['amount'] * current_price
                            else:  # SHORT
                                # For shorts, we track unrealized P&L
                                unrealized_pnl = (position['entry_price'] - current_price) * position['amount']
                                symbol_value += unrealized_pnl
                    
                    position_values[symbol] = symbol_value
                    total_value += symbol_value
            
            return {
                'total_value': total_value,
                'cash': self.cash,
                'position_values': position_values,
                'total_pnl': self.stats['total_pnl'],
                'total_pnl_percent': self.stats['total_pnl_percent']
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating portfolio value: {e}")
            return {
                'total_value': self.cash,
                'cash': self.cash,
                'position_values': {},
                'total_pnl': 0.0,
                'total_pnl_percent': 0.0
            }
    
    def get_positions(self, symbol: str = None) -> List[Dict]:
        """Get all positions or positions for a specific symbol"""
        try:
            if symbol:
                return self.positions.get(symbol, [])
            else:
                all_positions = []
                for symbol, positions in self.positions.items():
                    for position in positions:
                        position_copy = position.copy()
                        position_copy['symbol'] = symbol
                        all_positions.append(position_copy)
                return all_positions
        except Exception as e:
            self.logger.error(f"Error getting positions: {e}")
            return []
    
    def get_portfolio_stats(self) -> Dict:
        """Get portfolio statistics"""
        return {
            **self.stats,
            'cash': self.cash,
            'initial_cash': self.initial_cash,
            'total_positions': sum(len(positions) for positions in self.positions.values()),
            'open_positions': sum(len([p for p in positions if p['status'] == 'OPEN']) 
                                for positions in self.positions.values())
        }
    
    def reset_portfolio(self):
        """Reset portfolio to initial state (for testing)"""
        self.positions = {}
        self.cash = self.initial_cash
        self.stats = {
            'total_pnl': 0.0,
            'total_pnl_percent': 0.0,
            'winning_trades': 0,
            'losing_trades': 0,
            'total_trades': 0
        }
        self.db_manager.reset_portfolio()
        self.logger.info("Portfolio reset to initial state")