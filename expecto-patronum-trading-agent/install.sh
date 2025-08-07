#!/bin/bash

# Expecto Patronum Trading Agent - Installation Script
# This script automates the installation process for Linux and macOS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            echo "ubuntu"
        elif command_exists yum; then
            echo "centos"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Function to check Python version
check_python() {
    if command_exists python3; then
        PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
        
        if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 8 ]; then
            print_success "Python $PYTHON_VERSION found"
            return 0
        else
            print_error "Python 3.8 or higher required. Found: $PYTHON_VERSION"
            return 1
        fi
    else
        print_error "Python 3 not found"
        return 1
    fi
}

# Function to install system dependencies
install_system_deps() {
    local os=$(detect_os)
    
    print_status "Installing system dependencies for $os..."
    
    case $os in
        "ubuntu")
            sudo apt-get update
            sudo apt-get install -y python3-pip python3-venv python3-tk
            ;;
        "centos")
            sudo yum install -y python3-pip python3-tkinter
            ;;
        "macos")
            if command_exists brew; then
                brew install python
            else
                print_warning "Homebrew not found. Please install Python from python.org"
                return 1
            fi
            ;;
        *)
            print_warning "Unknown OS. Please install Python 3.8+ and tkinter manually"
            return 1
            ;;
    esac
}

# Function to create virtual environment
create_venv() {
    print_status "Creating virtual environment..."
    
    if [ -d "venv" ]; then
        print_warning "Virtual environment already exists. Removing..."
        rm -rf venv
    fi
    
    python3 -m venv venv
    print_success "Virtual environment created"
}

# Function to activate virtual environment
activate_venv() {
    print_status "Activating virtual environment..."
    source venv/bin/activate
    print_success "Virtual environment activated"
}

# Function to install Python dependencies
install_python_deps() {
    print_status "Installing Python dependencies..."
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install core dependencies
    pip install requests
    
    # Install optional dependencies (uncomment as needed)
    # pip install matplotlib numpy pandas scipy
    
    print_success "Python dependencies installed"
}

# Function to test installation
test_installation() {
    print_status "Testing installation..."
    
    # Test imports
    python3 -c "
import sys
sys.path.append('src')

try:
    from src.core.trading_engine import TradingEngine
    from src.core.portfolio import Portfolio
    from src.core.risk_manager import RiskManager
    from src.core.market_data_provider import MarketDataProvider
    from src.database.database_manager import DatabaseManager
    print('✅ All core modules imported successfully')
except ImportError as e:
    print(f'❌ Import error: {e}')
    sys.exit(1)
"
    
    # Run test suite
    if python3 test_app.py; then
        print_success "Installation test passed"
    else
        print_error "Installation test failed"
        return 1
    fi
}

# Function to create activation script
create_activation_script() {
    cat > activate.sh << 'EOF'
#!/bin/bash
# Expecto Patronum Trading Agent - Activation Script

echo "🦌 Activating Expecto Patronum Trading Agent..."
source venv/bin/activate
echo "✅ Virtual environment activated"
echo "🚀 Run 'python main.py' to start the application"
echo "🧪 Run 'python test_app.py' to run tests"
echo "🎭 Run 'python demo.py' to see a demo"
EOF
    
    chmod +x activate.sh
    print_success "Activation script created: ./activate.sh"
}

# Function to show next steps
show_next_steps() {
    echo
    echo "🎉 Installation completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Activate the environment: source venv/bin/activate"
    echo "2. Run the application: python main.py"
    echo "3. Run tests: python test_app.py"
    echo "4. See demo: python demo.py"
    echo
    echo "Or use the activation script: ./activate.sh"
    echo
    echo "For Recall API integration:"
    echo "1. Edit config/recall_api_config.py with your credentials"
    echo "2. Uncomment the connector initialization in main.py"
    echo
    echo "Documentation:"
    echo "- README.md - Main documentation"
    echo "- SETUP.md - Detailed setup guide"
    echo "- RECALL_API_INTEGRATION.md - API integration guide"
    echo
}

# Main installation function
main() {
    echo "🦌 Expecto Patronum Trading Agent - Installation Script"
    echo "=================================================="
    echo
    
    # Check if we're in the right directory
    if [ ! -f "main.py" ] || [ ! -f "requirements.txt" ]; then
        print_error "Please run this script from the expecto-patronum-trading-agent directory"
        exit 1
    fi
    
    # Check Python
    if ! check_python; then
        print_error "Python 3.8+ is required. Please install it first."
        exit 1
    fi
    
    # Install system dependencies
    if ! install_system_deps; then
        print_warning "System dependency installation failed. Continuing anyway..."
    fi
    
    # Create virtual environment
    create_venv
    
    # Activate virtual environment
    activate_venv
    
    # Install Python dependencies
    install_python_deps
    
    # Test installation
    if ! test_installation; then
        print_error "Installation test failed"
        exit 1
    fi
    
    # Create activation script
    create_activation_script
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"