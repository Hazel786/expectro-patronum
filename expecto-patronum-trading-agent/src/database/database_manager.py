"""
Database Manager - Magical storage for trading history
"""

import sqlite3
import os
from datetime import datetime
from typing import Dict, List, Optional
import logging

class DatabaseManager:
    """Magical database manager for storing trading data"""
    
    def __init__(self, db_path: str = "expecto_patronum.db"):
        self.db_path = db_path
        self.connection = None
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Initialize database
        self._init_database()
    
    def _init_database(self):
        """Initialize database tables"""
        try:
            self.connection = sqlite3.connect(self.db_path)
            self.connection.row_factory = sqlite3.Row
            
            # Create tables
            self._create_tables()
            self.logger.info("Database initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Error initializing database: {e}")
            raise
    
    def _create_tables(self):
        """Create database tables if they don't exist"""
        cursor = self.connection.cursor()
        
        # Positions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS positions (
                trade_id TEXT PRIMARY KEY,
                symbol TEXT NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                entry_price REAL NOT NULL,
                entry_time TIMESTAMP NOT NULL,
                exit_price REAL,
                exit_time TIMESTAMP,
                pnl REAL,
                status TEXT DEFAULT 'OPEN'
            )
        ''')
        
        # Trades table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trade_id TEXT NOT NULL,
                symbol TEXT NOT NULL,
                action TEXT NOT NULL,
                amount REAL NOT NULL,
                price REAL NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                FOREIGN KEY (trade_id) REFERENCES positions (trade_id)
            )
        ''')
        
        # Portfolio snapshots table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS portfolio_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP NOT NULL,
                total_value REAL NOT NULL,
                cash REAL NOT NULL,
                total_pnl REAL NOT NULL,
                total_pnl_percent REAL NOT NULL
            )
        ''')
        
        # Price history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS price_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                price REAL NOT NULL,
                timestamp TIMESTAMP NOT NULL
            )
        ''')
        
        self.connection.commit()
    
    def save_position(self, trade_id: str, symbol: str, position_type: str, 
                     amount: float, entry_price: float, entry_time: datetime):
        """Save a new position to the database"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                INSERT INTO positions (trade_id, symbol, type, amount, entry_price, entry_time, status)
                VALUES (?, ?, ?, ?, ?, ?, 'OPEN')
            ''', (trade_id, symbol, position_type, amount, entry_price, entry_time))
            
            self.connection.commit()
            self.logger.info(f"Saved position: {trade_id}")
            
        except Exception as e:
            self.logger.error(f"Error saving position: {e}")
            raise
    
    def close_position(self, trade_id: str, exit_price: float, exit_time: datetime, pnl: float):
        """Close a position in the database"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                UPDATE positions 
                SET exit_price = ?, exit_time = ?, pnl = ?, status = 'CLOSED'
                WHERE trade_id = ?
            ''', (exit_price, exit_time, pnl, trade_id))
            
            self.connection.commit()
            self.logger.info(f"Closed position: {trade_id}")
            
        except Exception as e:
            self.logger.error(f"Error closing position: {e}")
            raise
    
    def log_trade(self, symbol: str, action: str, amount: float, price: float, 
                  timestamp: datetime, trade_id: str):
        """Log a trade action to the database"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                INSERT INTO trades (trade_id, symbol, action, amount, price, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (trade_id, symbol, action, amount, price, timestamp))
            
            self.connection.commit()
            self.logger.info(f"Logged trade: {action} {amount} {symbol}")
            
        except Exception as e:
            self.logger.error(f"Error logging trade: {e}")
            raise
    
    def get_open_positions(self) -> List[Dict]:
        """Get all open positions"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM positions WHERE status = 'OPEN'
                ORDER BY entry_time DESC
            ''')
            
            positions = []
            for row in cursor.fetchall():
                positions.append(dict(row))
            
            return positions
            
        except Exception as e:
            self.logger.error(f"Error getting open positions: {e}")
            return []
    
    def get_position_history(self, symbol: str = None, limit: int = 100) -> List[Dict]:
        """Get position history"""
        try:
            cursor = self.connection.cursor()
            
            if symbol:
                cursor.execute('''
                    SELECT * FROM positions 
                    WHERE symbol = ? 
                    ORDER BY entry_time DESC 
                    LIMIT ?
                ''', (symbol, limit))
            else:
                cursor.execute('''
                    SELECT * FROM positions 
                    ORDER BY entry_time DESC 
                    LIMIT ?
                ''', (limit,))
            
            positions = []
            for row in cursor.fetchall():
                positions.append(dict(row))
            
            return positions
            
        except Exception as e:
            self.logger.error(f"Error getting position history: {e}")
            return []
    
    def get_trade_history(self, symbol: str = None, limit: int = 100) -> List[Dict]:
        """Get trade history"""
        try:
            cursor = self.connection.cursor()
            
            if symbol:
                cursor.execute('''
                    SELECT * FROM trades 
                    WHERE symbol = ? 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                ''', (symbol, limit))
            else:
                cursor.execute('''
                    SELECT * FROM trades 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                ''', (limit,))
            
            trades = []
            for row in cursor.fetchall():
                trades.append(dict(row))
            
            return trades
            
        except Exception as e:
            self.logger.error(f"Error getting trade history: {e}")
            return []
    
    def save_portfolio_snapshot(self, total_value: float, cash: float, 
                               total_pnl: float, total_pnl_percent: float):
        """Save a portfolio snapshot"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                INSERT INTO portfolio_snapshots (timestamp, total_value, cash, total_pnl, total_pnl_percent)
                VALUES (?, ?, ?, ?, ?)
            ''', (datetime.now(), total_value, cash, total_pnl, total_pnl_percent))
            
            self.connection.commit()
            
        except Exception as e:
            self.logger.error(f"Error saving portfolio snapshot: {e}")
    
    def get_portfolio_history(self, hours: int = 24) -> List[Dict]:
        """Get portfolio history"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM portfolio_snapshots 
                WHERE timestamp >= datetime('now', '-{} hours')
                ORDER BY timestamp ASC
            '''.format(hours))
            
            history = []
            for row in cursor.fetchall():
                history.append(dict(row))
            
            return history
            
        except Exception as e:
            self.logger.error(f"Error getting portfolio history: {e}")
            return []
    
    def save_price_history(self, symbol: str, price: float, timestamp: datetime):
        """Save price history point"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                INSERT INTO price_history (symbol, price, timestamp)
                VALUES (?, ?, ?)
            ''', (symbol, price, timestamp))
            
            self.connection.commit()
            
        except Exception as e:
            self.logger.error(f"Error saving price history: {e}")
    
    def get_price_history(self, symbol: str, hours: int = 24) -> List[Dict]:
        """Get price history from database"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM price_history 
                WHERE symbol = ? AND timestamp >= datetime('now', '-{} hours')
                ORDER BY timestamp ASC
            '''.format(hours), (symbol,))
            
            history = []
            for row in cursor.fetchall():
                history.append(dict(row))
            
            return history
            
        except Exception as e:
            self.logger.error(f"Error getting price history: {e}")
            return []
    
    def get_trading_stats(self) -> Dict:
        """Get trading statistics"""
        try:
            cursor = self.connection.cursor()
            
            # Total trades
            cursor.execute('SELECT COUNT(*) as total FROM trades')
            total_trades = cursor.fetchone()['total']
            
            # Winning trades
            cursor.execute('''
                SELECT COUNT(*) as wins FROM positions 
                WHERE status = 'CLOSED' AND pnl > 0
            ''')
            winning_trades = cursor.fetchone()['wins']
            
            # Losing trades
            cursor.execute('''
                SELECT COUNT(*) as losses FROM positions 
                WHERE status = 'CLOSED' AND pnl < 0
            ''')
            losing_trades = cursor.fetchone()['losses']
            
            # Total P&L
            cursor.execute('''
                SELECT SUM(pnl) as total_pnl FROM positions 
                WHERE status = 'CLOSED'
            ''')
            total_pnl = cursor.fetchone()['total_pnl'] or 0.0
            
            # Average P&L per trade
            cursor.execute('''
                SELECT AVG(pnl) as avg_pnl FROM positions 
                WHERE status = 'CLOSED'
            ''')
            avg_pnl = cursor.fetchone()['avg_pnl'] or 0.0
            
            return {
                'total_trades': total_trades,
                'winning_trades': winning_trades,
                'losing_trades': losing_trades,
                'total_pnl': total_pnl,
                'avg_pnl': avg_pnl,
                'win_rate': (winning_trades / max(1, total_trades)) * 100
            }
            
        except Exception as e:
            self.logger.error(f"Error getting trading stats: {e}")
            return {}
    
    def reset_portfolio(self):
        """Reset portfolio data (for testing)"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('DELETE FROM positions')
            cursor.execute('DELETE FROM trades')
            cursor.execute('DELETE FROM portfolio_snapshots')
            cursor.execute('DELETE FROM price_history')
            
            self.connection.commit()
            self.logger.info("Portfolio data reset")
            
        except Exception as e:
            self.logger.error(f"Error resetting portfolio: {e}")
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            self.logger.info("Database connection closed")