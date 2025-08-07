# 🦌 Expecto Patronum - Magical Trading Agent

A Harry Potter-themed cryptocurrency trading simulator that combines the magic of the wizarding world with the excitement of crypto trading!

## ✨ Features

### 🪄 Magical Trading Spells
- **EXPECTO LONG** - Cast to open long positions
- **EXPECTO SHORT** - Cast to open short positions  
- **FINITE INCANTATEM** - Cast to close positions
- **LUMOS** - Activate the trading engine
- **NOX** - Deactivate the trading engine

### 📊 Real-time Features
- Live cryptocurrency prices from CoinGecko API
- Real-time portfolio tracking with P&L calculations
- Interactive price charts using matplotlib
- SQLite database for trade history
- Risk management with position limits

### 🎨 Harry Potter Theme
- Dark magical color scheme
- Spell-based trading actions
- Magical UI elements and icons
- Beginner-friendly with clear error messages

## 🚀 Installation

### Prerequisites
- Python 3.8 or higher
- Internet connection for real-time data

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expecto-patronum-trading-agent
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python main.py
   ```

## 🎯 Usage Guide

### Getting Started

1. **Launch the Application**
   - Run `python main.py`
   - The magical interface will appear with three tabs

2. **Activate Trading Engine**
   - Click "✨ LUMOS (Activate)" to start the trading engine
   - Wait for market data to load

3. **Cast Your First Spell**
   - Select a cryptocurrency (e.g., Bitcoin)
   - Enter the amount you want to trade
   - Click "🦌 EXPECTO LONG" to open a long position

### Trading Spells Explained

#### 🦌 EXPECTO LONG
- **Purpose**: Open a long position (buy low, sell high)
- **When to use**: When you expect the price to rise
- **Risk**: Limited to your investment amount

#### 🦌 EXPECTO SHORT  
- **Purpose**: Open a short position (sell high, buy low)
- **When to use**: When you expect the price to fall
- **Risk**: Potentially unlimited (use with caution)

#### 🛡️ FINITE INCANTATEM
- **Purpose**: Close all open positions for a symbol
- **When to use**: To take profits or cut losses
- **Effect**: Converts positions back to cash

### Portfolio Management

#### 📜 Portfolio Tab
- View your total portfolio value
- See open positions with real-time P&L
- Track trading statistics and win rate
- Monitor session performance

#### 📊 Charts Tab
- Interactive price charts for all supported cryptocurrencies
- Multiple timeframes (1h, 6h, 24h, 7d)
- Price statistics and change indicators
- Real-time updates

## 🛡️ Risk Management

The trading agent includes several risk management features:

### Position Limits
- Maximum position size: 20% of portfolio per trade
- Maximum total exposure: 80% of portfolio
- Symbol-specific limits for different cryptocurrencies

### Leverage Limits
- Maximum leverage: 3x for short positions
- Automatic margin calculations

### Daily Loss Limits
- Maximum daily loss: 10% of portfolio
- Automatic trading suspension on limit breach

## 📁 Project Structure

```
expecto-patronum-trading-agent/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── src/
│   ├── __init__.py
│   ├── core/              # Core trading components
│   │   ├── __init__.py
│   │   ├── trading_engine.py    # Main trading logic
│   │   ├── portfolio.py         # Portfolio management
│   │   ├── risk_manager.py      # Risk management
│   │   └── market_data_provider.py  # Price data
│   ├── gui/               # User interface
│   │   ├── __init__.py
│   │   ├── main_window.py       # Main window
│   │   ├── trading_tab.py       # Trading interface
│   │   ├── portfolio_tab.py     # Portfolio view
│   │   └── charts_tab.py        # Price charts
│   └── database/          # Data storage
│       ├── __init__.py
│       └── database_manager.py  # SQLite operations
└── assets/                # Images and icons
```

## 🔧 Configuration

### Supported Cryptocurrencies
- Bitcoin (BTC)
- Ethereum (ETH)
- Cardano (ADA)
- Solana (SOL)
- Polkadot (DOT)
- Binance Coin (BNB)
- Ripple (XRP)
- Dogecoin (DOGE)

### Customization
You can modify the following in the source code:
- Risk management limits in `risk_manager.py`
- Supported cryptocurrencies in `market_data_provider.py`
- UI colors and themes in GUI components
- Database schema in `database_manager.py`

## 🐛 Troubleshooting

### Common Issues

1. **"Market data unavailable"**
   - Check your internet connection
   - CoinGecko API might be temporarily down
   - Wait a few minutes and try again

2. **"Insufficient cash"**
   - You don't have enough cash for the trade
   - Close some positions or reduce trade amount
   - Check your portfolio value

3. **"Risk management blocked"**
   - Trade exceeds position limits
   - Reduce trade amount
   - Check risk management settings

4. **Chart not loading**
   - Ensure matplotlib is installed correctly
   - Check if you have display permissions
   - Try updating the chart manually

### Error Messages
All error messages are designed to be beginner-friendly and explain what went wrong and how to fix it.

## 🔮 Future Enhancements

### Planned Features
- [ ] Integration with Recall API for advanced trading strategies
- [ ] More sophisticated risk management algorithms
- [ ] Additional technical indicators
- [ ] Paper trading competitions
- [ ] Mobile app version
- [ ] More Harry Potter spells and themes

### Modular Design
The application is designed to be easily extensible:
- Add new trading strategies
- Integrate with other APIs
- Customize risk management rules
- Add new cryptocurrencies

## 📄 License

This project is for educational purposes only. No real money is involved in trading.

## ⚠️ Disclaimer

**This is a simulation trading application. No real money is involved.**
- All trades are simulated
- Prices are real but trades are not executed
- Use for educational purposes only
- Do not use for actual trading decisions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Bug fixes
- New features
- Documentation improvements
- Harry Potter theme enhancements

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the error messages carefully
3. Open an issue on GitHub
4. Check the logs for detailed error information

---

**Remember: "It does not do to dwell on dreams and forget to live" - but in this case, it's perfectly fine to dwell on magical trading dreams! 🦌✨**

*Expecto Patronum Trading Agent - Where Magic Meets Markets*