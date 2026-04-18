import { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { useAuth } from '../auth/AuthContext'
import { routesApi } from '../auth/api'

const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

type ArtStyle = 'geometric' | 'neon' | 'constellation' | 'flow' | 'minimal' | 'retro'
type Layout = 'portrait' | 'square' | 'large'
type ColorTheme = 'default' | 'sunset' | 'ocean' | 'forest' | 'mono'
type BackgroundColor = 'white' | 'cream' | 'black' | 'lightgray' | 'deepblue' | 'sepia'

const colorPalettes: Record<ColorTheme, string[]> = {
  default: ['#00F0FF', '#FF2D92', '#00FFA3', '#FFD000', '#B04AFF', '#FF6B35'],
  sunset: ['#FF6B35', '#F7931E', '#FFD700', '#FF4500', '#FF1493', '#DC143C'],
  ocean: ['#00CED1', '#1E90FF', '#00BFFF', '#87CEEB', '#20B2AA', '#48D1CC'],
  forest: ['#228B22', '#6B8E23', '#8B4513', '#2E8B57', '#556B2F', '#808000'],
  mono: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF']
}

const backgroundPalettes: Record<BackgroundColor, string> = {
  white: '#ffffff',
  cream: '#faf8f5',
  black: '#000000',
  lightgray: '#f0f0f0',
  deepblue: '#050510',
  sepia: '#f5e6d3'
}

const backgroundSwatches: { id: BackgroundColor; color: string; name: string }[] = [
  { id: 'white', color: '#ffffff', name: 'White' },
  { id: 'cream', color: '#faf8f5', name: 'Cream' },
  { id: 'lightgray', color: '#f0f0f0', name: 'Light Gray' },
  { id: 'black', color: '#000000', name: 'Black' },
  { id: 'deepblue', color: '#050510', name: 'Deep Blue' },
  { id: 'sepia', color: '#f5e6d3', name: 'Sepia' }
]

const colorSwatches: { id: ColorTheme; color: string; name: string }[] = [
  { id: 'default', color: '#00F0FF', name: 'Cyan/Magenta' },
  { id: 'sunset', color: '#FF6B35', name: 'Sunset' },
  { id: 'ocean', color: '#00CED1', name: 'Ocean' },
  { id: 'forest', color: '#228B22', name: 'Forest' },
  { id: 'mono', color: '#333333', name: 'Mono' }
]

const styleAllowedColorThemes: Record<ArtStyle, ColorTheme[]> = {
  geometric: ['default', 'sunset', 'ocean', 'forest', 'mono'],
  neon: ['default', 'mono'],
  constellation: ['default', 'ocean'],
  flow: ['default', 'sunset', 'ocean', 'forest', 'mono'],
  minimal: ['mono'],
  retro: ['sunset', 'ocean', 'forest', 'mono']
}

const styleAllowedBackgrounds: Record<ArtStyle, BackgroundColor[]> = {
  geometric: ['white', 'cream', 'lightgray', 'black', 'sepia'],
  neon: ['black', 'deepblue'],
  constellation: ['black', 'deepblue'],
  flow: ['white', 'cream', 'lightgray'],
  minimal: ['white', 'lightgray'],
  retro: ['cream', 'sepia']
}

const styleDefaultBackground: Record<ArtStyle, BackgroundColor> = {
  geometric: 'white',
  neon: 'black',
  constellation: 'deepblue',
  flow: 'cream',
  minimal: 'white',
  retro: 'sepia'
}

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

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const RedditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

export function ArtGenerator({ traceData, userLocation }: ArtGeneratorProps) {
  const { token } = useAuth()
  const artRef = useRef<HTMLDivElement>(null)
  const hiddenRenderRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<ArtStyle>('neon')
  const [layout, setLayout] = useState<Layout>('square')
  const [customTitle, setCustomTitle] = useState('')
  const [includeStats, setIncludeStats] = useState(true)
  const [colorTheme, setColorTheme] = useState<ColorTheme>('default')
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>('black')
  const [customName, setCustomName] = useState('')
  const [includeName, setIncludeName] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [forGallery, setForGallery] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const ms = (val: number) => isMobile ? val * 1.5 : val
  const mfs = (val: number) => isMobile ? val * 0.8 : val

  useEffect(() => {
    setIsMobile(isMobileDevice())
    const savedColorTheme = localStorage.getItem('routecanvas_colorTheme') as ColorTheme
    const savedCustomName = localStorage.getItem('routecanvas_customName')
    if (savedColorTheme) setColorTheme(savedColorTheme)
    if (savedCustomName) {
      setCustomName(savedCustomName)
      setIncludeName(true)
    }
  }, [])

  const handleColorThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme)
    localStorage.setItem('routecanvas_colorTheme', theme)
  }

  const handleBackgroundColorChange = (bg: BackgroundColor) => {
    setBackgroundColor(bg)
  }

  const handleStyleChange = (newStyle: ArtStyle) => {
    setStyle(newStyle)
    setBackgroundColor(styleDefaultBackground[newStyle])
    if (!styleAllowedColorThemes[newStyle].includes(colorTheme)) {
      setColorTheme(styleAllowedColorThemes[newStyle][0])
    }
  }

  const handleCustomNameChange = (name: string) => {
    setCustomName(name)
    localStorage.setItem('routecanvas_customName', name)
  }

  const handleIncludeNameChange = (include: boolean) => {
    setIncludeName(include)
  }

  const validHops = traceData ? traceData.hops.filter(h => h.ip && h.ip !== '*') : []

  const generateImage = async (): Promise<Blob | null> => {
    if (!artRef.current) return null
    const canvas = await html2canvas(artRef.current, {
      scale: 10,
      useCORS: true,
      backgroundColor: backgroundPalettes[backgroundColor],
      logging: false
    })
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }

  const uploadToImgbb = async (blob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('image', blob)
      const response = await fetch('https://api.imgbb.com/1/upload?key=d36ebf28c0fc4601f8a9b63a4f1a4b77', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      return data.success ? data.data.url : null
    } catch {
      return null
    }
  }

  const getShareUrl = async (): Promise<string | null> => {
    const blob = await generateImage()
    if (!blob) return null
    const url = await uploadToImgbb(blob)
    return url
  }

  const getShareText = () => {
    const from = userLocation?.city || 'My Location'
    const to = traceData?.destination || 'destination'
    const hops = validHops.length
    const countries = new Set(validHops.filter(h => h.country).map(h => h.country)).size
    return `Check out my route from ${from} to ${to} - ${hops} hops across ${countries} countries!`
  }

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit' | 'instagram') => {
    setSharing(true)
    try {
      const text = getShareText()

      if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
        window.open(twitterUrl, '_blank', 'width=550,height=420')
      } else if (platform === 'facebook') {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}&u=${encodeURIComponent('https://www.routerino.com')}`
        window.open(facebookUrl, '_blank', 'width=550,height=420')
      } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.routerino.com')}`
        window.open(linkedinUrl, '_blank', 'width=550,height=420')
      } else if (platform === 'reddit') {
        const redditUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent('https://www.routerino.com')}`
        window.open(redditUrl, '_blank', 'width=550,height=420')
      }
    } finally {
      setSharing(false)
    }
  }

  const handleExport = async () => {
    if (!artRef.current) return
    setExporting(true)
    try {
      const blob = await generateImage()
      if (!blob) return
      const link = document.createElement('a')
      link.download = `route-art-${traceData?.destination || 'canvas'}-${Date.now()}.png`
      link.href = URL.createObjectURL(blob)
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleSaveToGallery = async () => {
    if (!traceData || !token) {
      setSaveMessage('Please login to save to gallery')
      return
    }

    if (!hiddenRenderRef.current) {
      setSaveMessage('Art not ready')
      return
    }

    try {
      setForGallery(true)
      await new Promise(resolve => setTimeout(resolve, 200))

      let thumbnailDataUrl = ''
      try {
        const captureElement = hiddenRenderRef.current
        if (!captureElement) throw new Error('Hidden render element not found')

        const fullCanvas = await html2canvas(captureElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: backgroundPalettes[backgroundColor],
          logging: false
        })

        console.log('Canvas size:', fullCanvas.width, fullCanvas.height)
        thumbnailDataUrl = fullCanvas.toDataURL('image/png', 0.9)
        console.log('Thumbnail length:', thumbnailDataUrl.length)
      } catch (canvasErr) {
        console.error('Canvas capture error:', canvasErr)
      } finally {
        setForGallery(false)
      }

      const hopsData = JSON.stringify(traceData.hops)
      await routesApi.shareRoute(token, traceData.destination, hopsData, true, thumbnailDataUrl || undefined)
      setSaveMessage(thumbnailDataUrl ? '✓ Saved to gallery!' : '✓ Saved to gallery! (no preview)')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save to gallery:', err)
      setSaveMessage('Failed to save')
    }
  }

  const dims = { w: 500, h: 500 }

  const stats = {
    hops: validHops.length,
    countries: new Set(validHops.filter(h => h.country).map(h => h.country)).size,
    avgRtt: validHops.length ? Math.round(validHops.filter(h => h.rtt).reduce((a, b) => a + (b.rtt || 0), 0) / validHops.filter(h => h.rtt).length) || 0 : 0
  }

  const colors = colorPalettes[colorTheme]
  const neonColors = colorPalettes[colorTheme].length >= 4 
    ? [colorPalettes[colorTheme][0], colorPalettes[colorTheme][1], colorPalettes[colorTheme][3], colorPalettes[colorTheme][2], colorPalettes[colorTheme][4], '#FFFFFF']
    : ['#00F0FF', '#FF2D92', '#FFD000', '#00FFA3', '#FF6BFF', '#FFFFFF']
  const retroColors = colorPalettes[colorTheme].length >= 5
    ? [colorPalettes[colorTheme][0], colorPalettes[colorTheme][1], colorPalettes[colorTheme][2], colorPalettes[colorTheme][3], colorPalettes[colorTheme][4], colorPalettes[colorTheme][5] || colorPalettes[colorTheme][0]]
    : ['#D4A500', '#CC5500', '#6B8E23', '#8B4513', '#B22222', '#CD853F']
  const getColor = (i: number) => colors[i % colors.length]
  const getNeonColor = (i: number) => neonColors[i % neonColors.length]
  const getRetroColor = (i: number) => retroColors[i % retroColors.length]

  const renderContent = (galleryMode = false) => {
    const hops = validHops.slice(0, 12)

    // Force square dimensions for gallery thumbnail
    const effectiveDims = galleryMode ? { w: 600, h: 600 } : dims
    const isSquare = effectiveDims.w === effectiveDims.h

    // ==================== GEOMETRIC ====================
    if (style === 'geometric') {
      return (
        <div style={{ background: backgroundPalettes[backgroundColor], width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
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
          
          <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 420 280">
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
            routerino.com
          </div>
          {includeName && customName && (
            <div style={{ position: 'absolute', bottom: 14, left: 18, fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#999' }}>
              Created by {customName}
            </div>
          )}
        </div>
      )
    }
    
    // ==================== NEON ====================
    if (style === 'neon') {
      const neonHopPositions = hops.map((h, i) => {
        const x = 40 + (i * (340 / Math.max(hops.length - 1, 1)))
        const y = 140 + Math.cos(i * 0.7) * 30
        return { x, y }
      })

      const pathD = neonHopPositions.length > 0 
        ? `M ${neonHopPositions.map((p, i) => {
            if (i === 0) return `${p.x} ${p.y}`
            if (i === 1) {
              const prev = neonHopPositions[0]
              const cpX = (prev.x + p.x) / 2
              const cpY = prev.y < p.y ? prev.y - 40 : prev.y + 40
              return `Q ${cpX} ${cpY}, ${p.x} ${p.y}`
            }
            return `T ${p.x} ${p.y}`
          }).join(' ')}`
        : ''

      return (
        <div style={{ background: backgroundPalettes[backgroundColor], width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          {/* Softer glowing border */}
          <div style={{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, border: '4px solid', borderImage: 'linear-gradient(135deg, #00F0FF, #FF2D92) 1', boxShadow: '0 0 40px rgba(0,240,255,0.4), 0 0 60px rgba(255,45,146,0.2)', pointerEvents: 'none', borderRadius: 4 }} />

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#ffffff', marginBottom: 20, textShadow: '0 0 30px #00F0FF, 0 0 60px #00F0FF, 0 0 90px #FF2D92' }}>
            {customTitle || 'THE JOURNEY'}
          </h1>

          <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 420 280">
            <defs>
              <filter id="neonGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="neonTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getNeonColor(0)} stopOpacity={0.9}/>
                <stop offset="50%" stopColor={getNeonColor(Math.floor(hops.length / 2))} stopOpacity={0.7}/>
                <stop offset="100%" stopColor={getNeonColor(hops.length - 1)} stopOpacity={0.9}/>
              </linearGradient>
            </defs>

            {/* Soft glow trail behind the path */}
            {hops.length > 1 && (
              <path d={pathD} fill="none" stroke="url(#neonTrailGrad)" strokeWidth={20} strokeLinecap="round" filter="url(#neonGlow)" opacity={0.25} />
            )}

            {/* Main glowing path - smooth flowing bezier curves */}
            {hops.length > 1 && (
              <path d={pathD} fill="none" stroke="url(#neonTrailGrad)" strokeWidth={4} strokeLinecap="round" filter="url(#neonGlow)" />
            )}

            {neonHopPositions.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={i === 0 || i === hops.length - 1 ? 16 : 12} fill={getNeonColor(i)} filter="url(#neonGlow)" />
                <circle cx={p.x} cy={p.y} r={i === 0 || i === hops.length - 1 ? 8 : 6} fill="#ffffff" opacity={0.8} />
              </g>
            ))}
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
            routerino.com
          </div>
          {includeName && customName && (
            <div style={{ position: 'absolute', bottom: 14, left: 18, fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#555' }}>
              Created by {customName}
            </div>
          )}
        </div>
      )
    }
    
    // ==================== CONSTELLATION ====================
    if (style === 'constellation') {
      if (isMobileDevice()) {
        return null
      }

      return (
        <div style={{ background: backgroundPalettes[backgroundColor], width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          {/* Softer glowing frame */}
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, border: '1px solid rgba(100,100,255,0.4)', borderRadius: 4, boxShadow: '0 0 40px rgba(100,100,255,0.2)', pointerEvents: 'none' }} />
          
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 44, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#ffffff', marginBottom: 20, textShadow: '0 0 20px rgba(100,100,255,0.8), 0 0 40px rgba(100,100,255,0.4)' }}>
            {customTitle || 'THE JOURNEY'}
          </h1>

          {/* Stars with varying opacity - hidden for gallery thumbnail */}
          {!isMobileDevice() && (
            <svg style={{ position: 'absolute', top: 0, left: 0 }} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 420 280">
              {Array.from({ length: 80 }, (_, i) => (
                <circle key={i} cx={Math.random() * 400 + 10} cy={Math.random() * 260 + 10} r={Math.random() * 1.5 + 0.5} fill="#fff" opacity={Math.random() * 0.6 + 0.2} />
              ))}
            </svg>
          )}
          
          {/* Planets with soft glow */}
          <div style={{ position: 'absolute', top: 35, right: 30, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B9d, #B04AFF)', boxShadow: '0 0 30px rgba(176,74,255,0.6)', filter: 'blur(1px)' }} />
          <div style={{ position: 'absolute', bottom: 50, left: 35, width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg, #00F0FF, #00FFA3)', boxShadow: '0 0 20px rgba(0,255,163,0.6)', filter: 'blur(1px)' }} />

          <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 420 280">
            <defs>
              <filter id="constGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="constTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getColor(0)} stopOpacity={0.8}/>
                <stop offset="50%" stopColor={getColor(Math.floor(hops.length / 2))} stopOpacity={0.6}/>
                <stop offset="100%" stopColor={getColor(hops.length - 1)} stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            {(() => {
              const constHopPositions = hops.map((h, i) => ({
                x: 40 + (i * (340 / Math.max(hops.length - 1, 1))),
                y: 140 + Math.cos(i * 0.7) * 30
              }))
              const pathD = constHopPositions.length > 0
                ? `M ${constHopPositions.map((p, i) => {
                    if (i === 0) return `${p.x} ${p.y}`
                    if (i === 1) {
                      const prev = constHopPositions[0]
                      const cpX = (prev.x + p.x) / 2
                      const cpY = prev.y < p.y ? prev.y - 40 : prev.y + 40
                      return `Q ${cpX} ${cpY}, ${p.x} ${p.y}`
                    }
                    return `T ${p.x} ${p.y}`
                  }).join(' ')}`
                : ''
              return (
                <>
                  <path d={pathD} fill="none" stroke="url(#constTrailGrad)" strokeWidth={12} strokeLinecap="round" filter="url(#constGlow)" opacity={0.2} />
                  <path d={pathD} fill="none" stroke="url(#constTrailGrad)" strokeWidth={2} strokeLinecap="round" filter="url(#constGlow)" />
                  {constHopPositions.map((p, i) => (
                    <g key={i} filter="url(#constGlow)">
                      <circle cx={p.x} cy={p.y} r={i === 0 || i === hops.length - 1 ? 12 : 7} fill={getColor(i)} />
                      <circle cx={p.x} cy={p.y} r={i === 0 || i === hops.length - 1 ? 6 : 4} fill="#ffffff" opacity={0.9} />
                    </g>
                  ))}
                </>
              )
            })()}
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
            routerino.com
          </div>
          {includeName && customName && (
            <div style={{ position: 'absolute', bottom: 14, left: 18, fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#555' }}>
              Created by {customName}
            </div>
          )}
        </div>
      )
    }
    
// ==================== FLOW ====================
    if (style === 'flow') {
      return (
        <div style={{ background: backgroundPalettes[backgroundColor], width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          {/* Softer elegant frame */}
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, border: '2px solid #d0c8c0', borderRadius: 4, pointerEvents: 'none' }} />

          {/* Curved corner flourishes - at actual SVG corners */}
          <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 475 475">
            {/* Top-left corner - curves inward from top edge to left edge */}
            <path d="M 10,50 Q 10,10 50,10" fill="none" stroke="#c0b8b0" strokeWidth={2} />
            {/* Top-right corner - curves inward from top edge to right edge */}
            <path d="M 490,10 Q 530,10 530,50" fill="none" stroke="#c0b8b0" strokeWidth={2} />
            {/* Bottom-left corner - curves inward from bottom edge to left edge */}
            <path d="M 10,617 Q 10,657 50,657" fill="none" stroke="#c0b8b0" strokeWidth={2} />
            {/* Bottom-right corner - curves inward from bottom edge to right edge */}
            <path d="M 490,657 Q 530,657 530,617" fill="none" stroke="#c0b8b0" strokeWidth={2} />
          </svg>

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 400, fontStyle: 'italic', letterSpacing: 1, color: '#2a2a2a', marginBottom: 20 }}>
            {customTitle || 'Journey'}
          </h1>

          <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 440 280">
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getColor(0)} stopOpacity={0.9}/>
                <stop offset="50%" stopColor={getColor(Math.floor(hops.length / 2))} stopOpacity={0.7}/>
                <stop offset="100%" stopColor={getColor(hops.length - 1)} stopOpacity={0.9}/>
              </linearGradient>
              <filter id="flowBlur">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            {(() => {
              const flowHopPositions = hops.map((h, i) => ({
                x: 30 + (i * (380 / Math.max(hops.length - 1, 1))),
                y: 140 + Math.cos(i * 0.7) * 30
              }))
              const pathD = flowHopPositions.length > 0
                ? `M ${flowHopPositions.map((p, i) => {
                    if (i === 0) return `${p.x} ${p.y}`
                    if (i === 1) {
                      const prev = flowHopPositions[0]
                      const cpX = (prev.x + p.x) / 2
                      const cpY = prev.y < p.y ? prev.y - 40 : prev.y + 40
                      return `Q ${cpX} ${cpY}, ${p.x} ${p.y}`
                    }
                    return `T ${p.x} ${p.y}`
                  }).join(' ')}`
                : ''
              return (
                <>
                  <path d={pathD} fill="none" stroke="url(#flowGrad)" strokeWidth={24} strokeLinecap="round" filter="url(#flowBlur)" opacity={0.2} />
                  <path d={pathD} fill="none" stroke="url(#flowGrad)" strokeWidth={8} strokeLinecap="round" />
                  <path d={pathD} fill="none" stroke="url(#flowGrad)" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
                  {flowHopPositions.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={i === 0 || i === hops.length - 1 ? 16 : 11} fill={getColor(i)} />
                  ))}
                </>
              )
            })()}
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
            routerino.com
          </div>
          {includeName && customName && (
            <div style={{ position: 'absolute', bottom: 14, left: 18, fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#aaa' }}>
              Created by {customName}
            </div>
          )}
        </div>
      )
    }
    
    // ==================== MINIMAL ====================
    if (style === 'minimal') {
      return (
        <div style={{ background: backgroundPalettes[backgroundColor], width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.08 }} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 420 260">
            <line x1={40} y1={260} x2={380} y2={260} stroke="#000" strokeWidth={1} />
            <circle cx={210} cy={140} r={4} fill="#000" />
            <circle cx={210} cy={140} r={160} fill="none" stroke="#000" strokeWidth={0.5} />
          </svg>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 52, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase', color: '#000000', marginBottom: 28 }}>
            {customTitle || 'ROUTE'}
          </h1>

          <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 420 260">
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
            routerino.com
          </div>
          {includeName && customName && (
            <div style={{ position: 'absolute', bottom: 14, left: 18, fontFamily: 'system-ui, sans-serif', fontSize: 9, color: '#bbb', letterSpacing: 1 }}>
              Created by {customName}
            </div>
          )}
        </div>
      )
    }
    
    // ==================== RETRO ====================
    if (style === 'retro') {
      return (
        <div style={{ background: backgroundPalettes[backgroundColor], width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', boxSizing: 'border-box' }}>
          {/* Softer vintage frame */}
          <div style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, border: '6px solid #8B4513', borderRadius: 8, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, border: '2px solid #D4A500', borderRadius: 4, pointerEvents: 'none' }} />
          
          {/* Curved sun rays - hidden for gallery thumbnail */}
          {!isMobileDevice() && (
            <svg style={{ position: 'absolute', top: 0, left: 0 }} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 420 260">
              {Array.from({ length: 16 }, (_, i) => {
                const angle = (i * 22.5) * Math.PI / 180
                const x1 = 210 + Math.cos(angle) * 80
                const y1 = 140 + Math.sin(angle) * 80
                const x2 = 210 + Math.cos(angle) * 110
                const y2 = 140 + Math.sin(angle) * 110
                return <path key={i} d={`M ${x1},${y1} Q ${210 + Math.cos(angle) * 95},${140 + Math.sin(angle) * 95} ${x2},${y2}`} fill="none" stroke="#D4A500" strokeWidth={2} opacity={0.25} />
              })}
            </svg>
          )}
          
          {/* Paper texture - hidden on mobile */}
          {!isMobileDevice() && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)', pointerEvents: 'none' }} />
          )}
          
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, fontWeight: 700, letterSpacing: 4, color: '#8B4513', marginBottom: 18, textShadow: '2px 2px 0 #D4A500' }}>
            {customTitle || 'THE JOURNEY'}
           </h1>
           
          <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 420 260">
             <defs>
               <filter id="retroGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="retroTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getRetroColor(0)} stopOpacity={0.8}/>
                <stop offset="50%" stopColor={getRetroColor(Math.floor(hops.length / 2))} stopOpacity={0.6}/>
                <stop offset="100%" stopColor={getRetroColor(hops.length - 1)} stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            {(() => {
              const retroHopPositions = hops.map((h, i) => ({
                x: 40 + (i * (340 / Math.max(hops.length - 1, 1))),
                y: 130 + Math.cos(i * 0.7) * 30
              }))
              const pathD = retroHopPositions.length > 0
                ? `M ${retroHopPositions.map((p, i) => {
                    if (i === 0) return `${p.x} ${p.y}`
                    if (i === 1) {
                      const prev = retroHopPositions[0]
                      const cpX = (prev.x + p.x) / 2
                      const cpY = prev.y < p.y ? prev.y - 40 : prev.y + 40
                      return `Q ${cpX} ${cpY}, ${p.x} ${p.y}`
                    }
                    return `T ${p.x} ${p.y}`
                  }).join(' ')}`
                : ''
              return (
                <>
                  <path d={pathD} fill="none" stroke="url(#retroTrailGrad)" strokeWidth={16} strokeLinecap="round" filter="url(#retroGlow)" opacity={0.25} />
                  <path d={pathD} fill="none" stroke="url(#retroTrailGrad)" strokeWidth={6} strokeLinecap="round" opacity={0.5} />
                  <path d={pathD} fill="none" stroke="url(#retroTrailGrad)" strokeWidth={2} strokeLinecap="round" />
                  {!isMobile && retroHopPositions.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={i === 0 || i === hops.length - 1 ? 15 : 10} fill={getRetroColor(i)} stroke="#8B4513" strokeWidth={2} />
                      <circle cx={p.x} cy={p.y} r={i === 0 || i === hops.length - 1 ? 7 : 5} fill="#f5e6d3" opacity={0.6} />
                    </g>
                  ))}
                </>
              )
            })()}
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
            routerino.com
          </div>
          {includeName && customName && (
            <div style={{ position: 'absolute', bottom: 12, left: 18, fontFamily: 'Georgia, serif', fontSize: 9, color: '#8B4513', letterSpacing: 0.5, opacity: 0.7 }}>
              Created by {customName}
            </div>
          )}
        </div>
      )
    }
    
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => handleStyleChange('neon')} style={{ padding: '12px 20px', border: style === 'neon' ? '2px solid #FF2D92' : '1px solid #444', background: style === 'neon' ? 'rgba(255,45,146,0.15)' : 'transparent', color: style === 'neon' ? '#FF2D92' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>NEON</button>
        <button onClick={() => handleStyleChange('geometric')} style={{ padding: '12px 20px', border: style === 'geometric' ? '2px solid #00F0FF' : '1px solid #444', background: style === 'geometric' ? 'rgba(0,240,255,0.15)' : 'transparent', color: style === 'geometric' ? '#00F0FF' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>GEOMETRIC</button>
        {!isMobileDevice() && <button onClick={() => handleStyleChange('constellation')} style={{ padding: '12px 20px', border: style === 'constellation' ? '2px solid #a855f7' : '1px solid #444', background: style === 'constellation' ? 'rgba(168,85,247,0.15)' : 'transparent', color: style === 'constellation' ? '#a855f7' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>CONSTELLATION</button>}
        <button onClick={() => handleStyleChange('flow')} style={{ padding: '12px 20px', border: style === 'flow' ? '2px solid #FF6B9d' : '1px solid #444', background: style === 'flow' ? 'rgba(255,107,157,0.15)' : 'transparent', color: style === 'flow' ? '#FF6B9d' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>FLOW</button>
        <button onClick={() => handleStyleChange('minimal')} style={{ padding: '12px 20px', border: style === 'minimal' ? '2px solid #333' : '1px solid #444', background: style === 'minimal' ? 'rgba(51,51,51,0.2)' : 'transparent', color: style === 'minimal' ? '#fff' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>MINIMAL</button>
        <button onClick={() => handleStyleChange('retro')} style={{ padding: '12px 20px', border: style === 'retro' ? '2px solid #D4A500' : '1px solid #444', background: style === 'retro' ? 'rgba(212,165,0,0.15)' : 'transparent', color: style === 'retro' ? '#D4A500' : '#888', borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>RETRO</button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ color: '#666', fontSize: 10, fontFamily: 'Space Mono, monospace', marginRight: 4 }}>|</span>
        {colorSwatches.filter(s => styleAllowedColorThemes[style].includes(s.id)).map((swatch) => (
          <button
            key={swatch.id}
            onClick={() => handleColorThemeChange(swatch.id)}
            title={swatch.name}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: swatch.color,
              border: colorTheme === swatch.id ? '3px solid #fff' : '2px solid #444',
              cursor: 'pointer',
              padding: 0,
              boxShadow: colorTheme === swatch.id ? `0 0 10px ${swatch.color}` : 'none',
              transform: colorTheme === swatch.id ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s'
            }}
          />
        ))}
        <span style={{ color: '#666', fontSize: 10, fontFamily: 'Space Mono, monospace', marginLeft: 8, marginRight: 4 }}>|</span>
        <span style={{ color: '#666', fontSize: 10, fontFamily: 'Space Mono, monospace', marginRight: 4 }}>BG:</span>
        {backgroundSwatches.filter(s => styleAllowedBackgrounds[style].includes(s.id)).map((swatch) => (
          <button
            key={swatch.id}
            onClick={() => handleBackgroundColorChange(swatch.id)}
            title={swatch.name}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: swatch.color,
              border: backgroundColor === swatch.id ? '3px solid #fff' : '2px solid #444',
              cursor: 'pointer',
              padding: 0,
              boxShadow: backgroundColor === swatch.id ? `0 0 8px ${swatch.color}` : 'none',
              transform: backgroundColor === swatch.id ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          />
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Custom title" style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #444', background: '#0a0a0a', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 12, width: 160 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 11, fontFamily: 'Space Mono, monospace', cursor: 'pointer' }}>
          <input type="checkbox" checked={includeStats} onChange={(e) => setIncludeStats(e.target.checked)} />STATS
        </label>
        {includeName && (
          <input type="text" value={customName} onChange={(e) => handleCustomNameChange(e.target.value)} placeholder="Your name" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #444', background: '#0a0a0a', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 11, width: 120 }} />
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 11, fontFamily: 'Space Mono, monospace', cursor: 'pointer' }}>
          <input type="checkbox" checked={includeName} onChange={(e) => handleIncludeNameChange(e.target.checked)} />NAME
        </label>
      </div>
      
      <div ref={artRef} data-layout={layout} className="art-preview-wrapper" style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        borderRadius: 4
      }}>
        {renderContent()}
      </div>
      
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={handleExport} disabled={exporting || !traceData} style={{ padding: '14px 40px', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #00F0FF, #FF2D92)', color: '#fff', cursor: exporting ? 'wait' : 'pointer', opacity: exporting ? 0.6 : 1, fontFamily: 'Syne, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
          {exporting ? 'Generating...' : 'Download Art'}
        </button>
        <button onClick={handleSaveToGallery} disabled={!traceData} style={{ padding: '14px 40px', fontSize: 14, fontWeight: 700, border: '2px solid #00F0FF', borderRadius: 12, background: 'transparent', color: '#00F0FF', cursor: !traceData ? 'not-allowed' : 'pointer', opacity: !traceData ? 0.5 : 1, fontFamily: 'Syne, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
          🖼️ Save to Gallery
        </button>
      </div>

      {saveMessage && (
        <div style={{ marginTop: 12, color: saveMessage.includes('✓') ? '#00FFA3' : '#ff4444', fontSize: 13, fontWeight: 600 }}>
          {saveMessage}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ color: '#666', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>SHARE:</span>
        <button onClick={() => handleShare('twitter')} disabled={sharing || !traceData} title="Share on X (Twitter)" style={{ padding: '10px 14px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', borderRadius: 8, cursor: sharing ? 'wait' : 'pointer', opacity: sharing ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TwitterIcon />
        </button>
        <button onClick={() => handleShare('facebook')} disabled={sharing || !traceData} title="Share on Facebook" style={{ padding: '10px 14px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', borderRadius: 8, cursor: sharing ? 'wait' : 'pointer', opacity: sharing ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FacebookIcon />
        </button>
        <button onClick={() => handleShare('linkedin')} disabled={sharing || !traceData} title="Share on LinkedIn" style={{ padding: '10px 14px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', borderRadius: 8, cursor: sharing ? 'wait' : 'pointer', opacity: sharing ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LinkedInIcon />
        </button>
        <button onClick={() => handleShare('reddit')} disabled={sharing || !traceData} title="Share on Reddit" style={{ padding: '10px 14px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', borderRadius: 8, cursor: sharing ? 'wait' : 'pointer', opacity: sharing ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RedditIcon />
        </button>
        
      </div>

      {/* Hidden div for thumbnail capture - always renders square for gallery */}
      <div
        ref={hiddenRenderRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '600px',
          height: '600px',
          overflow: 'hidden'
        }}
      >
        <div style={{ width: '600px', height: '600px' }}>
          {renderContent(true)}
        </div>
      </div>
    </div>
  )
}