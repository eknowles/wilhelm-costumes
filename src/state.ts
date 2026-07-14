import { createStore } from "solid-js/store";
import DATA from "./data";
import type { GroupMode, ViewMode } from "./types";

const allYears = DATA.map((d) => d._year).filter((v) => v !== null);
export const DATA_MIN_YEAR = Math.min(...allYears);
export const DATA_MAX_YEAR = Math.max(...allYears);

export interface AppStore {
  expandAll: boolean;
  group: GroupMode;
  onlyWanted: boolean;
  rangeFrom: number;
  rangeTo: number;
  search: string;
  view: ViewMode;
}

export const [state, setState] = createStore<AppStore>({
  expandAll: false,
  group: "city",
  onlyWanted: false,
  rangeFrom: DATA_MIN_YEAR,
  rangeTo: DATA_MAX_YEAR,
  search: "",
  view: "ledger",
});
