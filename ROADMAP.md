# Routerino - Project Roadmap

## Overview

This roadmap outlines the development phases for Routerino, from initial demo to full-featured platform.

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

## Phase 4: Expansion (In Progress)

### Week 9: Route Atlas ✅ COMPLETE

- [x] Route Atlas feature - compare routes to same destination over time
- [x] Visual map with multi-line overlay (bright colors on dark background)
- [x] Parallel "bus lane" rendering for shared segments
- [x] Path Breakdown section with bar charts
- [x] Hop Details (Head-to-Head) with shared/unique hops
- [x] Numbered hop badges (cyan for shared, path-colored for unique)
- [x] Stats row (routes, variations, first/latest trace dates)
- [x] Route picker modal - select up to 8 routes to compare
  - Routes grouped by destination (hostname only label)
  - Top 3 by frequency pre-selected
  - Fingerprint IDs shown alongside timestamps
  - "Show X more" collapsible sections for groups
- [x] Duplicate fingerprint prevention - block saving duplicate routes

### Week 9-10: Mobile Web PWA ✅ COMPLETE

- [x] PWA setup with manifest, icons, service worker (skipWaiting/clientsClaim)
- [x] Mobile fluid scaling with clamp() for 14+ UI elements
- [x] Constellation style disabled on mobile (decorative elements caused issues)
- [x] Preset destination buttons: Popular label + 2-row grid layout
- [x] Art preview scaled responsively with min(280px, 80vw)
- [x] Mode toggle, speed/theme buttons with fluid widths
- [x] Map container and hop list with dynamic heights
- [x] Gallery grid, profile routes grid responsive (160px min columns)
- [x] Badge case modal, inventory labels, toast notifications with fluid sizing
- [x] Route Atlas map and sidebar responsive heights
- [x] Cyberway Riders cyberpunk font for Routerino logo
- [x] Routerino logo with neon glow effects and gradient text
- [x] Background gradient (cyan/magenta) applied to body level
- [x] Gallery delete button for own gallery routes
- [x] Inventory FIRST badge and Seen counter now work for all categories (CATEGORY_PREFIX mapping fix)

### Week 10-11: Print-on-Demand

- [ ] Integrate print-on-demand API (Printful, Printify, or similar)
- [ ] Product selection (poster, T-shirt, canvas)
- [ ] Order processing
- [ ] Payment integration

### Week 12+: Gamification and Advanced Features

- [x] Route uniqueness scoring ("1 in X users have this route")
- [x] Compare routes feature (Route Atlas with route picker, max 8 selection)
- [x] Duplicate fingerprint prevention

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
- **First Discoveries / Route Uniqueness** (world first tracking, "1 in X users", FIRST badges, 5 first discovery badges)

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

### 3. Print-on-Demand
- [ ] Integrate print-on-demand API (Printful, Printify, or similar)
- [ ] Product selection (poster, T-shirt, canvas)
- [ ] Order processing
- [ ] Payment integration

### 4. Advanced Rarity System (Future)
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

*Last updated: 2026-04-05*
