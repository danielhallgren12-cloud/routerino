import { useState, useEffect } from 'react'
import { routesApi } from '../auth/api'
import { useAuth } from '../auth/AuthContext'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Hop {
  hop: number
  ip: string
  hostname?: string
  country?: string
  city?: string
  lat?: number
  lng?: number
  isp?: string
  asn?: string
  rtt?: number
}

interface RouteData {
  id: number
  destination: string
  hops_data: Hop[]
  created_at: string
}

interface DestinationRoutes {
  [destination: string]: RouteData[]
}

interface PathInfo {
  color: string
  asnChain: string
  count: number
  percentage: number
  routeIndices: number[]
}

const ROUTE_COLORS = [
  '#3b82f6',
  '#ec4899',
  '#f97316',
  '#14b8a6',
  '#8b5cf6',
  '#eab308',
  '#22c55e',
  '#ef4444',
]

const OFFSET_DISTANCE = 0.00003

function calculatePerpendicularOffset(
  pointA: [number, number],
  pointB: [number, number],
  laneIndex: number
): [number, number] {
  const dx = pointB[0] - pointA[0]
  const dy = pointB[1] - pointA[1]
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length === 0) return [0, 0]
  const nx = -dy / length
  const ny = dx / length
  return [nx * laneIndex * OFFSET_DISTANCE, ny * laneIndex * OFFSET_DISTANCE]
}

interface SegmentKey {
  fromIp: string
  toIp: string
}

interface SegmentInfo {
  routesSharing: number[]
}

function buildSegmentMap(routes: RouteData[]): Map<string, SegmentInfo> {
  const segmentMap = new Map<string, SegmentInfo>()
  
  routes.forEach((route, routeIdx) => {
    const hops = route.hops_data.filter(h => h.lat && h.lng)
    for (let i = 0; i < hops.length - 1; i++) {
      const fromIp = hops[i].ip
      const toIp = hops[i + 1].ip
      if (fromIp === '*' || toIp === '*') continue
      
      const key = `${fromIp}|${toIp}`
      if (!segmentMap.has(key)) {
        segmentMap.set(key, { routesSharing: [] })
      }
      const info = segmentMap.get(key)!
      if (!info.routesSharing.includes(routeIdx)) {
        info.routesSharing.push(routeIdx)
      }
    }
  })
  
  return segmentMap
}

