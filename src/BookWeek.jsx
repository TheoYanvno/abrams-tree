import { useState } from 'react';
import { weeks, WEEKS, route } from './lib/book.js';
import { bookById, superbookLink } from './lib/books.js';
import Translations from './Translations.jsx';
import { INTROS, QUOTES, FACTS, MEMORY_STEPS, memoryFor, LESSONS, saintLife, TALKING } from './data/study.js';
import { platesInWeek, leadFor, plateRef } from './lib/dore.js';
import { EVENTS, placeById } from './lib/map.js';
import { BOOK_ENDS } from './data/bookEnds.js';

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
      <Places w={w} />
      <Translations chapters={day.chapters} />
    </>
  );
}

/** The same study notes the printed week has: the lesson, a saint's words and life, a "Did you know?", new books and a prayer to learn. */
function StudyNotes({ w }) {
  const [fact] = FACTS[w.week - 1];
  const [quote, who, source] = QUOTES[w.week - 1];
  const [lesson, lessonText, lessonRef] = LESSONS[w.week - 1];
  const life = saintLife(who);
  const { prayer: [title, text], step } = memoryFor(w.week);
  const intros = starting(w).filter((b) => INTROS[b]);
  return (
    <section className="card" aria-labelledby="studynotes">
      <h2 id="studynotes">Week {w.week}</h2>
      <h3>Lesson of the week: {lesson}</h3>
      <p>{lessonText} <span className="muted">{lessonRef}</span></p>
      <h3>This week's saint</h3>
      <blockquote>“{quote}”<cite>{who}{source ? `, ${source}` : ''}</cite></blockquote>
      {life && <p><strong>About {who}.</strong> {life[0]}{life[1] && <span className="muted"> Feast day: {life[1]}.</span>}</p>}
      <h3>Did you know?</h3>
      <p>{fact}</p>
      {intros.length > 0 && (
        <>
          <h3>New this week</h3>
          {intros.map((b) => <p key={b}><strong>{bookById(b).label}.</strong> {INTROS[b]}</p>)}
        </>
      )}
      <h3>Pray it by heart: {title} <span className="muted">(week {step} of 4)</span></h3>
      <p>{text}</p>
      <p className="muted">{MEMORY_STEPS[step - 1]}</p>
      <h3>Talking points</h3>
      <p className="muted">Something to think about or talk over at the end of the week. There are no set answers.</p>
      <ol>{TALKING[w.week - 1].map((q) => <li key={q}>{q}</li>)}</ol>
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

/** The places of this week's readings (the same as the map on the printed week's second page), and the
 *  summary of any book that ends this week. */
function Places({ w }) {
  const keys = new Set(w.days.flatMap((d) => d.chapters.map((c) => `${c.book}|${c.chapter}`)));
  const events = EVENTS.filter((e) => keys.has(`${e.book}|${e.chapter}`));
  const ending = [...new Set(w.days.flatMap((d) => d.chapters.filter((c) => c.chapter === bookById(c.book).chapters).map((c) => c.book)))];
  return (
    <section className="card" aria-labelledby="places">
      <h2 id="places">This week on the map</h2>
      <ol>
        {events.map((e) => (
          <li key={e.id}><a href={route('map', 'era', e.era)}>{placeById(e.place).name}</a>: {e.title} <span className="muted">({bookById(e.book).label} {e.chapter})</span></li>
        ))}
      </ol>
      {ending.filter((b) => BOOK_ENDS[b]).map((b) => (
        <div key={b}>
          <h3>The end of {bookById(b).label}</h3>
          <p>{BOOK_ENDS[b].summary}</p>
        </div>
      ))}
    </section>
  );
}
