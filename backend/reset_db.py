import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'routecanvas.db')

# Delete existing database if it exists
if os.path.exists(db_path):
    print(f"Deleting old database: {db_path}")
    os.remove(db_path)
    print("Old database deleted.")

# Create new database with proper schema
print("Creating new database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create users table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_traces INTEGER DEFAULT 0,
    total_hops INTEGER DEFAULT 0,
    unique_countries TEXT DEFAULT '[]',
    unique_destinations TEXT DEFAULT '[]',
    unique_ips TEXT DEFAULT '[]',
    unique_asns TEXT DEFAULT '[]',
    unique_fingerprints TEXT DEFAULT '[]',
    unique_cities TEXT DEFAULT '[]',
    unique_companies TEXT DEFAULT '[]'
)
''')

# Create saved_routes table
cursor.execute('''
CREATE TABLE IF NOT EXISTS saved_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    destination VARCHAR NOT NULL,
    hops_data TEXT NOT NULL,
    share_id VARCHAR UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
''')

conn.commit()
conn.close()
print("New database created with all columns!")
print("Please register a new account to test.")