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
| POST | `/auth/register` | Register new user | ✅ |
| POST | `/auth/login` | User login | ✅ |
| GET | `/auth/me` | Get current user info | ✅ |
| GET | `/auth/routes` | Get user's saved routes | ✅ |
| POST | `/auth/routes` | Save route to account | ✅ |
| POST | `/auth/routes/share` | Save route with public share link | ✅ |
| DELETE | `/auth/routes/{id}` | Delete saved route | ✅ |
| GET | `/share/{share_id}` | Get public shared route | ✅ |
| GET | `/auth/me/collection` | Get user's collection stats | ✅ |
| POST | `/trace/collect` | Update collection after trace (auto) | ✅ |

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
    }
  ],
  "created_at": "2026-03-04T12:00:00Z",
  "fingerprint": "{...}",
  "fingerprint_id": "#8X2K4"
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
|   |   +-- art/
|   |   |   +-- ArtGenerator.tsx   # Art generator with 6 styles
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
+-- ART_GENERATOR.md
+-- README.md
```

---

## 4. Database Schema

### Tables

**saved_routes**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| user_id | INTEGER | FK to users |
| destination | VARCHAR | Target domain/IP |
| hops_data | TEXT | JSON string of hops |
| share_id | VARCHAR | Unique public share ID (nullable) |
| created_at | TIMESTAMP | Creation time |

**users**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| username | VARCHAR | Unique username |
| email | VARCHAR | Unique email |
| password_hash | VARCHAR | Bcrypt hash |
| created_at | TIMESTAMP | Registration time |
| total_traces | INTEGER | Total traces performed |
| total_hops | INTEGER | Total hops across all traces |
| unique_countries | TEXT | JSON array of unique countries |
| unique_destinations | TEXT | JSON array of unique destinations |
| unique_ips | TEXT | JSON array of unique IPs |
| unique_asns | TEXT | JSON array of unique ASNs |
| unique_fingerprints | TEXT | JSON array of unique fingerprints |
| unique_cities | TEXT | JSON array of unique cities |
| unique_companies | TEXT | JSON array of unique companies |

**likes**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| route_id | UUID | FK to routes |
| created_at | TIMESTAMP | Like time |

---

## 5. Traceroute Implementation
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
| Geometric | Clean, angular lines, circles at hop points | ✅ |
| Constellation | Space/cosmic, glowing, curved paths | ✅ |
| Flow | Watercolor-inspired, smooth sine-wave curves | ✅ |
| Neon | Dark background, glowing cyan/magenta lines | ✅ |
| Minimal | Black/white, simple lines, maximum whitespace | ✅ |
| Retro | 80s/90s synthwave, grid lines, gradient mesh | ✅ |

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

## 11. Local Development on Windows

For faster traceroute on Windows, use WSL (Windows Subsystem for Linux):

### Prerequisites
- Install WSL: `wsl --install`
- Ensure WSL has traceroute: `sudo apt install traceroute`

### How it works
- On Windows: Uses `wsl traceroute -n -T` for TCP-based traceroute (faster + better firewall traversal)
- On Linux: Uses native `traceroute -n -T`

### Benefits
- Same command works on both platforms
- TCP traceroute goes through firewalls better than UDP
- No DNS lookups (-n flag) = much faster

---

## 12. Deployment (Future)

### Render.com (Recommended)

**Why Render:**
- Free tier: 750 hours/month (enough for personal projects)
- Automatic Linux environment
- GitHub integration for automatic deploys

**Setup Steps:**
1. Push code to GitHub
2. Create account on render.com
3. Connect GitHub repository
4. Create new "Web Service"
5. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Deploy!

**Note:** For local Windows development, ensure WSL is running. For deployed apps, it runs natively on Linux.

---

*Last updated: 2026-03-16*
