import { useEffect, useState } from 'react';
import Home from './Home.jsx';
import Bible from './Bible.jsx';
import ReadingPlan from './ReadingPlan.jsx';
import Prayers from './Prayers.jsx';
import BibleMap from './BibleMap.jsx';
import Timeline from './Timeline.jsx';
import Calendar from './Calendar.jsx';
import Profile from './Profile.jsx';
import BookWeek from './BookWeek.jsx';
import { parseRoute, pageFor } from './lib/book.js';

// The Study tab also opens a week of the study book (#read/week/12) above your own plan.
// The route names read, pray, map and timeline are printed in the book's QR codes, so they never change.
const Read = ({ route }) => (
  <>
    {route.kind === 'week' && <BookWeek week={Number(route.id)} />}
    <ReadingPlan />
  </>
);

const PAGES = [
  { id: 'home', title: 'Home', Page: Home },
  { id: 'bible', title: 'Read the Bible', Page: Bible },
  { id: 'read', title: 'Bible Study Plans', Page: Read },
  { id: 'pray', title: 'Prayers', Page: Prayers },
  { id: 'map', title: 'Biblical Map', Page: BibleMap, wide: true },
  { id: 'timeline', title: 'Bible Timeline', Page: Timeline, wide: true },
  { id: 'calendar', title: 'Calendar', Page: Calendar },
  { id: 'profile', title: 'Profile', Page: Profile },
];

const I = {
  home: <path d="M4 11.5 12 5l8 6.5V20h-5.5v-5h-5v5H4z" />,
  bible: <path d="M3 6.5c3-1.4 6-1.4 9 .5 3-1.9 6-1.9 9-.5V19c-3-1.4-6-1.4-9 .5-3-1.9-6-1.9-9-.5zM12 7v12.5" />,
  study: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M8 13.5h2M14 13.5h2M8 16.5h2" /></>,
  profile: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  bell: <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5h4" />,
};
const Icon = ({ name }) => <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" className="icon">{I[name]}</svg>;

const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'bible', label: 'Bible', icon: 'bible' },
  { id: 'read', label: 'Study', icon: 'study' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

const hashNow = () => globalThis.location?.hash ?? '';
const pageOf = (hash) => PAGES.find((p) => p.id === parseRoute(hash).tab) ?? PAGES[0];

export default function App() {
  const [hash, setHash] = useState(hashNow);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const onHash = () => { setHash(hashNow()); setMenu(false); scrollTo?.(0, 0); };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  const page = pageOf(hash);
  const { Page } = page;
  const route = parseRoute(hash);
  const bookPage = pageFor(hash);
  const home = page.id === 'home';
  const active = ['pray', 'map', 'timeline'].includes(page.id) ? 'home' : page.id;

  return (
    <div className={`app${home ? ' is-home' : ''}${page.wide ? ' wide' : ''}`}>
      <header className="topbar">
        <button className="round" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><Icon name="menu" /></button>
        {!home && <h1 className="page-title">{page.title}</h1>}
        <a className="round" href="#calendar" aria-label="Upcoming feasts"><Icon name="bell" /></a>
      </header>

      {menu && (
        <div className="drawer-back" onClick={() => setMenu(false)}>
          <nav className="drawer" aria-label="All sections" onClick={(e) => e.stopPropagation()}>
            <p className="drawer-brand"><img src="img/logo.svg" alt="" width="44" height="38" /> AbrahamsTree</p>
            {PAGES.map((p) => <a key={p.id} href={`#${p.id}`} aria-current={p.id === page.id ? 'page' : undefined}>{p.title}</a>)}
          </nav>
        </div>
      )}

      <main>
        {bookPage && <p className="book-page">📕 This goes with Volume {bookPage.volume}, page {bookPage.page} of the AbrahamsTree Study Bible.</p>}
        <Page key={hash} route={route} />
        <footer className="muted">
          Bible text from public-domain translations (the World English Bible first), read in <a href="https://theoyanvno.github.io/SuperBook/">SuperBook</a>.
          Map data from <a href="https://www.naturalearthdata.com/">Natural Earth</a>. Engravings by Gustave Doré (1866, public domain).
        </footer>
      </main>

      <nav className="bottom-nav" aria-label="Main">
        {NAV.map((n) => (
          <a key={n.id} href={`#${n.id}`} aria-current={n.id === active ? 'page' : undefined}>
            <Icon name={n.icon} /><span>{n.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
