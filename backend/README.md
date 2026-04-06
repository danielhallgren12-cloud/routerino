# Routerino Backend

Python + FastAPI backend for Routerino

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## API Endpoints

### Trace
- `POST /api/v1/trace` - Run traceroute to destination

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user info
- `GET /api/v1/auth/me/collection` - Get user's collection stats
- `GET /api/v1/auth/me/badges` - Get user's badges
- `POST /api/v1/auth/me/badges/check` - Check and award badges

### Routes
- `GET /api/v1/auth/routes` - Get user's saved routes
- `POST /api/v1/auth/routes` - Save route to account
- `POST /api/v1/auth/routes/share` - Share route publicly
- `DELETE /api/v1/auth/routes/{id}` - Delete saved route
- `GET /api/v1/routes/by-destination` - Get routes grouped by destination (Route Atlas)

### Gallery
- `GET /api/v1/gallery` - Get public routes (paginated, sortable)
- `GET /api/v1/gallery/random` - Get random routes for featured section

### Social
- `POST /api/v1/routes/{id}/like` - Like or unlike a route
- `GET /api/v1/routes/{id}/like/status` - Check if user liked a route
- `PATCH /api/v1/routes/{id}/visibility` - Update route visibility
- `POST /api/v1/routes/{id}/view` - Increment view count

### Users
- `GET /api/v1/user/{username}` - Get public user profile
- `GET /api/v1/user/{username}/routes` - Get user's public routes
- `POST /api/v1/routes/{id}/report` - Report a route

### Sharing
- `GET /api/v1/share/{share_id}` - Get shared route

## Database

SQLite by default (routecanvas.db). Schema created automatically on first run.

### Schema Notes
- `saved_routes.fingerprint_id` - Used for duplicate route prevention
- `saved_routes.art_thumbnail` - Base64 PNG thumbnail for gallery
