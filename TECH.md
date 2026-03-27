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

**Base URL:** `/api/v1` (via Vite proxy - no CORS issues)

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
| GET | `/auth/me/badges` | Get all badges with earned status | ✅ |
| GET | `/auth/me/badges/check` | Check and award new badges | ✅ |
| POST | `/auth/me/badges/increment-export` | Increment export count for badges | ✅ |
| POST | `/auth/me/collection/clear-new` | Clear new items after user sees them | ✅ |
| GET | `/gallery` | Get public routes for gallery (paginated, sortable) | ✅ |
| GET | `/gallery/random` | Get random routes for featured section | ✅ |
| GET | `/user/{username}` | Get public user profile with stats and routes | ✅ |
| GET | `/user/{username}/routes` | Get user's public routes (paginated) | ✅ |
| POST | `/routes/{route_id}/like` | Like or unlike a route | ✅ |
| GET | `/routes/{route_id}/like/status` | Check if user liked a route | ✅ |
| PATCH | `/routes/{route_id}/visibility` | Update route visibility (public/private) | ✅ |
| POST | `/routes/{route_id}/view` | Increment view count | ✅ |
| POST | `/routes/{route_id}/report` | Report a route | ✅ |

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
| is_public | BOOLEAN | Whether route is visible in gallery (default: false) |
| like_count | INTEGER | Number of likes (default: 0) |
| view_count | INTEGER | Number of views (default: 0) |
| art_thumbnail | TEXT | Base64-encoded 600x600 PNG thumbnail for gallery |
| created_at | TIMESTAMP | Creation time |

**likes**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| user_id | INTEGER | FK to users |
| route_id | INTEGER | FK to saved_routes |
| created_at | TIMESTAMP | Like time |

**reports**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| route_id | INTEGER | FK to saved_routes |
| reporter_id | INTEGER | FK to users |
| reason | TEXT | Report reason |
| created_at | TIMESTAMP | Report time |

**global_discovery_counts**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| item_type | VARCHAR | Type: country, city, asn, company, destination, fingerprint |
| item_value | VARCHAR | The actual value (e.g., "Cloudflare", "Stockholm") |
| user_count | INTEGER | How many users discovered this item |
| created_at | TIMESTAMP | First discovery time |

**users** (additional fields)
| Column | Type | Description |
|--------|------|-------------|
| first_discoveries | INTEGER | Count of world-first discoveries (default: 0) |
| new_items | TEXT | JSON dict of items discovered since last visit |
| item_discovery_counts | TEXT | JSON dict tracking how many times each item was seen |

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

### Social Sharing

| Platform | Status | Notes |
|----------|--------|-------|
| Twitter/X | ✅ | Pre-filled text, link preview with OG image |
| Facebook | ✅ | Pre-filled text, shared image |
| LinkedIn | ✅ | Share offsite with link |
| Reddit | ✅ | Pre-filled title and link |
| Instagram | ✅ | Opens Instagram web (best effort for web) |

### Color Themes

| Theme | Colors | Status |
|-------|--------|--------|
| Cyan/Magenta | cyan, magenta, green, orange, purple | ✅ Default |
| Sunset | orange, red, pink, gold | ✅ |
| Ocean | teal, blue, aqua | ✅ |
| Forest | green, brown, earth tones | ✅ |
| Mono | black, grays, white | ✅ |

### Background Colors (Style-Specific)

| Style | Allowed Backgrounds | Default |
|-------|-------------------|---------|
| Geometric | White, Cream, Light Gray, Black, Sepia | White |
| Neon | Black, Deep Blue | Black |
| Constellation | Black, Deep Blue | Deep Blue |
| Flow | White, Cream, Light Gray | Cream |
| Minimal | White, Light Gray | White |
| Retro | Cream, Sepia | Sepia |

### Fingerprint Share

| Feature | Status | Notes |
|---------|--------|-------|
| Click to open modal | ✅ | Click fingerprint ID in fingerprint card |
| Fingerprint card display | ✅ | Shows hops, countries, cities, companies, ASNs |
| Download as image | ✅ | html2canvas + download |
| Social share | ✅ | Twitter, Facebook, LinkedIn, Reddit, Instagram |

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
- CORS configuration (via Vite proxy in development)
- Sanitize user inputs to prevent injection

---

## 11. Badge System

### Badge Categories

| Category | Description | Badge Count |
|----------|-------------|--------------|
| Milestone | Trace count achievements | 6 |
| Discovery | Unique countries/cities/destinations | 9 |
| Streak | Daily tracing streaks | 4 |
| Art | Export milestones | 3 |
| First Discovery | World first discoveries | 5 |

### Badge Definitions (27 total)

**Milestone:**
- First Trace (1 trace)
- Getting Started (5 traces)
- Explorer (10 traces)
- Adventurer (25 traces)
- Globetrotter (50 traces)
- Legend (100 traces)

**Discovery:**
- First Country, First City, First Destination
- World Traveler (5 countries)
- Metro Master (5 cities)
- Destination Addict (5 destinations)
- Continental (10 countries)

**Streak:**
- Day 1, Day 3, Day 7, Day 30

**Art:**
- First Export, Collection (10 exports), Masterpiece (50 exports)

**First Discovery:**
- First Footsteps (1 world first)
- Pathfinder (10 world firsts)
- Trailblazer (25 world firsts)
- Pioneer (50 world firsts)
- Legend (100 world firsts)

## 12. Item Discovery Tracking (Personal Rarity)

### Implementation
The system tracks how many times each user encounters specific items across all their traces, providing personal rarity statistics.

**Backend Storage:**
```json
// Stored in users.item_discovery_counts JSON field
{
  "country:US": 12,
  "city:Stockholm": 5,
  "company:Cloudflare": 8,
  "destination:google.com": 3,
  "ip:1.1.1.1": 2
}
```

**API Response Format:**
```json
{
  "destinations": 5,
  "countries": 8,
  "cities": 12,
  "companies": 10,
  "ips": 45,
  "asns": 8,
  "discovery_counts": {
    "country:US": 12,
    "city:Stockholm": 5,
    ...
  }
}
```

**Frontend Display:**
- Each inventory item shows: `🏆 Epic (Seen 5×)`
- Sorting option: "Most Collected" (sorts by discovery count)
- Inventory header shows: "Items" stat alongside Traces/Hops

**Database Schema:**
```sql
ALTER TABLE users ADD COLUMN item_discovery_counts TEXT DEFAULT '{}';
```

### Future Enhancement: Global Rarity System (On Hold)
**Status:** Not implemented - requires significant infrastructure changes

**What it would require:**
- New `items` table (global item registry)
- New `user_items` table (M:N relationship)
- Redis caching for performance (1000+ users)
- Background job to recalculate rarity tiers
- API endpoints for global stats

**Why it's on hold:**
- Not needed for MVP
- Personal rarity provides 80% of user value
- No impact on print-on-demand feature
- Estimated effort: 2-3 weeks vs 1 day for personal rarity

**If implementing later, would add:**
- "0.8% of users have this" (global rarity)
- "You have 3 of 78 total cities" (personal collection progress)
- Leaderboard: rarest items in community

---

## 12. Local Development on Windows

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

*Last updated: 2026-03-27*
