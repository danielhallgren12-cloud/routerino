import os
import secrets
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    GEOIP_API_KEY: str = ""
    GEOIP_API_URL: str = "https://ipapi.co/json/"
    MAX_HOPS: int = 30
    TRACE_TIMEOUT: int = 25
    DATABASE_URL: str = "sqlite:///./routecanvas.db"
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DEBUG: bool = False

    class Config:
        env_file = ".env"

settings = Settings()

if not settings.SECRET_KEY:
    if settings.DEBUG:
        object.__setattr__(settings, 'SECRET_KEY', secrets.token_hex(32))
    else:
        raise ValueError("SECRET_KEY environment variable must be set in production")