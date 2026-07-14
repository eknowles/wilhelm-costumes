import type { Production } from './types'
import DATA from './data'
import { state, DATA_MIN_YEAR, DATA_MAX_YEAR } from './state'

export function groupKey(d: Production): string {
  if (state.group === 'city') return d.city
  if (state.group === 'venue') return d.venue + ' — ' + d.city
  if (state.group === 'year') return d.year || 'Unknown'
  return d.title
}

export function filteredData(): Production[] {
  let list = DATA
  if (state.onlyWanted) list = list.filter(d => d.status === 'To be acquired')
  const q = state.search.trim().toLowerCase()
  if (q) list = list.filter(d => (d.title + ' ' + d.venue + ' ' + d.city).toLowerCase().includes(q))
  const rangeActive = state.rangeFrom > DATA_MIN_YEAR || state.rangeTo < DATA_MAX_YEAR
  if (rangeActive) {
    list = list.filter(d => d._year === null || (d._year >= state.rangeFrom && d._year <= state.rangeTo))
  }
  return list
}
