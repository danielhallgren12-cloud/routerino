import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'

type ArtStyle = 'geometric' | 'neon' | 'constellation' | 'flow' | 'minimal' | 'retro'
type Layout = 'portrait' | 'square' | 'large'

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

interface ArtGeneratorProps {
  traceData: {
    destination: string
    hops: Hop[]
    fingerprint_id?: string
  } | null
  userLocation: { city?: string; country?: string } | null
}

export function ArtGenerator({ traceData, userLocation }: ArtGeneratorProps) {
  const artRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<ArtStyle>('geometric')
  const [layout, setLayout] = useState<Layout>('portrait')
  const [customTitle, setCustomTitle] = useState('')
  const [includeStats, setIncludeStats] = useState(true)
  const [exporting, setExporting] = useState(false)

  const validHops = traceData ? traceData.hops.filter(h => h.ip && h.ip !== '*') : []

  const handleExport = async () => {
    if (!artRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(artRef.current, {
        scale: 10,
        useCORS: true,
        backgroundColor: style === 'neon' ? '#000000' : style === 'constellation' ? '#050510' : style === 'minimal' ? '#fafafa' : style === 'retro' ? '#f5e6d3' : '#ffffff',
        logging: false
      })
      const link = document.createElement('a')
      link.download = `route-art-${traceData?.destination || 'canvas'}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const dims = layout === 'portrait' ? { w: 500, h: 667 } : layout === 'square' ? { w: 600, h: 600 } : { w: 800, h: 1067 }

  const stats = {
    hops: validHops.length,
    countries: new Set(validHops.filter(h => h.country).map(h => h.country)).size,
    avgRtt: validHops.length ? Math.round(validHops.filter(h => h.rtt).reduce((a, b) => a + (b.rtt || 0), 0) / validHops.filter(h => h.rtt).length) || 0 : 0
  }

  const colors = ['#00F0FF', '#FF2D92', '#00FFA3', '#FFD000', '#B04AFF', '#FF6B35']
  const neonColors = ['#00F0FF', '#FF2D92', '#FFD000', '#00FFA3', '#FF6BFF', '#FFFFFF']
  const retroColors = ['#D4A500', '#CC5500', '#6B8E23', '#8B4513', '#B22222', '#CD853F']
  const getColor = (i: number) => colors[i % colors.length]
  const getNeonColor = (i: number) => neonColors[i % neonColors.length]
  const getRetroColor = (i: number) => retroColors[i % retroColors.length]

  const renderContent = () => {
    const hops = validHops.slice(0, 12)
    
    // ==================== GEOMETRIC ====================
    if (style === 'geometric') {
      return (
        <div style={{ background: '#ffffff', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          {/* Frame */}
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, border: '3px solid #0a0a0a', borderRadius: 2, pointerEvents: 'none' }} />
          
          {/* Corner accents */}
          <div style={{ position: 'absolute', top: 18, left: 18, width: 40, height: 40, borderTop: '4px solid #00F0FF', borderLeft: '4px solid #00F0FF' }} />
          <div style={{ position: 'absolute', top: 18, right: 18, width: 40, height: 40, borderTop: '4px solid #FF2D92', borderRight: '4px solid #FF2D92' }} />
          <div style={{ position: 'absolute', bottom: 18, left: 18, width: 40, height: 40, borderBottom: '4px solid #FF2D92', borderLeft: '4px solid #FF2D92' }} />
          <div style={{ position: 'absolute', bottom: 18, right: 18, width: 40, height: 40, borderBottom: '4px solid #00F0FF', borderRight: '4px solid #00F0FF' }} />
          
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 44, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#0a0a0a', marginBottom: 20 }}>
            {customTitle || 'THE JOURNEY'}
          </h1>
          
          <svg width={420} height={280} viewBox="0 0 420 280">
            {hops.map((h, i) => {
              const x = 40 + (i * (340 / Math.max(hops.length - 1, 1)))
              const y = 140 + Math.sin(i * 0.8) * 60
              const nx = i < hops.length - 1 ? 40 + ((i + 1) * (340 / Math.max(hops.length - 1, 1))) : x
              const ny = i < hops.length - 1 ? 140 + Math.sin((i + 1) * 0.8) * 60 : y
              return (
                <g key={i}>
                  {i < hops.length - 1 && <line x1={x} y1={y} x2={nx} y2={ny} stroke={getColor(i)} strokeWidth={6} strokeLinecap="round" />}
                  <circle cx={x} cy={y} r={i === 0 || i === hops.length - 1 ? 14 : 9} fill={getColor(i)} />
                </g>
              )
            })}
          </svg>
          
          <div style={{ display: 'flex', gap: 30, marginTop: 20, fontFamily: 'Space Mono, monospace', fontSize: 13, letterSpacing: 1 }}>
            <span style={{ color: '#00F0FF', fontWeight: 700 }}>{userLocation?.city?.toUpperCase() || 'START'}</span>
            <span style={{ color: '#999' }}>→</span>
            <span style={{ color: '#FF2D92', fontWeight: 700 }}>{traceData?.destination?.toUpperCase()}</span>
          </div>
          
          {includeStats && (
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: 1 }}>
              <span style={{ color: '#00F0FF' }}>{stats.hops} HOPS</span>
              <span style={{ color: '#FF2D92' }}>{stats.countries} COUNTRIES</span>
              <span style={{ color: '#00FFA3' }}>{stats.avgRtt}ms</span>
            </div>
          )}
          
          <div style={{ position: 'absolute', bottom: 14, right: 18, fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#999' }}>
            routecanvas.app
          </div>
        </div>
      )
    }
    
    // ==================== NEON ====================
    if (style === 'neon') {
      return (
        <div style={{ background: '#000000', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          {/* Glowing border */}
          <div style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, border: '4px solid', borderImage: 'linear-gradient(135deg, #00F0FF, #FF2D92) 1', boxShadow: '0 0 30px rgba(0,240,255,0.3)', pointerEvents: 'none' }} />
          
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#ffffff', marginBottom: 20, textShadow: '0 0 20px #00F0FF, 0 0 40px #00F0FF' }}>
            {customTitle || 'THE JOURNEY'}
          </h1>
          
          <svg width={420} height={280} viewBox="0 0 420 280">
            <defs>
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {hops.map((h, i) => {
              const x = 40 + (i * (340 / Math.max(hops.length - 1, 1)))
              const y = 140 + Math.cos(i * 0.7) * 50
              const nx = i < hops.length - 1 ? 40 + ((i + 1) * (340 / Math.max(hops.length - 1, 1))) : x
              const ny = i < hops.length - 1 ? 140 + Math.cos((i + 1) * 0.7) * 50 : y
              const color = getNeonColor(i)
              return (
                <g key={i} filter="url(#neonGlow)">
                  {i < hops.length - 1 && <line x1={x} y1={y} x2={nx} y2={ny} stroke={color} strokeWidth={4} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />}
                  <circle cx={x} cy={y} r={i === 0 || i === hops.length - 1 ? 14 : 10} fill={color} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
                </g>
              )
            })}
          </svg>
          
          <div style={{ display: 'flex', gap: 30, marginTop: 20, fontFamily: 'Space Mono, monospace', fontSize: 13, letterSpacing: 1 }}>
            <span style={{ color: '#00F0FF', fontWeight: 700, textShadow: '0 0 10px #00F0FF' }}>{userLocation?.city?.toUpperCase() || 'START'}</span>
            <span style={{ color: '#444' }}>→</span>
            <span style={{ color: '#FF2D92', fontWeight: 700, textShadow: '0 0 10px #FF2D92' }}>{traceData?.destination?.toUpperCase()}</span>
          </div>
          
          {includeStats && (
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: 1 }}>
              <span style={{ color: '#00F0FF', textShadow: '0 0 8px #00F0FF' }}>{stats.hops} HOPS</span>
              <span style={{ color: '#FFD000', textShadow: '0 0 8px #FFD000' }}>{stats.countries} COUNTRIES</span>
              <span style={{ color: '#00FFA3', textShadow: '0 0 8px #00FFA3' }}>{stats.avgRtt}ms</span>
            </div>
          )}
          
          <div style={{ position: 'absolute', bottom: 14, right: 18, fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#555' }}>
            routecanvas.app
          </div>
        </div>
      )
    }
    
    // ==================== CONSTELLATION ====================
    if (style === 'constellation') {
      return (
        <div style={{ background: 'linear-gradient(135deg, #050510, #0a0a1a, #0f0f25)', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          {/* Glowing frame */}
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, border: '1px solid rgba(100,100,255,0.4)', borderRadius: 2, boxShadow: '0 0 30px rgba(100,100,255,0.15)', pointerEvents: 'none' }} />
          
          {/* Stars */}
          <svg width={420} height={280} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            {Array.from({ length: 60 }, (_, i) => (
              <circle key={i} cx={Math.random() * 400 + 10} cy={Math.random() * 260 + 10} r={Math.random() * 1.5 + 0.5} fill="#fff" opacity={Math.random() * 0.5 + 0.2} />
            ))}
          </svg>
          
          {/* Planets */}
          <div style={{ position: 'absolute', top: 25, right: 40, width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B9d, #B04AFF)', boxShadow: '0 0 20px rgba(176,74,255,0.5)' }} />
          <div style={{ position: 'absolute', bottom: 50, left: 35, width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, #00F0FF, #00FFA3)', boxShadow: '0 0 15px rgba(0,255,163,0.5)' }} />
          
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 600, letterSpacing: 5, textTransform: 'uppercase', color: '#e8e8ff', marginBottom: 20, textShadow: '0 0 20px rgba(100,100,255,0.5)' }}>
            {customTitle || 'THE JOURNEY'}
          </h1>
          
          <svg width={420} height={280} viewBox="0 0 420 280">
            <defs>
              <filter id="constGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {hops.map((h, i) => {
              const x = 40 + (i * (340 / Math.max(hops.length - 1, 1)))
              const y = 140 + Math.cos(i * 0.6) * 50
              const nx = i < hops.length - 1 ? 40 + ((i + 1) * (340 / Math.max(hops.length - 1, 1))) : x
              const ny = i < hops.length - 1 ? 140 + Math.cos((i + 1) * 0.6) * 50 : y
              return (
                <g key={i} filter="url(#constGlow)">
                  {i < hops.length - 1 && <line x1={x} y1={y} x2={nx} y2={ny} stroke={getColor(i)} strokeWidth={2} opacity={0.7} />}
                  <circle cx={x} cy={y} r={i === 0 || i === hops.length - 1 ? 10 : 6} fill={getColor(i)} />
                  <circle cx={x} cy={y} r={i === 0 || i === hops.length - 1 ? 5 : 3} fill="#fff" opacity={0.9} />
                </g>
              )
            })}
          </svg>
          
          <div style={{ display: 'flex', gap: 30, marginTop: 20, fontFamily: 'Space Mono, monospace', fontSize: 13, color: '#b0b0d0', letterSpacing: 1 }}>
            <span>{userLocation?.city?.toUpperCase() || 'START'}</span>
            <span style={{ color: '#555' }}>→</span>
            <span>{traceData?.destination?.toUpperCase()}</span>
          </div>
          
          {includeStats && (
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#707090', letterSpacing: 1 }}>
              <span>{stats.hops} HOPS</span>
              <span>{stats.countries} COUNTRIES</span>
              <span>{stats.avgRtt}ms</span>
            </div>
          )}
          
          <div style={{ position: 'absolute', bottom: 14, right: 18, fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#555' }}>
            routecanvas.app
          </div>
        </div>
      )
    }
    
    // ==================== FLOW ====================
    if (style === 'flow') {
      return (
        <div style={{ background: '#faf8f5', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          {/* Elegant frame */}
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, border: '2px solid #e0d8d0', borderRadius: 2, pointerEvents: 'none' }} />
          
          {/* Corner flourishes */}
          <div style={{ position: 'absolute', top: 18, left: 25, width: 45, height: 45, borderBottom: '1.5px solid #c0b8b0', borderLeft: '1.5px solid #c0b8b0' }} />
          <div style={{ position: 'absolute', top: 18, right: 25, width: 45, height: 45, borderBottom: '1.5px solid #c0b8b0', borderRight: '1.5px solid #c0b8b0' }} />
          <div style={{ position: 'absolute', bottom: 18, left: 25, width: 45, height: 45, borderTop: '1.5px solid #c0b8b0', borderLeft: '1.5px solid #c0b8b0' }} />
          <div style={{ position: 'absolute', bottom: 18, right: 25, width: 45, height: 45, borderTop: '1.5px solid #c0b8b0', borderRight: '1.5px solid #c0b8b0' }} />
          
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 400, fontStyle: 'italic', letterSpacing: 1, color: '#2a2a2a', marginBottom: 20 }}>
            {customTitle || 'Journey'}
          </h1>
          
          <svg width={440} height={280} viewBox="0 0 440 280">
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getColor(0)} stopOpacity={0.9}/>
                <stop offset="50%" stopColor={getColor(Math.floor(hops.length / 2))} stopOpacity={0.7}/>
                <stop offset="100%" stopColor={getColor(hops.length - 1)} stopOpacity={0.9}/>
              </linearGradient>
              <filter id="flowBlur">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
            <path d={`M ${hops.map((h, i) => `${30 + (i * (380 / Math.max(hops.length - 1, 1)))} ${140 + Math.sin(i * 0.7) * 70}`).join(' L ')}`} 
                  fill="none" stroke="url(#flowGrad)" strokeWidth={12} strokeLinecap="round" filter="url(#flowBlur)" opacity={0.35} />
            <path d={`M ${hops.map((h, i) => `${30 + (i * (380 / Math.max(hops.length - 1, 1)))} ${140 + Math.sin(i * 0.7) * 70}`).join(' L ')}`} 
                  fill="none" stroke="url(#flowGrad)" strokeWidth={5} strokeLinecap="round" />
            {hops.map((h, i) => (
              <circle key={i} cx={30 + (i * (380 / Math.max(hops.length - 1, 1)))} cy={140 + Math.sin(i * 0.7) * 70} r={i === 0 || i === hops.length - 1 ? 14 : 10} fill={getColor(i)} />
            ))}
          </svg>
          
          <div style={{ marginTop: 24, fontFamily: 'Playfair Display, serif', fontSize: 14, color: '#666', fontStyle: 'italic' }}>
            {userLocation?.city || 'From here'} — {traceData?.destination || 'To there'}
          </div>
          
          {includeStats && (
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#999', letterSpacing: 1 }}>
              <span>{stats.hops} HOPS</span>
              <span>{stats.countries} COUNTRIES</span>
              <span>{stats.avgRtt}ms AVG</span>
            </div>
          )}
          
          <div style={{ position: 'absolute', bottom: 14, right: 18, fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#aaa' }}>
            routecanvas.app
          </div>
        </div>
      )
    }
    
    // ==================== MINIMAL ====================
    if (style === 'minimal') {
      return (
        <div style={{ background: '#fafafa', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          <svg width={420} height={280} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.1 }}>
            <line x1={40} y1={260} x2={380} y2={260} stroke="#000" strokeWidth={1} />
            <circle cx={210} cy={140} r={3} fill="#000" />
            <circle cx={210} cy={140} r={160} fill="none" stroke="#000" strokeWidth={0.5} />
          </svg>
          
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 52, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase', color: '#000000', marginBottom: 28 }}>
            {customTitle || 'ROUTE'}
          </h1>
          
          <svg width={420} height={260} viewBox="0 0 420 260">
            {hops.map((h, i) => {
              const x = 40 + (i * (340 / Math.max(hops.length - 1, 1)))
              const y = 130 + Math.sin(i * 0.6) * 40
              const nx = i < hops.length - 1 ? 40 + ((i + 1) * (340 / Math.max(hops.length - 1, 1))) : x
              const ny = i < hops.length - 1 ? 130 + Math.sin((i + 1) * 0.6) * 40 : y
              return (
                <g key={i}>
                  {i < hops.length - 1 && <line x1={x} y1={y} x2={nx} y2={ny} stroke="#000" strokeWidth={2} strokeLinecap="round" />}
                  <circle cx={x} cy={y} r={i === 0 || i === hops.length - 1 ? 6 : 3} fill="#000" />
                </g>
              )
            })}
          </svg>
          
          <div style={{ display: 'flex', gap: 30, marginTop: 28, fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 500, letterSpacing: 3, color: '#333' }}>
            <span>{userLocation?.city?.toUpperCase() || 'START'}</span>
            <span style={{ color: '#ccc' }}>→</span>
            <span>{traceData?.destination?.toUpperCase()}</span>
          </div>
          
          {includeStats && (
            <div style={{ display: 'flex', gap: 20, marginTop: 14, fontFamily: 'system-ui, sans-serif', fontSize: 10, color: '#888', letterSpacing: 2 }}>
              <span>{stats.hops} HOPS</span>
              <span>{stats.countries} COUNTRIES</span>
              <span>{stats.avgRtt}ms</span>
            </div>
          )}
          
          <div style={{ position: 'absolute', bottom: 14, right: 18, fontFamily: 'system-ui, sans-serif', fontSize: 9, color: '#bbb', letterSpacing: 1 }}>
            routecanvas.app
          </div>
        </div>
      )
    }
    
    // ==================== RETRO ====================
    if (style === 'retro') {
      return (
        <div style={{ background: '#f5e6d3', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          {/* Vintage frame */}
          <div style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, border: '6px solid #8B4513', borderRadius: 4, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, border: '2px solid #D4A500', pointerEvents: 'none' }} />
          
          {/* Sun rays */}
          <svg width={420} height={280} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30) * Math.PI / 180
              const x1 = 210 + Math.cos(angle) * 70
              const y1 = 140 + Math.sin(angle) * 70
              const x2 = 210 + Math.cos(angle) * 100
              const y2 = 140 + Math.sin(angle) * 100
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4A500" strokeWidth={2} opacity={0.3} />
            })}
          </svg>
          
          {/* Paper texture */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)', pointerEvents: 'none' }} />
          
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, fontWeight: 700, letterSpacing: 4, color: '#8B4513', marginBottom: 18, textShadow: '2px 2px 0 #D4A500' }}>
            {customTitle || 'THE JOURNEY'}
          </h1>
          
          <svg width={420} height={260} viewBox="0 0 420 260">
            {hops.map((h, i) => {
              const x = 40 + (i * (340 / Math.max(hops.length - 1, 1)))
              const y = 130 + Math.sin(i * 0.5 + 1) * 45
              const nx = i < hops.length - 1 ? 40 + ((i + 1) * (340 / Math.max(hops.length - 1, 1))) : x
              const ny = i < hops.length - 1 ? 130 + Math.sin((i + 1) * 0.5 + 1) * 45 : y
              const color = getRetroColor(i)
              return (
                <g key={i}>
                  {i < hops.length - 1 && (
                    <>
                      <line x1={x} y1={y} x2={nx} y2={ny} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.4} />
                      <line x1={x} y1={y} x2={nx} y2={ny} stroke={color} strokeWidth={3} strokeLinecap="round" strokeDasharray={i % 2 === 0 ? '0' : '8,4'} />
                    </>
                  )}
                  <circle cx={x} cy={y} r={i === 0 || i === hops.length - 1 ? 14 : 9} fill={color} stroke="#8B4513" strokeWidth={2} />
                </g>
              )
            })}
          </svg>
          
          <div style={{ display: 'flex', gap: 30, marginTop: 18, fontFamily: 'Georgia, serif', fontSize: 14, fontStyle: 'italic', color: '#6B8E23', letterSpacing: 1 }}>
            <span>{userLocation?.city || 'From'}</span>
            <span style={{ color: '#8B4513' }}>→</span>
            <span>{traceData?.destination || 'To'}</span>
          </div>
          
          {includeStats && (
            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontFamily: 'Georgia, serif', fontSize: 11, color: '#8B4513', letterSpacing: 1 }}>
              <span>{stats.hops} HOPS</span>
              <span>{stats.countries} LANDS</span>
              <span>{stats.avgRtt}ms</span>
            </div>
          )}
          
          <div style={{ position: 'absolute', bottom: 12, right: 18, fontFamily: 'Georgia, serif', fontSize: 9, color: '#8B4513', letterSpacing: 0.5, opacity: 0.7 }}>
            routecanvas.app
          </div>
        </div>
      )
    }
    
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setStyle('geometric')} style={{ padding: '12px 20px', border: style === 'geometric' ? '2px solid #00F0FF' : '1px solid #444', background: style === 'geometric' ? 'rgba(0,240,255,0.15)' : 'transparent', color: style === 'geometric' ? '#00F0FF' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>GEOMETRIC</button>
        <button onClick={() => setStyle('neon')} style={{ padding: '12px 20px', border: style === 'neon' ? '2px solid #FF2D92' : '1px solid #444', background: style === 'neon' ? 'rgba(255,45,146,0.15)' : 'transparent', color: style === 'neon' ? '#FF2D92' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>NEON</button>
        <button onClick={() => setStyle('constellation')} style={{ padding: '12px 20px', border: style === 'constellation' ? '2px solid #a855f7' : '1px solid #444', background: style === 'constellation' ? 'rgba(168,85,247,0.15)' : 'transparent', color: style === 'constellation' ? '#a855f7' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>CONSTELLATION</button>
        <button onClick={() => setStyle('flow')} style={{ padding: '12px 20px', border: style === 'flow' ? '2px solid #FF6B9d' : '1px solid #444', background: style === 'flow' ? 'rgba(255,107,157,0.15)' : 'transparent', color: style === 'flow' ? '#FF6B9d' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>FLOW</button>
        <button onClick={() => setStyle('minimal')} style={{ padding: '12px 20px', border: style === 'minimal' ? '2px solid #333' : '1px solid #444', background: style === 'minimal' ? 'rgba(51,51,51,0.2)' : 'transparent', color: style === 'minimal' ? '#fff' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>MINIMAL</button>
        <button onClick={() => setStyle('retro')} style={{ padding: '12px 20px', border: style === 'retro' ? '2px solid #D4A500' : '1px solid #444', background: style === 'retro' ? 'rgba(212,165,0,0.15)' : 'transparent', color: style === 'retro' ? '#D4A500' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>RETRO</button>
      </div>
      
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <select value={layout} onChange={(e) => setLayout(e.target.value as Layout)} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #444', background: '#1a1a1a', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 12 }}>
          <option value="portrait">Portrait (5×7)</option>
          <option value="square">Square (6×6)</option>
          <option value="large">Large (8×10)</option>
        </select>
        <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Custom title" style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #444', background: '#0a0a0a', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 12, width: 160 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 11, fontFamily: 'Space Mono, monospace', cursor: 'pointer' }}>
          <input type="checkbox" checked={includeStats} onChange={(e) => setIncludeStats(e.target.checked)} />STATS
        </label>
      </div>
      
      <div ref={artRef} style={{ width: dims.w, height: dims.h, maxWidth: '100%', maxHeight: '60vh', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', borderRadius: 4, overflow: 'auto' }}>
        {renderContent()}
      </div>
      
      <button onClick={handleExport} disabled={exporting || !traceData} style={{ padding: '14px 40px', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #00F0FF, #FF2D92)', color: '#fff', cursor: exporting ? 'wait' : 'pointer', opacity: exporting ? 0.6 : 1, fontFamily: 'Syne, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
        {exporting ? 'Generating...' : 'Download Art'}
      </button>
    </div>
  )
}