from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Collection stats
    total_traces = Column(Integer, default=0)
    total_hops = Column(Integer, default=0)
    unique_countries = Column(Text, default='[]')
    unique_destinations = Column(Text, default='[]')
    unique_ips = Column(Text, default='[]')
    unique_asns = Column(Text, default='[]')
    unique_fingerprints = Column(Text, default='[]')
    unique_cities = Column(Text, default='[]')
    unique_companies = Column(Text, default='[]')
    earned_badges = Column(Text, default='[]')
    last_trace_date = Column(String, nullable=True)  # For streak tracking (YYYY-MM-DD)
    current_streak = Column(Integer, default=0)
    last_visit = Column(String, nullable=True)  # Last visit timestamp (ISO format)
    new_items = Column(Text, default='[]')  # Items discovered since last visit
    
    routes = relationship("SavedRoute", back_populates="user", cascade="all, delete-orphan")

class SavedRoute(Base):
    __tablename__ = "saved_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination = Column(String, nullable=False)
    hops_data = Column(Text, nullable=False)  # JSON string of hops
    share_id = Column(String, unique=True, index=True, nullable=True)  # Public share ID
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="routes")
