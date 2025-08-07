"""
Risk Management - Magical protection spells for trading
"""

from typing import Dict, List
import logging

class RiskManager:
    """Magical risk manager that protects against dangerous trading spells"""
    
    def __init__(self):
        # Risk limits
        self.max_position_size = 0.2  # 20% of portfolio per position
        self.max_total_exposure = 0.8  # 80% of portfolio total exposure
        self.max_daily_loss = 0.1  # 10% daily loss limit
        self.max_leverage = 3.0  # Maximum leverage
        
        # Daily tracking
        self.daily_pnl = 0.0
        self.daily_trades = []
        
        # Position limits per symbol
        self.symbol_limits = {
            'bitcoin': {'max_amount': 1.0, 'max_value': 50000},
            'ethereum': {'max_amount': 10.0, 'max_value': 30000},
            'cardano': {'max_amount': 1000.0, 'max_value': 20000},
            'solana': {'max_amount': 100.0, 'max_value': 25000},
            'polkadot': {'max_amount': 500.0, 'max_value': 15000}
        }
        
        # Default limits for unknown symbols
        self.default_limits = {'max_amount': 100.0, 'max_value': 10000}
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def check_position_limit(self, symbol: str, position_type: str, amount: float, price: float) -> Dict:
        """
        Check if a position meets risk management requirements
        
        Args:
            symbol: Cryptocurrency symbol
            position_type: LONG or SHORT
            amount: Amount to trade
            price: Current price
        
        Returns:
            Dict with allowed status and reason
        """
        try:
            # Get symbol-specific limits
            limits = self.symbol_limits.get(symbol.lower(), self.default_limits)
            
            # Check amount limit
            if amount > limits['max_amount']:
                return {
                    'allowed': False,
                    'reason': f'Amount {amount} exceeds limit of {limits["max_amount"]} for {symbol}'
                }
            
            # Check value limit
            position_value = amount * price
            if position_value > limits['max_value']:
                return {
                    'allowed': False,
                    'reason': f'Position value ${position_value:,.2f} exceeds limit of ${limits["max_value"]:,.2f} for {symbol}'
                }
            
            # Check leverage for short positions
            if position_type == 'SHORT':
                leverage = position_value / (position_value * 0.1)  # 10% margin
                if leverage > self.max_leverage:
                    return {
                        'allowed': False,
                        'reason': f'Leverage {leverage:.1f}x exceeds maximum of {self.max_leverage}x'
                    }
            
            # All checks passed
            return {
                'allowed': True,
                'reason': 'Position meets risk management requirements'
            }
            
        except Exception as e:
            self.logger.error(f"Error checking position limit: {e}")
            return {
                'allowed': False,
                'reason': f'Risk check error: {str(e)}'
            }
    
    def check_portfolio_risk(self, portfolio_value: float, new_position_value: float, 
                           current_exposure: float) -> Dict:
        """
        Check portfolio-level risk management
        
        Args:
            portfolio_value: Total portfolio value
            new_position_value: Value of new position
            current_exposure: Current total exposure
        
        Returns:
            Dict with allowed status and reason
        """
        try:
            # Check position size limit
            position_size_ratio = new_position_value / portfolio_value
            if position_size_ratio > self.max_position_size:
                return {
                    'allowed': False,
                    'reason': f'Position size {position_size_ratio:.1%} exceeds limit of {self.max_position_size:.1%}'
                }
            
            # Check total exposure limit
            total_exposure_ratio = (current_exposure + new_position_value) / portfolio_value
            if total_exposure_ratio > self.max_total_exposure:
                return {
                    'allowed': False,
                    'reason': f'Total exposure {total_exposure_ratio:.1%} exceeds limit of {self.max_total_exposure:.1%}'
                }
            
            return {
                'allowed': True,
                'reason': 'Portfolio risk checks passed'
            }
            
        except Exception as e:
            self.logger.error(f"Error checking portfolio risk: {e}")
            return {
                'allowed': False,
                'reason': f'Portfolio risk check error: {str(e)}'
            }
    
    def check_daily_loss_limit(self, new_pnl: float) -> Dict:
        """
        Check if new P&L would exceed daily loss limit
        
        Args:
            new_pnl: New P&L to add to daily total
        
        Returns:
            Dict with allowed status and reason
        """
        try:
            # Calculate new daily P&L
            new_daily_pnl = self.daily_pnl + new_pnl
            
            # Check if it would exceed loss limit
            if new_daily_pnl < -(self.daily_pnl * self.max_daily_loss):
                return {
                    'allowed': False,
                    'reason': f'Daily loss limit would be exceeded. Current: ${self.daily_pnl:,.2f}, New: ${new_daily_pnl:,.2f}'
                }
            
            return {
                'allowed': True,
                'reason': 'Daily loss limit check passed'
            }
            
        except Exception as e:
            self.logger.error(f"Error checking daily loss limit: {e}")
            return {
                'allowed': False,
                'reason': f'Daily loss check error: {str(e)}'
            }
    
    def update_daily_pnl(self, pnl: float):
        """Update daily P&L tracking"""
        self.daily_pnl += pnl
        self.logger.info(f"Updated daily P&L: ${self.daily_pnl:,.2f}")
    
    def reset_daily_tracking(self):
        """Reset daily tracking (call at start of new day)"""
        self.daily_pnl = 0.0
        self.daily_trades = []
        self.logger.info("Daily risk tracking reset")
    
    def get_risk_limits(self) -> Dict:
        """Get current risk management limits"""
        return {
            'max_position_size': self.max_position_size,
            'max_total_exposure': self.max_total_exposure,
            'max_daily_loss': self.max_daily_loss,
            'max_leverage': self.max_leverage,
            'symbol_limits': self.symbol_limits,
            'daily_pnl': self.daily_pnl
        }
    
    def set_risk_limits(self, **kwargs):
        """Update risk management limits"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
                self.logger.info(f"Updated risk limit: {key} = {value}")
    
    def get_risk_report(self) -> Dict:
        """Generate a comprehensive risk report"""
        return {
            'limits': self.get_risk_limits(),
            'daily_stats': {
                'daily_pnl': self.daily_pnl,
                'daily_trades': len(self.daily_trades),
                'loss_limit_remaining': self.daily_pnl * self.max_daily_loss
            },
            'symbol_limits': self.symbol_limits
        }