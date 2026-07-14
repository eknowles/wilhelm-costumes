import DATA from '../data'

export default function Header() {
  const cities = new Set(DATA.map(d => d.city)).size
  const venues = new Set(DATA.map(d => d.venue + '|' + d.city)).size
  const wanted = DATA.filter(d => d.status === 'To be acquired').length

  return (
    <header class="header">
      <div class="header-main">
        <div class="header-eyebrow">Costume Design Chronology · 1877–1933</div>
        <h1 class="header-title" title="Compiled by Brian Peters from surviving programmes and playbills. Titles in red remain uncollected.">
          Productions Costumed by Wilhelm
        </h1>
      </div>
      <div class="header-stats">
        <div class="hs-item"><span class="hs-num">{DATA.length}</span> Productions</div>
        <div class="hs-item"><span class="hs-num">{cities}</span> Cities</div>
        <div class="hs-item"><span class="hs-num">{venues}</span> Venues</div>
        <div class="hs-item"><span class="hs-num">{wanted}</span> Still Sought</div>
      </div>
    </header>
  )
}
