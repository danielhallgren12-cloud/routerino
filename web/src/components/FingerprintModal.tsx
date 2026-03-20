import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'

interface FingerprintModalProps {
  fingerprintId: string
  destination: string
  hops: Array<{
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
  }>
  userLocation: { city?: string; country?: string } | null
  onClose: () => void
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

export default function FingerprintModal({ fingerprintId, destination, hops, userLocation, onClose }: FingerprintModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const validHops = hops.filter(h => h.ip && h.ip !== '*')
  const countries = new Set(validHops.filter(h => h.country).map(h => h.country))
  const cities = new Set(validHops.filter(h => h.city).map(h => h.city))
  const companies = new Set(validHops.filter(h => h.isp).map(h => h.isp))
  const asns = new Set(validHops.filter(h => h.asn).map(h => h.asn))

  const generateImage = async () => {
    if (!cardRef.current) return null
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#1a1a2e',
      logging: false
    })
    return new Promise<Blob | null>((resolve) => {
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

  const getShareText = () => {
    const from = userLocation?.city || 'My Location'
    const to = destination
    return `Check out my route from ${from} to ${to} - ${validHops.length} hops across ${countries.size} countries!`
  }

  const handleShare = async (platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit' | 'instagram') => {
    setSharing(true)
    try {
      const text = getShareText()

      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420')
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420')
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=550,height=420')
      } else if (platform === 'reddit') {
        window.open(`https://www.reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=550,height=420')
      } else if (platform === 'instagram') {
        const imageUrl = await getShareUrl()
        if (imageUrl) {
          window.open(`https://www.instagram.com/create/selection/?img=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(text)}`, '_blank')
        }
      }
    } finally {
      setSharing(false)
    }
  }

  const getShareUrl = async (): Promise<string | null> => {
    const blob = await generateImage()
    if (!blob) return null
    return uploadToImgbb(blob)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await generateImage()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `route-fingerprint-${fingerprintId}-${Date.now()}.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="fingerprint-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div ref={cardRef} className="fingerprint-share-card">
          <div className="fingerprint-share-header">
            <span className="fingerprint-share-icon">🏷️</span>
            <span className="fingerprint-share-title">Network Fingerprint</span>
            <span className="fingerprint-share-id">{fingerprintId}</span>
          </div>
          
          <div className="fingerprint-share-dest">
            {userLocation?.city || 'Unknown'} → {destination}
          </div>
          
          <div className="fingerprint-share-stats">
            <div className="fps-stat">
              <span className="fps-value">{validHops.length}</span>
              <span className="fps-label">Hops</span>
            </div>
            <div className="fps-stat">
              <span className="fps-value">{countries.size}</span>
              <span className="fps-label">Countries</span>
            </div>
            <div className="fps-stat">
              <span className="fps-value">{cities.size}</span>
              <span className="fps-label">Cities</span>
            </div>
            <div className="fps-stat">
              <span className="fps-value">{companies.size}</span>
              <span className="fps-label">Companies</span>
            </div>
            <div className="fps-stat">
              <span className="fps-value">{asns.size}</span>
              <span className="fps-label">ASNs</span>
            </div>
          </div>
          
          <div className="fingerprint-share-footer">
            routecanvas.app
          </div>
        </div>
        
        <div className="fingerprint-share-actions">
          <button 
            onClick={handleDownload} 
            disabled={downloading}
            className="fps-download-btn"
          >
            {downloading ? 'Generating...' : 'Download'}
          </button>
          
          <div className="fps-social-buttons">
            <button onClick={() => handleShare('twitter')} disabled={sharing} title="Share on X" className="fps-social-btn">
              <TwitterIcon />
            </button>
            <button onClick={() => handleShare('facebook')} disabled={sharing} title="Share on Facebook" className="fps-social-btn">
              <FacebookIcon />
            </button>
            <button onClick={() => handleShare('linkedin')} disabled={sharing} title="Share on LinkedIn" className="fps-social-btn">
              <LinkedInIcon />
            </button>
            <button onClick={() => handleShare('reddit')} disabled={sharing} title="Share on Reddit" className="fps-social-btn">
              <RedditIcon />
            </button>
            <button onClick={() => handleShare('instagram')} disabled={sharing} title="Share on Instagram" className="fps-social-btn">
              <InstagramIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
