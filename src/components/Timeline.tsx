import {
  createEffect,
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

function dotBackground(grp: Production[]): string {
  if (grp.length <= 1) {
    return "";
  }
  const acq = grp.filter((d) => d.status !== "To be acquired").length;
  if (acq === 0) {
    return "";
  }
  if (acq === grp.length) {
    return "";
  }
  const pct = (acq / grp.length) * 100;
  return `conic-gradient(var(--gold) 0deg ${pct}%, var(--red) ${pct}% 360deg)`;
}

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

  const [zoomMin, setZoomMin] = createSignal(lo());
  const [zoomMax, setZoomMax] = createSignal(hi());

  createEffect(() => {
    setZoomMin(lo());
    setZoomMax(hi());
  });

  const effectiveLo = createMemo(() => Math.max(lo(), zoomMin()));
  const effectiveHi = createMemo(() => Math.min(hi(), zoomMax()));

  const posPct = (y: number) =>
    ((y - effectiveLo()) / (effectiveHi() - effectiveLo())) * 100;

  const zoomed = createMemo(() => effectiveLo() > lo() || effectiveHi() < hi());

  const resetZoom = () => {
    setZoomMin(lo());
    setZoomMax(hi());
  };

  const sparkBars = createMemo(() => {
    const bars: { year: number; pct: number }[] = [];
    for (let y = effectiveLo(); y <= effectiveHi(); y += 1) {
      const count = yearCounts()[y] || 0;
      bars.push({ pct: (count / maxCount()) * 100, year: y });
    }
    return bars;
  });

  const ticks = createMemo(() => {
    const range = effectiveHi() - effectiveLo();
    let step: number;
    if (range <= 15) {
      step = 1;
    } else if (range <= 30) {
      step = 2;
    } else if (range <= 60) {
      step = 5;
    } else {
      step = 10;
    }
    const firstTick = Math.ceil(effectiveLo() / step) * step;
    let t = "";
    for (let y = firstTick; y <= effectiveHi(); y += step) {
      const pct = posPct(y);
      t += `<div class="tick" style="left:${pct}%">${y}</div>`;
    }
    return t;
  });

  /* ── Pinch zoom ── */
  let pinchData: {
    startDist: number;
    startMin: number;
    startMax: number;
    center: number;
    halfSpan: number;
  } | null = null;

  const onContainerTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const [touchA, touchB] = e.touches;
      const dx = touchA.clientX - touchB.clientX;
      const dy = touchA.clientY - touchB.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const smin = effectiveLo();
      const smax = effectiveHi();
      pinchData = {
        center: (smin + smax) / 2,
        halfSpan: (smax - smin) / 2,
        startDist: dist,
        startMax: smax,
        startMin: smin,
      };
    }
  };

  const onContainerTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && pinchData) {
      e.preventDefault();
      const [touchA, touchB] = e.touches;
      const dx = touchA.clientX - touchB.clientX;
      const dy = touchA.clientY - touchB.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = pinchData.startDist / dist;
      const newHalf = pinchData.halfSpan * ratio;
      const newMin = Math.max(lo(), Math.round(pinchData.center - newHalf));
      const newMax = Math.min(hi(), Math.round(pinchData.center + newHalf));
      if (newMax - newMin >= 1) {
        setZoomMin(newMin);
        setZoomMax(newMax);
      }
    }
  };

  const onContainerTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      pinchData = null;
    }
  };

  /* ── Double-tap to reset zoom ── */
  let lastTap = 0;
  const onContainerTouch = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      onContainerTouchStart(e);
    }
    if (e.touches.length === 1 && zoomed()) {
      const now = Date.now();
      if (now - lastTap < 300) {
        resetZoom();
        lastTap = 0;
        return;
      }
      lastTap = now;
    }
  };

  return (
    <div
      class="tl-container"
      onTouchEnd={onContainerTouchEnd}
      onTouchMove={onContainerTouchMove}
      onTouchStart={onContainerTouch}
    >
      <div class="result-line">
        Showing {list().length} of {DATA.length} productions
        {zoomed() && (
          <button class="tl-zoom-btn" onClick={resetZoom} type="button">
            Reset zoom ({effectiveLo()}–{effectiveHi()})
          </button>
        )}
      </div>

      <Show when={list().length}>
        <div class="tl-sparkline">
          <div class="tl-spark-label">{effectiveLo()}</div>
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
          <div class="tl-spark-label">{effectiveHi()}</div>
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
                const y = d._year;
                if (y < effectiveLo() || y > effectiveHi()) {
                  continue;
                }
                if (!byYear[y]) {
                  byYear[y] = [];
                }
                byYear[y].push(d);
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
                      const acqCount = grp.filter(
                        (d) => d.status !== "To be acquired"
                      ).length;
                      const wantCount = grp.length - acqCount;
                      const hasBoth =
                        grp.length > 1 && acqCount > 0 && wantCount > 0;
                      let cls: string;
                      if (hasBoth) {
                        cls = "multi";
                      } else if (wantCount > 0) {
                        cls = "want";
                      } else {
                        cls = "acq";
                      }
                      const pieBg = dotBackground(grp);
                      const dotStyle: Record<string, string> = {
                        left: `${pct}%`,
                      };
                      if (pieBg) {
                        dotStyle.background = pieBg;
                      }
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
                          showTip(
                            titles,
                            yr,
                            k,
                            wantCount > 0,
                            rect.left,
                            rect.top
                          );
                        }
                      };

                      const handleDotEnter = (e: MouseEvent) => {
                        showTip(
                          titles,
                          yr,
                          k,
                          wantCount > 0,
                          e.clientX,
                          e.clientY
                        );
                      };

                      const handleDotLeave = () => {
                        if (!tappedGroup()) {
                          setTooltip(null);
                        }
                      };

                      const handleDotMove = (e: MouseEvent) => {
                        showTip(
                          titles,
                          yr,
                          k,
                          wantCount > 0,
                          e.clientX,
                          e.clientY
                        );
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
                            wantCount > 0,
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
                            showTip(titles, yr, k, wantCount > 0, 0, 0);
                          }
                        }
                      };

                      return (
                        <button
                          class="tl-dot"
                          classList={{
                            [cls]: true,
                            "has-chart": !!pieBg,
                            tapped: tappedGroup() === dotKey,
                          }}
                          onClick={handleDotClick}
                          onKeyDown={handleDotKey}
                          onMouseEnter={handleDotEnter}
                          onMouseLeave={handleDotLeave}
                          onMouseMove={handleDotMove}
                          onTouchStart={handleDotTouch}
                          style={dotStyle}
                          type="button"
                        >
                          <Show when={grp.length > 1}>
                            <span class="count">
                              {pieBg ? `${acqCount}/${grp.length}` : grp.length}
                            </span>
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
