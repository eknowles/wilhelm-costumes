export interface Production {
  city: string
  venue: string
  title: string
  year: string
  status: 'Acquired' | 'To be acquired'
  notes: string
  _year: number | null
}

export type GroupMode = 'city' | 'venue' | 'title' | 'year'
export type ViewMode = 'ledger' | 'timeline'

export interface AppStore {
  group: GroupMode
  search: string
  onlyWanted: boolean
  view: ViewMode
  expandAll: boolean
  rangeFrom: number
  rangeTo: number
}
