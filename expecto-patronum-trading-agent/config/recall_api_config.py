"""
Recall API Configuration Template
Copy this file and update with your actual API credentials
"""

# Recall API Configuration
RECALL_API_CONFIG = {
    # API Settings
    'api_base_url': 'https://api.recall.ai/v1',  # Update if different
    'api_key': 'your_api_key_here',  # Replace with your actual API key
    'competition_id': 'your_competition_id_here',  # Replace with your competition ID
    'user_id': 'your_user_id_here',  # Replace with your user ID
    
    # Connection Settings
    'timeout': 30,  # Request timeout in seconds
    'retry_attempts': 3,  # Number of retry attempts for failed requests
    'retry_delay': 1,  # Delay between retries in seconds
    
    # Sync Settings
    'enable_logging': True,  # Enable/disable logging
    'auto_sync': False,  # Enable automatic portfolio synchronization
    'sync_interval': 60,  # Sync interval in seconds (if auto_sync is True)
}

# Example configuration for development/testing
RECALL_API_CONFIG_DEV = {
    'api_base_url': 'https://api.recall.ai/v1',
    'api_key': 'dev_api_key_here',
    'competition_id': 'dev_competition_id',
    'user_id': 'dev_user_id',
    'timeout': 30,
    'retry_attempts': 3,
    'retry_delay': 1,
    'enable_logging': True,
    'auto_sync': False,
    'sync_interval': 60,
}

# Example configuration for production
RECALL_API_CONFIG_PROD = {
    'api_base_url': 'https://api.recall.ai/v1',
    'api_key': 'prod_api_key_here',
    'competition_id': 'prod_competition_id',
    'user_id': 'prod_user_id',
    'timeout': 30,
    'retry_attempts': 5,
    'retry_delay': 2,
    'enable_logging': True,
    'auto_sync': True,
    'sync_interval': 30,
}

def get_config(environment: str = 'default') -> dict:
    """
    Get configuration for specified environment
    
    Args:
        environment: 'default', 'dev', or 'prod'
    
    Returns:
        Configuration dictionary
    """
    configs = {
        'default': RECALL_API_CONFIG,
        'dev': RECALL_API_CONFIG_DEV,
        'prod': RECALL_API_CONFIG_PROD
    }
    
    return configs.get(environment, RECALL_API_CONFIG)

def validate_config(config: dict) -> tuple[bool, str]:
    """
    Validate configuration settings
    
    Args:
        config: Configuration dictionary to validate
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ['api_key', 'competition_id', 'user_id']
    
    for field in required_fields:
        if not config.get(field) or config[field] == f'your_{field}_here':
            return False, f"Missing or invalid {field}"
    
    if config.get('timeout', 0) <= 0:
        return False, "Timeout must be greater than 0"
    
    if config.get('retry_attempts', 0) < 0:
        return False, "Retry attempts must be non-negative"
    
    if config.get('sync_interval', 0) <= 0:
        return False, "Sync interval must be greater than 0"
    
    return True, "Configuration is valid"