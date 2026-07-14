import type { Production } from './types'
import raw from './data.json'

function parseYear(y: string): number | null {
  if (!y) return null
  const m = String(y).match(/(\d{4})/)
  return m ? parseInt(m[1]) : null
}

const DATA: Production[] = (raw as Omit<Production, '_year'>[]).map(d => ({
  ...d,
  _year: parseYear(d.year),
}))

export default DATA
