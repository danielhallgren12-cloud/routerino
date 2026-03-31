# RouteCanvas Backend

Python + FastAPI backend for RouteCanvas

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## API Endpoints

- `POST /api/v1/trace` - Run traceroute
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/routes` - Get saved routes
- `POST /api/v1/auth/routes` - Save route
- `POST /api/v1/auth/routes/share` - Share route publicly
- `GET /api/v1/auth/me/collection` - Get collection stats
- `GET /api/v1/share/{share_id}` - Get shared route

## Database

SQLite by default. Schema created automatically on first run.

### Schema Notes
- `saved_routes.fingerprint_id` - Used for duplicate route prevention
