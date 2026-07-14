import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import DATA from "../data";
import { filteredData, groupKey } from "../filter";
import type { Production } from "../types";

export default function Timeline() {
  const list = createMemo(() => filteredData().filter((d) => d._year !== null));

  const years = createMemo(() => list().map((d) => d._year as number));
  const minY = createMemo(() => Math.min(...years(), 1877));
  const maxY = createMemo(() => Math.max(...years(), 1933));
  const pad = 2;
  const lo = createMemo(() => minY() - pad);
  const hi = createMemo(() => maxY() + pad);

  const yearCounts = createMemo(() => {
    const counts: Record<number, number> = {};
    for (const d of list()) {
      if (d._year !== null) {
        const y = d._year;
        counts[y] = (counts[y] || 0) + 1;
      }
    }
    return counts;
  });
  const maxCount = createMemo(() =>
    Math.max(...Object.values(yearCounts()), 1)
  );

  const groups = createMemo(() => {
    const g: Record<string, Production[]> = {};
    for (const d of list()) {
      const k = groupKey(d);
      if (!g[k]) {
        g[k] = [];
      }
      g[k].push(d);
    }
    return g;
  });

  const keys = createMemo(() =>
    Object.keys(groups()).sort((a, b) => a.localeCompare(b))
  );

  const ticks = createMemo(() => {
    let t = "";
    for (let y = Math.ceil(lo() / 10) * 10; y <= hi(); y += 10) {
      const pct = ((y - lo()) / (hi() - lo())) * 100;
      t += `<div class="tick" style="left:${pct}%">${y}</div>`;
    }
    return t;
  });

  const [tooltip, setTooltip] = createSignal<{
    titles: string;
    year: string;
    group: string;
    wanted: boolean;
    x: number;
    y: number;
  } | null>(null);

  const [tappedGroup, setTappedGroup] = createSignal<string | null>(null);

  onMount(() => {
    document.addEventListener("click", dismissTooltip);
    onCleanup(() => document.removeEventListener("click", dismissTooltip));
  });

  const dismissTooltip = () => {
    setTooltip(null);
    setTappedGroup(null);
  };

  const showTip = (
    titles: string,
    year: string,
    group: string,
    wanted: boolean,
    clientX: number,
    clientY: number
  ) => {
    setTooltip({ group, titles, wanted, x: clientX, y: clientY, year });
  };

  const sparkBars = createMemo(() => {
    const bars: { year: number; pct: number }[] = [];
    for (let y = lo(); y <= hi(); y += 1) {
      const count = yearCounts()[y] || 0;
      bars.push({ pct: (count / maxCount()) * 100, year: y });
    }
    return bars;
  });

  const posPct = (y: number) => ((y - lo()) / (hi() - lo())) * 100;

  return (
    <div class="tl-container">
      <div class="result-line">
        Showing {list().length} of {DATA.length} productions
      </div>

      <Show when={list().length}>
        <div class="tl-sparkline">
          <div class="tl-spark-label">{lo()}</div>
          <div class="tl-spark-track">
            <For each={sparkBars()}>
              {(b) => (
                <div
                  class="tl-spark-bar"
                  style={{ height: `${Math.max(b.pct, 2)}%` }}
                  title={`${b.year}: ${yearCounts()[b.year] || 0} productions`}
                />
              )}
            </For>
          </div>
          <div class="tl-spark-label">{hi()}</div>
        </div>
      </Show>

      <div class="tl-axis">
        <div class="tl-label-spacer" />
        <div class="tl-track" innerHTML={ticks()} />
      </div>

      <div class="tl-lanes" id="tlLanes">
        <For each={keys()}>
          {(k) => {
            const items = groups()[k];
            const byYear: Record<number, Production[]> = {};
            for (const d of items) {
              if (d._year !== null) {
                if (!byYear[d._year]) {
                  byYear[d._year] = [];
                }
                byYear[d._year].push(d);
              }
            }
            return (
              <div class="tl-lane">
                <div class="tl-label" title={k}>
                  {k}
                </div>
                <div class="tl-track">
                  <For each={Object.entries(byYear)}>
                    {([yr, grp]) => {
                      const y = Number.parseInt(yr, 10);
                      const pct = posPct(y);
                      const anyWant = grp.some(
                        (d) => d.status === "To be acquired"
                      );
                      const cls = anyWant ? "want" : "acq";
                      const titles = grp
                        .map(
                          (d) =>
                            `${d.title}${d.status === "To be acquired" ? " (wanted)" : ""}`
                        )
                        .join(" · ");
                      const dotKey = `${k}|${yr}`;

                      const handleDotClick = (e: MouseEvent) => {
                        e.stopPropagation();
                        if (tappedGroup() === dotKey) {
                          dismissTooltip();
                        } else {
                          setTappedGroup(dotKey);
                          const rect = (
                            e.target as HTMLElement
                          ).getBoundingClientRect();
                          showTip(titles, yr, k, anyWant, rect.left, rect.top);
                        }
                      };

                      const handleDotEnter = (e: MouseEvent) => {
                        showTip(titles, yr, k, anyWant, e.clientX, e.clientY);
                      };

                      const handleDotLeave = () => {
                        if (!tappedGroup()) {
                          setTooltip(null);
                        }
                      };

                      const handleDotMove = (e: MouseEvent) => {
                        showTip(titles, yr, k, anyWant, e.clientX, e.clientY);
                      };

                      const handleDotTouch = (e: TouchEvent) => {
                        e.preventDefault();
                        if (tappedGroup() === dotKey) {
                          dismissTooltip();
                        } else {
                          setTappedGroup(dotKey);
                          const [touch] = e.touches;
                          showTip(
                            titles,
                            yr,
                            k,
                            anyWant,
                            touch.clientX,
                            touch.clientY
                          );
                        }
                      };

                      const handleDotKey = (e: KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          if (tappedGroup() === dotKey) {
                            dismissTooltip();
                          } else {
                            setTappedGroup(dotKey);
                            showTip(titles, yr, k, anyWant, 0, 0);
                          }
                        }
                      };

                      return (
                        <button
                          class="tl-dot"
                          classList={{
                            [cls]: true,
                            tapped: tappedGroup() === dotKey,
                          }}
                          onClick={handleDotClick}
                          onKeyDown={handleDotKey}
                          onMouseEnter={handleDotEnter}
                          onMouseLeave={handleDotLeave}
                          onMouseMove={handleDotMove}
                          onTouchStart={handleDotTouch}
                          style={{ left: `${pct}%` }}
                          type="button"
                        >
                          <Show when={grp.length > 1}>
                            <span class="count">{grp.length}</span>
                          </Show>
                        </button>
                      );
                    }}
                  </For>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      <Show when={tooltip()}>
        {(t) => (
          <div
            class="tooltip show"
            style={{
              left: `${Math.min(t().x + 14, window.innerWidth - 300)}px`,
              top: `${Math.max(t().y - 10, 10)}px`,
            }}
          >
            <div class="t-title" classList={{ want: t().wanted }}>
              {t().year}
            </div>
            <div class="t-row">{t().group}</div>
            <div class="t-row">{t().titles}</div>
          </div>
        )}
      </Show>
    </div>
  );
}
