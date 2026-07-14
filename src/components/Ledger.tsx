import { createMemo, For, Show } from 'solid-js'
import type { Production, GroupMode } from '../types'
import DATA from '../data'
import { state } from '../state'
import { escapeHtml } from '../helpers'
import { filteredData } from '../filter'

function groupKey(d: Production, mode: GroupMode): string {
  if (mode === 'city') return d.city
  if (mode === 'venue') return d.venue + ' — ' + d.city
  if (mode === 'year') return d.year || 'Unknown'
  return d.title
}

function sortEntries(a: Production, b: Production): number {
  const ay = a._year === null ? 99999 : a._year
  const by = b._year === null ? 99999 : b._year
  return ay - by
}

export default function Ledger(props: { onSelect?: (d: Production) => void }) {
  const list = createMemo(filteredData)

  const groups = createMemo(() => {
    const g: Record<string, Production[]> = {}
    list().forEach(d => {
      const k = groupKey(d, state.group)
      ;(g[k] = g[k] || []).push(d)
    })
    return g
  })

  const keys = createMemo(() => {
    const ks = Object.keys(groups())
    if (state.group === 'year') {
      return ks.sort((a, b) => {
        const na = parseInt(a)
        const nb = parseInt(b)
        if (isNaN(na)) return 1
        if (isNaN(nb)) return -1
        return na - nb
      })
    }
    return ks.sort((a, b) => a.localeCompare(b))
  })

  return (
    <>
      <div class="result-line">
        Showing {list().length} of {DATA.length} productions
      </div>

      <Show when={list().length} fallback={
        <div class="empty-state">No productions match your search.</div>
      }>
        <For each={keys()}>
          {k => {
            const items = groups()[k]
            const openAttr = state.expandAll || state.search ? true : undefined
            if (state.group === 'city') {
              const venues: Record<string, Production[]> = {}
              items.forEach(d => (venues[d.venue] = venues[d.venue] || []).push(d))
              const vKeys = Object.keys(venues).sort((a, b) => a.localeCompare(b))
              return (
                <details class="group" open={openAttr}>
                  <summary>
                    <span class="arrow">▸</span>
                    <span class="gname">{escapeHtml(k)}</span>
                    <span class="gcount">{items.length} · {vKeys.length} venue{vKeys.length !== 1 ? 's' : ''}</span>
                  </summary>
                  <div class="group-body">
                    <For each={vKeys}>
                      {vk => (
                        <div class="venue-block">
                          <h4>{escapeHtml(vk)}</h4>
                          <For each={venues[vk].sort(sortEntries)}>
                            {d => <EntryRow d={d} showSub={false} onClick={() => props.onSelect?.(d)} />}
                          </For>
                        </div>
                      )}
                    </For>
                  </div>
                </details>
              )
            }
            if (state.group === 'year') {
              return (
                <details class="group" open={openAttr}>
                  <summary>
                    <span class="arrow">▸</span>
                    <span class="gname">{escapeHtml(k)}</span>
                    <span class="gcount">{items.length} production{items.length !== 1 ? 's' : ''}</span>
                  </summary>
                  <div class="group-body">
                    <For each={items.sort(sortEntries)}>
                      {d => <EntryRow d={d} showSub={true} onClick={() => props.onSelect?.(d)} />}
                    </For>
                  </div>
                </details>
              )
            }
            const entries = items.sort(sortEntries)
            const showSub = state.group === 'title'
            return (
              <details class="group" open={openAttr}>
                <summary>
                  <span class="arrow">▸</span>
                  <span class="gname">{escapeHtml(k)}</span>
                  <span class="gcount">{items.length} production{items.length !== 1 ? 's' : ''}</span>
                </summary>
                <div class="group-body">
                  <For each={entries}>
                    {d => <EntryRow d={d} showSub={showSub} onClick={() => props.onSelect?.(d)} />}
                  </For>
                </div>
              </details>
            )
          }}
        </For>
      </Show>
    </>
  )
}

function EntryRow(props: { d: Production; showSub: boolean; onClick?: () => void }) {
  const want = () => props.d.status === 'To be acquired'
  return (
    <div class="entry" classList={{ want: want(), clickable: !!props.onClick }} onClick={props.onClick}>
      <span class="title">{escapeHtml(props.d.title)}</span>
      <Show when={props.d.notes}>
        <span class="note-marker" title={props.d.notes}>*</span>
      </Show>
      <span class="leader"></span>
      <span class="meta-col">
        <Show when={props.showSub}>
          <span class="sub">{escapeHtml(props.d.venue)} · {escapeHtml(props.d.city)}</span>
        </Show>
      </span>
      <span class="year" classList={{ want: want() }}>{escapeHtml(props.d.year || '—')}</span>
    </div>
  )
}
