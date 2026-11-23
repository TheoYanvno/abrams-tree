import { useState } from 'react';
import { weeks, WEEKS, route } from './lib/book.js';
import { bookById, superbookLink } from './lib/books.js';
import Translations from './Translations.jsx';

const ALL = weeks();

/** One week of the study book's reading plan, opened from the QR code on that week's page. */
export default function BookWeek({ week }) {
  const w = ALL[Math.min(Math.max(week, 1), WEEKS) - 1];
  const [pick, setPick] = useState(0);
  const day = w.days[pick];

  return (
    <>
      <section className="card" aria-labelledby="bookweek">
        <h2 id="bookweek">Week {w.week} of the study book</h2>
        <p className="muted">The whole Bible in a year. Tap a day to read it here in two translations, or open a chapter in SuperBook.</p>
        <ol className="week-days">
          {w.days.map((d, i) => (
            <li key={d.day} className={i === pick ? 'on' : undefined}>
              <button className="link" onClick={() => setPick(i)} aria-pressed={i === pick}>Day {d.day}: {d.text}</button>
              <span className="muted small">
                {' '}{d.chapters.map(({ book, chapter }) => (
                  <a key={`${book}-${chapter}`} href={superbookLink(book, chapter)} target="_blank" rel="noreferrer">{bookById(book).label} {chapter}</a>
                )).reduce((acc, a) => (acc.length ? [...acc, ' · ', a] : [a]), [])}
              </span>
            </li>
          ))}
        </ol>
        <p className="row">
          {w.week > 1 && <a href={route('read', 'week', w.week - 1)}>← Week {w.week - 1}</a>}
          {w.week < WEEKS && <a href={route('read', 'week', w.week + 1)}>Week {w.week + 1} →</a>}
        </p>
      </section>
      <Translations chapters={day.chapters} />
    </>
  );
}
