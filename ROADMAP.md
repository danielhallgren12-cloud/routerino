# RouteCanvas - Project Roadmap

## Overview

This roadmap outlines the development phases for RouteCanvas, from initial demo to full-featured platform.

---

## Phase 1: Foundation (Weeks 1-3)

**Goal:** Core traceroute to art visualization working

### Week 1: Setup and Backend

- [ ] Initialize project structure
- [ ] Set up FastAPI backend
- [ ] Implement basic traceroute execution
- [ ] Add GeoIP lookup for hop locations
- [ ] Create API endpoints

**Deliverables:**
- Backend running with `/trace` endpoint
- Basic traceroute working to any destination

### Week 2: Frontend Web

- [ ] Set up React + Vite project
- [ ] Implement Leaflet map integration
- [ ] Create destination input component
- [ ] Connect to backend API
- [ ] Display hop markers on map

**Deliverables:**
- Web app with map showing hop locations

### Week 3: Visualization and Export

- [ ] Implement animated journey (packet travel animation)
- [ ] Create art theme system (Neon, Sketch, Retro)
- [ ] Add image export functionality
- [ ] Basic styling and UI polish

**Deliverables:**
- Working demo with animation and export

---

## Phase 2: Engagement (Weeks 4-6)

**Goal:** User accounts and route history

### Week 4: User System

- [ ] Set up SQLite database
- [ ] Implement user registration/login
- [ ] Create user authentication (JWT)
- [ ] Add session management

**Deliverables:**
- Users can create accounts and log in

### Week 5: Route History and Profiles

- [ ] Save routes to database
- [ ] Create user profile page
- [ ] Display route history
- [ ] Add route details view

**Deliverables:**
- Users can view their route history

### Week 6: Features Expansion

- [x] Preset destinations (popular targets)
- [x] Network fingerprint generation
- [ ] Theme customization options
- [ ] Watercolor/artistic themes (for beautiful exports)
- [ ] UI/UX improvements
- [x] Mobile touch gestures (pinch zoom, double-tap to zoom)
- [x] Faster probing (20 hops, 200ms timeout, shows non-geo hops)
- [x] IPv6 support

**Deliverables:**
- Preset destinations working
- Network fingerprint feature
- Better mobile experience (touch gestures)
- Faster probing

---

## Phase 3: Social (Weeks 7-9)

**Goal:** Community features

### Week 7: Public Gallery

- [ ] Create public gallery page
- [ ] Add route publishing
- [ ] Implement trending/popular sorting
- [ ] Add pagination/infinite scroll

**Deliverables:**
- Browse public routes

### Week 8: Social Features

- [ ] Like routes
- [ ] Save favorites
- [ ] Share to social media
- [ ] User profiles with stats

**Deliverables:**
- Full social features

### Week 9: Mobile App

- [ ] Set up React Native + Expo project
- [ ] Implement core features
- [ ] Ensure cross-platform compatibility
- [ ] Test and polish

**Deliverables:**
- Mobile app (iOS/Android)

---

## Phase 4: Expansion (Weeks 10+)

**Goal:** Advanced features and monetization

### Week 10-11: Print-on-Demand

**Vision:** Route art that creates emotional connection - "This is MY digital journey"

Why it works:
- **Start point:** User's home location = personal
- **End point:** User's search destination (brand/company they like) = personal  
- **The journey:** The actual route their packets take = unique to that moment

**Implementation:**

- [ ] Beautiful artistic themes (required for social/print appeal)
- [ ] High-res image export (300 DPI required for print)
- [ ] Custom text overlay: "From [City] to [Destination]"
- [ ] Multiple background color options
- [ ] Shareable export layouts (cards, posters)
- [ ] Integrate print-on-demand API
- [ ] Product selection (poster, T-shirt, canvas)
- [ ] Order processing
- [ ] Payment integration

**Deliverables:**
- Users can order printed products with their route art
- Export looks professional and shareable

### Week 12+: Gamification and Advanced Features

- [x] Badge system (22 badges: Milestone, Discovery, Streak, Art)
- [x] Country counter (via Inventory)
- [ ] Route uniqueness scoring
- [x] Achievements (badge system)
- [ ] Compare routes feature
- [ ] Video export

**🔄 On Hold:**
- **Historical route comparison** - Compare saved routes with current trace
  - Status: Backend endpoint ready, frontend implementation had React state timing issues
  - Enhancement ideas for future implementation:
    - "Route journal" - trace same target over time, see changes
    - "Route streak" - trace daily, see how often route changes
    - Simpler approach: Load saved route in dedicated comparison view (not tied to current trace)
    - Alternative: Store comparisons as separate objects, not tied to live state

**✅ COMPLETED (Phase 2):**
- **Network fingerprint with collection tracking**
  - Cities, Countries, Destinations, Companies, IPs, ASNs, Fingerprints
  - Collection updates after every search (logged-in users)
  - Fingerprint ID shows unique route signature
- **Badge system** (22 badges across 4 categories)
  - Milestone: trace milestones (1, 5, 10, 25, 50, 100 traces)
  - Discovery: unique countries/cities/destinations
  - Streak: daily tracing streaks
  - Art: export milestones
- **Inventory modal** (view all collected items with rarity, sorting)
- **Profile dropdown** (My Routes, Inventory, My Badges)

---

### Future Enhancements (Network Fingerprint)

**Planned:**
- [x] "New" indicators showing items discovered in current trace (vs already collected)
- [x] Inventory screen to view all collected items in detail
- [x] Badge system for collection milestones
- [x] Personal discovery tracking (how many times each item seen)

---

## Next Features (Planned)

### 1. Share to Social Media
- Share buttons (Twitter/X, Facebook, Reddit, LinkedIn)
- Auto-generate OG-image (preview image) for social sharing
- Pre-filled post: "Check out my route from [City] to [Destination]!"

### 2. Fingerprint Share
- "Copy Fingerprint Link" button
- Public page: `/fp/{fingerprint_id}` showing the route
- QR code for fingerprint

### 3. Advanced Rarity System (Future)
**Status:** On Hold - requires significant infrastructure

**Vision:** Global rarity tracking across all users
- Show percentage: "Only 0.8% of users have this"
- Personal collection progress: "You found 3 of 78 possible cities"
- Community leaderboards: rarest items

**Why not now:**
- Requires new database tables (items, user_items)
- Needs Redis for performance at scale
- Personal rarity provides 80% of user value
- Not required for print-on-demand
- Effort: 2-3 weeks vs 1 day for personal tracking

**Keep for future if:**
- App grows to 1000+ users
- Community features prioritized
- Users request social comparison

---
