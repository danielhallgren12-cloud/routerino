from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from app.schemas import TraceRequest, TraceResponse, Hop
from app.services import traceroute

router = APIRouter()

@router.post("/trace", response_model=TraceResponse)
async def trace_route(request: TraceRequest):
    """Run traceroute to destination and return hop data with geo-location."""
    
    if not request.destination:
        raise HTTPException(status_code=400, detail="Destination is required")
    
    hops = traceroute.run_traceroute(request.destination, request.max_hops)
    
    if not hops:
        raise HTTPException(status_code=500, detail="No route data found")
    
    trace_id = str(uuid.uuid4())
    
    response = TraceResponse(
        id=trace_id,
        destination=request.destination,
        hops=[Hop(**hop) for hop in hops],
        created_at=datetime.utcnow().isoformat() + "Z"
    )
    
    return response
