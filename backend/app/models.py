from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, UniqueConstraint
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
    new_items = Column(Text, default='{}')  # Items discovered since last visit (dict of lists)
    item_discovery_counts = Column(Text, default='{}')  # Track how many times each item was seen

    routes = relationship("SavedRoute", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")

class SavedRoute(Base):
    __tablename__ = "saved_routes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination = Column(String, nullable=False)
    hops_data = Column(Text, nullable=False)  # JSON string of hops
    share_id = Column(String, unique=True, index=True, nullable=True)  # Public share ID
    created_at = Column(DateTime, default=datetime.utcnow)

    # Gallery fields
    is_public = Column(Boolean, default=False)
    like_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    art_thumbnail = Column(Text, nullable=True)  # Base64 encoded thumbnail image

    user = relationship("User", back_populates="routes")
    likes = relationship("Like", back_populates="route", cascade="all, delete-orphan")

class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("saved_routes.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('user_id', 'route_id', name='unique_user_route_like'),)

    user = relationship("User", back_populates="likes")
    route = relationship("SavedRoute", back_populates="likes")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("saved_routes.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)