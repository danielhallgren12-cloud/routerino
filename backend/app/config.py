import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEOIP_API_KEY = os.getenv("GEOIP_API_KEY", "")
    GEOIP_API_URL = "https://ipapi.co/json/"
    MAX_HOPS = int(os.getenv("MAX_HOPS", "30"))
    TRACE_TIMEOUT = int(os.getenv("TRACE_TIMEOUT", "25"))
