# RouteCanvas - Project Roadmap

## Overview

This roadmap outlines the development phases for RouteCanvas, from initial demo to full-featured platform.

---

## Phase 1: Foundation ✅ COMPLETED

**Goal:** Core traceroute to art visualization working

### Completed Deliverables:
- Backend running with `/trace` endpoint
- Basic traceroute working to any destination
- Web app with map showing hop locations
- Working demo with animation and export

---

## Phase 2: Engagement ✅ COMPLETED

**Goal:** User accounts and route history

### Completed Deliverables:
- User authentication (register/login/JWT)
- Route history (save/view/delete)
- Users can view their route history
- Preset destinations working
- Network fingerprint feature
- Better mobile experience (touch gestures)
- Faster probing

---

## Phase 3: Social ✅ COMPLETED

**Goal:** Community features

### Week 7: Public Gallery ✅

- [x] Create public gallery page
- [x] Add route publishing (Save to Gallery with square thumbnail)
- [x] Implement trending/popular sorting
- [x] Add pagination/infinite scroll

### Week 8: Social Features ✅

- [x] Like routes (heart button with like/unlike)
- [x] Save favorites (liked routes stored per user)
- [x] Share to social media (Twitter, Facebook, LinkedIn, Reddit, Instagram)
- [x] User profiles with stats (public profile modal)

---

## Phase 4: Expansion (Planned)

### Week 9: Mobile App

- [ ] Set up React Native + Expo project
- [ ] Implement core features
- [ ] Ensure cross-platform compatibility
- [ ] Test and polish

### Week 10-11: Print-on-Demand

- [ ] Integrate print-on-demand API
- [ ] Product selection (poster, T-shirt, canvas)
- [ ] Order processing
- [ ] Payment integration

### Week 12+: Gamification and Advanced Features

- [ ] Route uniqueness scoring
- [ ] Compare routes feature
- [ ] Advanced Rarity System (global rarity across users)

---

## Completed Features Summary

### ✅ Phase 2 Achievements:
- **Network fingerprint with collection tracking** (Cities, Countries, Destinations, Companies, IPs, ASNs, Fingerprints)
- **Badge system** (22 badges across 4 categories)
- **Inventory modal** (view all collected items with rarity, sorting)
- **Profile dropdown** (My Routes, Inventory, My Badges)

### ✅ Phase 3 Achievements:
- **Public Gallery** (browse latest, popular, trending routes with infinite scroll)
- **Like/Unlike routes** (heart button with like/unlike)
- **Public user profiles** (stats and routes with thumbnails)
- **Social sharing** (Twitter, Facebook, LinkedIn, Reddit, Instagram)
- **Fingerprint share** (modal with download + social share)

---

## Next Features (Planned)

### 1. Share to Social Media ✅ DONE
- [x] Share buttons (Twitter/X, Facebook, Reddit, LinkedIn, Instagram)
- [x] Auto-generate preview image for social sharing
- [x] Pre-filled post: "Check out my route from [City] to [Destination]!"

### 2. Fingerprint Share ✅ DONE
- [x] Click fingerprint ID → modal opens
- [x] Fingerprint card showing current route stats (hops, countries, cities, companies, ASNs)
- [x] Download fingerprint card as image
- [x] Share to social media (Twitter, Facebook, LinkedIn, Reddit, Instagram)

### 3. Mobile App
- [ ] Set up React Native + Expo project
- [ ] Implement core features
- [ ] Ensure cross-platform compatibility

### 4. Print-on-Demand
- [ ] Integrate print-on-demand API (Printful, Printify, or similar)
- [ ] Product selection (poster, T-shirt, canvas)
- [ ] Order processing
- [ ] Payment integration

### 5. Advanced Rarity System (Future)
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

---

*Last updated: 2026-03-27*
