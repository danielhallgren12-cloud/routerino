import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import html2canvas from 'html2canvas'

interface Hop {
  hop: number
  ip: string
  hostname?: string
  isp?: string
  asn?: string
  country?: string
  city?: string
  lat?: number
  lng?: number
  rtt?: number
}

interface TraceResponse {
  id: string
  destination: string
  hops: Hop[]
  created_at: string
}

const getLatencyColor = (rtt?: number) => {
  if (!rtt) return '#888888'
  if (rtt < 50) return '#22c55e'
  if (rtt <= 150) return '#eab308'
  return '#ef4444'
}

const themes = {
  neon: { color: '#00d4ff', lineColor: '#ff00aa' },
  retro: { color: '#ff6b35', lineColor: '#f7c59f' },
  minimal: { color: '#ffffff', lineColor: '#888888' }
}

type Theme = 'neon' | 'retro' | 'minimal'

function MapEvents({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom())
    },
  })
  useEffect(() => {
    onZoomChange(map.getZoom())
  }, [])
  return null
}

function App() {
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDots, setLoadingDots] = useState(0)
  const [error, setError] = useState('')
  const [traceData, setTraceData] = useState<TraceResponse | null>(null)
  const [theme, setTheme] = useState<Theme>('neon')
  const [zoomLevel, setZoomLevel] = useState(2)
  const [selectedHop, setSelectedHop] = useState<Hop | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const runTrace = async () => {
    if (!destination.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/v1/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destination.trim(), max_hops: 15 })
      })
      
      if (!response.ok) {
        throw new Error('Trace failed')
      }
      
      const data = await response.json()
      setTraceData(data)
    } catch (err) {
      setError('Failed to run traceroute. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const exportImage = async () => {
    const mapElement = document.querySelector('.leaflet-container') as HTMLElement
    if (!mapElement) return

    try {
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#0a0a0f'
      })
      
      const link = document.createElement('a')
      link.download = `route-to-${destination.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
      setError('Failed to export image. Please try again.')
    }
  }

  useEffect(() => {
    if (selectedHop && selectedHop.lat && selectedHop.lng && mapRef.current) {
      mapRef.current.flyTo([selectedHop.lat, selectedHop.lng], 8)
    }
  }, [selectedHop])

  useEffect(() => {
    if (!loading) {
      setLoadingDots(0)
      return
    }
    const interval = setInterval(() => {
      setLoadingDots(prev => (prev + 1) % 3)
    }, 400)
    return () => clearInterval(interval)
  }, [loading])

  const getValidHops = (): Hop[] => {
    if (!traceData) return []
    return traceData.hops.filter(h => h.ip && h.ip !== '*')
  }

  const validHops = getValidHops()
  const routeCoords = validHops.map(h => [h.lat!, h.lng!] as [number, number])

  const getHopGroup = () => {
    const groups: { [key: string]: { hops: number[], lat: number, lng: number } } = {}
    
    validHops.forEach(hop => {
      const cityKey = hop.city && hop.country ? `${hop.city},${hop.country}` : `${hop.lat},${hop.lng}`
      
      if (!groups[cityKey]) {
        groups[cityKey] = { hops: [], lat: hop.lat!, lng: hop.lng! }
      }
      groups[cityKey].hops.push(hop.hop)
    })
    
    return groups
  }

  const hopGroups = getHopGroup()

  const getMarkerLabel = (lat: number, lng: number) => {
    const cityKey = Object.keys(hopGroups).find(key => {
      const group = hopGroups[key]
      return group.lat === lat && group.lng === lng
    })
    
    if (cityKey) {
      const hops = hopGroups[cityKey].hops
      if (hops.length > 1) {
        return hops.sort((a, b) => a - b).join(',')
      }
      return hops[0].toString()
    }
    return ''
  }

  const shouldCombineMarkers = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const latDiff = Math.abs(lat1 - lat2)
    const lngDiff = Math.abs(lng1 - lng2)
    return latDiff < 0.1 && lngDiff < 0.1
  }

  const customIcon = (label: string) => L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: auto;
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      background: linear-gradient(135deg, ${themes[theme].color}, ${themes[theme].lineColor});
      border-radius: 12px;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: black;
      white-space: nowrap;
    ">${label}</div>`,
    iconSize: [30, 24],
    iconAnchor: [15, 12]
  })

  return (
    <div className="app">
      <header className="header">
        <h1>RouteCanvas</h1>
      </header>

      <main className="main">
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter destination (e.g., google.com)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runTrace()}
          />
          <button onClick={runTrace} disabled={loading || !destination.trim()}>
            {loading ? `Tracing${'.'.repeat(loadingDots + 1)}` : 'Trace Route'}
          </button>
          {traceData && validHops.length > 0 && (
            <button onClick={exportImage} className="export-button">
              📸 Export Image
            </button>
          )}
          {loading && <div className="loading-note">A search takes approx 10-20 sec</div>}
        </div>

        {error && <div className="error">{error}</div>}

        {traceData && (
          <div className="theme-selector">
            {(['neon', 'retro', 'minimal'] as Theme[]).map(t => (
              <button
                key={t}
                className={`theme-button ${theme === t ? 'active' : ''}`}
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div className="content-columns">
          <div className="map-container">
            {loading && (
              <div className="loading">Running traceroute...</div>
            )}
            
            {!loading && traceData && validHops.length > 0 && (
              <MapContainer
                ref={mapRef}
                center={[20, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
              >
                <MapEvents onZoomChange={setZoomLevel} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                />
                
                {(() => {
                  const cityGroups: { [key: string]: Hop[] } = {}
                  
                  validHops.forEach(hop => {
                    const cityKey = hop.city && hop.country ? `${hop.city},${hop.country}` : `${hop.lat},${hop.lng}`
                    if (!cityGroups[cityKey]) {
                      cityGroups[cityKey] = []
                    }
                    cityGroups[cityKey].push(hop)
                  })
                  
                  const renderedHops = new Set<number>()
                  
                  return Object.values(cityGroups).map(cityHops => {
                    const isSameLocation = cityHops.length > 1 && cityHops.every(h => 
                      Math.abs(h.lat! - cityHops[0].lat!) < 0.01 && Math.abs(h.lng! - cityHops[0].lng!) < 0.01
                    )
                    
                    const shouldCombine = zoomLevel < 5 || isSameLocation
                    
                    if (shouldCombine) {
                      const hopNums = cityHops.map(h => h.hop).sort((a, b) => a - b)
                      const label = hopNums.join(',')
                      const hop = cityHops[0]
                      hopNums.forEach(n => renderedHops.add(n))
                      
                      return (
                        <Marker
                          key={`combined-${label}`}
                          position={[hop.lat!, hop.lng!]}
                          icon={customIcon(label)}
                          eventHandlers={{
                            click: () => {
                              mapRef.current?.flyTo([hop.lat!, hop.lng!], 8)
                              setSelectedHop(hop)
                            }
                          }}
                        >
                          <Popup>
                            <div style={{ color: '#000' }}>
                              <strong>Hops {label}</strong><br />
                              {cityHops.map(h => (
                                <div key={h.hop}>
                                  Hop {h.hop}: {h.ip}<br />
                                  {h.city && <>{h.city}, {h.country}</>}
                                  {h.asn && <><br />{h.asn}</>}
                                  {h.rtt && (
                                    <>
                                      <br />RTT: <span style={{ color: getLatencyColor(h.rtt) }}>{h.rtt}ms</span>
                                    </>
                                  )}
                                  <hr style={{ margin: '4px 0' }} />
                                </div>
                              ))}
                            </div>
                          </Popup>
                        </Marker>
                      )
                    }
                    
                    return cityHops.map(hop => {
                      if (renderedHops.has(hop.hop)) return null
                      renderedHops.add(hop.hop)
                      
                      return (
                        <Marker
                          key={`single-${hop.hop}`}
                          position={[hop.lat!, hop.lng!]}
                          icon={customIcon(hop.hop.toString())}
                          eventHandlers={{
                            click: () => {
                              mapRef.current?.flyTo([hop.lat!, hop.lng!], 8)
                              setSelectedHop(hop)
                            }
                          }}
                        >
                          <Popup>
                            <div style={{ color: '#000' }}>
                              <strong>Hop {hop.hop}</strong><br />
                              IP: {hop.ip}<br />
                              {hop.city && <>{hop.city}, {hop.country}</>}
                              {hop.asn && <><br />{hop.asn}</>}
                              {hop.rtt && (
                                <>
                                  <br />RTT: <span style={{ color: getLatencyColor(hop.rtt) }}>{hop.rtt}ms</span>
                                </>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })
                  })
                })()}
               
                {routeCoords.slice(0, -1).map((start, i) => {
                  const end = routeCoords[i + 1]
                  const hopRtt = validHops[i + 1]?.rtt
                  const segmentColor = getLatencyColor(hopRtt)

                  return (
                    <Polyline
                      key={i}
                      positions={[start, end]}
                      color={segmentColor}
                      weight={3}
                      opacity={0.8}
                      dashArray={theme === 'retro' ? '10, 10' : undefined}
                    />
                  )
                })}
              </MapContainer>
            )}
            
            {!loading && traceData && validHops.length === 0 && (
              <div className="loading">No map data. Showing route details below...</div>
            )}
            
            {!loading && !traceData && (
              <div className="loading">Enter a destination to trace your route</div>
            )}
          </div>

          {traceData && traceData.hops.length > 0 && (
            <div className="hop-list">
              <h3>Route Details</h3>
              {traceData.hops.map(hop => (
                <div 
                  key={hop.hop} 
                  className="hop-item"
                  onClick={() => {
                    if (hop.lat && hop.lng) {
                      mapRef.current?.flyTo([hop.lat, hop.lng], 8)
                      setSelectedHop(hop)
                    }
                  }}
                  style={{ cursor: hop.lat && hop.lng ? 'pointer' : 'default' }}
                >
                  <div className="hop-number">{hop.hop}</div>
                  <div className="hop-details">
                    <div className="ip">{hop.ip}</div>
                    {hop.hostname && <div className="hostname">{hop.hostname}</div>}
                    {hop.asn && <div className="asn">{hop.asn}</div>}
                    {(hop.city || hop.country) && (
                      <div className="location-row">
                        <span className="location">{[hop.city, hop.country].filter(Boolean).join(', ')}</span>
                        {hop.rtt && (
                          <span className="hop-rtt" style={{ color: getLatencyColor(hop.rtt) }}>
                            {hop.rtt}ms
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
