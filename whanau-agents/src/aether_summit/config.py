from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    model: str = Field(default="llama3.1:8b", description="Default local model via Ollama")
    temperature: float = 0.3
    max_tokens: int = 4096
    hitl_enabled: bool = True
    audit_log: bool = True
    ollama_base_url: str = "http://localhost:11434"

    class Config:
        env_file = ".env"
        env_prefix = "AETHER_"

settings = Settings()
