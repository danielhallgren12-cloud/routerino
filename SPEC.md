# RouteCanvas - Project Specification

## 1. Project Overview

**RouteCanvas** is a creative network visualization tool that transforms traceroutes into animated journeys and shareable art. Users enter a destination (domain or IP), and RouteCanvas displays the path their packets take across the internet as a visual journey between cities, with the option to apply artistic themes and export the result as art.

## 2. Core Concept

- **Visual Traceroute**: Transform standard traceroute output into an animated journey on a world map
- **Route Art**: Apply artistic themes (neon, sketch, retro, etc.) to create unique shareable images
- **Network Fingerprint**: Each route creates a unique visual "fingerprint" of that connection
- **Social Sharing**: Gallery to share and browse routes from the community

## 3. Target Users

- Network technicians and IT professionals (educational tool)
- Tech enthusiasts curious about internet infrastructure
- Social media users who enjoy unique digital art
- Educators teaching networking concepts

## 4. Goals for This Project

1. **Educational**: Help users understand how their data travels across the internet
2. **Creative**: Provide a unique artistic outlet through route visualization
3. **Portfolio-worthy**: Demonstrate full-stack development skills for IT career
4. **Practical**: Potentially generate side income through print-on-demand products

---

## 5. Features

### Phase 1 - Core (MVP)

| Feature | Description |
|---------|-------------|
| Destination Input | Enter domain or IP address to trace |
| Traceroute Execution | Run traceroute via backend, return hop data |
| Map Visualization | Display hops on interactive world map |
| Animated Journey | Show packet travel animation between hops |
| Art themes: Neon, Themes | Apply visual Sketch, Retro, Watercolor |
| Image Export | Download route visualization as PNG image |

### Phase 2 - Engagement

| Feature | Description |
|---------|-------------|
| Preset Destinations | One-click trace to popular targets (Google DNS, Cloudflare, Netflix, etc.) |
| Network Fingerprint | Generate unique signature for each route |
| Route History | Save and view past traces |
| User Accounts | Basic authentication for personal route collection |

### Phase 3 - Social

| Feature | Description |
|---------|-------------|
| Public Gallery | Browse latest and popular community routes |
| Like & Save | Save favorite routes to collection |
| User Profiles | Display user's route collection and stats |
| Share Routes | Easy share to social media |

### Phase 4 - Expansion

| Feature | Description |
|---------|-------------|
| Print-on-Demand | Order posters, T-shirts, canvases with route art |
| Gamification | Badges, country counters, route uniqueness scores |
| Compare Routes | Overlay routes from different times/locations |
| Video Export | Export animated journey as MP4/GIF |

---

## 6. Demo Scope (Current Phase)

For the initial demo, we will build:

**Input**: Destination (domain or IP)  
**Process**: 
1. Backend runs traceroute to destination
2. Returns hop data (IP, hostname, ISP, location, latency)
3. Frontend visualizes on map with animation

**Output**:
- Interactive map showing hop locations
- Animated visualization of packet journey
- Theme selection (Neon, Sketch, Retro)
- Export as PNG image

---

## 7. User Flow (Demo)

```
+-----------+    +-----------+    +-----------+    +-----------+
|   Enter     |-->|   Run       |-->|   View      |-->|   Export    |
| Destination |    |  Traceroute |    |   Art       |    |   Image     |
+-----------+    +-----------+    +-----------+    +-----------+
      |                  |                  |                  |
      v                  v                  v                  v
  "google.com"      [hop data]         [animated map]      [PNG file]
```

---

## 8. Technical Requirements

- Cross-platform: Mobile app (React Native) + Web (React)
- Backend: Python + FastAPI for traceroute execution
- Maps: Leaflet + OpenStreetMap (free, no API keys)
- Image generation: html2canvas or similar

---

## 9. Success Criteria (Demo)

- [ ] User can enter any domain or IP
- [ ] Traceroute completes and returns hop data
- [ ] Hops displayed on map with correct geographic locations
- [ ] Packet animation plays smoothly
- [ ] At least 3 art themes available
- [ ] Image export works and produces valid PNG

---

## 10. Future Considerations

- Print-on-demand integration (Redbubble, Printful API)
- Real-time monitoring features
- Network comparison tools
- Advanced gamification system

---

*Last updated: 2026-03-04*
