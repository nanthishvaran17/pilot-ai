import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("APP_NAME", "ProjectPilot AI")
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-projectpilot-jwt-token-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./projectpilot.db")
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage")
    
    # AI Provider Settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "built-in") # built-in, openai, gemini, anthropic
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_DIR, "exports"), exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_DIR, "uploads"), exist_ok=True)
