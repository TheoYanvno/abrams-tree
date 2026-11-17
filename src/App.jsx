import { useEffect, useState } from 'react';
import ReadingPlan from './ReadingPlan.jsx';
import Prayers from './Prayers.jsx';
import BibleMap from './BibleMap.jsx';

const TABS = [
  { id: 'read', label: '📖 Read', Page: ReadingPlan },
  { id: 'pray', label: '🙏 Pray', Page: Prayers },
  { id: 'map', label: '🗺️ Map', Page: BibleMap },
];
const fromHash = () => TABS.find((t) => `#${t.id}` === globalThis.location?.hash)?.id ?? 'read';

export default function App() {
  const [tab, setTab] = useState(fromHash);
  useEffect(() => {
    const onHash = () => setTab(fromHash());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  const { Page } = TABS.find((t) => t.id === tab);

  return (
    <div className={`app ${tab === 'map' ? 'wide' : ''}`}>
      <header>
        <h1>📜 AbramsTree</h1>
        <p className="tagline">A Bible study guide: a daily reading plan, prayers and a map of where it happened.</p>
        <nav className="tabs" aria-label="Sections">
          {TABS.map((t) => (
            <a key={t.id} href={`#${t.id}`} aria-current={t.id === tab ? 'page' : undefined}>{t.label}</a>
          ))}
        </nav>
      </header>
      <main><Page /></main>
      <footer className="muted">
        Bible text from public-domain translations (the World English Bible first), read in <a href="https://theoyanvno.github.io/SuperBook/">SuperBook</a>.
        Map data from <a href="https://www.naturalearthdata.com/">Natural Earth</a>.
      </footer>
    </div>
  );
}