function MapContent({ selectedDestination, destinations, pathInfos }: {
  selectedDestination: string | null
  destinations: DestinationRoutes
  pathInfos: PathInfo[]
}) {
  const map = useMap()

  useEffect(() => {
    if (!selectedDestination) return

    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.TileLayer) return
      map.removeLayer(layer)
    })

    const routes = destinations[selectedDestination]
    if (!routes || routes.length < 2) return

    const segmentMap = buildSegmentMap(routes)

    pathInfos.forEach((pathInfo) => {
      const routeIndices = pathInfo.routeIndices
      if (routeIndices.length === 0) return

      routeIndices.forEach((routeIdx) => {
        const route = routes[routeIdx]
        const hops = route.hops_data.filter(h => h.lat && h.lng)
        if (hops.length < 2) return

        const coordsWithOffset: [number, number][] = []
        
        for (let i = 0; i < hops.length; i++) {
          const hop = hops[i]
          let offsetLat = 0
          let offsetLng = 0
          
          if (i < hops.length - 1) {
            const fromIp = hop.ip
            const toIp = hops[i + 1].ip
            if (fromIp !== '*' && toIp !== '*') {
              const key = `${fromIp}|${toIp}`
              const segInfo = segmentMap.get(key)
              if (segInfo && segInfo.routesSharing.length > 1) {
                const laneIdx = segInfo.routesSharing.indexOf(routeIdx)
                const totalLanes = segInfo.routesSharing.length
                const centerLane = (totalLanes - 1) / 2
                const normalizedLane = laneIdx - centerLane
                const [nx, ny] = calculatePerpendicularOffset(
                  [hop.lat!, hop.lng!],
                  [hops[i + 1].lat!, hops[i + 1].lng!],
                  normalizedLane
                )
                offsetLat = nx
                offsetLng = ny
              }
            }
          }
          
          coordsWithOffset.push([hop.lat! + offsetLat, hop.lng! + offsetLng])
        }

        L.polyline(coordsWithOffset, {
          color: pathInfo.color,
          weight: 4,
          opacity: 0.85,
        }).addTo(map)

        hops.forEach((hop) => {
          const marker = L.circleMarker([hop.lat!, hop.lng!], {
            radius: 6,
            fillColor: pathInfo.color,
            color: '#fff',
            weight: 2,
            fillOpacity: 0.9,
          })

          marker.bindPopup(`
            <strong>${hop.city || 'Unknown'}, ${hop.country || ''}</strong><br>
            ${hop.ip}<br>
            ${hop.isp || ''} (${hop.asn || ''})
          `)
          marker.addTo(map)
        })
      })
    })

    const cityFrequency: Record<string, { lat: number; lng: number; count: number }> = {}
    routes.forEach(route => {
      route.hops_data.forEach(hop => {
        if (hop.city && hop.lat && hop.lng) {
          const key = `${hop.city}-${hop.country}`
          if (!cityFrequency[key]) {
            cityFrequency[key] = { lat: hop.lat, lng: hop.lng, count: 0 }
          }
          cityFrequency[key].count++
        }
      })
    })

    Object.entries(cityFrequency).forEach(([key, data]) => {
      const size = 8 + (data.count / routes.length) * 12
      const marker = L.circleMarker([data.lat, data.lng], {
        radius: size,
        fillColor: '#FF00AA',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.4,
      })
      marker.bindPopup(`${key}: ${data.count} appearances`)
      marker.addTo(map)
    })

    const allCoords = routes.flatMap(r => 
      r.hops_data.filter(h => h.lat && h.lng).map(h => [h.lat!, h.lng!] as [number, number])
    )
    if (allCoords.length > 0) {
      map.fitBounds(allCoords, { padding: [50, 50] })
    }
  }, [selectedDestination, destinations, pathInfos, map])

  return null
}

