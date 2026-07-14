import raw from "./data.json";
import type { Production } from "./types";

const YEAR_RANGE_RE = /^(\d{4})\s*[–—-]\s*(\d{2,4})$/;
const YEAR_PARSE_RE = /(\d{4})/;

function normalizeYear(y: string): string {
  if (!y || y === "n/d") {
    return y || "";
  }
  const m = y.match(YEAR_RANGE_RE);
  if (m) {
    const [, start, end] = m;
    const fullEnd = end.length === 2 ? start.slice(0, 2) + end : end;
    return `${start}–${fullEnd}`;
  }
  return y;
}

function parseYear(y: string): number | null {
  if (!y) {
    return null;
  }
  const m = String(y).match(YEAR_PARSE_RE);
  return m ? Number.parseInt(m[1], 10) : null;
}

const DATA: Production[] = (raw as Omit<Production, "_year">[]).map((d) => ({
  ...d,
  _year: parseYear(d.year),
  year: normalizeYear(d.year),
}));

export default DATA;
