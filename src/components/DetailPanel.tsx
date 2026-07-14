import { createMemo, For, Show } from 'solid-js'
import type { Production } from '../types'
import DATA from '../data'
import { escapeHtml } from '../helpers'

export default function DetailPanel(props: {
  production: Production | null
  onClose: () => void
  onSelect?: (d: Production) => void
}) {
  const sameVenue = createMemo(() => {
    if (!props.production) return []
    return DATA
      .filter(d => d.venue === props.production!.venue && d.city === props.production!.city && d !== props.production!)
      .sort((a, b) => (a._year ?? 9999) - (b._year ?? 9999))
  })

  const sameTitle = createMemo(() => {
    if (!props.production) return []
    return DATA
      .filter(d => d.title === props.production!.title && d !== props.production!)
      .sort((a, b) => (a._year ?? 9999) - (b._year ?? 9999))
  })

  return (
    <div class="panel-overlay" classList={{ open: !!props.production }} onClick={props.onClose}>
      <div class="detail-panel" classList={{ open: !!props.production }} onClick={e => e.stopPropagation()}>
        <button class="panel-close" onClick={props.onClose}>&times;</button>

        <Show when={props.production}>
          {p => (
            <>
              <div class="panel-header">
                <div class="panel-status" classList={{ want: p().status === 'To be acquired' }}>
                  {p().status === 'To be acquired' ? 'Still to acquire' : 'In collection'}
                </div>
                <h2 class="panel-title">{escapeHtml(p().title)}</h2>
                <div class="panel-meta">
                  <span class="panel-venue">{escapeHtml(p().venue)}</span>
                  <span class="panel-sep">·</span>
                  <span class="panel-city">{escapeHtml(p().city)}</span>
                  <span class="panel-sep">·</span>
                  <span class="panel-year">{escapeHtml(p().year)}</span>
                </div>
              </div>

              <Show when={p().notes}>
                <div class="panel-notes">
                  <label>Notes</label>
                  <p>{escapeHtml(p().notes)}</p>
                </div>
              </Show>

              <Show when={sameVenue().length > 0}>
                <div class="panel-related">
                  <label>Other productions at {escapeHtml(p().venue)}</label>
                  <For each={sameVenue()}>
                    {d => (
                      <div
                        class="panel-related-row"
                        classList={{ want: d.status === 'To be acquired' }}
                        onClick={() => props.onSelect?.(d)}
                      >
                        <span class="pr-title">{escapeHtml(d.title)}</span>
                        <span class="pr-year">{d.year}</span>
                      </div>
                    )}
                  </For>
                </div>
              </Show>

              <Show when={sameTitle().length > 0}>
                <div class="panel-related">
                  <label>Other productions of this show</label>
                  <For each={sameTitle()}>
                    {d => (
                      <div
                        class="panel-related-row"
                        classList={{ want: d.status === 'To be acquired' }}
                        onClick={() => props.onSelect?.(d)}
                      >
                        <span class="pr-title">{escapeHtml(d.venue)}, {escapeHtml(d.city)}</span>
                        <span class="pr-year">{d.year}</span>
                      </div>
                    )}
                  </For>
                </div>
              </Show>

              <Show when={!sameVenue().length && !sameTitle().length}>
                <div class="panel-empty">
                  No other related productions in this collection.
                </div>
              </Show>
            </>
          )}
        </Show>
      </div>
    </div>
  )
}
