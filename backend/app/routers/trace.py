from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
import socket
import subprocess
import hashlib
import json
from app.schemas import TraceRequest, TraceResponse, Hop
from app.services import traceroute

router = APIRouter()

def calculate_fingerprint(hops: list) -> tuple[str, str]:
    """Calculate a unique fingerprint for this route."""
    asns = sorted(set(h.get('asn', '') for h in hops if h.get('asn')))
    countries = sorted(set(h.get('country', '') for h in hops if h.get('country')))
    ips = sorted(set(h.get('ip', '') for h in hops if h.get('ip') and h.get('ip') != '*'))
    
    fp_data = {
        'asns': asns,
        'countries': countries,
        'ips': ips[:10]
    }
    fp_string = json.dumps(fp_data, sort_keys=True)
    fp_hash = hashlib.sha256(fp_string.encode()).hexdigest()[:8]
    short_id = ''.join(c.upper() for c in fp_hash if c.isalnum())[:5]
    
    return fp_string, f"#{short_id}"

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
    fp_string, fp_id = calculate_fingerprint(hops)
    
    response = TraceResponse(
        id=trace_id,
        destination=request.destination,
        hops=[Hop(**hop) for hop in hops],
        created_at=datetime.utcnow().isoformat() + "Z",
        fingerprint=fp_string,
        fingerprint_id=fp_id
    )
    
    return response
