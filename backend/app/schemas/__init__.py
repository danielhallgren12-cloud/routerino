from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class TraceRequest(BaseModel):
    destination: str
    max_hops: int = 30

class Hop(BaseModel):
    hop: int
    ip: str
    hostname: Optional[str] = None
    isp: Optional[str] = None
    asn: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    rtt: Optional[float] = None

class TraceResponse(BaseModel):
    id: str
    destination: str
    hops: List[Hop]
    created_at: str
    fingerprint: Optional[str] = None
    fingerprint_id: Optional[str] = None

# Auth schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Route schemas
class SavedRouteCreate(BaseModel):
    destination: str
    hops_data: str  # JSON string

class SavedRouteResponse(BaseModel):
    id: int
    destination: str
    share_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
