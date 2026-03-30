from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class TraceRequest(BaseModel):
    destination: str
    max_hops: int = 30
    ip_version: Optional[str] = "ipv4"

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
    is_public: bool = False
    art_thumbnail: Optional[str] = None
    fingerprint_id: Optional[str] = None

class SavedRouteResponse(BaseModel):
    id: int
    destination: str
    share_id: Optional[str] = None
    created_at: datetime
    is_public: bool = False
    like_count: int = 0
    view_count: int = 0
    art_thumbnail: Optional[str] = None
    user_id: Optional[int] = None
    username: Optional[str] = None
    fingerprint_id: Optional[str] = None

    class Config:
        from_attributes = True

class SavedRouteWithUser(SavedRouteResponse):
    username: str
    user_id: int

class GalleryRoute(BaseModel):
    id: int
    destination: str
    created_at: datetime
    like_count: int
    view_count: int
    username: str
    user_id: int
    art_thumbnail: Optional[str] = None

    class Config:
        from_attributes = True

class PublicProfile(BaseModel):
    username: str
    created_at: datetime
    total_routes: int
    total_traces: int
    total_hops: int
    collection_items: int
    badges_count: int
    public_routes: List[SavedRouteResponse]

class LikeResponse(BaseModel):
    success: bool
    like_count: int
    liked: bool

class ReportCreate(BaseModel):
    reason: str

class ReportResponse(BaseModel):
    success: bool
    message: str