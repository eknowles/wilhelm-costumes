import { createSignal, Match, Switch } from "solid-js";
import DetailPanel from "./components/DetailPanel";
import Header from "./components/Header";
import Ledger from "./components/Ledger";
import Sidebar from "./components/Sidebar";
import Timeline from "./components/Timeline";
import { state } from "./state";
import type { Production } from "./types";

export default function App() {
  const [selected, setSelected] = createSignal<Production | null>(null);
  const closePanel = () => setSelected(null);

  return (
    <>
      <Header />
      <div class="layout">
        <Sidebar />
        <main class="main-area">
          <div class="content-constrained">
            <Switch>
              <Match when={state.view === "ledger"}>
                <Ledger onSelect={setSelected} />
              </Match>
              <Match when={state.view === "timeline"}>
                <Timeline />
              </Match>
            </Switch>
          </div>
        </main>
      </div>
      <DetailPanel
        onClose={closePanel}
        onSelect={setSelected}
        production={selected()}
      />
    </>
  );
}
