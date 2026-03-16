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

- [ ] Badge system
- [ ] Country counter
- [ ] Route uniqueness scoring
- [ ] Achievements
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

---

## Additional Documentation

### Current Status Summary

#### ✅ COMPLETED (Demo-Ready)
- Basic traceroute execution with GeoIP
- React frontend with Leaflet map
- Animated journey visualization
- Color-coded latency markers
- ASN tracking
- Three themes (neon, retro, minimal)
- Two-column layout (map + route details)
- User authentication (register/login)
- Save/view/delete routes
- Preset destinations
- Error handling with specific messages
- Artistic hero section
- Basic image export
- Dark/Light mode toggle
- Latency graph with toggle view
- Route statistics panel
- Mobile responsive design
- Art Generator with 6 styles (Geometric, Constellation, Flow, Neon, Minimal, Retro)
- 300 DPI export for print quality

#### ❌ REMAINING

**High Priority (Quick Wins):**
- [x] Dark/Light theme toggle
- [x] Latency graph (visual chart of RTT per hop)
- [x] Route statistics panel (hop count, avg/max/min latency)
- [x] Mobile responsive design
- [x] Share routes via URL
- [x] Network fingerprint with collection tracking

### Future Enhancements (Network Fingerprint)

**Planned:**
- [ ] "New" indicators showing items discovered in current trace (vs already collected)
- [ ] Inventory screen to view all collected items in detail
- [ ] Badge system for collection milestones
- [ ] Simple per-user rarity display (first time vs again)
