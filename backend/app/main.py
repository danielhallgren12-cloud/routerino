from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import trace, auth
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RouteCanvas API",
    description="Backend API for RouteCanvas - Visual Traceroute Art",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trace.router, prefix="/api/v1", tags=["trace"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])

@app.get("/")
def root():
    return {"message": "RouteCanvas API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
