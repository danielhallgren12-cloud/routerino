# Routerino - Visual Route Art Game

<img width="676" height="462" alt="Skärmbild 2026-04-12 135618" src="https://github.com/user-attachments/assets/f3453147-9cc9-4c7d-8009-814daceb4c42" />


Transform network routes into beautiful visual art. Trace internet paths to any destination and watch as data packets travel across the globe on an interactive map.

## Overview

Routerino is a visual traceroute art game that lets you:
- Trace routes to any website or IP address
- See the journey your data takes across the world
- Collect badges for visiting countries, cities, and ISPs
- Generate beautiful artwork from your traces
- Explore routes from other users in the public gallery

## Features

- 🎯 **Visual Traceroute** - See your internet traffic travel the world
- 🗺️ **Interactive Map** - Leaflet-based map with route visualization
- 👤 **User System** - Register, login, and save your traces
- 🖼️ **Route Art** - Generate beautiful artwork from your traces  
- 🏆 **Badges** - Collect badges for visiting countries, cities, ISPs
- 📊 **Route Atlas** - Compare up to 8 routes side-by-side
- 🌍 **Public Gallery** - Share and explore routes from other users
- 📱 **PWA Support** - Works on mobile devices

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript, Vite 7, Leaflet, Workbox (PWA) |
| **Backend** | Python 3.10 + FastAPI, SQLAlchemy |
| **Database** | Neon PostgreSQL |
| **Hosting** | Cloudflare Pages (frontend), Hetzner CX23 VPS (backend) |
| **Domain** | Porkbun (routerino.com) |

## Architecture

```
                         Cloudflare
                        (DNS / SSL)
                              │
              ┌───────────────┴───────────────┐
              │                               │
     www.routerino.com              api.routerino.com
     (Cloudflare Pages)             (Hetzner VPS)
              │                               │
              │                               │
              │                        ┌──────┴──────┐
              │                        │    Neon     │
              │                        │  PostgreSQL │
              │                        └────────────┘
              │
```

## Installation

### Prerequisites

- Node.js 20+
- Python 3.10+
- Git

### Clone Repository

```bash
git clone https://github.com/danielhallgren12-cloud/routerino.git
cd routerino
```

### Frontend Setup

```bash
cd web
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Backend Setup

```bash
cd backend
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

## Deployment

### Frontend (Cloudflare Pages)

1. Connect your GitHub repository to Cloudflare Pages
2. Configure build settings:
   - **Build command**: `cd web && npm install && npm run build`
   - **Deploy command**: `echo "Cloudflare Pages handles deployment"`
   - **Root directory**: `/`
3. Cloudflare Pages auto-deploys on push to `main` branch

### Backend (Hetzner VPS)

```bash
# SSH to your Hetzner server
ssh user@your-server-ip

# Install system dependencies
sudo apt update
sudo apt install python3-venv traceroute

# Give traceroute permission to use raw sockets
sudo setcap 'cap_net_raw+ep' /usr/bin/traceroute.db

# Navigate to backend directory
cd /path/to/routerino/backend

# Activate virtual environment
source venv/bin/activate

# Create .env file with database URL
echo 'DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require' > .env

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Nginx Reverse Proxy

```nginx
server {
    server_name api.routerino.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.routerino.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.routerino.com/privkey.pem;
}
```

## Environment Variables

### Backend (.env)

```bash
DEBUG=false
SECRET_KEY=your-secret-key-minimum-32-characters
DATABASE_URL=postgresql://neondb_owner:password@ep-host.neon.tech/neondb?sslmode=require
```

### Backend Systemd Service (Recommended for Production)

Create `/etc/systemd/system/routerino.service`:

```ini
[Unit]
Description=Routerino FastAPI Backend
After=network.target

[Service]
User=your-user
WorkingDirectory=/path/to/routerino/backend
Environment="DEBUG=false"
Environment="SECRET_KEY=your-secret-key"
Environment="DATABASE_URL=postgresql://..."
ExecStart=/path/to/routerino/backend/venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable routerino
sudo systemctl start routerino
```

## API Documentation

Base URL: `https://api.routerino.com/api/v1`

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Create new account |
| `/login` | POST | Login to account |
| `/me` | GET | Get current user info |

### Traceroute

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/trace` | POST | Run traceroute to destination |

Request body:
```json
{
  "destination": "google.com",
  "max_hops": 20,
  "ip_version": "ipv4"
}
```

### Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/routes` | GET | Get user's saved routes |
| `/routes` | POST | Save a route |
| `/routes/{id}` | GET | Get route details |
| `/routes/{id}` | DELETE | DELETE route |
| `/routes/likes/status` | POST | Batch check like status (max 50 per request) |
| `/routes/{id}/like` | POST | Like/unlike a route |
| `/routes/{id}/view` | POST | Increment view count |

### Gallery

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gallery` | GET | List public routes |
| `/gallery/random` | GET | Get random public routes |
| `/routes/by-destination` | GET | Routes to specific destination |

### Badges

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/me/badges` | GET | Get user's earned badges |
| `/me/badges/check` | POST | Check for new badges |

## API Documentation

Full API documentation available at `https://api.routerino.com/docs` when backend is running.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Contact

- **Email**: danielhallgren12@gmail.com
- **GitHub**: [danielhallgren12-cloud](https://github.com/danielhallgren12-cloud)

---

Made with ❤️ for network exploration enthusiasts
