# Routerino Deployment Plan

## Hosting Setup

| Service | Provider | Cost | Notes |
|---------|----------|------|-------|
| Frontend | Cloudflare Pages | €0 | Free, unlimited bandwidth |
| Backend | Hetzner VPS | €3-5/mo | Always on, full control |
| Database | Neon PostgreSQL | €0 | 3GB free, managed |
| Domain | Porkbun (routerino.com) | ~€10-15/yr | |

## DNS Structure

| Subdomain | Points to | Purpose |
|-----------|-----------|---------|
| www.routerino.com | Cloudflare Pages | Frontend |
| api.routerino.com | Hetzner VPS | Backend API |

## Deployment Steps

### Phase 1: Prerequisites
1. [ ] Purchase domain (routerino.com)
2. [ ] Create Cloudflare account
3. [ ] Create Neon PostgreSQL database
4. [ ] Order Hetzner VPS (Ubuntu)

### Phase 2: Cloudflare Pages Setup
1. [ ] Connect GitHub repo to Cloudflare Pages
2. [ ] Configure build settings (npm run build)
3. [ ] Set environment variables (VITE_API_URL)
4. [ ] Deploy frontend

### Phase 3: Hetzner VPS Setup
1. [ ] Install Ubuntu on VPS
2. [ ] Install Nginx
3. [ ] Install Python + FastAPI dependencies
4. [ ] Install PostgreSQL client
5. [ ] Configure Nginx reverse proxy
6. [ ] Setup SSL with Let's Encrypt
7. [ ] Deploy FastAPI backend

### Phase 4: DNS Configuration
1. [ ] Point routerino.com to Hetzner VPS
2. [ ] Configure Cloudflare DNS
3. [ ] Setup www CNAME to Cloudflare Pages
4. [ ] Setup api A record to Hetzner VPS

### Phase 5: Backend Connection
1. [ ] Configure CORS allow_origins with deployed domains
2. [ ] Connect FastAPI to Neon PostgreSQL
3. [ ] Test API endpoints

## Pre-Deployment Fixes (ALL DONE)
- [x] CORS configuration (add deployed domains)
- [x] Rate limiting (10 traces/minute on collect_route endpoint)
- [x] Database indexes (user_id, is_public, fingerprint_id, route_id)
- [x] SECRET_KEY validation with DEBUG fallback
- [x] Like model relationships (user and route back_populates)
- [x] geo_cache max size (10000) with LRU eviction

## Cost Summary

| Item | Monthly | Yearly |
|------|---------|--------|
| Hetzner VPS | €3-5 | €36-60 |
| Neon PostgreSQL | €0 | €0 |
| Cloudflare Pages | €0 | €0 |
| Domain | ~€1 | ~€12-15 |
| **Total** | **€4-6/mo** | **~€50-75/yr** |

## Discussion Points (Future)

### Print-on-Demand / Webshop - ON HOLD
- **Status:** Currently on hold
- **Affiliate** (easy, 2-3h work, low payout)
- **Etsy/Printful** (medium, 5-10h work, better margins)
- **Digital Downloads via Gumroad** (medium, 10-15h, sells exact user's trace)
- **Premium Subscription** (complex, 30-50h, recurring revenue)

### Monetization Conclusion
- Start with **Donations** (PayPal.me)
- **Digital Downloads** via Gumroad for exact traces (future)
- **Premium** only if clear value proposition found (future)
- Affiliate as supplementary (future)

### Linux Prerequisites for VPS
- Ubuntu/Debian
- Nginx (reverse proxy + SSL)
- Python/FastAPI
- PostgreSQL client
- UFW firewall
- Let's Encrypt (SSL)

## Notes
- Rate limiting added: 10 traces per minute per user
- geo_cache capped at 10000 entries with LRU eviction
- Like model now has proper relationships for SQLAlchemy
- Full deployment takes ~2-3 hours
