import { useState, useEffect, useMemo } from 'react'
import { routesApi } from '../auth/api'
import { getRarity, RARITY_COLORS, RARITY_LABELS, Rarity } from '../utils/rarity'
import { getCountryName } from '../utils/countryNames'

interface InventoryProps {
  token: string
  collection: {
    destinations: number; countries: number; cities: number; companies: number;
    ips: number; asns: number; total_traces: number; total_hops: number; fingerprints: number;
    new_items?: { destinations: string[]; countries: string[]; cities: string[]; companies: string[]; ips: string[]; asns: string[]; fingerprints: string[] };
    items?: { destinations: string[]; countries: string[]; cities: string[]; companies: string[]; ips: string[]; asns: string[]; fingerprints: string[] };
  }
  onClose: () => void
  initialCategory?: string | null
}

type Category = 'destinations' | 'countries' | 'cities' | 'companies' | 'ips' | 'asns' | 'fingerprints'
type SortOption = 'name-asc' | 'name-desc' | 'rarity-asc' | 'rarity-desc' | 'recent'

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'destinations', label: 'Destinations', icon: '📍' },
  { key: 'countries', label: 'Countries', icon: '🌍' },
  { key: 'cities', label: 'Cities', icon: '🌆' },
  { key: 'companies', label: 'Companies', icon: '🏢' },
  { key: 'ips', label: 'IPs', icon: '🔢' },
  { key: 'asns', label: 'ASNs', icon: '🔢' },
  { key: 'fingerprints', label: 'Fingerprints', icon: '🏷️' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'rarity-asc', label: 'Rarity (Common→Rare)' },
  { value: 'rarity-desc', label: 'Rarity (Rare→Common)' },
  { value: 'recent', label: 'Recently Added' },
]

const RARITY_ORDER: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
}

export default function Inventory({ token, collection, onClose, initialCategory }: InventoryProps) {
  const [activeCategory, setActiveCategory] = useState<Category>((initialCategory as Category) || 'destinations')
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')

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

  const sortedItems = useMemo(() => {
    const sorted = [...items]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.localeCompare(b)
        case 'name-desc':
          return b.localeCompare(a)
        case 'rarity-asc':
          return RARITY_ORDER[getRarity(activeCategory, a)] - RARITY_ORDER[getRarity(activeCategory, b)]
        case 'rarity-desc':
          return RARITY_ORDER[getRarity(activeCategory, b)] - RARITY_ORDER[getRarity(activeCategory, a)]
        case 'recent':
          // Items are stored with newest at the end, so reverse to show newest first
          return 0
        default:
          return 0
      }
    })
    // For "recent" sort, reverse to show newest (new items) first
    if (sortBy === 'recent') {
      sorted.reverse()
    }
    return sorted
  }, [items, sortBy, activeCategory])

  const counts = {
    destinations: collection.destinations,
    countries: collection.countries,
    cities: collection.cities,
    companies: collection.companies,
    ips: collection.ips,
    asns: collection.asns,
    fingerprints: collection.fingerprints,
  }

  const newCounts = collection.new_items || {}
  const getNewCount = (key: keyof typeof counts) => newCounts[key]?.length || 0

  return (
    <div className="inventory-modal">
      <button className="modal-close" onClick={onClose}>×</button>
      <h3>📦 Your Inventory</h3>
      <div className="inventory-stats">
        <div className="inv-stat"><span className="inv-stat-value">{collection.total_traces}</span><span className="inv-stat-label">Traces</span></div>
        <div className="inv-stat"><span className="inv-stat-value">{collection.total_hops}</span><span className="inv-stat-label">Hops</span></div>
      </div>
      <div className="inventory-tabs">
        {CATEGORIES.map(cat => {
          const newCount = getNewCount(cat.key as keyof typeof counts)
          return (
            <button
              key={cat.key}
              className={`inventory-tab ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.icon} {cat.label} <span className="tab-count">({counts[cat.key]})</span>
              {newCount > 0 && <span className="tab-new-badge">+{newCount}</span>}
            </button>
          )
        })}
      </div>
      <div className="inventory-sort">
        <label>Sort: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="inventory-items">
        {loading ? (
          <div className="inventory-loading">Loading...</div>
        ) : sortedItems.length === 0 ? (
          <div className="inventory-empty">No {activeCategory} yet. Start tracing!</div>
        ) : (
          <div className="inventory-list">
            {sortedItems.map((item, idx) => {
              const rarity = getRarity(activeCategory, item)
              const displayValue = activeCategory === 'countries' ? `${item} - ${getCountryName(item)}` : item
              const isNew = newCounts[activeCategory]?.includes(item) || false
              return (
                <div key={idx} className="inventory-item" style={{ borderLeftColor: RARITY_COLORS[rarity] }}>
                  <span className="item-value">
                    {displayValue}
                    {isNew && <span className="item-new-badge">NEW</span>}
                  </span>
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