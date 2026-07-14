import { createEffect, createSignal, For } from "solid-js";
import { DATA_MAX_YEAR, DATA_MIN_YEAR, setState, state } from "../state";

const GROUP_NAMES = {
  city: "City",
  title: "Title",
  venue: "Venue",
  year: "Year",
} as const;

const GROUPS = Object.keys(GROUP_NAMES) as (
  | "city"
  | "venue"
  | "title"
  | "year"
)[];

function isGroupKey(v: string): v is "city" | "venue" | "title" | "year" {
  return v in GROUP_NAMES;
}

export default function Sidebar() {
  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref assignment
  let themeBtnEl: HTMLButtonElement | undefined;
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  const toggleTheme = () => {
    const next = theme() === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    if (themeBtnEl) {
      themeBtnEl.innerHTML = next === "dark" ? "&#9728;" : "&#9789;";
    }
  };

  const handleSearch = (e: Event) => {
    setState("search", (e.target as HTMLInputElement).value);
  };

  const handleWantedToggle = (e: Event) => {
    setState("onlyWanted", (e.target as HTMLInputElement).checked);
  };

  const toggleExpand = () => {
    setState("expandAll", !state.expandAll);
  };

  const setGroup = (g: string) => {
    if (isGroupKey(g)) {
      setState("group", g);
    }
  };

  const setViewLedger = () => setState("view", "ledger");
  const setViewTimeline = () => setState("view", "timeline");

  return (
    <aside class="sidebar">
      <div class="sidebar-section">
        <span class="sidebar-label">Group by</span>
        <div class="seg seg-vertical">
          <For each={GROUPS}>
            {(g) => (
              <button
                classList={{ active: state.group === g }}
                onClick={() => setGroup(g)}
                type="button"
              >
                {GROUP_NAMES[g]}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class="sidebar-section">
        <span class="sidebar-label">Search</span>
        <div class="search-wrap">
          <svg
            fill="none"
            height="14"
            role="img"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="14"
          >
            <title>Search</title>
            <circle cx="11" cy="11" r="7" />
            <line x1="21" x2="16.6" y1="21" y2="16.6" />
          </svg>
          <input
            onInput={handleSearch}
            placeholder="Title, venue, or city…"
            type="search"
            value={state.search}
          />
        </div>
      </div>

      <div class="sidebar-section">
        <span class="sidebar-label">Year range</span>
        <YearRange />
      </div>

      <div class="sidebar-section">
        <label class="toggle-wrap">
          <input
            checked={state.onlyWanted}
            onChange={handleWantedToggle}
            type="checkbox"
          />
          Only still to acquire
        </label>
      </div>

      <div class="sidebar-section">
        <button class="expand-btn" onClick={toggleExpand} type="button">
          {state.expandAll ? "Collapse all groups" : "Expand all groups"}
        </button>
      </div>

      <div class="sidebar-section sidebar-legend">
        <span>
          <span class="dot acq" /> In collection
        </span>
        <span>
          <span class="dot want" /> To acquire
        </span>
      </div>

      <div class="sidebar-spacer" />

      <div class="sidebar-section sidebar-bottom">
        <div class="view-tabs">
          <button
            classList={{ active: state.view === "ledger" }}
            data-view="ledger"
            onClick={setViewLedger}
            type="button"
          >
            Ledger
          </button>
          <button
            classList={{ active: state.view === "timeline" }}
            data-view="timeline"
            onClick={setViewTimeline}
            type="button"
          >
            Timeline
          </button>
        </div>
        <button
          aria-label="Toggle light mode"
          class="theme-toggle"
          onClick={toggleTheme}
          ref={themeBtnEl}
          title="Toggle light mode"
          type="button"
        >
          &#9789;
        </button>
      </div>
    </aside>
  );
}

function YearRange() {
  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref assignment
  let sliderEl: HTMLInputElement | undefined;

  const fromInput = (e: Event) => {
    const v = Number.parseInt((e.target as HTMLInputElement).value, 10);
    if (!Number.isNaN(v) && v >= DATA_MIN_YEAR && v <= state.rangeTo) {
      setState("rangeFrom", v);
    }
  };
  const toInput = (e: Event) => {
    const v = Number.parseInt((e.target as HTMLInputElement).value, 10);
    if (!Number.isNaN(v) && v <= DATA_MAX_YEAR && v >= state.rangeFrom) {
      setState("rangeTo", v);
    }
  };

  const resetRange = () => {
    setState({ rangeFrom: DATA_MIN_YEAR, rangeTo: DATA_MAX_YEAR });
  };

  createEffect(() => {
    const lo = DATA_MIN_YEAR;
    const hi = DATA_MAX_YEAR;
    const fromPct = ((state.rangeFrom - lo) / (hi - lo)) * 100;
    const toPct = ((state.rangeTo - lo) / (hi - lo)) * 100;
    if (sliderEl) {
      sliderEl.style.background = `linear-gradient(90deg, var(--rule) ${fromPct}%, var(--gold) ${fromPct}%, var(--gold) ${toPct}%, var(--rule) ${toPct}%)`;
    }
  });

  const handleSlider = (e: Event) => {
    const v = Number.parseInt((e.target as HTMLInputElement).value, 10);
    if (v <= state.rangeTo) {
      setState("rangeFrom", v);
    }
  };

  return (
    <div class="year-range">
      <div class="yr-inputs">
        <label class="yr-field">
          <span class="yr-field-label">Start</span>
          <input
            max={state.rangeTo}
            min={DATA_MIN_YEAR}
            onInput={fromInput}
            type="number"
            value={state.rangeFrom}
          />
        </label>
        <span class="yr-sep">—</span>
        <label class="yr-field">
          <span class="yr-field-label">End</span>
          <input
            max={DATA_MAX_YEAR}
            min={state.rangeFrom}
            onInput={toInput}
            type="number"
            value={state.rangeTo}
          />
        </label>
        <button class="yr-reset" onClick={resetRange} type="button">
          Reset
        </button>
      </div>
      <input
        class="yr-slider"
        max={DATA_MAX_YEAR}
        min={DATA_MIN_YEAR}
        onInput={handleSlider}
        ref={sliderEl}
        type="range"
        value={state.rangeFrom}
      />
    </div>
  );
}
