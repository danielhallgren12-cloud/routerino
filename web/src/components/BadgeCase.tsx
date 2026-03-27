import { useState, useEffect } from 'react'
import { routesApi } from '../auth/api'

interface Badge {
  id: string
  name: string
  desc: string
  icon: string
  category: string
  earned: boolean
}

interface BadgeCaseProps {
  token: string
  onClose: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  milestone: 'Milestones',
  discovery: 'Discovery',
  streak: 'Streaks',
  art: 'Art',
  first_discovery: 'First Discoveries',
}

export default function BadgeCase({ token, onClose }: BadgeCaseProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalAvailable, setTotalAvailable] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    routesApi.getBadges(token)
      .then(data => {
        setBadges(data.badges || [])
        setTotalEarned(data.total_earned || 0)
        setTotalAvailable(data.total_available || 0)
      })
      .catch(err => console.error('Failed to load badges:', err))
      .finally(() => setLoading(false))
  }, [token])

  const categories = [...new Set(badges.map(b => b.category))]
  const filteredBadges = activeCategory 
    ? badges.filter(b => b.category === activeCategory)
    : badges

  return (
    <div className="badgecase-modal">
      <button className="modal-close" onClick={onClose}>×</button>
      <h3>🏆 Your Badges</h3>
      
      <div className="badgecase-stats">
        <div className="badge-stat">
          <span className="badge-stat-value">{totalEarned}</span>
          <span className="badge-stat-label">Earned</span>
        </div>
        <div className="badge-stat">
          <span className="badge-stat-value">{totalAvailable}</span>
          <span className="badge-stat-label">Total</span>
        </div>
      </div>

      <div className="badgecase-tabs">
        <button 
          className={`badge-tab ${!activeCategory ? 'active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All ({badges.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`badge-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      <div className="badgecase-grid">
        {loading ? (
          <div className="badgecase-loading">Loading...</div>
        ) : (
          filteredBadges.map(badge => (
            <div 
              key={badge.id} 
              className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}
              title={badge.desc}
            >
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.desc}</div>
              {badge.earned && <div className="badge-check">✓</div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}