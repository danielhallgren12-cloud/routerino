# Routerino - Art Generator Specification

## Overview

The Art Generator is a feature that creates beautiful, shareable, and printable artwork from traceroute data. It transforms network journey data into artistic visualizations that users can download, share on social media, or print as wall art.

*Note: Print-on-Demand functionality is currently on hold. Users can export and download high-quality images for personal use.*

---

## Vision

Create **emotionally resonant, gallery-worthy art** that:
- Represents the user's personal digital journey
- Is beautiful enough to share on social media
- Is suitable for print-on-demand products
- Serves as a portfolio centerpiece demonstrating full-stack + creative skills

---

## The Four Pillars of Quality

| Pillar | Implementation |
|--------|---------------|
| **Emotional** | Personalization (name, custom title), actual start/end locations, timestamp "souvenir" |
| **Aesthetic** | Abstract art, beautiful compositions, gallery-worthy layouts |
| **Unique** | Based on YOUR actual route - no one else has this exact combination |
| **Tangible** | High-res (300 DPI), print-ready, professional layouts |

---

## Art Styles

### 1. Geometric (Default)
- **Aesthetic:** Clean, modern, minimalist
- **Visual:** Angular lines, circles at hop points, gradient colors
- **Colors:** Multiple vibrant colors (cyan, magenta, green, orange, purple)
- **Background:** Light gray/white (#fafafa)
- **Typography:** Helvetica Neue, sans-serif
- **Best for:** Modern, clean prints

### 2. Constellation
- **Aesthetic:** Space/cosmic, glowing, ethereal
- **Visual:** Curved paths like star constellations, pulsing dots
- **Colors:** Same palette but with glow effects
- **Background:** Dark gradient (#0a0a1a to #1a1a2e)
- **Typography:** Georgia, serif
- **Best for:** Dark-themed prints, space enthusiasts

### 3. Flow (Watercolor-inspired)
- **Aesthetic:** Organic, flowing, artistic
- **Visual:** Smooth sine-wave curves, soft edges
- **Colors:** Gradient from first to last hop color
- **Background:** Off-white paper (#f5f5f0)
- **Typography:** Palatino, serif (italic)
- **Best for:** Artistic, gallery-style prints

### 4. Neon
- **Aesthetic:** Cyberpunk, glowing, vibrant
- **Visual:** Bright glowing lines with bloom effects, neon-colored hop points
- **Colors:** Hot pink, electric blue, neon green, bright purple
- **Background:** Pure black (#000000)
- **Typography:** Courier New, monospace
- **Best for:** Cyberpunk aesthetic, dark room displays

### 5. Minimal
- **Aesthetic:** Ultra-clean, Scandinavian, elegant
- **Visual:** Thin lines, small dots, maximum whitespace
- **Colors:** Black and white only, single accent color
- **Background:** White (#ffffff)
- **Typography:** Helvetica, sans-serif (light weight)
- **Best for:** Modern interiors, minimalist art

### 6. Retro
- **Aesthetic:** 80s/90s, synthwave, nostalgic
- **Visual:** Grid lines, gradient mesh, pixel-inspired elements
- **Colors:** Teal, magenta, orange, purple
- **Background:** Dark purple gradient (#1a0a2e to #0d0015)
- **Typography:** Futura, sans-serif (bold)
- **Best for:** Retro enthusiasts, vintage aesthetic

---

## Layout Options

### Portrait (600x800)
- **Use case:** Standard print sizes (8x10)
- **Best for:** Framing, wall art

### Square (800x800)
- **Use case:** Social media (Instagram, Facebook)
- **Best for:** Sharing online

### Large (1200x1600)
- **Use case:** Large prints (16x20)
- **Best for:** Premium wall art

---

## Data Visualization

Each art piece displays:

| Data | Display |
|------|---------|
| **Origin** | User's city/country (from geolocation) |
| **Destination** | Target domain/URL |
| **Hop count** | Number of network hops |
| **Countries** | Number of countries traversed |
| **Avg latency** | Average RTT in milliseconds |
| **Fingerprint ID** | Unique route signature |

---

## Customization Options

### User Controls

| Setting | Options | Default |
|---------|---------|---------|
| **Art Style** | Geometric, Constellation, Flow, Neon, Minimal, Retro | Geometric |
| **Layout** | Portrait, Square, Large | Portrait |
| **Custom Title** | Text input | "THE JOURNEY" |
| **Show Stats** | Toggle | ON |
| **Social Share** | Twitter, Facebook, LinkedIn, Reddit, Instagram | Buttons below Download |
| **Color Themes** | Cyan/Magenta, Sunset, Ocean, Forest, Mono | Cyan/Magenta | Style-aware filtering |
| **Custom Name** | Text input with toggle ("Created by [Name]") | Off |
| **Background Colors** | Style-specific palettes (6 colors) | Style default |

### Future Enhancements (v2)

All planned enhancements have been implemented:
- [x] Color theme selection (5 palettes)
- [x] Custom name ("Created by [Name]")
- [x] Background color picker (style-specific)
- [x] Social sharing (Twitter, Facebook, LinkedIn, Reddit, Instagram)

### Components

```
web/src/
├── App.tsx                 # Main app with modal trigger
└── art/
    └── ArtGenerator.tsx   # Art generator component
```

### Export System

- **Library:** html2canvas
- **Scale:** 10x (300 DPI for print quality)
- **Format:** PNG
- **Resolution:** Up to 300 DPI equivalent

### State Management

```typescript
type ArtStyle = 'geometric' | 'flow' | 'constellation' | 'neon' | 'minimal' | 'retro'
type Layout = 'portrait' | 'square' | 'large'

interface ArtState {
  style: ArtStyle
  layout: Layout
  customTitle: string
  includeStats: boolean
  exporting: boolean
}
```

---

## File Structure

### ArtGenerator.tsx

```
- Imports: React, html2canvas
- Types: Hop, ArtGeneratorProps, ArtStyle, Layout
- State: style, layout, customTitle, includeStats, exporting
- Functions:
  - handleExport(): Generate and download image
  - getStats(): Calculate hop/country/avgRtt
  - getHopColor(): Get color for each hop
  - renderContent(): Render art based on style
- Render:
  - Style buttons (geometric/constellation/flow)
  - Layout selector (portrait/square/large)
  - Settings (title input, stats toggle)
  - Art preview canvas
  - Download button
```

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Cyan | #00d4ff | Hop 1, gradients |
| Magenta | #ff00aa | Hop 2 |
| Green | #00ff88 | Hop 3 |
| Orange | #ffaa00 | Hop 4 |
| Purple | #aa00ff | Hop 5 |
| Red-Orange | #ff5500 | Hop 6+ |

Colors cycle for routes with many hops.

---

## Export Specifications

| Setting | Value |
|---------|-------|
| **Format** | PNG |
| **Scale** | 10x (300 DPI) |
| **Background** | Transparent or style-specific |
| **CORS** | Enabled |
| **Logging** | Disabled |

---

## User Flow

1. User runs a traceroute to any destination
2. Route data is displayed on map
3. User clicks "Create Art" button
4. Art Generator modal opens
5. User selects:
   - Art style (geometric/constellation/flow/neon/minimal/retro)
   - Layout (portrait/square/large)
   - Custom title (optional)
   - Stats visibility
6. Preview updates in real-time
7. User clicks "Download Art"
8. High-quality PNG downloads
9. User clicks "Save to Gallery"
10. Square 600x600 thumbnail is captured and saved to public gallery

---

## Success Metrics

- [x] Downloads work for all 6 styles
- [x] All layouts produce correctly sized images
- [x] Custom titles appear in export
- [x] Stats toggle works correctly
- [x] Export quality is print-worthy (300 DPI equivalent)
- [x] Save to Gallery produces square 600x600 thumbnails
- [x] Works on mobile (responsive)

---

## Future Enhancements

### Art Generator - Complete ✅
All art customization features have been implemented:
- [x] Color themes (5 palettes with style-aware filtering)
- [x] Background colors (style-specific options)
- [x] Custom name ("Created by")
- [x] Social sharing (Twitter, Facebook, LinkedIn, Reddit, Instagram)

### Phase 3 - Social ✅ COMPLETE
- [x] Public Gallery with infinite scroll and sorting
- [x] Like/Unlike routes with heart button
- [x] Public user profiles with stats and routes
- [x] Gallery button with shimmer effect in header
- [x] Square 600x600 thumbnail generation for gallery

### Phase 4 - Expansion - ON HOLD
- [ ] ~~Print-on-demand integration~~
- [ ] ~~User profiles and gallery~~

---

## Technical Debt / Known Issues

- [~] Constellation stars, retro sun rays and paper texture now render in desktop gallery saves
  - **Fix:** Changed from `!galleryMode` to `!isMobileDevice()` check
  - **Affected:** Constellation (stars), Retro (sun rays, paper texture)
  - **Not affected:** Mobile (remains hidden as intended)
- [ ] html2canvas can be buggy with advanced CSS (gradients, shadows)
- [ ] Glow effects may not render perfectly in export
- [ ] Large layout exports may be slow or memory-intensive

---

## Gallery Thumbnail Capture

When saving to gallery, a 600x600 square thumbnail is generated using html2canvas with a hidden off-screen element. Due to html2canvas coordinate calculation issues with percentage-based positioning, decorative elements using `transform: translate(-50%, -50%)` are hidden for gallery captures:

| Element | Constellation | Retro | Notes |
|---------|--------------|-------|-------|
| Stars (80 random dots) | Hidden | N/A | Uses % positioning |
| Sun rays (16 curved) | N/A | Hidden | Uses % positioning |
| Planets (2 fixed) | ✅ Visible | N/A | Fixed pixel offsets |
| Paper texture | N/A | ✅ Visible | Full coverage overlay |
| Hop path SVG | ✅ Visible | ✅ Visible | viewBox coordinates |
| Frame borders | ✅ Visible | ✅ Visible | Fixed positioning |

---

## Competitor Analysis

### Similar Tools
- **Mapify.me** - Converts Google Maps to artistic prints
- **Route66** - Simple route visualizations
- **Pic-Time** - Photo printing service

### Routerino Differentiation
- **Network-specific:** Unique focus on traceroute/IP routing
- **Interactive:** Live map + static art
- **Gamification:** Collection, fingerprints, badges
- **Social:** Gallery, sharing, profiles

---

## Conclusion

The Art Generator transforms Routerino from a traceroute tool into an artistic platform. By focusing on quality, personalization, and shareability, this feature serves as the foundation for viral growth and print-on-demand revenue.

*Last updated: 2026-04-05*