# 🤖 AI Trading Agent

A **magical, beginner-friendly trading agent** that combines AI-powered decision making with an intuitive interface. This system simulates real trading scenarios while being educational and engaging for newcomers to trading.

![AI Trading Agent](https://img.shields.io/badge/Status-Demo-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

## ✨ Features

### 🎯 Core Trading Engine
- **Long/Short Order Simulation**: Realistic order execution with market conditions
- **Real-time Market Data**: Live price feeds using Alpha Vantage API
- **Multiple Order Types**: Market orders, limit orders, stop-loss orders
- **Portfolio Management**: Complete position tracking, P&L calculations, and account balance management
- **Trade History**: Comprehensive logging of all executed trades

### 🧠 AI Decision Engine
- **Technical Analysis**: RSI, Moving Averages, MACD, Bollinger Bands, Volume Analysis
- **Market Regime Detection**: Automatic identification of bull/bear/sideways markets
- **Pattern Recognition**: Common chart pattern identification
- **Confidence Scoring**: AI-generated confidence levels for trade recommendations
- **Educational Explanations**: Human-readable reasoning for every trading decision

### 🛡️ Risk Management System
- **Automatic Position Sizing**: Based on account size and risk tolerance
- **Stop-Loss Integration**: Automatic and manual stop-loss orders
- **Risk-Reward Calculations**: Pre-trade risk assessment
- **Portfolio Risk Metrics**: Real-time risk monitoring and alerts
- **Diversification Rules**: Automatic exposure limits

### 🎨 Modern User Interface
- **Interactive Dashboard**: Clean, professional trading interface
- **Live Charts**: Professional-grade candlestick charts with technical indicators
- **Real-time Updates**: Live market data and portfolio updates
- **Mobile Responsive**: Works seamlessly on all devices
- **Dark Theme**: Easy on the eyes for long trading sessions

### 🪄 Magic Mode for Beginners
- **AI-Assisted Trading**: One-click execution of AI recommendations
- **Educational Tooltips**: Hover explanations for all trading concepts
- **Guided Trading**: Step-by-step trading tutorials
- **Risk Level Indicators**: Clear visual risk assessment
- **Paper Trading**: Safe practice environment with virtual funds

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Alpha Vantage API key (free at [alphavantage.co](https://www.alphavantage.co/support/#api-key))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trading-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Alpha Vantage API key:
   ```env
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Demo Data

The application includes comprehensive mock data for demonstration:
- **Portfolio**: $100,000 starting capital with sample positions
- **Market Data**: Real-time simulation with realistic price movements
- **AI Signals**: Pre-generated trading recommendations
- **Order History**: Sample trading history for learning

## 🏗️ Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lightweight Charts**: Professional trading charts
- **Lucide React**: Modern icon system

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Market Data Service**: Alpha Vantage integration
- **Trading Engine**: Order execution and portfolio management
- **AI Decision Engine**: Technical analysis and signal generation

### Key Components
```
src/
├── app/
│   ├── api/                 # API endpoints
│   ├── dashboard/           # Main trading dashboard
│   └── page.tsx            # Landing page
├── components/
│   ├── charts/             # Chart components
│   ├── trading/            # Trading-specific components
│   └── ui/                 # Reusable UI components
├── services/
│   ├── marketDataService.ts # Market data integration
│   ├── tradingEngine.ts    # Core trading logic
│   └── aiDecisionEngine.ts # AI analysis engine
└── types/
    └── trading.ts          # TypeScript definitions
```

## 🔧 API Endpoints

### Market Data
- `GET /api/market-data/quote?symbol=AAPL` - Get real-time quote
- `POST /api/market-data/quote` - Get multiple quotes
- `GET /api/market-data/chart?symbol=AAPL&interval=daily` - Get chart data

### Trading
- `POST /api/trading/order` - Place new order
- `GET /api/trading/order?portfolioId=demo` - Get orders
- `DELETE /api/trading/order?orderId=123` - Cancel order

### AI Analysis
- `GET /api/ai/signal?symbol=AAPL` - Get AI trading signal
- `POST /api/ai/signal` - Analyze multiple symbols

## 🎓 Educational Features

### Learning Resources
- **Interactive Tutorials**: Step-by-step trading guides
- **Glossary**: Comprehensive trading terminology
- **Risk Education**: Understanding trading risks
- **Technical Analysis**: Learn chart patterns and indicators

### Beginner-Friendly Elements
- **Magic Mode**: AI-assisted trading with explanations
- **Paper Trading**: Risk-free practice environment
- **Visual Risk Indicators**: Clear risk level displays
- **Progress Tracking**: Monitor learning advancement

## 🔒 Security & Safety

### Data Protection
- **No Real Money**: Demo environment only
- **Secure API Calls**: Encrypted communications
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Graceful error management

### Trading Safety
- **Risk Warnings**: Clear disclaimers about trading risks
- **Position Limits**: Automatic risk management
- **Demo Mode**: All trades are simulated
- **Educational Focus**: Learning-first approach

## 🚧 Development Roadmap

### Phase 1: Core Features ✅
- [x] Trading engine implementation
- [x] Market data integration
- [x] AI decision engine
- [x] Basic user interface

### Phase 2: Advanced Features 🔄
- [ ] Risk management system
- [ ] Recall API integration
- [ ] Advanced charting features
- [ ] Social trading features

### Phase 3: Educational Platform 📋
- [ ] Interactive tutorials
- [ ] Achievement system
- [ ] Community features
- [ ] Advanced AI strategies

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**Important**: This is an educational trading simulator. It does not involve real money or actual trading. All trades are simulated for learning purposes only. Real trading involves substantial risk of loss. Always consult with financial professionals before making actual investment decisions.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/trading-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/trading-agent/discussions)

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for market data API
- [TradingView](https://www.tradingview.com/) for charting inspiration
- [Next.js](https://nextjs.org/) team for the amazing framework
- Open source community for various libraries and tools

---

**Built with ❤️ for traders and developers who want to learn and build amazing trading applications.**
