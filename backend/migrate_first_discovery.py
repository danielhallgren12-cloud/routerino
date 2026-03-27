"""
Migration script for First Discovery / Route Uniqueness feature.

Adds:
1. 'first_discoveries' column to users table
2. 'global_discovery_counts' table

Run with: python migrate_first_discovery.py
"""

from app.database import engine, Base, SessionLocal
from app.models import User, GlobalDiscovery
import sqlalchemy as sa

def migrate():
    # Create the new table
    GlobalDiscovery.__table__.create(engine, checkfirst=True)
    print("[OK] Created global_discovery_counts table")

    # Add column to users table if it doesn't exist
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(sa.text("PRAGMA table_info(users)"))
        columns = [row[1] for row in result]
        
        if 'first_discoveries' not in columns:
            conn.execute(sa.text("ALTER TABLE users ADD COLUMN first_discoveries INTEGER DEFAULT 0"))
            conn.commit()
            print("[OK] Added first_discoveries column to users table")
        else:
            print("[INFO] first_discoveries column already exists")

    print("\n[OK] Migration complete!")

if __name__ == "__main__":
    migrate()
