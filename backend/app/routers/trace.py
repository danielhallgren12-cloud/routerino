from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
import socket
import subprocess
from app.schemas import TraceRequest, TraceResponse, Hop
from app.services import traceroute

router = APIRouter()

@router.post("/trace", response_model=TraceResponse)
async def trace_route(request: TraceRequest):
    """Run traceroute to destination and return hop data with geo-location."""
    
    if not request.destination:
        raise HTTPException(status_code=400, detail="Destination is required")
    
    # Validate hostname format
    try:
        socket.gethostbyname(request.destination)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Host not found - check the spelling")
    except socket.timeout:
        raise HTTPException(status_code=408, detail="Connection timed out - try again")
    except OSError as e:
        raise HTTPException(status_code=503, detail=f"Network error - {str(e)}")
    
    try:
        hops = traceroute.run_traceroute(request.destination, request.max_hops)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Trace timed out - try again")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trace failed - {str(e)}")
    
    if not hops:
        raise HTTPException(status_code=404, detail="No route found - destination may be unreachable")
    
    trace_id = str(uuid.uuid4())
    
    response = TraceResponse(
        id=trace_id,
        destination=request.destination,
        hops=[Hop(**hop) for hop in hops],
        created_at=datetime.utcnow().isoformat() + "Z"
    )
    
    return response
