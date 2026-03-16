import { useState, useEffect } from 'react'
import { routesApi } from '../auth/api'
import { getRarity, RARITY_COLORS, RARITY_LABELS, Rarity } from '../utils/rarity'

interface InventoryProps {
  token: string
  collection: {
    destinations: number; countries: number; cities: number; isps: number;
    ips: number; asns: number; total_traces: number; total_hops: number; fingerprints: number;
    items?: { destinations: string[]; countries: string[]; cities: string[]; isps: string[]; ips: string[]; asns: string[]; fingerprints: string[] };
  }
  onClose: () => void
}

type Category = 'destinations' | 'countries' | 'cities' | 'isps' | 'ips' | 'asns' | 'fingerprints'

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'destinations', label: 'Destinations', icon: '📍' },
  { key: 'countries', label: 'Countries', icon: '🌍' },
  { key: 'cities', label: 'Cities', icon: '🌆' },
  { key: 'isps', label: 'ISPs', icon: '🏢' },
  { key: 'ips', label: 'IPs', icon: '🔢' },
  { key: 'asns', label: 'ASNs', icon: '🔢' },
  { key: 'fingerprints', label: 'Fingerprints', icon: '🏷️' },
]

export default function Inventory({ token, collection, onClose }: InventoryProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('destinations')
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (collection.items && collection.items[activeCategory]) {
      setItems(collection.items[activeCategory])
    } else {
      setLoading(true)
      routesApi.getCollectionCategory(token, activeCategory)
        .then(data => setItems(data.items || []))
        .catch(err => console.error('Failed to load category:', err))
        .finally(() => setLoading(false))
    }
  }, [activeCategory, token, collection.items])

  const counts = {
    destinations: collection.destinations,
    countries: collection.countries,
    cities: collection.cities,
    isps: collection.isps,
    ips: collection.ips,
    asns: collection.asns,
    fingerprints: collection.fingerprints,
  }

  return (
    <div className="inventory-modal">
      <button className="modal-close" onClick={onClose}>×</button>
      <h3>📦 Your Inventory</h3>
      <div className="inventory-stats">
        <div className="inv-stat"><span className="inv-stat-value">{collection.total_traces}</span><span className="inv-stat-label">Traces</span></div>
        <div className="inv-stat"><span className="inv-stat-value">{collection.total_hops}</span><span className="inv-stat-label">Hops</span></div>
      </div>
      <div className="inventory-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`inventory-tab ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.icon} {cat.label} <span className="tab-count">({counts[cat.key]})</span>
          </button>
        ))}
      </div>
      <div className="inventory-items">
        {loading ? (
          <div className="inventory-loading">Loading...</div>
        ) : items.length === 0 ? (
          <div className="inventory-empty">No {activeCategory} yet. Start tracing!</div>
        ) : (
          <div className="inventory-list">
            {items.map((item, idx) => {
              const rarity = getRarity(activeCategory, item)
              return (
                <div key={idx} className="inventory-item" style={{ borderLeftColor: RARITY_COLORS[rarity] }}>
                  <span className="item-value">{item}</span>
                  <span className="item-rarity" style={{ color: RARITY_COLORS[rarity] }}>{RARITY_LABELS[rarity]}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}