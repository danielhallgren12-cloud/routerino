from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import timedelta, date
from typing import List
import secrets
import string
import json
from app.database import get_db
from app.models import User, SavedRoute
from app.auth import verify_password, get_password_hash, create_access_token, decode_access_token
from app.schemas import UserCreate, UserLogin, Token, UserResponse, SavedRouteCreate, SavedRouteResponse
from app.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

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
    
    db.commit()
    
    # Return updated collection
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
        "new_items": new_items,
    }

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

@router.post("/routes", response_model=SavedRouteResponse)
def save_route(route: SavedRouteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_route = SavedRoute(
        user_id=current_user.id,
        destination=route.destination,
        hops_data=route.hops_data
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
    """Save route and generate a public shareable link"""
    # Generate unique share_id
    share_id = generate_share_id()
    while db.query(SavedRoute).filter(SavedRoute.share_id == share_id).first():
        share_id = generate_share_id()
    
    db_route = SavedRoute(
        user_id=current_user.id,
        destination=route.destination,
        hops_data=route.hops_data,
        share_id=share_id
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
        "exports": 0,  # Would need to track this separately
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
    # For now just return success - would need export tracking
    return {"success": True}
