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

- [ ] Integrate print-on-demand API
- [ ] Product selection (poster, T-shirt, canvas)
- [ ] Order processing
- [ ] Payment integration

**Deliverables:**
- Users can order printed products

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

*Last updated: 2026-03-04*
