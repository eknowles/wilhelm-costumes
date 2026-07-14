import { createMemo, For, Show } from "solid-js";
import DATA from "../data";
import type { Production } from "../types";

function RelatedRow(props: {
  d: Production;
  label: string;
  onSelect?: (d: Production) => void;
}) {
  return (
    <button
      class="panel-related-row"
      classList={{ want: props.d.status === "To be acquired" }}
      onClick={() => props.onSelect?.(props.d)}
      type="button"
    >
      <span class="pr-title">{props.label}</span>
      <span class="pr-year">{props.d.year}</span>
    </button>
  );
}

export default function DetailPanel(props: {
  production: Production | null;
  onClose: () => void;
  onSelect?: (d: Production) => void;
}) {
  const sameVenue = createMemo(() => {
    const p = props.production;
    if (!p) {
      return [];
    }
    return DATA.filter(
      (d) => d.venue === p.venue && d.city === p.city && d !== p
    ).sort((a, b) => (a._year ?? 9999) - (b._year ?? 9999));
  });

  const sameTitle = createMemo(() => {
    const p = props.production;
    if (!p) {
      return [];
    }
    return DATA.filter((d) => d.title === p.title && d !== p).sort(
      (a, b) => (a._year ?? 9999) - (b._year ?? 9999)
    );
  });

  const handleOverlayKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      props.onClose();
    }
  };

  const stopPanelClick = (e: Event) => e.stopPropagation();

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: overlay backdrop pattern
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: overlay backdrop pattern
    <div
      class="panel-overlay"
      classList={{ open: !!props.production }}
      onClick={props.onClose}
      onKeyDown={handleOverlayKey}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: panel needs stopPropagation */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: panel needs stopPropagation */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only, not an action */}
      <div
        class="detail-panel"
        classList={{ open: !!props.production }}
        onClick={stopPanelClick}
      >
        <button class="panel-close" onClick={props.onClose} type="button">
          &times;
        </button>

        <Show when={props.production}>
          {(p) => (
            <>
              <div class="panel-header">
                <div
                  class="panel-status"
                  classList={{ want: p().status === "To be acquired" }}
                >
                  {p().status === "To be acquired"
                    ? "Still to acquire"
                    : "In collection"}
                </div>
                <h2 class="panel-title">{p().title}</h2>
                <div class="panel-meta">
                  <span class="panel-venue">{p().venue}</span>
                  <span class="panel-sep">·</span>
                  <span class="panel-city">{p().city}</span>
                  <span class="panel-sep">·</span>
                  <span class="panel-year">{p().year}</span>
                </div>
              </div>

              <Show when={p().notes}>
                <div class="panel-notes">
                  <h3 class="panel-heading">Notes</h3>
                  <p>{p().notes}</p>
                </div>
              </Show>

              <Show when={sameVenue().length > 0}>
                <div class="panel-related">
                  <h3 class="panel-heading">
                    Other productions at {p().venue}
                  </h3>
                  <For each={sameVenue()}>
                    {(d) => (
                      <RelatedRow
                        d={d}
                        label={d.title}
                        onSelect={props.onSelect}
                      />
                    )}
                  </For>
                </div>
              </Show>

              <Show when={sameTitle().length > 0}>
                <div class="panel-related">
                  <h3 class="panel-heading">Other productions of this show</h3>
                  <For each={sameTitle()}>
                    {(d) => (
                      <RelatedRow
                        d={d}
                        label={`${d.venue}, ${d.city}`}
                        onSelect={props.onSelect}
                      />
                    )}
                  </For>
                </div>
              </Show>

              <Show when={!(sameVenue().length || sameTitle().length)}>
                <div class="panel-empty">
                  No other related productions in this collection.
                </div>
              </Show>
            </>
          )}
        </Show>
      </div>
    </div>
  );
}
