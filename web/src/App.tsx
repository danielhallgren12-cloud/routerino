import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import html2canvas from 'html2canvas'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginForm, RegisterForm } from './auth/forms'
import { routesApi } from './auth/api'

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
  const { user, token, logout, isAuthenticated } = useAuth()
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
  const [animationProgress, setAnimationProgress] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [showPacket, setShowPacket] = useState(false)
  const [packetPosition, setPacketPosition] = useState<[number, number] | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [savedRoutes, setSavedRoutes] = useState<{id: number, destination: string, created_at: string}[]>([])
  const [showRoutes, setShowRoutes] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const animationRef = useRef<{ cancel: boolean }>({ cancel: false })
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

  const saveRoute = async () => {
    if (!traceData || !token) return
    
    try {
      const hopsData = JSON.stringify(traceData.hops)
      await routesApi.saveRoute(token, traceData.destination, hopsData)
      setSaveMessage('Route saved!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      setError('Failed to save route')
    }
  }

  const loadSavedRoutes = async () => {
    if (!token) return
    
    try {
      const routes = await routesApi.getRoutes(token)
      setSavedRoutes(routes)
      setShowRoutes(true)
    } catch (err) {
      setError('Failed to load routes')
    }
  }

  const loadRoute = (route: {id: number, destination: string}) => {
    // This would require fetching the route details - for now just set destination
    setDestination(route.destination)
    setShowRoutes(false)
    runTrace()
  }

  const deleteSavedRoute = async (routeId: number) => {
    if (!token) return
    
    try {
      await routesApi.deleteRoute(token, routeId)
      setSavedRoutes(savedRoutes.filter(r => r.id !== routeId))
    } catch (err) {
      setError('Failed to delete route')
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

  // Calculate distance between two points in km
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // New hop-by-hop animation system
  useEffect(() => {
    if (!isPlaying || validHops.length === 0 || !userLocation) return

    animationRef.current.cancel = false

    // Speed affects travel time: slow=4000ms, medium=2500ms, fast=1500ms
    const baseTravelTime = animationSpeed === 0.25 ? 4000 : animationSpeed === 0.5 ? 2500 : 1500
    const arrivePause = 400

    const animateHop = async (hopIndex: number) => {
      if (animationRef.current.cancel) return

      let fromLat: number, fromLng: number, toLat: number, toLng: number

      if (hopIndex === -1) {
        fromLat = userLocation.lat
        fromLng = userLocation.lng
        toLat = validHops[0].lat!
        toLng = validHops[0].lng!
      } else if (hopIndex < validHops.length - 1) {
        fromLat = validHops[hopIndex].lat!
        fromLng = validHops[hopIndex].lng!
        toLat = validHops[hopIndex + 1].lat!
        toLng = validHops[hopIndex + 1].lng!
      } else {
        setIsPlaying(false)
        return
      }

      // Show packet at start position first
      setAnimationHop(hopIndex)
      setPacketPosition([fromLat, fromLng])
      setShowPacket(true)

      if (hopIndex === -1) {
        // FIRST HOP: Camera flies first, then envelope moves
        if (mapRef.current) {
          mapRef.current.flyTo([toLat, toLng], 6, { duration: 1.2 })
        }
        
        // Wait for camera to finish flying
        await new Promise(r => setTimeout(r, 1200))
        
        if (animationRef.current.cancel) return
      } else {
        // SUBSEQUENT HOPS: Envelope travels first, camera follows after a bit
        
        // Start envelope traveling immediately
        const travelTime = baseTravelTime
        const startTime = Date.now()

        const travelInterval = setInterval(() => {
          if (animationRef.current.cancel) {
            clearInterval(travelInterval)
            return
          }

          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / travelTime, 1)

          const newLat = fromLat + (toLat - fromLat) * progress
          const newLng = fromLng + (toLng - fromLng) * progress
          setPacketPosition([newLat, newLng])

          // Start camera after envelope has traveled a bit (20% of journey)
          if (progress >= 0.2 && mapRef.current) {
            mapRef.current.flyTo([toLat, toLng], 6, { duration: 1.2 })
          }

          if (progress >= 1) {
            clearInterval(travelInterval)
            setAnimationHop(hopIndex + 1)
            setPacketPosition([toLat, toLng])

            setTimeout(() => {
              if (!animationRef.current.cancel) {
                animateHop(hopIndex + 1)
              }
            }, arrivePause)
          }
        }, 30)
        
        return
      }

      // Animate packet traveling for first hop
      const travelTime = baseTravelTime
      const startTime = Date.now()

      const travelInterval = setInterval(() => {
        if (animationRef.current.cancel) {
          clearInterval(travelInterval)
          return
        }

        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / travelTime, 1)

        const newLat = fromLat + (toLat - fromLat) * progress
        const newLng = fromLng + (toLng - fromLng) * progress
        setPacketPosition([newLat, newLng])

        if (progress >= 1) {
          clearInterval(travelInterval)
          setAnimationHop(hopIndex + 1)
          setPacketPosition([toLat, toLng])

          setTimeout(() => {
            if (!animationRef.current.cancel) {
              animateHop(hopIndex + 1)
            }
          }, arrivePause)
        }
      }, 30)
    }

    animateHop(-1)

    return () => {
      animationRef.current.cancel = true
    }
  }, [isPlaying, animationSpeed, validHops.length, userLocation])

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
      width: 28px;
      height: 28px;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-shadow: 0 0 10px #00d4ff, 0 0 20px #00d4ff;
    ">📨</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })

  return (
    <div className="app">
      <header className="header">
        <h1>RouteCanvas</h1>
        <div className="header-auth">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">Welcome, {user?.username}!</span>
              <button onClick={loadSavedRoutes}>📁 My Routes</button>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>Login</button>
              <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>Register</button>
            </>
          )}
        </div>
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
            <>
              <button onClick={exportImage} className="export-button">
                📸 Export Image
              </button>
              {isAuthenticated && (
                <button onClick={saveRoute} className="save-button">
                  💾 Save Route
                </button>
              )}
              {saveMessage && <span className="save-message">{saveMessage}</span>}
            </>
          )}
          {loading && <div className="loading-note">A search takes approx 10-20 sec</div>}
          <div className="preset-destinations" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', color: '#888', marginRight: '0.25rem' }}>Popular:</span>
            {['google.com', 'cloudflare.com', 'github.com', 'amazon.com', 'facebook.com'].map(dest => (
              <button 
                key={dest} 
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  background: 'transparent', 
                  border: '1px solid #555', 
                  borderRadius: '4px',
                  color: '#bbb', 
                  fontSize: '0.7rem', 
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
                onClick={() => { setDestination(dest); runTrace(); }}
              >
                {dest.replace('.com', '')}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {traceData && validHops.length > 0 && (
          <div className="animation-controls">
            <div className="playback-controls">
              <button onClick={() => { setAnimationHop(-1); setIsPlaying(false); setShowPacket(false); setPacketPosition(null); }} title="Reset">🔄</button>
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
              <button className={animationSpeed === 0.25 ? 'active' : ''} onClick={() => setAnimationSpeed(0.25)}>Slow</button>
              <button className={animationSpeed === 0.5 ? 'active' : ''} onClick={() => setAnimationSpeed(0.5)}>Med</button>
              <button className={animationSpeed === 1 ? 'active' : ''} onClick={() => setAnimationSpeed(1)}>Fast</button>
            </div>
            <div className="theme-controls">
              <span>Theme:</span>
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

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}>×</button>
              {authMode === 'login' ? (
                <LoginForm onClose={() => setShowAuthModal(false)} />
              ) : (
                <RegisterForm onClose={() => setShowAuthModal(false)} />
              )}
              <div className="auth-switch">
                {authMode === 'login' ? (
                  <p>Don't have an account? <button onClick={() => setAuthMode('register')}>Register</button></p>
                ) : (
                  <p>Already have an account? <button onClick={() => setAuthMode('login')}>Login</button></p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Saved Routes Modal */}
        {showRoutes && (
          <div className="modal-overlay" onClick={() => setShowRoutes(false)}>
            <div className="modal routes-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowRoutes(false)}>×</button>
              <h3>My Saved Routes</h3>
              {savedRoutes.length === 0 ? (
                <p>No saved routes yet.</p>
              ) : (
                <ul className="routes-list">
                  {savedRoutes.map(route => (
                    <li key={route.id}>
                      <span onClick={() => loadRoute(route)} className="route-destination">
                        {route.destination}
                      </span>
                      <span className="route-date">
                        {new Date(route.created_at).toLocaleDateString()}
                      </span>
                      <button onClick={() => deleteSavedRoute(route.id)} className="delete-route">🗑️</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
