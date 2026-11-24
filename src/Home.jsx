// The home screen: the AbrahamsTree crest over Abraham's oak, God's promise to Abraham, and a tile
// for each part of the app.
const ICONS = {
  plans: <><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M8 13.5h2M14 13.5h2M8 16.5h2M14 16.5h2" /></>,
  bible: <path d="M3 6.5c3-1.4 6-1.4 9 .5 3-1.9 6-1.9 9-.5V19c-3-1.4-6-1.4-9 .5-3-1.9-6-1.9-9-.5zM12 7v12.5" />,
  cross: <path d="M12 3v18M7 8h10M9.5 21h5" />,
  pin: <><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>,
  glass: <path d="M7 3.5h10M7 20.5h10M8 3.5c0 5 8 5.5 8 8.5s-8 3.5-8 8.5M16 3.5c0 5-8 5.5-8 8.5s8 3.5 8 8.5" />,
};

const TILES = [
  { href: '#read', img: 'img/study.jpg', icon: 'plans', title: 'Bible Study Plans', text: 'Guided studies for every season of faith', wide: true },
  { href: '#bible', img: 'img/bible.jpg', icon: 'bible', title: 'Read the Bible', text: 'Explore Scripture with study tools' },
  { href: '#pray', img: 'img/prayers.jpg', icon: 'cross', title: 'Prayers', text: 'Traditional and daily prayers for your spiritual life' },
  { href: '#map', img: 'img/map.jpg', icon: 'pin', title: 'Biblical Map', text: 'Explore key places in Scripture' },
  { href: '#timeline', img: 'img/timeline.jpg', icon: 'glass', title: 'Bible Timeline', text: 'Walk through God’s story from beginning to end' },
];

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <img className="crest" src="img/logo.svg" alt="" width="240" height="210" />
        <h1 className="brand">AbrahamsTree</h1>
        <p className="kicker"><span>Bible Study &amp; Faith Journey</span></p>
        <div className="rule" aria-hidden="true"><span>†</span></div>
      </section>
      <figure className="promise">
        <blockquote>“All the families of the earth will be blessed through you.”</blockquote>
        <figcaption>Genesis 12:3 (WEB)</figcaption>
      </figure>
      <nav className="tiles" aria-label="Sections">
        {TILES.map((t) => (
          <a key={t.href} href={t.href} className={`tile${t.wide ? ' wide' : ''}`}>
            <img src={t.img} alt="" loading="lazy" />
            <span className="tile-body">
              <svg className="tile-icon icon" viewBox="0 0 24 24" aria-hidden="true">{ICONS[t.icon]}</svg>
              <strong>{t.title}</strong>
              <span className="tile-text">{t.text}</span>
            </span>
            <span className="chev" aria-hidden="true">›</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
