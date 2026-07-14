import { createSignal, Switch, Match } from 'solid-js'
import type { Production } from './types'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Ledger from './components/Ledger'
import Timeline from './components/Timeline'
import DetailPanel from './components/DetailPanel'
import { state } from './state'

export default function App() {
  const [selected, setSelected] = createSignal<Production | null>(null)

  return (
    <>
      <Header />
      <div class="layout">
        <Sidebar />
        <main class="main-area">
          <div class="content-constrained">
            <Switch>
              <Match when={state.view === 'ledger'}>
                <Ledger onSelect={setSelected} />
              </Match>
              <Match when={state.view === 'timeline'}>
                <Timeline />
              </Match>
            </Switch>
          </div>
        </main>
      </div>
      <DetailPanel
        production={selected()}
        onClose={() => setSelected(null)}
        onSelect={setSelected}
      />
    </>
  )
}
