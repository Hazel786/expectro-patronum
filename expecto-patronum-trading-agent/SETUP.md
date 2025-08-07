# 🚀 Expecto Patronum Trading Agent - Setup Guide

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Platform-Specific Setup](#platform-specific-setup)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Setup](#advanced-setup)

## 🖥️ System Requirements

### Minimum Requirements
- **Python**: 3.8 or higher
- **RAM**: 512MB available
- **Storage**: 100MB free space
- **Internet**: Connection for real-time market data
- **Display**: GUI support (for tkinter)

### Recommended Requirements
- **Python**: 3.9 or higher
- **RAM**: 1GB available
- **Storage**: 500MB free space
- **Internet**: Stable broadband connection
- **Display**: 1024x768 or higher resolution

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd expecto-patronum-trading-agent
```

### 2. Install Dependencies
```bash
# Install core dependencies
pip install -r requirements.txt

# Or install manually
pip install requests
```

### 3. Run the Application
```bash
python main.py
```

### 4. Run Tests (Optional)
```bash
python test_app.py
```

## 🔧 Detailed Installation

### Step 1: Verify Python Installation

Check your Python version:
```bash
python --version
# or
python3 --version
```

**Required**: Python 3.8 or higher

### Step 2: Install Python Dependencies

#### Option A: Using requirements.txt (Recommended)
```bash
# Install all dependencies
pip install -r requirements.txt

# Or install with user flag (if you don't have admin rights)
pip install --user -r requirements.txt
```

#### Option B: Manual Installation
```bash
# Core dependency
pip install requests

# Optional enhancements (uncomment as needed)
# pip install matplotlib numpy pandas scipy
```

#### Option C: Using Virtual Environment (Recommended for Development)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Verify Installation

Run the test suite to verify everything is working:
```bash
python test_app.py
```

You should see:
```
🦌 Expecto Patronum Trading Agent - Test Suite
==================================================
🧪 Testing imports...
✅ All core modules imported successfully
...
📊 Test Results: 5/5 tests passed
🎉 All tests passed! The application should work correctly.
```

## 🖥️ Platform-Specific Setup

### Linux (Ubuntu/Debian)

#### Install System Dependencies
```bash
# Update package list
sudo apt update

# Install Python and tkinter
sudo apt install python3 python3-pip python3-tk

# Install additional dependencies (if needed)
sudo apt install python3-venv
```

#### Install Python Dependencies
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### macOS

#### Using Homebrew (Recommended)
```bash
# Install Python
brew install python

# Install dependencies
pip3 install -r requirements.txt
```

#### Using Python.org Installer
1. Download Python from [python.org](https://www.python.org/downloads/)
2. Install with default settings (includes tkinter)
3. Open Terminal and run:
```bash
pip3 install -r requirements.txt
```

### Windows

#### Using Python.org Installer
1. Download Python from [python.org](https://www.python.org/downloads/)
2. **Important**: Check "Add Python to PATH" during installation
3. Open Command Prompt and run:
```cmd
pip install -r requirements.txt
```

#### Using Microsoft Store
1. Install Python from Microsoft Store
2. Open PowerShell and run:
```powershell
pip install -r requirements.txt
```

## ⚙️ Configuration

### Basic Configuration

The application works out of the box with default settings. No configuration is required for basic usage.

### Recall API Configuration (Optional)

If you want to integrate with Recall API competitions:

#### 1. Edit Configuration File
```bash
# Open the configuration file
nano config/recall_api_config.py
# or
code config/recall_api_config.py
```

#### 2. Update API Credentials
```python
RECALL_API_CONFIG = {
    'api_base_url': 'https://api.recall.ai/v1',
    'api_key': 'your_actual_api_key_here',
    'competition_id': 'your_competition_id_here',
    'user_id': 'your_user_id_here',
    'timeout': 30,
    'retry_attempts': 3,
    'auto_sync': True,
    'sync_interval': 60
}
```

#### 3. Enable Integration in main.py
Uncomment the Recall API initialization in `main.py`:
```python
# Initialize Recall API connector
from config.recall_api_config import get_config
recall_config = get_config('default')
self.recall_connector = RecallAPIConnector(recall_config)
```

### Advanced Configuration

#### Environment-Specific Configs
```python
# Development environment
config = get_config('dev')

# Production environment  
config = get_config('prod')

# Custom configuration
custom_config = {
    'api_key': 'your_key',
    'competition_id': 'your_comp',
    'auto_sync': False
}
```

## 🧪 Testing

### Run All Tests
```bash
python test_app.py
```

### Run Specific Demos
```bash
# Basic features demo
python demo.py

# Recall API integration demo
python recall_api_demo.py
```

### Test Individual Components
```python
# Test market data
python -c "from src.core.market_data_provider import MarketDataProvider; m = MarketDataProvider(); print('Market data working')"

# Test database
python -c "from src.database.database_manager import DatabaseManager; db = DatabaseManager('test.db'); print('Database working')"
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "No module named 'tkinter'"
**Solution**: Install tkinter for your platform
```bash
# Ubuntu/Debian
sudo apt install python3-tk

# CentOS/RHEL
sudo yum install python3-tkinter

# macOS (using Homebrew)
brew install python-tk
```

#### 2. "Permission denied" when installing packages
**Solution**: Use user installation or virtual environment
```bash
# User installation
pip install --user -r requirements.txt

# Or use virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. "No module named 'requests'"
**Solution**: Install the requests library
```bash
pip install requests
```

#### 4. GUI not displaying properly
**Solution**: Check display settings and tkinter installation
```bash
# Test tkinter
python -c "import tkinter; tkinter._test()"
```

#### 5. Market data not loading
**Solution**: Check internet connection and firewall settings
```bash
# Test internet connectivity
curl -I https://api.coingecko.com/api/v3/ping
```

### Debug Mode

Run with verbose logging:
```bash
# Set debug environment variable
export PYTHONPATH=.
python -u main.py 2>&1 | tee debug.log
```

### Log Files

Check log files for detailed error information:
```bash
# View recent logs
tail -f debug.log

# Search for errors
grep -i error debug.log
```

## 🚀 Advanced Setup

### Development Environment

#### 1. Install Development Dependencies
```bash
# Uncomment development dependencies in requirements.txt
pip install pytest black flake8 mypy
```

#### 2. Setup Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Setup hooks
pre-commit install
```

#### 3. Run Code Quality Checks
```bash
# Format code
black src/ tests/

# Lint code
flake8 src/ tests/

# Type checking
mypy src/
```

### Production Deployment

#### 1. Create Production Configuration
```python
# config/recall_api_config.py
RECALL_API_CONFIG_PROD = {
    'api_key': 'prod_api_key',
    'competition_id': 'prod_competition',
    'user_id': 'prod_user',
    'timeout': 60,
    'retry_attempts': 5,
    'auto_sync': True,
    'sync_interval': 30
}
```

#### 2. Setup Logging
```python
# Configure production logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('expecto_patronum.log'),
        logging.StreamHandler()
    ]
)
```

#### 3. System Service (Linux)
Create a systemd service file:
```ini
# /etc/systemd/system/expecto-patronum.service
[Unit]
Description=Expecto Patronum Trading Agent
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/expecto-patronum-trading-agent
ExecStart=/usr/bin/python3 main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable expecto-patronum
sudo systemctl start expecto-patronum
```

### Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3-tk \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (if needed)
EXPOSE 8080

# Run the application
CMD ["python", "main.py"]
```

#### 2. Build and Run
```bash
# Build image
docker build -t expecto-patronum .

# Run container
docker run -d --name trading-agent expecto-patronum
```

## 📚 Additional Resources

### Documentation
- [README.md](README.md) - Main project documentation
- [RECALL_API_INTEGRATION.md](RECALL_API_INTEGRATION.md) - Recall API integration guide
- [FINAL_SUMMARY.md](FINAL_SUMMARY.md) - Complete feature summary

### Support
- Check the [Troubleshooting](#troubleshooting) section above
- Review log files for detailed error information
- Test individual components using the demo scripts

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python test_app.py`
5. Submit a pull request

---

## 🎉 Setup Complete!

Once you've completed the setup, you can:

1. **Run the application**: `python main.py`
2. **Cast trading spells**: Use the Harry Potter-themed interface
3. **Monitor your portfolio**: Track P&L and positions
4. **View price charts**: Analyze cryptocurrency trends
5. **Integrate with Recall**: Submit trades to competitions

**Happy trading with Expecto Patronum! 🦌✨**