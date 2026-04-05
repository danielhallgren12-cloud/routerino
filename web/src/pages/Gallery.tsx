import { useState, useEffect } from 'react'
import { galleryApi, routesApi } from '../auth/api'
import { useAuth } from '../auth/AuthContext'
import PublicProfile from './PublicProfile'

interface GalleryRoute {
  id: number
  destination: string
  created_at: string
  like_count: number
  view_count: number
  username: string
  user_id: number
  art_thumbnail?: string
}

interface GalleryResponse {
  routes: GalleryRoute[]
  total: number
  page: number
  limit: number
}

export default function Gallery({ onClose }: { onClose: () => void }) {
  const { token, user, isAuthenticated } = useAuth()
  const [routes, setRoutes] = useState<GalleryRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('latest')
  const [likedRoutes, setLikedRoutes] = useState<Set<number>>(new Set())
  const [loadingMore, setLoadingMore] = useState(false)
  const [showProfile, setShowProfile] = useState<string | null>(null)
  const limit = 12

  const loadRoutes = async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const data = await galleryApi.getGallery(pageNum, limit, sort)
      if (append) {
        setRoutes(prev => [...prev, ...data.routes])
      } else {
        setRoutes(data.routes)
      }
      setTotal(data.total)
      setPage(pageNum)
    } catch (err) {
      console.error('Failed to load gallery:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadRoutes(1, false)
  }, [sort])

  useEffect(() => {
    if (isAuthenticated && token && routes.length > 0) {
      checkLikeStatus()
    }
  }, [isAuthenticated, token, routes])

  const checkLikeStatus = async () => {
    if (!token) return
    const liked = new Set<number>()
    for (const route of routes) {
      try {
        const status = await galleryApi.getLikeStatus(token, route.id)
        if (status.liked) liked.add(route.id)
      } catch (err) {
        console.error('Failed to check like status:', err)
      }
    }
    setLikedRoutes(liked)
  }

  const handleLike = async (routeId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!isAuthenticated || !token) return

    try {
      const result = await galleryApi.likeRoute(token, routeId)
      setRoutes(prev => prev.map(r =>
        r.id === routeId ? { ...r, like_count: result.like_count } : r
      ))
      if (result.liked) {
        setLikedRoutes(prev => new Set([...prev, routeId]))
      } else {
        setLikedRoutes(prev => {
          const next = new Set(prev)
          next.delete(routeId)
          return next
        })
      }
    } catch (err) {
      console.error('Failed to like route:', err)
    }
  }

  const handleInfiniteScroll = () => {
    if (loadingMore) return
    if (routes.length < total) {
      loadRoutes(page + 1, true)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        handleInfiniteScroll()
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadingMore, routes.length, total])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const viewProfile = (username: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowProfile(username)
  }

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h2>🌍 Public Gallery</h2>
        <div className="gallery-sort">
          <label>Sort by: </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="latest">Latest</option>
            <option value="popular">Most Liked</option>
            <option value="trending">Most Viewed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="gallery-loading">Loading gallery...</div>
      ) : routes.length === 0 ? (
        <div className="gallery-empty">
          <p>No public routes yet.</p>
          <p>Be the first to share your route art!</p>
        </div>
      ) : (
        <>
          <div className="gallery-grid">
            {routes.map(route => (
              <div key={route.id} className="gallery-card">
                <div className="gallery-card-art">
                  {route.art_thumbnail ? (
                    <img src={route.art_thumbnail} alt={route.destination} className="gallery-thumbnail" />
                  ) : (
                    <svg viewBox="0 0 200 200" className="gallery-route-art">
                      <defs>
                        <linearGradient id={`grad-${route.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4"/>
                          <stop offset="30%" stopColor="#ff00aa" stopOpacity="1"/>
                          <stop offset="70%" stopColor="#00d4ff" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#ff00aa" stopOpacity="0.4"/>
                        </linearGradient>
                        <filter id={`glow-${route.id}`}>
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                      </defs>
                      <path d="M 20 150 Q 60 50, 100 100 T 180 60" fill="none" stroke={`url(#grad-${route.id})`} strokeWidth="3" filter={`url(#glow-${route.id})`}/>
                      <circle cx="20" cy="150" r="6" fill="#00d4ff" filter={`url(#glow-${route.id})`}/>
                      <circle cx="100" cy="100" r="5" fill="#ff00aa" filter={`url(#glow-${route.id})`}/>
                      <circle cx="180" cy="60" r="6" fill="#00d4ff" filter={`url(#glow-${route.id})`}/>
                    </svg>
                  )}
                </div>
                <div className="gallery-card-info">
                  <div className="gallery-card-top">
                    <span className="gallery-destination">{route.destination}</span>
                  </div>
                  <div className="gallery-card-bottom">
                    <span
                      className="gallery-username"
                      onClick={(e) => viewProfile(route.username, e)}
                    >
                      @{route.username}
                    </span>
                    <button
                      className={`gallery-like-btn ${likedRoutes.has(route.id) ? 'liked' : ''}`}
                      onClick={(e) => handleLike(route.id, e)}
                      disabled={!isAuthenticated}
                      title={isAuthenticated ? 'Like' : 'Login to like'}
                    >
                      {likedRoutes.has(route.id) ? '❤️' : '🤍'} {route.like_count}
                    </button>
                    {route.user_id === user?.id && (
                      <button
                        className="gallery-delete-btn"
                        style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '4px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm('Are you sure you want to delete this route from the gallery?')) {
                            routesApi.deleteRoute(token!, route.id).then(() => loadRoutes(1, false))
                          }
                        }}
                        title="Delete from gallery"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {loadingMore && <div className="gallery-loading-more">Loading more...</div>}
          {routes.length >= total && routes.length > 0 && (
            <div className="gallery-end">You've seen all routes!</div>
          )}
        </>
      )}

      {showProfile && (
        <div className="gallery-profile-overlay" onClick={() => setShowProfile(null)}>
          <div className="gallery-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close gallery-close" onClick={() => setShowProfile(null)}>×</button>
            <PublicProfile username={showProfile} onClose={() => setShowProfile(null)} />
          </div>
        </div>
      )}
    </div>
  )
}