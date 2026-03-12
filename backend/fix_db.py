import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'routecanvas.db')

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

print(f"Using database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Add missing columns to users table
columns = [
    ('total_traces', 'INTEGER DEFAULT 0'),
    ('total_hops', 'INTEGER DEFAULT 0'),
    ('unique_countries', 'TEXT DEFAULT "[]"'),
    ('unique_destinations', 'TEXT DEFAULT "[]"'),
    ('unique_ips', 'TEXT DEFAULT "[]"'),
    ('unique_asns', 'TEXT DEFAULT "[]"'),
    ('unique_fingerprints', 'TEXT DEFAULT "[]"'),
    ('unique_cities', 'TEXT DEFAULT "[]"'),
    ('unique_companies', 'TEXT DEFAULT "[]"')
]

for col_name, col_type in columns:
    try:
        cursor.execute(f'ALTER TABLE users ADD COLUMN {col_name} {col_type}')
        print(f'Added column: {col_name}')
    except sqlite3.OperationalError as e:
        if 'duplicate column' in str(e).lower():
            print(f'Column already exists: {col_name}')
        else:
            print(f'Error adding {col_name}: {e}')

conn.commit()
conn.close()
print('\nDone! Database updated.')