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

- [ ] Preset destinations (popular targets)
- [ ] Network fingerprint generation
- [ ] Theme customization options
- [ ] UI/UX improvements

**Deliverables:**
- Preset destinations working
- Network fingerprint feature

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

- [ ] Integrate print-on-demand API
- [ ] Product selection (poster, T-shirt, canvas)
- [ ] Order processing
- [ ] Payment integration
- [ ] High-res image export (300 DPI required for print)
- [ ] Custom text overlay: "From [City] to [Destination]"
- [ ] Multiple background color options

**Deliverables:**
- Users can order printed products with their route art

### Week 12+: Gamification and Advanced Features

- [ ] Badge system
- [ ] Country counter
- [ ] Route uniqueness scoring
- [ ] Achievements
- [ ] Compare routes feature
- [ ] Video export

**Deliverables:**
- Full gamification system

---

## Milestones

| Milestone | Description | Target |
|-----------|-------------|--------|
| M1 | Basic traceroute working | Week 1 |
| M2 | Web demo complete | Week 3 |
| M3 | User accounts live | Week 5 |
| M4 | Public gallery | Week 7 |
| M5 | Mobile app | Week 9 |
| M6 | Print-on-demand | Week 11 |
| M7 | Full launch | Week 12 |

---

## Future Ideas

- Real-time route monitoring
- Network comparison tools
- Browser extension
- API for developers
- White-label for ISPs
- Educational mode with explanations
- VR visualization
- AR exploration of routes

---

## Notes

- Timeline is flexible based on available time
- Prioritize MVP features first
- Iterate based on user feedback
- Consider open-sourcing core components

---

## Future Improvements - High Priority

These features were identified by comparing with other traceroute tools (NextTrace, Trippy, VisualRoute):

### High Priority

- [x] **Color-coded latency** - Green/yellow/red markers based on RTT
  - Green: < 50ms (fast)
  - Yellow: 50-150ms (moderate)
  - Red: > 150ms (slow)
  - Applied to: route lines, popup RTT, route details RTT

- [x] **ASN tracking** - Show Autonomous System numbers along route
  - Shows "AS15169 - Google LLC" format
  - Displayed in popup and route details
  - Uses ip-api.com batch API

- [x] ~~City-level accuracy~~ - Discarded (city is sufficient)

### Medium Priority

- [x] **Export as image** - Basic PNG export working (html2canvas)
  - [ ] High-resolution export (300 DPI for print quality)
  - [ ] Custom title overlay: "From [User City] to [Destination]"
  - [ ] Attribution overlay

- [x] **Route art styles** - Basic themes working (neon, retro, minimal)
  - [ ] Watercolor/artistic themes
  
- [x] **Home location emphasis** - Working (dashed hot pink line from home to first hop)
  
- [ ] **Continuous ping mode** - Monitor latency continuously
- [ ] **Multiple destination comparison** - Compare routes side-by-side
- [x] **Preset destinations** - Working (google, cloudflare, github, etc.)
- [x] **Improved error handling** - Specific error messages implemented
- [x] **Enhanced loading states** - Basic cycling dots animation working
  - [ ] Progress indicator (hop 1/15, hop 2/15...) - requires backend SSE
  - [ ] GeoIP resolution progress

### User System

**Status:** COMPLETED ✅

- [x] User registration (email + password)
- [x] User login with JWT authentication
- [x] Save route to account
- [x] View route history
- [x] Delete saved routes

**Future enhancements:**
- [ ] Share routes publicly
- [ ] User profiles with stats
- [ ] Social login: Google + Facebook

**Tech stack:**
- Database: SQLite
- ORM: SQLAlchemy
- Auth: JWT (JSON Web Tokens)
- Password hashing: bcrypt

### Lower Priority / Future Ideas

- [ ] **Faster probing** - Parallel probes like NextTrace
- [ ] **WHOIS integration** - Show IP ownership details
- [x] **Route animation** - Packet travel animation IMPLEMENTED 2026-03-08
- [ ] **Animation polish** - Route line sync during camera flyTo
- [ ] **IPv6 support** - Modern networking
- [ ] **Historical route comparison** - Compare past saved routes

---

## Route Art Vision

**The Core Concept:** Transform traceroutes into personal, shareable art that creates emotional connection.

### Why Route Art Works

| Element | Why It's Special |
|---------|------------------|
| **Start point** | User's location (home town) = deeply personal |
| **End point** | User's search destination (brand/company they care about) = meaningful |
| **The journey** | Actual packet path = unique to that moment in time |

This creates: **"This is MY digital journey from MY home to what I care about"**

### For Print-on-Demand Success

Users will want to buy prints because:
1. It's **personal** - shows their location
2. It's **unique** - their packet route is different from everyone else's
3. It's **educational** - shows how the internet actually works
4. It's **art** - beautiful visualization they can display

### Implementation Priorities

1. **High-res export** - 300 DPI minimum for print quality
2. **Custom overlays** - Title text user can customize
3. **Home location emphasis** - Make starting point stand out
4. **Multiple styles** - Different visual aesthetics for different tastes

---

## Honest Limitations

Be transparent about what RouteCanvas can and cannot do:

### Same Limitations as ALL Traceroute Tools

| Limitation | Explanation |
|------------|-------------|
| **Timeout hops** | Cannot show hops that return `*` (no response) |
| **Internal routing** | Cannot see company internal network infrastructure |
| **Exact path** | Only shows responding hops - true path may differ |
| **Dynamic routes** | BGP routes change constantly - each trace is a snapshot |

### RouteCanvas Advantages

| Feature | Advantage |
|---------|-----------|
| **Visual map** | Clear geographic visualization |
| **Art themes** | Unique creative angle - no other tool does this |
| **Animated journey** | Educational + engaging |
| **Speed** | Batch GeoIP = ~15 seconds for 15 hops |

---

## How RouteCanvas Differs from Other Tools

| Feature | Other Tools | RouteCanvas |
|---------|-------------|-------------|
| Route visualization | Basic maps | Animated journey + Art themes |
| Creative output | None | Route art generation |
| Styling | Standard | Multiple themes (neon, retro, minimal) |
| Speed | Varies | Batch GeoIP = fast |

---

*Last updated: 2026-03-08*

## Current Status Summary

### ✅ COMPLETED (Demo-Ready)
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

### ❌ REMAINING

**High Priority (Quick Wins):**
- Dark/Light theme toggle
- Latency graph (visual chart of RTT per hop)
- Route statistics panel (hop count, total distance, avg latency)
- Mobile responsive design
- Share routes via URL

**Medium Priority:**
- High-resolution export (300 DPI)
- Custom title overlay on export
- Watercolor/artistic themes
- Continuous ping mode
- Multiple destination comparison
- Enhanced loading states (progress indicator - requires backend SSE)
- Network fingerprint (unique signature based on route patterns)
- Mobile touch gestures (pinch zoom, drag)

**Lower Priority:**
- Animation polish (route line sync)
- Faster probing (parallel)
- IPv6 support
- Historical route comparison
- WHOIS integration
- Keyboard shortcuts (Enter to trace, Esc to clear)
- Video export

---

## Additional Documentation
