from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.routers import trace, auth
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Routerino API",
    description="Backend API for Routerino - Visual Traceroute Art",
    version="0.1.0"
)

# Add cache-busting middleware
@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.10.56:5173",
        "https://www.routerino.com",
        "https://api.routerino.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trace.router, prefix="/api/v1", tags=["trace"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])

@app.get("/")
def root():
    return {"message": "Routerino API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
