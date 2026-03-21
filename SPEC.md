# RouteCanvas - Project Specification

## 1. Project Overview

**RouteCanvas** is a creative network visualization tool that transforms traceroutes into animated journeys and shareable art. Users enter a destination (domain or IP), and RouteCanvas displays the path their packets take across the internet as a visual journey between cities, with the option to apply artistic themes and export the result as art.

**The Vision:** Transform traceroutes into personal route art that creates emotional connection - "This is MY digital journey from MY home to what I care about"

## 2. Core Concept

- **Visual Traceroute**: Transform standard traceroute output into an animated journey on a world map
- **Route Art**: Apply artistic themes (neon, retro, minimal) to create unique shareable images
- **Personal Connection**: Emphasize user's home location as start point + their search destination as end point
- **Print-on-Demand**: High-quality exports for ordering prints (posters, canvases)

## 3. Target Users

- Network technicians and IT professionals (educational tool)
- Tech enthusiasts curious about internet infrastructure
- Social media users who enjoy unique digital art
- Educators teaching networking concepts
- People who want personalized, meaningful wall art

## 4. Goals for This Project

1. **Educational**: Help users understand how their data travels across the internet
2. **Creative**: Provide a unique artistic outlet through route visualization
3. **Portfolio-worthy**: Demonstrate full-stack development skills for IT career
4. **Practical**: Generate side income through print-on-demand products

---

## 5. Features

### Phase 1 - Core (MVP) ✅ COMPLETED

| Feature | Status |
|---------|--------|
| Destination Input | ✅ Complete |
| Traceroute Execution | ✅ Complete |
| Map Visualization | ✅ Complete |
| Color-coded latency | ✅ Complete |
| ASN tracking | ✅ Complete |
| Art themes: Geometric, Constellation, Flow, Neon, Minimal, Retro | ✅ Complete |
| Image Export | ✅ Complete (300 DPI) |
| Color Themes | ✅ Complete (5 palettes: Cyan/Magenta, Sunset, Ocean, Forest, Mono) - style-aware filtering |
| Background Colors | ✅ Complete (style-specific backgrounds - White, Cream, Light Gray, Black, Deep Blue, Sepia) |
| Custom Name on Art | ✅ Complete (optional "Created by" attribution) |

### Phase 2 - Engagement ✅ COMPLETED

| Feature | Description |
|---------|-------------|
| High-res Export | ✅ Complete (300 DPI) |
| Custom title overlay | ✅ Complete |
| Home location emphasis | ✅ Complete (dashed hot pink line) |
| Route art styles | ✅ Complete (6 styles: Geometric, Constellation, Flow, Neon, Minimal, Retro) |
| Preset Destinations | ✅ Complete |
| Route History | ✅ Complete (save/view/delete) |
| User Accounts | ✅ Complete (register/login/JWT) |
| Dark/Light Mode | ✅ Complete (toggle in header) |
| Latency Graph | ✅ Complete (toggle view in route details) |
| Network Fingerprint | ✅ Complete (collection tracking: Cities, Countries, Destinations, Companies, IPs, ASNs, Fingerprints + fingerprint_id for sharing) |
| Inventory Modal | ✅ Complete (view collected items by category, sorting, rarity system) |
| Profile Dropdown | ✅ Complete (My Routes, Inventory, My Badges) |
| Badge System | ✅ Complete (22 badges across 4 categories: Milestone, Discovery, Streak, Art) |
| Badge Notifications | ✅ Complete (toast notification when earning new badges) |
| New Discoveries Indicator | ✅ Complete (animated card, +N badges, NEW labels on items) |

### Phase 3 - Social (In Progress)

| Feature | Description |
|---------|-------------|
| Public Gallery | Browse latest and popular community routes |
| Like & Save | Save favorite routes to collection |
| User Profiles | Display user's route collection and stats |
| Share Routes | ✅ Social buttons (Twitter, Facebook, LinkedIn, Reddit, Instagram) - full functionality with real share pages |
| Fingerprint Share | ✅ Click fingerprint ID → modal with fingerprint card + download + social share |

### Phase 4 - Expansion (Planned)

| Feature | Description |
|---------|-------------|
| Print-on-Demand | Order posters, T-shirts, canvases with route art |
| Advanced Rarity | Global rarity (how many users have it), personal rarity stats |
| Gamification | Badges, country counters, route uniqueness scores |
| Compare Routes | Overlay routes from different times/locations |

---

## 6. The Route Art Vision

### Why Route Art Creates Emotional Connection

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

---

*Last updated: 2026-03-16*
