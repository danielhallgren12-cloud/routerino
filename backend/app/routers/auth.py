from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from datetime import timedelta, date, datetime
from typing import List
import json
import string
import secrets
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import get_db
from app.models import User, SavedRoute, Like, Report, GlobalDiscovery
from app.auth import verify_password, get_password_hash, create_access_token, decode_access_token
from app.schemas import (
    UserCreate, UserLogin, Token, UserResponse,
    SavedRouteCreate, SavedRouteResponse, SavedRouteWithUser,
    GalleryRoute, PublicProfile, LikeResponse, ReportCreate, ReportResponse
)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

_rate_limit_store = {}

def _check_rate_limit(user_id: int, max_traces_per_minute: int = 10) -> tuple[bool, str]:
    now = datetime.now()
    if user_id not in _rate_limit_store:
        _rate_limit_store[user_id] = []
    times = [t for t in _rate_limit_store[user_id] if (now - t).total_seconds() < 60]
    _rate_limit_store[user_id] = times
    if len(times) >= max_traces_per_minute:
        return False, f"Rate limit exceeded. Max {max_traces_per_minute} traces per minute."
    _rate_limit_store[user_id].append(now)
    return True, ""

class CollectRequest(BaseModel):
    destination: str
    hops_data: str
    fingerprint_id: str

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email = payload.get("sub")
    if email is None or not isinstance(email, str):
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/me/collection")
def get_user_collection(current_user: User = Depends(get_current_user)):
    """Get user's complete collection stats with arrays"""
    destinations = json.loads(current_user.unique_destinations or '[]')
    countries = json.loads(current_user.unique_countries or '[]')
    cities = json.loads(current_user.unique_cities or '[]')
    companies = json.loads(current_user.unique_companies or '[]')
    ips = json.loads(current_user.unique_ips or '[]')
    asns = json.loads(current_user.unique_asns or '[]')
    fingerprints = json.loads(current_user.unique_fingerprints or '[]')
    new_items = json.loads(current_user.new_items or '{}')
    discovery_counts = json.loads(current_user.item_discovery_counts or '{}')

    return {
        "destinations": len(destinations),
        "countries": len(countries),
        "cities": len(cities),
        "companies": len(companies),
        "ips": len(ips),
        "asns": len(asns),
        "total_traces": current_user.total_traces,
        "total_hops": current_user.total_hops,
        "fingerprints": len(fingerprints),
        "new_items": new_items,
        "discovery_counts": discovery_counts,
        "items": {
            "destinations": destinations,
            "countries": countries,
            "cities": cities,
            "companies": companies,
            "ips": ips,
            "asns": asns,
            "fingerprints": fingerprints,
        }
    }

