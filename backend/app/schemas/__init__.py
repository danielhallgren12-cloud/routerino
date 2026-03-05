from pydantic import BaseModel
from typing import Optional, List

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
