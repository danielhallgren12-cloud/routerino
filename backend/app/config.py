import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    GEOIP_API_KEY: str = ""
    GEOIP_API_URL: str = "https://ipapi.co/json/"
    MAX_HOPS: int = 30
    TRACE_TIMEOUT: int = 25
    
    # Database
    DATABASE_URL: str = "sqlite:///./routecanvas.db"
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    class Config:
        env_file = ".env"

settings = Settings()