export default function RouteAtlas() {
  const { token } = useAuth()
  const [destinations, setDestinations] = useState<DestinationRoutes>({})
  const [totalDestinations, setTotalDestinations] = useState(0)
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pathInfos, setPathInfos] = useState<PathInfo[]>([])

  useEffect(() => {
    if (token) {
      loadRoutes()
    }
  }, [token])

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const data = await routesApi.getRoutesByDestination(token!)
      setDestinations(data.destinations || {})
      setTotalDestinations(data.total_destinations || 0)
    } catch (err) {
      console.error('Failed to load routes:', err)
    } finally {
      setLoading(false)
    }
  }

  const selectDestination = (destination: string) => {
    setSelectedDestination(destination)
    calculatePaths(destination)
  }

  const calculatePaths = (destination: string) => {
    const routes = destinations[destination]
    if (!routes || routes.length < 2) {
      setPathInfos([])
      return
    }

    const asnChainCounts: Record<string, { count: number; routeIndices: number[] }> = {}

    routes.forEach((route, idx) => {
      const asns = route.hops_data
        .filter(h => h.asn)
        .map(h => h.asn)
        .join(' → ')
      if (!asnChainCounts[asns]) {
        asnChainCounts[asns] = { count: 0, routeIndices: [] }
      }
      asnChainCounts[asns].count++
      asnChainCounts[asns].routeIndices.push(idx)
    })

    const sortedChains = Object.entries(asnChainCounts)
      .sort((a, b) => b[1].count - a[1].count)

    const infos: PathInfo[] = sortedChains.map(([asnChain], idx) => {
      const info = asnChainCounts[asnChain]
      const percentage = Math.round((info.count / routes.length) * 100)
      return {
        color: ROUTE_COLORS[idx % ROUTE_COLORS.length],
        asnChain,
        count: info.count,
        percentage,
        routeIndices: info.routeIndices
      }
    })

    setPathInfos(infos)
  }

  const getRouteStats = (destination: string) => {
    const routes = destinations[destination]
    if (!routes || routes.length === 0) return null

    return {
      routeCount: routes.length,
      firstTrace: routes[routes.length - 1]?.created_at,
      latestTrace: routes[0]?.created_at,
    }
  }

  interface HopInfo {
    city: string
    country: string
    ip: string
    isp: string
    asn: string
    hop: number
    lat?: number
    lng?: number
  }

  const getHopComparison = () => {
    if (!selectedDestination || pathInfos.length === 0) return null
    
    const routes = destinations[selectedDestination]
    if (!routes) return null

    const sharedKeys = new Set<string>()
    const hopMap: Record<string, HopInfo> = {}
    
    const routeHopSets = routes.map(r => new Set(
      r.hops_data
        .filter(h => h.ip && h.ip !== '*' && h.lat && h.lng)
        .map(h => `${h.lat}|${h.lng}`)
    ))
    
    routeHopSets.forEach((route, routeIdx) => {
      route.forEach(key => {
        const hop = routes[routeIdx].hops_data.find(h => `${h.lat}|${h.lng}` === key)
        if (hop) {
          hopMap[key] = {
            city: hop.city || '-',
            country: hop.country || '-',
            ip: hop.ip,
            isp: hop.isp || '-',
            asn: hop.asn || '-',
            hop: hop.hop,
            lat: hop.lat,
            lng: hop.lng
          }
        }
      })
    })

    if (routeHopSets.length > 0) {
      routeHopSets[0].forEach(key => {
        if (routeHopSets.every(set => set.has(key))) {
          sharedKeys.add(key)
        }
      })
    }

    const uniqueByPath: Record<string, string[]> = {}
    pathInfos.forEach(info => {
      info.routeIndices.forEach(routeIdx => {
        const route = routes[routeIdx]
        const hopKeys = new Set(
          route.hops_data
            .filter(h => h.ip && h.ip !== '*' && h.lat && h.lng)
            .map(h => `${h.lat}|${h.lng}`)
        )
        hopKeys.forEach(key => {
          if (!sharedKeys.has(key)) {
            if (!uniqueByPath[info.asnChain]) {
              uniqueByPath[info.asnChain] = []
            }
            if (!uniqueByPath[info.asnChain].includes(key)) {
              uniqueByPath[info.asnChain].push(key)
            }
          }
        })
      })
    })

    return {
      shared: Array.from(sharedKeys),
      uniqueByPath,
      hopMap
    }
  }

  const hopComparison = getHopComparison()

  if (loading) {
    return (
      <div className="route-atlas-loading">
        <div className="loading-spinner"></div>
        <p>Loading your route atlas...</p>
      </div>
    )
  }

  return (
    <div className="route-atlas">
      <div className="route-atlas-header">
        <h2>🗺️ Route Atlas</h2>
        <p className="route-atlas-subtitle">
          Explore all the routes you've taken to the same destinations over time
        </p>
      </div>

      {totalDestinations === 0 ? (
        <div className="route-atlas-empty">
          <p>You need at least 2 traces to the same destination to use Route Atlas.</p>
          <p>Trace the same destination multiple times to see how your routes change!</p>
        </div>
      ) : (
        <div className="route-atlas-content">
          <div className="route-atlas-sidebar">
            <h3>Destinations ({totalDestinations})</h3>
            <div className="destination-list">
              {Object.keys(destinations).map(dest => {
                const count = destinations[dest].length
                return (
                  <button
                    key={dest}
                    className={`destination-item ${selectedDestination === dest ? 'active' : ''}`}
                    onClick={() => selectDestination(dest)}
                  >
                    <span className="destination-name">{dest}</span>
                    <span className="destination-count">{count} routes</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="route-atlas-main">
            {selectedDestination ? (
              <>
                <div className="route-atlas-title">
                  <h3>Routes to {selectedDestination}</h3>
                </div>

                <div className="route-atlas-compact-stats">
                  <span className="compact-stat">
                    <span className="compact-stat-label">Routes:</span>
                    <span className="compact-stat-value">{destinations[selectedDestination]?.length || 0}</span>
                  </span>
                  <span className="compact-stat-sep">|</span>
                  <span className="compact-stat">
                    <span className="compact-stat-label">Variations:</span>
                    <span className="compact-stat-value">{pathInfos.length}</span>
                  </span>
                  <span className="compact-stat-sep">|</span>
                  <span className="compact-stat">
                    <span className="compact-stat-label">First:</span>
                    <span className="compact-stat-value">{getRouteStats(selectedDestination)?.firstTrace?.split('T')[0] || 'N/A'}</span>
                  </span>
                  <span className="compact-stat-sep">|</span>
                  <span className="compact-stat">
                    <span className="compact-stat-label">Latest:</span>
                    <span className="compact-stat-value">{getRouteStats(selectedDestination)?.latestTrace?.split('T')[0] || 'N/A'}</span>
                  </span>
                </div>

                <div className="route-atlas-map">
                  <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                    doubleClickZoom={false}
                    scrollWheelZoom={true}
                    touchZoom={true}
                    dragging={true}
                  >
                    <TileLayer
                      attribution='© OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapContent
                      selectedDestination={selectedDestination}
                      destinations={destinations}
                      pathInfos={pathInfos}
                    />
                  </MapContainer>
                </div>

                <div className="route-atlas-paths">
                  <h4>Path Breakdown</h4>
                  {pathInfos.map((info, idx) => (
                    <div key={idx} className="path-item" style={{ borderLeftColor: info.color }}>
                      <div className="path-bar-container">
                        <div
                          className="path-bar"
                          style={{
                            width: `${info.percentage}%`,
                            background: info.color,
                          }}
                        ></div>
                      </div>
                      <div className="path-info">
                        <span className="path-text">{info.asnChain}</span>
                        <span className="path-count">{info.count} routes ({info.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="route-atlas-hops">
                  <h4>Hop Details (Head-to-Head)</h4>
                  {hopComparison && (
                    <>
                      {hopComparison.shared.length > 0 && (
                        <div className="hops-section hops-shared">
                          <div className="hops-section-header shared">
                            <span className="hops-section-badge">SHARED</span>
                            <span className="hops-section-title">Hops in all routes ({hopComparison.shared.length})</span>
                          </div>
                          <div className="hops-grid">
                            {hopComparison.shared.map((key, idx) => {
                              const hop = hopComparison.hopMap[key]
                              return (
                                <div key={idx} className="hop-card shared">
                                  <div className="hop-card-header">
                                    <span className="hop-number shared">{hop.hop}</span>
                                    <span className="hop-card-location">{hop.city}, {hop.country}</span>
                                  </div>
                                  <div className="hop-card-ip">{hop.ip}</div>
                                  <div className="hop-card-isp">{hop.isp}</div>
                                  <div className="hop-card-asn">ASN {hop.asn}</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      {Object.keys(hopComparison.uniqueByPath).map((pathKey) => {
                        const pathInfo = pathInfos.find(p => p.asnChain === pathKey)
                        if (!pathInfo) return null
                        const uniqueKeys = hopComparison.uniqueByPath[pathKey]
                        if (uniqueKeys.length === 0) return null
                        
                        return (
                          <div key={pathKey} className="hops-section hops-unique" style={{ borderLeftColor: pathInfo.color }}>
                            <div className="hops-section-header unique">
                              <span className="hops-section-badge" style={{ background: pathInfo.color }}>PATH</span>
                              <span className="hops-section-title">{pathInfo.percentage}% of routes</span>
                            </div>
                            <div className="hops-grid">
                              {uniqueKeys.map((key, idx) => {
                                const hop = hopComparison.hopMap[key]
                                return (
                                  <div key={idx} className="hop-card unique" style={{ borderTopColor: pathInfo.color }}>
                                    <div className="hop-card-header">
                                      <span className="hop-number" style={{ color: pathInfo.color }}>{hop.hop}</span>
                                      <span className="hop-card-location">{hop.city}, {hop.country}</span>
                                    </div>
                                    <div className="hop-card-ip">{hop.ip}</div>
                                    <div className="hop-card-isp">{hop.isp}</div>
                                    <div className="hop-card-asn">ASN {hop.asn}</div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                  {!hopComparison && (
                    <div className="hops-empty">No hop data available</div>
                  )}
                </div>
              </>
            ) : (
              <div className="route-atlas-placeholder">
                <p>Select a destination from the sidebar to view its route atlas</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
