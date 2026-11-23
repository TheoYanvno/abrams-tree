import { useEffect, useState } from 'react';
import ReadingPlan from './ReadingPlan.jsx';
import Prayers from './Prayers.jsx';
import BibleMap from './BibleMap.jsx';
import Timeline from './Timeline.jsx';
import BookWeek from './BookWeek.jsx';
import { parseRoute, pageFor } from './lib/book.js';

// The Read tab also opens a week of the study book (#read/week/12) above your own plan.
const Read = ({ route }) => (
  <>
    {route.kind === 'week' && <BookWeek week={Number(route.id)} />}
    <ReadingPlan />
  </>
);

const TABS = [
  { id: 'read', label: '📖 Read', Page: Read },
  { id: 'pray', label: '🙏 Pray', Page: Prayers },
  { id: 'map', label: '🗺️ Map', Page: BibleMap },
  { id: 'timeline', label: '⏳ Timeline', Page: Timeline },
];
const hashNow = () => globalThis.location?.hash ?? '';
const tabOf = (hash) => TABS.find((t) => t.id === parseRoute(hash).tab)?.id ?? 'read';

export default function App() {
  const [hash, setHash] = useState(hashNow);
  const tab = tabOf(hash);
  useEffect(() => {
    const onHash = () => setHash(hashNow());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  const { Page } = TABS.find((t) => t.id === tab);
  const route = parseRoute(hash);
  const bookPage = pageFor(hash);

  return (
    <div className={`app ${tab === 'map' || tab === 'timeline' ? 'wide' : ''}`}>
      <header>
        <h1>📜 AbrahamsTree</h1>
        <p className="tagline">A Bible study guide: a daily reading plan, prayers, a map of where it happened and a timeline of who lived when.</p>
        <nav className="tabs" aria-label="Sections">
          {TABS.map((t) => (
            <a key={t.id} href={`#${t.id}`} aria-current={t.id === tab ? 'page' : undefined}>{t.label}</a>
          ))}
        </nav>
        {bookPage && <p className="book-page">📕 This goes with Volume {bookPage.volume}, page {bookPage.page} of the AbrahamsTree Study Bible.</p>}
      </header>
      <main><Page key={hash} route={route} /></main>
      <footer className="muted">
        Bible text from public-domain translations (the World English Bible first), read in <a href="https://theoyanvno.github.io/SuperBook/">SuperBook</a>.
        Map data from <a href="https://www.naturalearthdata.com/">Natural Earth</a>.
      </footer>
    </div>
  );
}
