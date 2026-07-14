import type { Production } from './types'
import raw from './data.json'

function normalizeYear(y: string): string {
  if (!y || y === 'n/d') return y || ''
  // Normalize multi-year ranges: "1885-86" → "1885–1886", "1900-01" → "1900–1901"
  const m = y.match(/^(\d{4})\s*[–—-]\s*(\d{2,4})$/)
  if (m) {
    const start = m[1]
    const end = m[2]
    const fullEnd = end.length === 2 ? start.slice(0, 2) + end : end
    return `${start}–${fullEnd}`
  }
  return y
}

function parseYear(y: string): number | null {
  if (!y) return null
  const m = String(y).match(/(\d{4})/)
  return m ? parseInt(m[1]) : null
}

const DATA: Production[] = (raw as Omit<Production, '_year'>[]).map(d => ({
  ...d,
  year: normalizeYear(d.year),
  _year: parseYear(d.year),
}))

export default DATA
