export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

const COMMON_COUNTRIES = ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'JP', 'NL', 'BR', 'IN']
const UNCOMMON_COUNTRIES = ['IT', 'ES', 'KR', 'SG', 'CH', 'SE', 'NO', 'DK', 'FI', 'AT']
const RARE_COUNTRIES = ['PL', 'CZ', 'RU', 'UA', 'TR', 'ZA', 'AE', 'MX', 'AR', 'CL']
const EPIC_COUNTRIES = ['TH', 'VN', 'ID', 'MY', 'PH', 'NZ', 'IE', 'PT', 'GR', 'HU']
const LEGENDARY_COUNTRIES = ['IS', 'LU', 'EE', 'LV', 'LT', 'HR', 'BG', 'RO', 'SK', 'SI', 'CY', 'MT', 'IS']

const COMMON_ISPS = ['Cloudflare', 'AWS', 'Google', 'Microsoft', 'Akamai', 'Fastly', 'Cloudfront']
const UNCOMMON_ISPS = ['Comcast', 'AT&T', 'Verizon', 'T-Mobile', 'Vodafone', 'Orange', 'Deutsche Telekom']
const RARE_ISPS = ['Bredband2', 'Telia', 'Telenor', ' Elisa', 'Swisscom', 'KPN', 'Telefonica']

const COMMON_IPS = ['1.1.1.1', '8.8.8.8', '8.8.4.4', '1.0.0.1', '208.67.222.222', '208.67.220.220']

export function getCountryRarity(country: string): Rarity {
  if (LEGENDARY_COUNTRIES.includes(country)) return 'legendary'
  if (EPIC_COUNTRIES.includes(country)) return 'epic'
  if (RARE_COUNTRIES.includes(country)) return 'rare'
  if (UNCOMMON_COUNTRIES.includes(country)) return 'uncommon'
  return 'common'
}

export function getIspRarity(isp: string): Rarity {
  if (RARE_ISPS.some(i => isp.toLowerCase().includes(i.toLowerCase()))) return 'rare'
  if (UNCOMMON_ISPS.some(i => isp.toLowerCase().includes(i.toLowerCase()))) return 'uncommon'
  if (COMMON_ISPS.some(i => isp.toLowerCase().includes(i.toLowerCase()))) return 'common'
  return 'uncommon'
}

export function getIpRarity(ip: string): Rarity {
  if (COMMON_IPS.includes(ip)) return 'common'
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) return 'common'
  return 'uncommon'
}

export function getAsnRarity(asn: string): Rarity {
  const commonAsns = ['AS13335', 'AS15169', 'AS8075', 'AS20940', 'AS54113']
  if (commonAsns.includes(asn)) return 'common'
  return 'uncommon'
}

export function getDestinationRarity(destination: string): Rarity {
  const commonDestinations = ['google.com', 'cloudflare.com', 'amazon.com', 'microsoft.com', 'facebook.com', 'github.com', 'apple.com']
  if (commonDestinations.some(d => destination.toLowerCase().includes(d))) return 'common'
  return 'uncommon'
}

export function getRarity(category: string, value: string): Rarity {
  switch (category) {
    case 'countries':
      return getCountryRarity(value)
    case 'isps':
      return getIspRarity(value)
    case 'ips':
      return getIpRarity(value)
    case 'asns':
      return getAsnRarity(value)
    case 'destinations':
      return getDestinationRarity(value)
    default:
      return 'common'
  }
}