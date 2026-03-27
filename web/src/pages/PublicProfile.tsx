import { useState, useEffect } from 'react'
import { galleryApi } from '../auth/api'
import { useAuth } from '../auth/AuthContext'

interface PublicRoute {
  id: number
  destination: string
  created_at: string
  like_count: number
  view_count: number
  is_public: boolean
  art_thumbnail?: string
}

interface Profile {
  username: string
  created_at: string
  total_routes: number
  total_traces: number
  total_hops: number
  collection_items: number
  badges_count: number
  public_routes: PublicRoute[]
}

export default function PublicProfile({ username, onClose }: { username: string; onClose: () => void }) {
  const { token, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likedRoutes, setLikedRoutes] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadProfile()
  }, [username])

  useEffect(() => {
    if (isAuthenticated && token && profile?.public_routes) {
      checkLikeStatus()
    }
  }, [isAuthenticated, token, profile])

  const loadProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await galleryApi.getPublicProfile(username)
      setProfile(data)
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError('User not found')
    } finally {
      setLoading(false)
    }
  }

  const checkLikeStatus = async () => {
    if (!token || !profile) return
    const liked = new Set<number>()
    for (const route of profile.public_routes) {
      try {
        const status = await galleryApi.getLikeStatus(token, route.id)
        if (status.liked) liked.add(route.id)
      } catch (err) {
        console.error('Failed to check like status:', err)
      }
    }
    setLikedRoutes(liked)
  }

  const handleLike = async (routeId: number) => {
    if (!isAuthenticated || !token) return
    
    try {
      const result = await galleryApi.likeRoute(token, routeId)
      setProfile(prev => prev ? {
        ...prev,
        public_routes: prev.public_routes.map(r => 
          r.id === routeId ? { ...r, like_count: result.like_count } : r
        )
      } : null)
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <h2>User not found</h2>
          <p>The user @{username} doesn't exist or has no public profile.</p>
          <button onClick={onClose}>Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>@{profile.username}</h2>
        <p className="profile-member-since">Member since {formatDate(profile.created_at)}</p>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat-value">{profile.total_routes}</span>
          <span className="profile-stat-label">Public Routes</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{profile.total_traces}</span>
          <span className="profile-stat-label">Total Traces</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{profile.total_hops}</span>
          <span className="profile-stat-label">Total Hops</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{profile.collection_items}</span>
          <span className="profile-stat-label">Collection Items</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-value">{profile.badges_count}</span>
          <span className="profile-stat-label">Badges</span>
        </div>
      </div>

      <div className="profile-routes">
        <h3>Public Routes</h3>
        {profile.public_routes.length === 0 ? (
          <p className="profile-no-routes">No public routes yet.</p>
        ) : (
          <div className="profile-routes-grid">
            {profile.public_routes.map(route => (
              <div key={route.id} className="profile-route-card">
                <div className="route-card-art">
                  {route.art_thumbnail ? (
                    <img src={route.art_thumbnail} alt={route.destination} className="gallery-thumbnail" />
                  ) : (
                    <svg viewBox="0 0 200 100" className="route-art-preview">
                      <defs>
                        <linearGradient id={`profile-grad-${route.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3"/>
                          <stop offset="50%" stopColor="#ff00aa" stopOpacity="1"/>
                          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.3"/>
                        </linearGradient>
                      </defs>
                      <path d="M 20 80 Q 60 20, 100 50 T 180 30" fill="none" stroke={`url(#profile-grad-${route.id})`} strokeWidth="3"/>
                      <circle cx="20" cy="80" r="5" fill="#00d4ff"/>
                      <circle cx="100" cy="50" r="4" fill="#ff00aa"/>
                      <circle cx="180" cy="30" r="5" fill="#00d4ff"/>
                    </svg>
                  )}
                </div>
                <div className="route-card-info">
                  <span className="route-card-destination">{route.destination}</span>
                  <span className="route-card-date">{formatDate(route.created_at)}</span>
                  <div className="route-card-actions">
                    <button 
                      className={`like-button ${likedRoutes.has(route.id) ? 'liked' : ''}`}
                      onClick={() => handleLike(route.id)}
                      disabled={!isAuthenticated}
                    >
                      ❤️ {route.like_count}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}