import { createMemo, For, Show } from "solid-js";
import DATA from "../data";
import { filteredData } from "../filter";
import { state } from "../state";
import type { GroupMode, Production } from "../types";

function groupKey(d: Production, mode: GroupMode): string {
  if (mode === "city") {
    return d.city;
  }
  if (mode === "venue") {
    return `${d.venue} — ${d.city}`;
  }
  if (mode === "year") {
    return d.year || "Unknown";
  }
  return d.title;
}

function sortEntries(a: Production, b: Production): number {
  const ay = a._year === null ? 99_999 : a._year;
  const by = b._year === null ? 99_999 : b._year;
  return ay - by;
}

function EntryRow(props: {
  d: Production;
  showSub: boolean;
  onClick?: () => void;
}) {
  const want = () => props.d.status === "To be acquired";
  return (
    <button
      class="entry"
      classList={{ clickable: !!props.onClick, want: want() }}
      onClick={props.onClick}
      type="button"
    >
      <span class="title">{props.d.title}</span>
      <Show when={props.d.notes}>
        <span class="note-marker" title={props.d.notes}>
          *
        </span>
      </Show>
      <span class="leader" />
      <span class="meta-col">
        <Show when={props.showSub}>
          <span class="sub">
            {props.d.venue} · {props.d.city}
          </span>
        </Show>
      </span>
      <span class="year" classList={{ want: want() }}>
        {props.d.year || "—"}
      </span>
    </button>
  );
}

function groupEntries(entries: Production[]): Record<string, Production[]> {
  const g: Record<string, Production[]> = {};
  for (const d of entries) {
    const k = groupKey(d, state.group);
    if (!g[k]) {
      g[k] = [];
    }
    g[k].push(d);
  }
  return g;
}

function renderCityGroup(
  k: string,
  items: Production[],
  openAttr: true | undefined,
  onSelect?: (d: Production) => void
) {
  const venues: Record<string, Production[]> = {};
  for (const d of items) {
    if (!venues[d.venue]) {
      venues[d.venue] = [];
    }
    venues[d.venue].push(d);
  }
  const vKeys = Object.keys(venues).sort((a, b) => a.localeCompare(b));
  return (
    <details class="group" open={openAttr}>
      <summary>
        <span class="arrow">▸</span>
        <span class="gname">{k}</span>
        <span class="gcount">
          {items.length} · {vKeys.length} venue
          {vKeys.length === 1 ? "" : "s"}
        </span>
      </summary>
      <div class="group-body">
        <For each={vKeys}>
          {(vk) => (
            <div class="venue-block">
              <h4>{vk}</h4>
              <For each={venues[vk].sort(sortEntries)}>
                {(d) => (
                  <EntryRow
                    d={d}
                    onClick={() => onSelect?.(d)}
                    showSub={false}
                  />
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </details>
  );
}

function renderYearGroup(
  k: string,
  items: Production[],
  openAttr: true | undefined,
  onSelect?: (d: Production) => void
) {
  return (
    <details class="group" open={openAttr}>
      <summary>
        <span class="arrow">▸</span>
        <span class="gname">{k}</span>
        <span class="gcount">
          {items.length} production{items.length === 1 ? "" : "s"}
        </span>
      </summary>
      <div class="group-body">
        <For each={items.sort(sortEntries)}>
          {(d) => (
            <EntryRow d={d} onClick={() => onSelect?.(d)} showSub={true} />
          )}
        </For>
      </div>
    </details>
  );
}

function renderDefaultGroup(
  k: string,
  items: Production[],
  openAttr: true | undefined,
  showSub: boolean,
  onSelect?: (d: Production) => void
) {
  const entries = items.sort(sortEntries);
  return (
    <details class="group" open={openAttr}>
      <summary>
        <span class="arrow">▸</span>
        <span class="gname">{k}</span>
        <span class="gcount">
          {items.length} production{items.length === 1 ? "" : "s"}
        </span>
      </summary>
      <div class="group-body">
        <For each={entries}>
          {(d) => (
            <EntryRow d={d} onClick={() => onSelect?.(d)} showSub={showSub} />
          )}
        </For>
      </div>
    </details>
  );
}

export default function Ledger(props: { onSelect?: (d: Production) => void }) {
  const list = createMemo(filteredData);

  const groups = createMemo(() => groupEntries(list()));

  const keys = createMemo(() => {
    const ks = Object.keys(groups());
    if (state.group === "year") {
      return ks.sort((a, b) => {
        const na = Number.parseInt(a, 10);
        const nb = Number.parseInt(b, 10);
        if (Number.isNaN(na)) {
          return 1;
        }
        if (Number.isNaN(nb)) {
          return -1;
        }
        return na - nb;
      });
    }
    return ks.sort((a, b) => a.localeCompare(b));
  });

  return (
    <>
      <div class="result-line">
        Showing {list().length} of {DATA.length} productions
      </div>

      <Show
        fallback={
          <div class="empty-state">No productions match your search.</div>
        }
        when={list().length}
      >
        <For each={keys()}>
          {(k) => {
            const items = groups()[k];
            const openAttr = state.expandAll || state.search ? true : undefined;
            if (state.group === "city") {
              return renderCityGroup(k, items, openAttr, props.onSelect);
            }
            if (state.group === "year") {
              return renderYearGroup(k, items, openAttr, props.onSelect);
            }
            const showSub = state.group === "title";
            return renderDefaultGroup(
              k,
              items,
              openAttr,
              showSub,
              props.onSelect
            );
          }}
        </For>
      </Show>
    </>
  );
}
