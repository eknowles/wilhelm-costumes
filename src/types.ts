export interface Production {
  _year: number | null;
  city: string;
  notes: string;
  status: "Acquired" | "To be acquired";
  title: string;
  venue: string;
  year: string;
}

export type GroupMode = "city" | "venue" | "title" | "year";
export type ViewMode = "ledger" | "timeline";

export interface AppStore {
  expandAll: boolean;
  group: GroupMode;
  onlyWanted: boolean;
  rangeFrom: number;
  rangeTo: number;
  search: string;
  view: ViewMode;
}
