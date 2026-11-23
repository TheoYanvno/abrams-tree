import { useMemo, useState } from 'react';
import { genesisPeople, floodYear, laterPeople, formatBcAd, formatFromCreation, formatGodTime, godDays, contemporaries,
  span, percent, ticks, GOD_TIME, GOD_DAY } from './lib/timeline.js';
import { bookById, superbookLink } from './lib/books.js';

const GENESIS = genesisPeople();
const LATER = laterPeople();

const CHARTS = {
  genesis: {
    label: 'Adam to Joseph',
    people: GENESIS,
    step: 100,
    tick: 500,
    year: (y) => formatFromCreation(y),
    short: (y) => y.toLocaleString('en-US'),
    intro: 'Years counted from creation, added up from the ages Genesis gives for each father and son.',
  },
  later: {
    label: 'Abraham to the apostles',
    people: LATER,
    step: 100,
    tick: 500,
    year: (y, about) => formatBcAd(y, about),
    short: (y) => (y < 0 ? `${-y} BC` : y === 0 ? 'BC | AD' : `AD ${y}`),
    intro: 'Years BC and AD, worked back from Solomon\'s temple (1 Kings 6:1). Dates marked c. are approximate.',
  },
};

/** The bands along the top: one of God's days for every thousand of our years. */
function dayBands(chart, s) {
  if (chart === 'genesis') {
    return godDays(s.from, s.to).map((d) => ({ ...d, label: `God's day ${d.day}`, full: d.to - d.from === GOD_DAY }));
  }
  const edges = [s.from, ...ticks(s, GOD_DAY).filter((y) => y > s.from && y < s.to), s.to];
  return edges.slice(1).map((to, i) => ({ from: edges[i], to, label: 'one day to God', full: to - edges[i] === GOD_DAY }));
}

export default function Timeline() {
  const [chart, setChart] = useState('genesis');
  const [selectedId, setSelectedId] = useState('adam');
  const [age, setAge] = useState('');
  const c = CHARTS[chart];
  const s = useMemo(() => span(c.people, c.step), [c]);
  const person = c.people.find((p) => p.id === selectedId) ?? c.people[0];
  const together = useMemo(() => contemporaries(person, c.people), [person, c]);
  const withIds = new Set(together.map((p) => p.id));
  const flood = chart === 'genesis' ? floodYear(GENESIS) : null;
  const years = (p) => `${c.year(p.born, p.about)} – ${c.year(p.died, p.about)}`;
  const pick = setSelectedId;

  return (
    <>
      <section className="card" aria-labelledby="when">
        <h2 id="when">When they lived</h2>
        <div className="hours" role="group" aria-label="Which part of the Bible">
          {Object.entries(CHARTS).map(([id, x]) => (
            <button key={id} className={`chip ${chart === id ? 'on' : ''}`} aria-pressed={chart === id}
              onClick={() => { setChart(id); setSelectedId(x.people[0].id); }}>{x.label}</button>
          ))}
        </div>
        <p className="muted">{c.intro} Each band along the top is a thousand years: one day to the Lord. Tap a name to see who was alive at the same time.</p>

        <div className="timeline" role="list">
          <div className="tl-row tl-days" aria-hidden="true">
            <span />
            <div className="tl-track">
              {dayBands(chart, s).map((d) => (
                <div key={d.from} className={`tl-day ${d.full ? '' : 'part'}`}
                  style={{ left: `${percent(d.from, s)}%`, width: `${percent(d.to, s) - percent(d.from, s)}%` }}>
                  {d.full || chart === 'genesis' ? d.label : ''}
                </div>
              ))}
            </div>
          </div>
          {c.people.map((p) => {
            const state = p.id === person.id ? 'on' : withIds.has(p.id) ? 'with' : 'dim';
            return (
              <div key={p.id} className={`tl-row ${state}`} role="listitem">
                <button className="tl-name link" onClick={() => pick(p.id)} aria-pressed={p.id === person.id}>{p.name}</button>
                <div className="tl-track">
                  {flood !== null && <div className="tl-flood" style={{ left: `${percent(flood, s)}%` }} />}
                  <button className={`tl-bar ${p.about ? 'about' : ''}`} onClick={() => pick(p.id)}
                    style={{ left: `${percent(p.born, s)}%`, width: `${percent(p.died, s) - percent(p.born, s)}%` }}
                    aria-label={`${p.name}: ${years(p)}, lived ${p.lived} years`} title={`${p.name}: ${years(p)}`}>
                    <span>{p.lived}</span>
                  </button>
                </div>
              </div>
            );
          })}
          <div className="tl-row tl-axis" aria-hidden="true">
            <span />
            <div className="tl-track">
              {ticks(s, c.tick).map((y) => <span key={y} style={{ left: `${percent(y, s)}%` }}>{c.short(y)}</span>)}
            </div>
          </div>
        </div>
        {flood !== null && <p className="muted small"><span className="flood-key" /> The Flood, in year {flood.toLocaleString('en-US')} (Genesis 7). The number on each bar is how many years that person lived.</p>}
        {flood === null && <p className="muted small">The number on each bar is how many years that person lived.</p>}
      </section>

      <section className="card" aria-labelledby="person">
        <h2 id="person">{person.name}</h2>
        <p className="reading">{years(person)}</p>
        <div className="stats">
          <span>Lived<br /><strong>{person.lived} years</strong></span>
          <span>In God's time<br /><strong>{formatGodTime(person.lived)}</strong></span>
        </div>
        {person.note && <p>{person.note}</p>}
        <p><a href={superbookLink(person.book, person.chapter)} target="_blank" rel="noreferrer">Read {bookById(person.book).label} {person.chapter}</a></p>
        {together.length > 0 && (
          <>
            <h3>Alive at the same time</h3>
            <ul className="events">
              {together.map((p) => (
                <li key={p.id}>
                  <button className="link" onClick={() => pick(p.id)}>{p.name}</button>
                  {' '}<span className="muted">{p.shared > 0 ? `${p.about || person.about ? 'about ' : ''}${p.shared} years together` : 'in the same year'}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="card" aria-labelledby="godtime">
        <h2 id="godtime">A day with the Lord</h2>
        <p>“One day is with the Lord as a thousand years, and a thousand years as one day.” So whenever God speaks about time, we remember His day is a thousand of our years: a year of ours is about a minute and a half of His day.</p>
        {GOD_TIME.map(([id, ref, book, chapter, text, meaning]) => (
          <blockquote key={id}>
            {text}
            <cite><a href={superbookLink(book, chapter)} target="_blank" rel="noreferrer">{ref}</a> · {meaning}</cite>
          </blockquote>
        ))}
        <label className="field">How old are you?{' '}
          <input type="number" min="0" max="150" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '6em' }} />
        </label>
        {age !== '' && Number(age) >= 0 && (
          <p>{Number(age)} years is <strong>{formatGodTime(Number(age))}</strong> of God's day.</p>
        )}
      </section>
    </>
  );
}
