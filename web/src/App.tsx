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
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, city?: string, country?: string} | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationHop, setAnimationHop] = useState(-1)
  const [animationProgress, setAnimationProgress] = useState(0) // 0-1 between hops
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [showPacket, setShowPacket] = useState(false)
  const [packetPosition, setPacketPosition] = useState<[number, number] | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const runTrace = async () => {
    if (!destination.trim()) return
    
    setLoading(true)
    setError('')
    setAnimationHop(-1)
    setIsPlaying(false)
    setShowPacket(false)
    
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

  useEffect(() => {
    if (!navigator.geolocation) return
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await response.json()
          const address = data.address
          const city = address.city || address.town || address.village || address.municipality || address.county || 'Unknown'
          const country = address.country_code?.toUpperCase() || ''
          setUserLocation({
            lat: latitude,
            lng: longitude,
            city: city,
            country: country
          })
        } catch {
          setUserLocation({
            lat: latitude,
            lng: longitude,
            city: 'Unknown',
            country: ''
          })
        }
      },
      () => {
        // User denied or error
      }
    )
  }, [])

  // Define validHops first
  const validHops = traceData ? traceData.hops.filter(h => h.ip && h.ip !== '*') : []

  // Calculate packet position between current and next hop
  const getPacketPosition = (): [number, number] | null => {
    if (animationHop === -1 && userLocation && validHops.length > 0) {
      // Starting from home to first hop
      const startLat = userLocation.lat
      const startLng = userLocation.lng
      const endLat = validHops[0].lat!
      const endLng = validHops[0].lng!
      return [
        startLat + (endLat - startLat) * animationProgress,
        startLng + (endLng - startLng) * animationProgress
      ]
    }
    
    if (animationHop >= 0 && animationHop < validHops.length - 1) {
      // Between hop N and N+1
      const startLat = validHops[animationHop].lat!
      const startLng = validHops[animationHop].lng!
      const endLat = validHops[animationHop + 1].lat!
      const endLng = validHops[animationHop + 1].lng!
      return [
        startLat + (endLat - startLat) * animationProgress,
        startLng + (endLng - startLng) * animationProgress
      ]
    }
    
    if (animationHop >= 0 && animationHop < validHops.length) {
      // At a hop
      return [validHops[animationHop].lat!, validHops[animationHop].lng!]
    }
    
    return null
  }

  // Update packet position when animation changes
  useEffect(() => {
    const pos = getPacketPosition()
    if (pos) {
      setPacketPosition(pos)
    }
  }, [animationHop, animationProgress])

  // Animation effect
  useEffect(() => {
    if (!isPlaying || validHops.length === 0) return
    
    const hopTime = 1500 / animationSpeed
    const progressTime = 50 // Update position every 50ms for smooth animation
    
    let progress = 0
    
    const progressInterval = setInterval(() => {
      progress += progressTime / hopTime
      
      if (progress >= 1) {
        progress = 0
        setAnimationHop(prev => {
          if (prev < validHops.length - 1) {
            return prev + 1
          } else {
            setIsPlaying(false)
            return prev
          }
        })
      } else {
        setAnimationProgress(progress)
      }
    }, progressTime)
    
    return () => clearInterval(progressInterval)
  }, [isPlaying, animationSpeed, validHops.length])

  // Smooth camera following the packet
  useEffect(() => {
    if (!packetPosition || !mapRef.current) return
    
    // Smooth pan to follow packet
    mapRef.current.panTo(packetPosition, { animate: true, duration: 0.3 })
  }, [packetPosition])

  useEffect(() => {
    if (animationHop >= 0) {
      setShowPacket(true)
    }
  }, [animationHop])

  useEffect(() => {
    if (traceData) {
      setAnimationHop(-1)
      setIsPlaying(false)
      setShowPacket(false)
    }
  }, [traceData])

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

  const homeIcon = L.divIcon({
    className: 'home-marker',
    html: `<div style="
      width: 26px;
      height: 26px;
      background: #00d4ff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 0 8px #00d4ff, 0 0 16px #00d4ff;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="transform: rotate(45deg); color: #0a0a0f; font-size: 11px;">📍</div>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26]
  })

  const packetIcon = L.divIcon({
    className: 'packet-marker',
    html: `<div style="
      width: 24px;
      height: 18px;
      background: white;
      border-radius: 2px;
      border: 2px solid #00d4ff;
      box-shadow: 0 0 8px #00d4ff, 0 0 16px #00d4ff;
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 2px;
        left: 2px;
        right: 2px;
        bottom: 6px;
        border-bottom: 2px solid #00d4ff;
        border-left: 2px solid transparent;
        border-right: 2px solid transparent;
        border-top: 2px solid transparent;
      "></div>
    </div>`,
    iconSize: [24, 18],
    iconAnchor: [12, 9]
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
          <div className="privacy-note">🔒 Your location is only used to show where your packets start. We don't store it.</div>
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

        {traceData && validHops.length > 0 && (
          <div className="animation-controls">
            <div className="playback-controls">
              <button onClick={() => { setAnimationHop(-1); setIsPlaying(false); }} title="Reset">🔄</button>
              <button onClick={() => { 
                setIsPlaying(!isPlaying); 
                if (animationHop >= validHops.length - 1) setAnimationHop(-1);
              }} title={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button onClick={() => setAnimationHop(Math.max(-1, animationHop - 1))} title="Previous" disabled={animationHop <= -1}>⏮️</button>
              <button onClick={() => setAnimationHop(Math.min(validHops.length - 1, animationHop + 1))} title="Next" disabled={animationHop >= validHops.length - 1}>⏭️</button>
            </div>
            <div className="speed-controls">
              <span>Speed:</span>
              <button className={animationSpeed === 0.5 ? 'active' : ''} onClick={() => setAnimationSpeed(0.5)}>Slow</button>
              <button className={animationSpeed === 1 ? 'active' : ''} onClick={() => setAnimationSpeed(1)}>Med</button>
              <button className={animationSpeed === 2 ? 'active' : ''} onClick={() => setAnimationSpeed(2)}>Fast</button>
            </div>
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
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

                {routeCoords.length > 1 && routeCoords.slice(0, -1).map((start, i) => {
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

                {userLocation && validHops.length > 0 && validHops[0] && (
                  <Polyline
                    positions={[
                      [userLocation.lat, userLocation.lng],
                      [validHops[0].lat!, validHops[0].lng!]
                    ]}
                    color="#ff69b4"
                    weight={3}
                    opacity={0.9}
                    dashArray="10, 10"
                  />
                )}

                {userLocation && (
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={homeIcon}
                    eventHandlers={{
                      click: () => {
                        mapRef.current?.flyTo([userLocation.lat, userLocation.lng], 10)
                        setSelectedHop({ lat: userLocation.lat, lng: userLocation.lng, hop: 0, ip: 'You' } as Hop)
                      }
                    }}
                  >
                    <Popup>
                      <div style={{ color: '#000' }}>
                        <strong>📍 Your Location</strong><br />
                        {userLocation.city}, {userLocation.country}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {showPacket && userLocation && animationHop === -1 && packetPosition && (
                  <Marker
                    position={packetPosition}
                    icon={packetIcon}
                    zIndexOffset={1000}
                  >
                    <Popup>
                      <div style={{ color: '#000' }}>
                        <strong>Packet Starting</strong><br />
                        From: {userLocation.city}, {userLocation.country}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {showPacket && animationHop >= 0 && validHops[animationHop] && packetPosition && (
                  <Marker
                    position={packetPosition}
                    icon={packetIcon}
                    zIndexOffset={1000}
                    eventHandlers={{
                      click: () => {
                        setSelectedHop(validHops[animationHop])
                      }
                    }}
                  >
                    <Popup>
                      <div style={{ color: '#000' }}>
                        <strong>Hop {validHops[animationHop].hop}</strong><br />
                        IP: {validHops[animationHop].ip}<br />
                        {validHops[animationHop].city && <>{validHops[animationHop].city}, {validHops[animationHop].country}</>}
                        {validHops[animationHop].rtt && (
                          <>
                            <br />RTT: <span style={{ color: getLatencyColor(validHops[animationHop].rtt) }}>{validHops[animationHop].rtt}ms</span>
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}
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
              {userLocation && (
                <div 
                  className="user-location-header"
                  onClick={() => {
                    if (userLocation) {
                      mapRef.current?.flyTo([userLocation.lat, userLocation.lng], 10)
                      setSelectedHop({ lat: userLocation.lat, lng: userLocation.lng, hop: 0, ip: 'You' } as Hop)
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  📍 Your Location: {userLocation.city}, {userLocation.country}
                </div>
              )}
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
