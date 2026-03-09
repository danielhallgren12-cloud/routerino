# RouteCanvas - Technical Documentation

## 1. Technology Stack

### Overview

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Mobile App | React Native (Expo) | Native mobile experience, mature ecosystem |
| Web App | React + Capacitor | Shared components, single codebase |
| Backend | Python + FastAPI | Modern async framework, great for network tools |
| Database | SQLite (demo) → PostgreSQL (prod) | Simple start, scalable later |
| Caching | Redis | Session management, rate limiting |
| Maps | Leaflet + OpenStreetMap | Free, no API keys, lightweight |
| Maps (Mobile) | react-native-maps | Native map component for React Native |

### Frontend Stack

**Web:**
- React 18+
- TypeScript
- Vite (build tool)
- Leaflet (maps)
- html2canvas (image export)
- CSS Modules or Tailwind CSS

**Mobile:**
- React Native (Expo)
- TypeScript
- Expo Router (navigation)
- react-native-maps
- expo-camera / expo-image-picker (future)

### Backend Stack

- Python 3.10+
- FastAPI
- Uvicorn (ASGI server)
- SQLAlchemy (ORM)
- Pydantic (validation)
- Scapy or custom traceroute implementation
- GeoIP2 or ipapi.co (geolocation)

---

## 2. Architecture

### System Architecture

```
+-------------------------------------------------------------+
|                        Client Layer                          |
|  +-----------------+              +-----------------+        |
|  |   React Web     |              | React Native    |        |
|  |   (Browser)      |              |   (Mobile)      |        |
|  +--------+--------+              +--------+--------+        |
|           |                                |                  |
|           +---------------+----------------+                   |
|                           v                                   |
|                   +--------------+                            |
|                   |  API Gateway |                            |
|                   |  (FastAPI)   |                            |
|                   +------+-------+                            |
|                          |                                    |
|          +---------------+---------------+                    |
|          v                               v                    |
|  +-------------+               +-------------+                |
|  | Traceroute  |               |   Database  |                |
|  |  Service    |               | (SQLite/PG) |                |
|  +-------------+               +-------------+                |
|          |                                                   |
|          v                                                   |
|  +-------------+                                            |
|  | GeoIP       |                                            |
|  | Service     |                                            |
|  +-------------+                                            |
+-------------------------------------------------------------+
```

### API Design

**Base URL:** `http://localhost:8000/api/v1`

#### Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/trace` | Run traceroute to destination | ✅ |
| GET | `/destinations/presets` | Get list of preset destinations | ✅ |
| POST | `/users/register` | Register new user | ✅ |
| POST | `/users/login` | User login | ✅ |
| POST | `/routes/save` | Save route to account | ✅ |
| GET | `/routes` | Get user's saved routes | ✅ |
| DELETE | `/routes/{id}` | Delete saved route | ✅ |
| GET | `/trace/{id}` | Get existing trace result | 🔄 Future |
| GET | `/routes/public` | Get public gallery routes | 🔄 Future |
| POST | `/routes/{id}/like` | Like a route | 🔄 Future |

#### Request/Response Examples

**POST /trace**
```json
// Request
{
  "destination": "google.com",
  "max_hops": 30
}

// Response
{
  "id": "abc123",
  "destination": "google.com",
  "hops": [
    {
      "hop": 1,
      "ip": "192.168.1.1",
      "hostname": "router.local",
      "isp": "Home Network",
      "country": "SE",
      "city": "Stockholm",
      "lat": 59.3293,
      "lng": 18.0686,
      "rtt": 1.2
    },
    {
      "hop": 2,
      "ip": "83.255.1.1",
      "hostname": "bra-border-1.se",
      "isp": "Bredband2",
      "country": "SE",
      "city": "Stockholm",
      "lat": 59.3293,
      "lng": 18.0686,
      "rtt": 3.4
    }
  ],
  "created_at": "2026-03-04T12:00:00Z"
}
```

---

## 3. Project Structure

