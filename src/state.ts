import { createStore } from 'solid-js/store'
import type { GroupMode, ViewMode } from './types'
import DATA from './data'

const allYears = DATA.map(d => d._year).filter(v => v !== null)
export const DATA_MIN_YEAR = Math.min(...allYears)
export const DATA_MAX_YEAR = Math.max(...allYears)

export interface AppStore {
  group: GroupMode
  search: string
  onlyWanted: boolean
  view: ViewMode
  expandAll: boolean
  rangeFrom: number
  rangeTo: number
}

export const [state, setState] = createStore<AppStore>({
  group: 'city',
  search: '',
  onlyWanted: false,
  view: 'ledger',
  expandAll: false,
  rangeFrom: DATA_MIN_YEAR,
  rangeTo: DATA_MAX_YEAR,
})
