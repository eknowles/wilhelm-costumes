import { createEffect, createSignal } from 'solid-js'
import { state, setState, DATA_MIN_YEAR, DATA_MAX_YEAR } from '../state'

export default function Sidebar() {
  let themeBtnEl!: HTMLButtonElement
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light')

  const toggleTheme = () => {
    const next = theme() === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    themeBtnEl.innerHTML = next === 'dark' ? '&#9728;' : '&#9789;'
  }

  const groups = ['city', 'venue', 'title', 'year'] as const

  return (
    <aside class="sidebar">
      <div class="sidebar-section">
        <label class="sidebar-label">Group by</label>
        <div class="seg seg-vertical">
          {groups.map(g => (
            <button
              classList={{ active: state.group === g }}
              onClick={() => setState('group', g)}
            >
              {g === 'city' ? 'City' : g === 'venue' ? 'Venue' : g === 'title' ? 'Title' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      <div class="sidebar-section">
        <label class="sidebar-label">Search</label>
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/>
          </svg>
          <input
            type="search"
            placeholder="Title, venue, or city…"
            value={state.search}
            onInput={e => setState('search', (e.target as HTMLInputElement).value)}
          />
        </div>
      </div>

      <div class="sidebar-section">
        <label class="sidebar-label">Year range</label>
        <YearRange />
      </div>

      <div class="sidebar-section">
        <label class="toggle-wrap">
          <input
            type="checkbox"
            checked={state.onlyWanted}
            onChange={e => setState('onlyWanted', (e.target as HTMLInputElement).checked)}
          />
          Only still to acquire
        </label>
      </div>

      <div class="sidebar-section">
        <button class="expand-btn" onClick={() => setState('expandAll', !state.expandAll)}>
          {state.expandAll ? 'Collapse all groups' : 'Expand all groups'}
        </button>
      </div>

      <div class="sidebar-section sidebar-legend">
        <span><span class="dot acq"></span> In collection</span>
        <span><span class="dot want"></span> To acquire</span>
      </div>

      <div class="sidebar-spacer"></div>

      <div class="sidebar-section sidebar-bottom">
        <div class="view-tabs">
          <button
            data-view="ledger"
            classList={{ active: state.view === 'ledger' }}
            onClick={() => setState('view', 'ledger')}
          >
            Ledger
          </button>
          <button
            data-view="timeline"
            classList={{ active: state.view === 'timeline' }}
            onClick={() => setState('view', 'timeline')}
          >
            Timeline
          </button>
        </div>
        <button
          class="theme-toggle"
          ref={themeBtnEl}
          aria-label="Toggle light mode"
          title="Toggle light mode"
          onClick={toggleTheme}
        >
          &#9789;
        </button>
      </div>
    </aside>
  )
}

function YearRange() {
  let sliderEl!: HTMLInputElement

  const fromInput = (e: Event) => {
    const v = parseInt((e.target as HTMLInputElement).value)
    if (!isNaN(v) && v >= DATA_MIN_YEAR && v <= state.rangeTo) setState('rangeFrom', v)
  }
  const toInput = (e: Event) => {
    const v = parseInt((e.target as HTMLInputElement).value)
    if (!isNaN(v) && v <= DATA_MAX_YEAR && v >= state.rangeFrom) setState('rangeTo', v)
  }

  createEffect(() => {
    const lo = DATA_MIN_YEAR
    const hi = DATA_MAX_YEAR
    const fromPct = ((state.rangeFrom - lo) / (hi - lo)) * 100
    const toPct = ((state.rangeTo - lo) / (hi - lo)) * 100
    sliderEl.style.background = `linear-gradient(90deg, var(--rule) ${fromPct}%, var(--gold) ${fromPct}%, var(--gold) ${toPct}%, var(--rule) ${toPct}%)`
  })

  return (
    <div class="year-range">
      <div class="yr-inputs">
        <label class="yr-field">
          <span class="yr-field-label">Start</span>
          <input
            type="number"
            min={DATA_MIN_YEAR}
            max={state.rangeTo}
            value={state.rangeFrom}
            onInput={fromInput}
          />
        </label>
        <span class="yr-sep">—</span>
        <label class="yr-field">
          <span class="yr-field-label">End</span>
          <input
            type="number"
            min={state.rangeFrom}
            max={DATA_MAX_YEAR}
            value={state.rangeTo}
            onInput={toInput}
          />
        </label>
        <button class="yr-reset" onClick={() => setState({ rangeFrom: DATA_MIN_YEAR, rangeTo: DATA_MAX_YEAR })}>
          Reset
        </button>
      </div>
      <input
        type="range"
        ref={sliderEl}
        class="yr-slider"
        min={DATA_MIN_YEAR}
        max={DATA_MAX_YEAR}
        value={state.rangeFrom}
        onInput={e => {
          const v = parseInt((e.target as HTMLInputElement).value)
          if (v <= state.rangeTo) setState('rangeFrom', v)
        }}
      />
    </div>
  )
}
