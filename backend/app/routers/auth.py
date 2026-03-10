from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from app.database import get_db
from app.models import User, SavedRoute
from app.auth import verify_password, get_password_hash, create_access_token, decode_access_token
from app.schemas import UserCreate, UserLogin, Token, UserResponse, SavedRouteCreate, SavedRouteResponse
from app.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

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
