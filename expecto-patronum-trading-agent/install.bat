@echo off
REM Expecto Patronum Trading Agent - Windows Installation Script
REM This script automates the installation process for Windows

setlocal enabledelayedexpansion

REM Colors for output (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to check if command exists
:command_exists
where %1 >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 0
) else (
    exit /b 1
)

REM Function to check Python version
:check_python
call :command_exists python
if %errorlevel% neq 0 (
    call :print_error "Python not found in PATH"
    exit /b 1
)

python -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"
if %errorlevel% neq 0 (
    call :print_error "Python 3.8 or higher required"
    exit /b 1
)

python -c "import sys; print(f'Python {sys.version_info.major}.{sys.version_info.minor} found')"
call :print_success "Python version check passed"
exit /b 0

REM Function to create virtual environment
:create_venv
call :print_status "Creating virtual environment..."
if exist venv (
    call :print_warning "Virtual environment already exists. Removing..."
    rmdir /s /q venv
)

python -m venv venv
if %errorlevel% neq 0 (
    call :print_error "Failed to create virtual environment"
    exit /b 1
)
call :print_success "Virtual environment created"
exit /b 0

REM Function to activate virtual environment
:activate_venv
call :print_status "Activating virtual environment..."
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    call :print_error "Failed to activate virtual environment"
    exit /b 1
)
call :print_success "Virtual environment activated"
exit /b 0

REM Function to install Python dependencies
:install_python_deps
call :print_status "Installing Python dependencies..."

REM Upgrade pip
python -m pip install --upgrade pip
if %errorlevel% neq 0 (
    call :print_warning "Failed to upgrade pip. Continuing..."
)

REM Install core dependencies
pip install requests
if %errorlevel% neq 0 (
    call :print_error "Failed to install requests"
    exit /b 1
)

REM Install optional dependencies (uncomment as needed)
REM pip install matplotlib numpy pandas scipy

call :print_success "Python dependencies installed"
exit /b 0

REM Function to test installation
:test_installation
call :print_status "Testing installation..."

REM Test imports
python -c "import sys; sys.path.append('src'); from src.core.trading_engine import TradingEngine; from src.core.portfolio import Portfolio; from src.core.risk_manager import RiskManager; from src.core.market_data_provider import MarketDataProvider; from src.database.database_manager import DatabaseManager; print('✅ All core modules imported successfully')"
if %errorlevel% neq 0 (
    call :print_error "Import test failed"
    exit /b 1
)

REM Run test suite
python test_app.py
if %errorlevel% neq 0 (
    call :print_error "Installation test failed"
    exit /b 1
)

call :print_success "Installation test passed"
exit /b 0

REM Function to create activation script
:create_activation_script
call :print_status "Creating activation script..."

(
echo @echo off
echo REM Expecto Patronum Trading Agent - Activation Script
echo.
echo echo 🦌 Activating Expecto Patronum Trading Agent...
echo call venv\Scripts\activate.bat
echo echo ✅ Virtual environment activated
echo echo 🚀 Run 'python main.py' to start the application
echo echo 🧪 Run 'python test_app.py' to run tests
echo echo 🎭 Run 'python demo.py' to see a demo
) > activate.bat

call :print_success "Activation script created: activate.bat"
exit /b 0

REM Function to show next steps
:show_next_steps
echo.
echo 🎉 Installation completed successfully!
echo.
echo Next steps:
echo 1. Activate the environment: venv\Scripts\activate.bat
echo 2. Run the application: python main.py
echo 3. Run tests: python test_app.py
echo 4. See demo: python demo.py
echo.
echo Or use the activation script: activate.bat
echo.
echo For Recall API integration:
echo 1. Edit config\recall_api_config.py with your credentials
echo 2. Uncomment the connector initialization in main.py
echo.
echo Documentation:
echo - README.md - Main documentation
echo - SETUP.md - Detailed setup guide
echo - RECALL_API_INTEGRATION.md - API integration guide
echo.
exit /b 0

REM Main installation function
:main
echo 🦌 Expecto Patronum Trading Agent - Installation Script
echo ==================================================
echo.

REM Check if we're in the right directory
if not exist "main.py" (
    call :print_error "Please run this script from the expecto-patronum-trading-agent directory"
    exit /b 1
)

if not exist "requirements.txt" (
    call :print_error "requirements.txt not found"
    exit /b 1
)

REM Check Python
call :check_python
if %errorlevel% neq 0 (
    call :print_error "Python 3.8+ is required. Please install it first."
    call :print_error "Download from: https://www.python.org/downloads/"
    call :print_error "Make sure to check 'Add Python to PATH' during installation"
    pause
    exit /b 1
)

REM Create virtual environment
call :create_venv
if %errorlevel% neq 0 (
    call :print_error "Failed to create virtual environment"
    pause
    exit /b 1
)

REM Activate virtual environment
call :activate_venv
if %errorlevel% neq 0 (
    call :print_error "Failed to activate virtual environment"
    pause
    exit /b 1
)

REM Install Python dependencies
call :install_python_deps
if %errorlevel% neq 0 (
    call :print_error "Failed to install Python dependencies"
    pause
    exit /b 1
)

REM Test installation
call :test_installation
if %errorlevel% neq 0 (
    call :print_error "Installation test failed"
    pause
    exit /b 1
)

REM Create activation script
call :create_activation_script

REM Show next steps
call :show_next_steps

pause
exit /b 0

REM Run main function
call :main