@router.post("/trace/collect")
def collect_route(collect: CollectRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update user's collection with new trace data"""
    allowed, msg = _check_rate_limit(current_user.id)
    if not allowed:
        raise HTTPException(status_code=429, detail=msg)
    hops = json.loads(collect.hops_data)

    # Extract unique items from this trace
    countries = set(h.get('country', '') for h in hops if h.get('country'))
    cities = set(h.get('city', '') for h in hops if h.get('city'))
    ips = set(h.get('ip', '') for h in hops if h.get('ip') and h.get('ip') != '*')
    asns = set(h.get('asn', '') for h in hops if h.get('asn'))
    isps = set(h.get('isp', '') for h in hops if h.get('isp'))

    # Get current collections
    current_countries = set(json.loads(current_user.unique_countries or '[]'))
    current_destinations = set(json.loads(current_user.unique_destinations or '[]'))
    current_cities = set(json.loads(current_user.unique_cities or '[]'))
    current_companies = set(json.loads(current_user.unique_companies or '[]'))
    current_ips = set(json.loads(current_user.unique_ips or '[]'))
    current_asns = set(json.loads(current_user.unique_asns or '[]'))
    current_fingerprints = set(json.loads(current_user.unique_fingerprints or '[]'))

    # Track new discoveries
    new_items = {
        "destinations": [],
        "countries": [],
        "cities": [],
        "companies": [],
        "ips": [],
        "asns": [],
        "fingerprints": [],
    }

    # Find new destinations
    new_destinations = {collect.destination} - current_destinations
    if new_destinations:
        new_items["destinations"] = list(new_destinations)

    # Find new countries
    new_countries = countries - current_countries
    if new_countries:
        new_items["countries"] = list(new_countries)

    # Find new cities
    new_cities = cities - current_cities
    if new_cities:
        new_items["cities"] = list(new_cities)

    # Find new ISPs/companies
    new_companies = isps - current_companies
    if new_companies:
        new_items["companies"] = list(new_companies)

    # Find new IPs
    new_ips = ips - current_ips
    if new_ips:
        new_items["ips"] = list(new_ips)

    # Find new ASNs
    new_asns = asns - current_asns
    if new_asns:
        new_items["asns"] = list(new_asns)

    # Find new fingerprints
    new_fingerprints = {collect.fingerprint_id} - current_fingerprints
    if new_fingerprints:
        new_items["fingerprints"] = list(new_fingerprints)

    # Update counts
    current_user.total_traces += 1
    current_user.total_hops += len([h for h in hops if h.get('ip') and h.get('ip') != '*'])

    # Update streak
    today = date.today().isoformat()
    if current_user.last_trace_date:
        last_date = date.fromisoformat(current_user.last_trace_date)
        days_diff = (date.today() - last_date).days
        if days_diff == 1:
            current_user.current_streak += 1
        elif days_diff > 1:
            current_user.current_streak = 1
    else:
        current_user.current_streak = 1
    current_user.last_trace_date = today

    # Add new items to collections (append to end to preserve discovery order)
    def append_unique(existing_list, new_items):
        result = list(existing_list)
        for item in new_items:
            if item not in result:
                result.append(item)
        return result

    current_user.unique_countries = json.dumps(append_unique(current_countries, countries))
    current_user.unique_destinations = json.dumps(append_unique(current_destinations, {collect.destination}))
    current_user.unique_cities = json.dumps(append_unique(current_cities, cities))
    current_user.unique_companies = json.dumps(append_unique(current_companies, isps))
    current_user.unique_ips = json.dumps(append_unique(current_ips, ips))
    current_user.unique_asns = json.dumps(append_unique(current_asns, asns))
    current_user.unique_fingerprints = json.dumps(append_unique(current_fingerprints, {collect.fingerprint_id}))

    # Accumulate new items
    new_items_raw = current_user.new_items or '{}'
    if new_items_raw == '[]':  # Handle legacy data
        new_items_raw = '{}'
    current_new_items = json.loads(new_items_raw)
    for key in new_items:
        if new_items[key]:
            if key not in current_new_items:
                current_new_items[key] = []
            current_new_items[key] = list(set(current_new_items[key] + new_items[key]))
    current_user.new_items = json.dumps(current_new_items)

    # Update item discovery counts
    discovery_counts = json.loads(current_user.item_discovery_counts or '{}')

    # Increment counts for all items in this trace
    for item in countries:
        discovery_counts[f"country:{item}"] = discovery_counts.get(f"country:{item}", 0) + 1
    for item in cities:
        discovery_counts[f"city:{item}"] = discovery_counts.get(f"city:{item}", 0) + 1
    for item in isps:
        discovery_counts[f"company:{item}"] = discovery_counts.get(f"company:{item}", 0) + 1
    for item in ips:
        discovery_counts[f"ip:{item}"] = discovery_counts.get(f"ip:{item}", 0) + 1
    for item in asns:
        discovery_counts[f"asn:{item}"] = discovery_counts.get(f"asn:{item}", 0) + 1
    discovery_counts[f"destination:{collect.destination}"] = discovery_counts.get(f"destination:{collect.destination}", 0) + 1
    discovery_counts[f"fingerprint:{collect.fingerprint_id}"] = discovery_counts.get(f"fingerprint:{collect.fingerprint_id}", 0) + 1

    current_user.item_discovery_counts = json.dumps(discovery_counts)

    # ========== GLOBAL FIRST DISCOVERY TRACKING ==========
    first_discoveries_this_trace = []
    
    def track_global_discovery(item_type, item_value):
        """Track global discovery and return True if this is a world first"""
        existing = db.query(GlobalDiscovery).filter(
            GlobalDiscovery.item_type == item_type,
            GlobalDiscovery.item_value == item_value
        ).first()
        
        if existing:
            existing.user_count += 1
            return False
        else:
            # World First! Nobody else has discovered this
            new_discovery = GlobalDiscovery(
                item_type=item_type,
                item_value=item_value,
                user_count=1
            )
            db.add(new_discovery)
            return True
    
    # Check all new items for world first discoveries
    for dest in new_items.get("destinations", []):
        if track_global_discovery("destination", dest):
            first_discoveries_this_trace.append(f"destination:{dest}")
    
    for country in new_items.get("countries", []):
        if track_global_discovery("country", country):
            first_discoveries_this_trace.append(f"country:{country}")
    
    for city in new_items.get("cities", []):
        if track_global_discovery("city", city):
            first_discoveries_this_trace.append(f"city:{city}")
    
    for company in new_items.get("companies", []):
        if track_global_discovery("company", company):
            first_discoveries_this_trace.append(f"company:{company}")
    
    for asn in new_items.get("asns", []):
        if track_global_discovery("asn", asn):
            first_discoveries_this_trace.append(f"asn:{asn}")
    
    for fingerprint in new_items.get("fingerprints", []):
        if track_global_discovery("fingerprint", fingerprint):
            first_discoveries_this_trace.append(f"fingerprint:{fingerprint}")
    
    # Update user's first discovery count
    if first_discoveries_this_trace:
        current_user.first_discoveries += len(first_discoveries_this_trace)
    # ========== END GLOBAL FIRST DISCOVERY ==========

    db.commit()

    # Return updated collection with discovery counts
    return {
        "destinations": len(json.loads(current_user.unique_destinations or '[]')),
        "countries": len(json.loads(current_user.unique_countries or '[]')),
        "cities": len(json.loads(current_user.unique_cities or '[]')),
        "companies": len(json.loads(current_user.unique_companies or '[]')),
        "ips": len(json.loads(current_user.unique_ips or '[]')),
        "asns": len(json.loads(current_user.unique_asns or '[]')),
        "total_traces": current_user.total_traces,
        "total_hops": current_user.total_hops,
        "fingerprints": len(json.loads(current_user.unique_fingerprints or '[]')),
        "new_items": json.loads(current_user.new_items or '{}'),
        "discovery_counts": discovery_counts,
        "first_discoveries": current_user.first_discoveries,
        "first_discoveries_this_trace": first_discoveries_this_trace,
    }

@router.get("/me/collection/uniqueness")
def get_collection_uniqueness(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get global uniqueness stats for user's collection items"""
    uniqueness = {}
    
    # Check fingerprints
    fingerprints = json.loads(current_user.unique_fingerprints or '[]')
    for fp in fingerprints:
        discovery = db.query(GlobalDiscovery).filter(
            GlobalDiscovery.item_type == "fingerprint",
            GlobalDiscovery.item_value == fp
        ).first()
        uniqueness[f"fingerprint:{fp}"] = discovery.user_count if discovery else 0
    
    # Check other items for "first discovery" status
    for category, field in [
        ("country", current_user.unique_countries),
        ("city", current_user.unique_cities),
        ("company", current_user.unique_companies),
        ("asn", current_user.unique_asns),
        ("destination", current_user.unique_destinations),
    ]:
        items = json.loads(field or '[]')
        for item in items:
            key = f"{category}:{item}"
            if key not in uniqueness:
                discovery = db.query(GlobalDiscovery).filter(
                    GlobalDiscovery.item_type == category,
                    GlobalDiscovery.item_value == item
                ).first()
                uniqueness[key] = discovery.user_count if discovery else 0
    
    return uniqueness

@router.get("/me/collection/{category}")
def get_collection_category(category: str, current_user: User = Depends(get_current_user)):
    """Get items from a specific collection category"""
    valid_categories = ["destinations", "countries", "cities", "companies", "ips", "asns", "fingerprints"]
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Valid: {valid_categories}")

    field_map = {
        "destinations": current_user.unique_destinations,
        "countries": current_user.unique_countries,
        "cities": current_user.unique_cities,
        "companies": current_user.unique_companies,
        "ips": current_user.unique_ips,
        "asns": current_user.unique_asns,
        "fingerprints": current_user.unique_fingerprints,
    }

    items = json.loads(field_map.get(category, '[]'))
    return {"category": category, "items": items, "count": len(items)}

@router.get("/me/uniqueness")
def get_collection_uniqueness(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get global uniqueness stats for user's collection items"""
    uniqueness = {}
    
    # Check fingerprints
    fingerprints = json.loads(current_user.unique_fingerprints or '[]')
    for fp in fingerprints:
        discovery = db.query(GlobalDiscovery).filter(
            GlobalDiscovery.item_type == "fingerprint",
            GlobalDiscovery.item_value == fp
        ).first()
        uniqueness[f"fingerprint:{fp}"] = discovery.user_count if discovery else 0
    
    # Check other items for "first discovery" status
    for category, field in [
        ("country", current_user.unique_countries),
        ("city", current_user.unique_cities),
        ("company", current_user.unique_companies),
        ("asn", current_user.unique_asns),
        ("destination", current_user.unique_destinations),
    ]:
        items = json.loads(field or '[]')
        for item in items:
            key = f"{category}:{item}"
            if key not in uniqueness:
                discovery = db.query(GlobalDiscovery).filter(
                    GlobalDiscovery.item_type == category,
                    GlobalDiscovery.item_value == item
                ).first()
                uniqueness[key] = discovery.user_count if discovery else 0
    
    return uniqueness

@router.post("/me/collection/clear-new")
def clear_new_items(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Clear the new_items list after user has seen them"""
    current_user.new_items = '[]'
    db.commit()
    return {"success": True}

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # Create new user
    try:
        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            password_hash=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last_visit timestamp
    from datetime import datetime
    user.last_visit = datetime.utcnow().isoformat() + "Z"
    db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Saved routes endpoints
@router.get("/routes", response_model=List[SavedRouteResponse])
def get_routes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    routes = db.query(SavedRoute).filter(SavedRoute.user_id == current_user.id).order_by(SavedRoute.created_at.desc()).all()
    return routes

@router.get("/routes/by-destination")
def get_routes_by_destination(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all routes grouped by destination for Route Atlas feature"""
    routes = db.query(SavedRoute).filter(
        SavedRoute.user_id == current_user.id,
        SavedRoute.share_id.is_(None)
    ).order_by(SavedRoute.created_at.desc()).all()
    
    # Group by destination
    destinations: dict = {}
    for route in routes:
        dest = route.destination
        if dest not in destinations:
            destinations[dest] = []
        destinations[dest].append({
            "id": route.id,
            "destination": route.destination,
            "hops_data": json.loads(route.hops_data),
            "created_at": route.created_at.isoformat() if route.created_at else None,
            "fingerprint_id": route.fingerprint_id,
            "share_id": route.share_id,
        })
    
    # Filter to only destinations with 2+ routes
    result = {
        dest: routes_list 
        for dest, routes_list in destinations.items() 
        if len(routes_list) >= 2
    }
    
    return {"destinations": result, "total_destinations": len(result)}

@router.post("/routes", response_model=SavedRouteResponse)
def save_route(route: SavedRouteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check for duplicate fingerprint in saved routes
    if route.fingerprint_id:
        fp_id = route.fingerprint_id if route.fingerprint_id.startswith('#') else f"#{route.fingerprint_id}"
        existing = db.query(SavedRoute).filter(
            SavedRoute.user_id == current_user.id,
            SavedRoute.fingerprint_id == fp_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"This route pattern ({fp_id}) is already saved"
            )

    db_route = SavedRoute(
        user_id=current_user.id,
        destination=route.destination,
        hops_data=route.hops_data,
        is_public=route.is_public,
        art_thumbnail=route.art_thumbnail,
        fingerprint_id=route.fingerprint_id
    )
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

@router.get("/routes/{route_id}")
def get_route(route_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    route = db.query(SavedRoute).filter(SavedRoute.id == route_id, SavedRoute.user_id == current_user.id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.delete("/routes/{route_id}")
def delete_route(route_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    route = db.query(SavedRoute).filter(SavedRoute.id == route_id, SavedRoute.user_id == current_user.id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    db.delete(route)
    db.commit()
    return {"message": "Route deleted"}

def generate_share_id(length: int = 8) -> str:
    """Generate a random share ID"""
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

@router.post("/routes/share", response_model=SavedRouteResponse)
def share_route(route: SavedRouteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Generate unique share_id
    share_id = generate_share_id()
    while db.query(SavedRoute).filter(SavedRoute.share_id == share_id).first():
        share_id = generate_share_id()

    db_route = SavedRoute(
        user_id=current_user.id,
        destination=route.destination,
        hops_data=route.hops_data,
        share_id=share_id,
        is_public=route.is_public,
        art_thumbnail=route.art_thumbnail,
        fingerprint_id=route.fingerprint_id
    )
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

@router.get("/share/{share_id}")
def get_shared_route(share_id: str, db: Session = Depends(get_db)):
    """Get a public shared route by share_id"""
    route = db.query(SavedRoute).filter(SavedRoute.share_id == share_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Shared route not found")
    return route

# ============ GALLERY ENDPOINTS ============

@router.get("/gallery")
def get_gallery(
    page: int = 1,
    limit: int = 12,
    sort: str = "latest",
    db: Session = Depends(get_db)
):
    """Get public routes for gallery display"""
    query = db.query(SavedRoute).options(joinedload(SavedRoute.user)).filter(SavedRoute.is_public == True)

    if sort == "popular":
        query = query.order_by(SavedRoute.like_count.desc())
    elif sort == "trending":
        query = query.order_by(SavedRoute.view_count.desc())
    else:  # latest
        query = query.order_by(SavedRoute.created_at.desc())

    total = query.count()
    offset = (page - 1) * limit
    routes = query.offset(offset).limit(limit).all()

    result = []
    for r in routes:
        result.append({
            "id": r.id,
            "destination": r.destination,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "like_count": r.like_count,
            "view_count": r.view_count,
            "username": r.user.username if r.user else "unknown",
            "user_id": r.user_id,
            "art_thumbnail": r.art_thumbnail
        })
    return {"routes": result, "total": total, "page": page, "limit": limit}

@router.get("/gallery/random")
def get_random_gallery(limit: int = 6, db: Session = Depends(get_db)):
    """Get random public routes for homepage featured section"""
    import random
    routes = db.query(SavedRoute).options(joinedload(SavedRoute.user)).filter(SavedRoute.is_public == True).all()
    random.shuffle(routes)
    result = []
    for r in routes[:limit]:
        result.append({
            "id": r.id,
            "destination": r.destination,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "like_count": r.like_count,
            "view_count": r.view_count,
            "username": r.user.username if r.user else "unknown",
            "user_id": r.user_id,
            "art_thumbnail": r.art_thumbnail
        })
    return {"routes": result}

@router.get("/user/{username}")
def get_public_profile(username: str, db: Session = Depends(get_db)):
    """Get public profile with stats and routes"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get public routes for this user
    public_routes = db.query(SavedRoute).filter(
        SavedRoute.user_id == user.id,
        SavedRoute.is_public == True
    ).order_by(SavedRoute.created_at.desc()).all()

    # Calculate stats
    collection_items = (
        len(json.loads(user.unique_countries or '[]')) +
        len(json.loads(user.unique_destinations or '[]')) +
        len(json.loads(user.unique_cities or '[]')) +
        len(json.loads(user.unique_companies or '[]')) +
        len(json.loads(user.unique_ips or '[]')) +
        len(json.loads(user.unique_asns or '[]'))
    )

    badges = json.loads(user.earned_badges or '[]')

    # Serialize public routes
    serialized_routes = []
    for r in public_routes:
        serialized_routes.append({
            "id": r.id,
            "destination": r.destination,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "like_count": r.like_count,
            "view_count": r.view_count,
            "is_public": r.is_public,
            "art_thumbnail": r.art_thumbnail
        })

    return JSONResponse(content={
        "username": user.username,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "total_routes": len(public_routes),
        "total_traces": user.total_traces,
        "total_hops": user.total_hops,
        "collection_items": collection_items,
        "badges_count": len(badges),
        "public_routes": serialized_routes
    })

@router.get("/user/{username}/routes")
def get_user_public_routes(
    username: str,
    page: int = 1,
    limit: int = 12,
    sort: str = "latest",
    db: Session = Depends(get_db)
):
    """Get public routes for a specific user"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(SavedRoute).filter(
        SavedRoute.user_id == user.id,
        SavedRoute.is_public == True
    )

    if sort == "popular":
        query = query.order_by(SavedRoute.like_count.desc())
    else:
        query = query.order_by(SavedRoute.created_at.desc())

    total = query.count()
    offset = (page - 1) * limit
    routes = query.offset(offset).limit(limit).all()

    return {"routes": routes, "total": total, "page": page, "limit": limit}

@router.post("/routes/{route_id}/like")
def like_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a route"""
    route = db.query(SavedRoute).filter(SavedRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    # Check if already liked
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.route_id == route_id
    ).first()

    if existing_like:
        # Unlike
        db.delete(existing_like)
        route.like_count = max(0, route.like_count - 1)
        liked = False
    else:
        # Like
        new_like = Like(user_id=current_user.id, route_id=route_id)
        db.add(new_like)
        route.like_count = route.like_count + 1
        liked = True

    db.commit()
    return {"success": True, "like_count": route.like_count, "liked": liked}

@router.get("/routes/{route_id}/like/status")
def get_like_status(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked a route"""
    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.route_id == route_id
    ).first()
    return {"liked": existing_like is not None}

@router.post("/routes/likes/status")
def get_likes_status(
    route_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Batch check if current user has liked multiple routes"""
    if len(route_ids) > 50:
        raise HTTPException(status_code=400, detail="Max 50 route IDs per request")
    liked_routes = db.query(Like.route_id).filter(
        Like.user_id == current_user.id,
        Like.route_id.in_(route_ids)
    ).all()
    return {"liked_routes": [r.route_id for r in liked_routes]}

@router.patch("/routes/{route_id}/visibility")
def update_route_visibility(
    route_id: int,
    is_public: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update route visibility (public/private)"""
    route = db.query(SavedRoute).filter(
        SavedRoute.id == route_id,
        SavedRoute.user_id == current_user.id
    ).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    route.is_public = is_public
    db.commit()
    return {"success": True, "is_public": is_public}

@router.post("/routes/{route_id}/view")
def increment_view_count(
    route_id: int,
    db: Session = Depends(get_db)
):
    """Increment view count for a route (public endpoint)"""
    route = db.query(SavedRoute).filter(SavedRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    route.view_count = route.view_count + 1
    db.commit()
    return {"success": True, "view_count": route.view_count}

@router.post("/routes/{route_id}/report")
def report_route(
    route_id: int,
    report: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Report a route for inappropriate content"""
    route = db.query(SavedRoute).filter(SavedRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    # Don't let users report their own routes
    if route.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot report your own route")

    # Create report
    db_report = Report(
        route_id=route_id,
        reporter_id=current_user.id,
        reason=report.reason
    )
    db.add(db_report)
    db.commit()

    return {"success": True, "message": "Report submitted"}

@router.get("/me/badges")
def get_user_badges(current_user: User = Depends(get_current_user)):
    """Get user's badges and all available badges"""
    from app.badges import get_all_badges, BADGES

    earned = json.loads(current_user.earned_badges or '[]')
    all_badges = get_all_badges()

    # Build response with earned status
    result = []
    for badge in all_badges:
        result.append({
            **badge,
            "earned": badge["id"] in earned
        })

    return {
        "earned": earned,
        "badges": result,
        "total_earned": len(earned),
        "total_available": len(all_badges)
    }

@router.get("/me/badges/check")
def check_badges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Check and award any new badges based on user stats"""
    from app.badges import get_all_badges

    earned = set(json.loads(current_user.earned_badges or '[]'))
    all_badges = get_all_badges()
    new_badges = []

    # Get current stats
    stats = {
        "traces": current_user.total_traces,
        "countries": len(json.loads(current_user.unique_countries or '[]')),
        "cities": len(json.loads(current_user.unique_cities or '[]')),
        "destinations": len(json.loads(current_user.unique_destinations or '[]')),
        "companies": len(json.loads(current_user.unique_companies or '[]')),
        "streak": current_user.current_streak,
        "exports": 0,
        "first_discoveries": current_user.first_discoveries,
    }

    # Check each badge
    for badge in all_badges:
        if badge["id"] in earned:
            continue

        req_type, req_value = badge["req"]

        if req_type in stats and stats[req_type] >= req_value:
            earned.add(badge["id"])
            new_badges.append(badge)

    # Update database if new badges earned
    if new_badges:
        current_user.earned_badges = json.dumps(list(earned))
        db.commit()

    return {
        "new_badges": new_badges,
        "total_earned": len(earned)
    }

@router.post("/me/badges/increment-export")
def increment_export(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Increment export counter for badges"""
    return {"success": True}