```
RouteCanvas/
+-- backend/
|   +-- app/
|   |   +-- __init__.py
|   |   +-- main.py              # FastAPI app entry
|   |   +-- config.py            # Configuration
|   |   +-- models/              # SQLAlchemy models
|   |   +-- schemas/             # Pydantic schemas
|   |   +-- routers/             # API routes
|   |   +-- services/
|   |   +-- utils/
|   +-- requirements.txt
|   +-- .env.example
|   +-- README.md
|
+-- web/
|   +-- src/
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- services/
|   |   +-- styles/
|   |   +-- App.tsx
|   |   +-- main.tsx
|   +-- index.html
|   +-- package.json
|   +-- tsconfig.json
|   +-- vite.config.ts
|
+-- mobile/
|   +-- App.tsx
|   +-- app.json
|   +-- package.json
|   +-- src/
|       +-- components/
|       +-- screens/
|       +-- services/
|
+-- SPEC.md
+-- TECH.md
+-- ROADMAP.md
+-- README.md
```

---

## 4. Database Schema

### Tables

**routes**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users (nullable for anon) |
| destination | VARCHAR(255) | Target domain/IP |
| hops | JSON | Array of hop data |
| theme | VARCHAR(50) | Applied art theme |
| is_public | BOOLEAN | Shown in gallery? |
| likes_count | INTEGER | Number of likes |
| created_at | TIMESTAMP | Creation time |

**users**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| username | VARCHAR(50) | Unique username |
| email | VARCHAR(255) | Unique email |
| password_hash | VARCHAR(255) | Bcrypt hash |
| created_at | TIMESTAMP | Registration time |

**likes**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| route_id | UUID | FK to routes |
| created_at | TIMESTAMP | Like time |

---

## 5. Traceroute Implementation

### Options for Python

| Library | Pros | Cons |
|---------|------|------|
| **scapy** | Full control, cross-platform | Complex, requires root |
| **subprocess (system traceroute)** | Simple | Platform-dependent (traceroute/tracert) |
| **py-traceroute** | Pure Python | Limited features |
| **aioscapy** | Async support | Complex setup |

### Recommended Approach

For MVP, use **subprocess** to call system traceroute:
- Linux/macOS: `traceroute`
- Windows: `tracert`

Parse output and enrich with GeoIP data.

### GeoIP Services

| Service | Free Tier | Accuracy |
|---------|-----------|----------|
| ipapi.co | 1000/day | Good |
| IP Geolocation API (ip-api.com) | 45/min | Good |
| MaxMind GeoLite2 | Unlimited (offline) | Good |

---

## 6. Frontend Implementation

### Map Visualization (Web)

```typescript
// Using Leaflet
import L from 'leaflet';

const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// Draw route
const route = L.polyline(coordinates, { color: themeColor }).addTo(map);
```

### Map Visualization (Mobile)

```typescript
// Using react-native-maps
import MapView from 'react-native-maps';

<MapView
  initialRegion={{ latitude: 20, longitude: 0, latitudeDelta: 100, longitudeDelta: 100 }}
>
  {hops.map((hop) => (
    <Marker key={hop.hop} coordinate={{ latitude: hop.lat, longitude: hop.lng }} />
  ))}
</MapView>
```

### Art Themes

| Theme | Style | Status |
|-------|-------|--------|
| Neon | Dark background, glowing cyan/magenta lines | ✅ |
| Retro | Vintage colors, scanline effects | ✅ |
| Minimal | Black/white, simple lines | ✅ |
| Watercolor | Soft gradients, bleeding colors | 🔄 Future |

---

## 7. Deployment

### Backend

**Options:**
- Render.com (free tier available)
- Railway
- Fly.io
- DigitalOcean App Platform
- Heroku

**Dockerfile:**
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

### Frontend (Web)

**Options:**
- Vercel
- Netlify
- Cloudflare Pages

### Mobile (App)

- Expo EAS Build
- App Store / Google Play

---

## 8. Development Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- Docker (optional)
- Expo CLI

### Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Web
cd web
npm install
npm run dev

# Mobile
cd mobile
npm install
npx expo start
```

---

## 9. Environment Variables

```env
# Backend
DATABASE_URL=sqlite:///./routecanvas.db
REDIS_URL=redis://localhost:6379
GEOIP_API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here

# Frontend
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 10. Security Considerations

- Rate limiting on trace endpoints (prevent abuse)
- Input validation on all endpoints
- Password hashing (bcrypt)
- CORS configuration
- Sanitize user inputs to prevent injection

---

*Last updated: 2026-03-09*
