from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    # API Keys
    openai_api_key: str

    # Database
    redis_url: str = "redis://localhost:6379"
    database_url: str = "postgresql+asyncpg://proxy_user:proxy_pass@localhost:5432/proxy_db"

    # x402 Facilitator
    x402_facilitator_url: str = "https://api.facilitator.example.com"
    cdp_api_key: str = "api_key"
    cdp_api_key_secret: str = "secret"

    # x402 Payment
    x402_testnet_wallet_address: str  # Wallet address for testnet (Base Sepolia)
    x402_mainnet_wallet_address: str  # Wallet address for mainnet (Base)
    x402_chain_id: Optional[int] = None  # If None, auto-set based on dev_mode (84532 testnet, 8453 mainnet)
    x402_testnet_chain_id: int = 84532  # Base Sepolia testnet
    x402_mainnet_chain_id: int = 8453  # Base mainnet

    log_level: str = "INFO"

    # Server
    api_port: int = 8000
    api_host: str = "0.0.0.0"

    # Performance
    max_concurrent_requests: int = 1000

    # Development
    dev_mode: bool = False  # Controls pricing, network (testnet/mainnet), and OpenAI mocking

    class Config:
        env_file = Path(__file__).parents[1] / ".env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Auto-set chain_id based on dev_mode if not explicitly provided
        if self.x402_chain_id is None:
            self.x402_chain_id = self.x402_testnet_chain_id if self.dev_mode else self.x402_mainnet_chain_id

    def get_chain_id(self) -> int:
        """Get the active chain ID based on dev_mode"""
        return self.x402_testnet_chain_id if self.dev_mode else self.x402_mainnet_chain_id

    def get_wallet_address(self) -> str:
        """Get the active wallet address based on dev_mode"""
        return self.x402_testnet_wallet_address if self.dev_mode else self.x402_mainnet_wallet_address

    def is_mock_mode(self) -> bool:
        """Check if OpenAI should be mocked (dev_mode)"""
        return self.dev_mode


settings = Settings()
