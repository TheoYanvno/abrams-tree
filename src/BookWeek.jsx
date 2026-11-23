import { useState } from 'react';
import { weeks, WEEKS, route } from './lib/book.js';
import { bookById, superbookLink } from './lib/books.js';
import Translations from './Translations.jsx';
import { INTROS, QUOTES, FACTS, MEMORY_STEPS, memoryFor } from './data/study.js';
import { platesInWeek, leadFor, plateRef } from './lib/dore.js';

const ALL = weeks();

/** Books whose first chapter is read in a week. */
const starting = (w) => [...new Set(w.days.flatMap((d) => d.chapters.filter((c) => c.chapter === 1).map((c) => c.book)))];

/** One week of the study book's reading plan, opened from the QR code on that week's page. */
export default function BookWeek({ week }) {
  const w = ALL[Math.min(Math.max(week, 1), WEEKS) - 1];
  const [pick, setPick] = useState(0);
  const day = w.days[pick];

  return (
    <>
      <section className="card" aria-labelledby="bookweek">
        <h2 id="bookweek">Week {w.week} of the Study Bible</h2>
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
      <StudyNotes w={w} />
      <Pictures w={w} />
      <Translations chapters={day.chapters} />
    </>
  );
}

/** The same study notes the printed week has: new books, a "Did you know?", a saint's words and a prayer to learn. */
function StudyNotes({ w }) {
  const [fact] = FACTS[w.week - 1];
  const [quote, who, source] = QUOTES[w.week - 1];
  const { prayer: [title, text], step } = memoryFor(w.week);
  const intros = starting(w).filter((b) => INTROS[b]);
  return (
    <section className="card" aria-labelledby="studynotes">
      <h2 id="studynotes">This week</h2>
      {intros.length > 0 && (
        <>
          <h3>New this week</h3>
          {intros.map((b) => <p key={b}><strong>{bookById(b).label}.</strong> {INTROS[b]}</p>)}
        </>
      )}
      <h3>Did you know?</h3>
      <p>{fact}</p>
      <h3>This week's saint</h3>
      <blockquote>“{quote}”<cite>{who}{source ? `, ${source}` : ''}</cite></blockquote>
      <h3>Pray it by heart: {title} <span className="muted">(week {step} of 4)</span></h3>
      <p>{text}</p>
      <p className="muted">{MEMORY_STEPS[step - 1]}</p>
    </section>
  );
}

/** The week's Doré engravings, the same ones printed beside these chapters in the book. */
function Pictures({ w }) {
  const inWeek = platesInWeek(w);
  const lead = leadFor(w);
  const all = lead && !inWeek.some((p) => p.n === lead.n) ? [lead, ...inWeek] : inWeek;
  if (!all.length) return null;
  return (
    <section className="card" aria-labelledby="pictures">
      <h2 id="pictures">Pictures this week</h2>
      <div className="plates">
        {all.map((p) => (
          <figure key={p.n} className="plate">
            <img src={`dore/${String(p.n).padStart(3, '0')}.jpg`} alt={`${p.title}, engraving by Gustave Doré`} loading="lazy" width={p.w} height={p.h} />
            <figcaption>{p.title} <span className="muted">· {plateRef(p)}</span></figcaption>
          </figure>
        ))}
      </div>
      <p className="muted small">Engravings by Gustave Doré, <i>La Grande Bible de Tours</i> (1866), public domain. Derived from AionianBible.org by Nainoia Inc.</p>
    </section>
  );
}
