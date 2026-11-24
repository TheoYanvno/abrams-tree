import { useEffect, useMemo, useRef, useState } from 'react';
import { BASEMAP, PLACES, ERAS, FULL, project, placeById, filterEvents, eventBooks, eventsAt, zoomAt, pan, centreOn, nextIndex, fitBoth, footsteps } from './lib/map.js';
import { bookById, superbookLink } from './lib/books.js';
import { periodIdFor, periodById, peopleOf } from './data/history.js';

const PLAY_MS = 3000;
const WALK_MS = 1800;                                   // how long the footprints take to walk to the next place

// A sandal print: the wide sole leads and the small heel follows. Drawn pointing down; it is turned to face the way of travel.
const FOOT = 'M0 -1.5c2.6 0 3.6 2.4 3.4 4.9-.2 2.6-1.3 4.6-3.4 4.6s-3.2-2-3.4-4.6C-3.6.9-2.6-1.5 0-1.5zM-.2-3.2c-1.9 0-3-1.6-2.8-3.4.2-1.6 1.4-2.4 2.8-2.4 1.6 0 2.8 1 2.8 2.7s-1 3.1-2.8 3.1z';

export default function BibleMap({ route = {} }) {
  const [view, setView] = useState(FULL);
  const [era, setEra] = useState(() => (route.kind === 'era' && ERAS.some((x) => x.id === route.id) ? route.id : 'all'));
  const [book, setBook] = useState('all');
  const [placeId, setPlaceId] = useState(null);
  const [playing, setPlaying] = useState(null);          // index into the filtered events, or null
  const [legs, setLegs] = useState([]);                  // the journey so far: [{ from, to }] in map units
  const [upTo, setUpTo] = useState(null);                // the last event reached on the journey, or null for every place
  const [periodId, setPeriodId] = useState(null);       // the history period chosen by hand
  const svg = useRef(null);
  const drag = useRef(null);

  const events = useMemo(() => filterEvents({ era, book }), [era, book]);
  const shown = useMemo(() => new Set(events.map((e) => e.place)), [events]);
  const current = playing !== null ? events[playing] : null;
  const place = placeId && placeById(placeId);
  // The history periods the chosen events pass through, in story order; the card follows the journey while it plays.
  const periods = useMemo(() => [...new Set(events.map(periodIdFor))].filter(Boolean), [events]);
  const period = periodById((current && periodIdFor(current)) || (periods.includes(periodId) ? periodId : periods[0]));
  const unit = view.w / FULL.w;                          // shrink markers and labels as you zoom in
  // While the journey plays (and after, until it is reset) only the places reached so far are drawn.
  const reached = useMemo(() => (upTo === null ? null : new Set(events.slice(0, upTo + 1).map((e) => e.place))), [upTo, events]);

  // Play the events through in order: each one is selected and the map flies to it.
  useEffect(() => {
    if (playing === null) return;
    const e = events[playing];
    if (!e) { setPlaying(null); return; }
    setPlaceId(e.place);
    const here = project(placeById(e.place));
    const before = playing > 0 && events[playing - 1].place !== e.place ? project(placeById(events[playing - 1].place)) : null;
    if (playing === 0) setLegs([]);
    setUpTo(playing);
    if (before) {
      setLegs((l) => [...l, { from: before, to: here }]);
      setView(fitBoth(before, here, Math.min(view.w, 320)));
    } else setView(centreOn(here, Math.min(view.w, 320)));
    const id = setTimeout(() => setPlaying((i) => (i === null ? null : nextIndex(i, events.length))), PLAY_MS);
    return () => clearTimeout(id);
  }, [playing, events]);
  useEffect(() => { setPlaying(null); setLegs([]); setUpTo(null); }, [era, book]);
  const showAll = () => { setPlaying(null); setLegs([]); setUpTo(null); setView(FULL); };

  // Map units per screen pixel, and a screen point in map units.
  const ratio = () => view.w / (svg.current?.clientWidth || FULL.w);
  const toMap = (e) => {
    const r = svg.current.getBoundingClientRect();
    return { x: view.x + (e.clientX - r.left) * ratio(), y: view.y + (e.clientY - r.top) * ratio() };
  };

  useEffect(() => {
    const el = svg.current;
    const onWheel = (e) => { e.preventDefault(); const p = toMap(e); setView((v) => zoomAt(v, e.deltaY > 0 ? 1.25 : 0.8, p.x, p.y)); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const down = (e) => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; };
  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 2) {
      d.moved = true;                                    // a drag, not a click: keep the pointer even off the map
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* already released */ }
    }
    drag.current = { ...d, x: e.clientX, y: e.clientY };
    setView((v) => pan(v, -dx * ratio(), -dy * ratio()));
  };
  const up = () => { setTimeout(() => { drag.current = null; }, 0); };
  const leave = () => { if (drag.current && !drag.current.moved) drag.current = null; };
  const choose = (id) => {
    if (drag.current?.moved) return;
    setPlaceId(id); setPlaying(null);
    const first = events.find((e) => e.place === id);
    if (first) setPeriodId(periodIdFor(first));
  };
  const keys = (e) => {
    const step = view.w * 0.1;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) { e.preventDefault(); setView((v) => pan(v, ...moves[e.key])); }
    if (e.key === '+' || e.key === '=') setView((v) => zoomAt(v, 0.8));
    if (e.key === '-') setView((v) => zoomAt(v, 1.25));
  };

  return (
    <>
      <section className="card map-card" aria-labelledby="map">
        <h2 id="map">Where it happened</h2>
        <div className="row">
          <label>Era
            <select value={era} onChange={(e) => setEra(e.target.value)}>
              <option value="all">All of the Bible</option>
              {ERAS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </label>
          <label>Book
            <select value={book} onChange={(e) => setBook(e.target.value)}>
              <option value="all">Every book</option>
              {eventBooks().map((b) => <option key={b} value={b}>{bookById(b).label}</option>)}
            </select>
          </label>
          <button className="primary" onClick={() => setPlaying(playing === null ? 0 : null)} disabled={!events.length}>
            {playing === null ? '▶ Play in order' : '⏸ Stop'}
          </button>
          {upTo !== null && playing === null && <button onClick={showAll}>Show every place</button>}
        </div>
        <div className="map-wrap">
          <svg
            ref={svg} className="map" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} role="application" tabIndex={0}
            aria-label="Map of biblical places. Drag or use the arrow keys to move, the mouse wheel or + and - to zoom."
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={leave} onKeyDown={keys}
          >
            <defs>
              {/* Ink that wobbles a little, like a pen on paper. */}
              <filter id="ink" x="-2%" y="-2%" width="104%" height="104%">
                <feTurbulence type="fractalNoise" baseFrequency={0.04 / unit} numOctaves="2" seed="3" />
                <feDisplacementMap in="SourceGraphic" scale={2.4 * unit} />
              </filter>
              <pattern id="waves" patternUnits="userSpaceOnUse" width={28 * unit} height={14 * unit}>
                <path d={`M0 ${7 * unit} q${3.5 * unit} ${-3 * unit} ${7 * unit} 0 t${7 * unit} 0`} className="wave" strokeWidth={0.6 * unit} />
              </pattern>
              <path id="foot" d={FOOT} />
            </defs>
            <rect x="0" y="0" width={FULL.w} height={FULL.h} className="sea" />
            <rect x="0" y="0" width={FULL.w} height={FULL.h} fill="url(#waves)" />
            <g filter="url(#ink)">
              {BASEMAP.land.map((d, i) => <path key={`h${i}`} d={d} className="coast-shade" fillRule="evenodd" strokeWidth={7 * unit} />)}
              {BASEMAP.land.map((d, i) => <path key={i} d={d} className="land" fillRule="evenodd" strokeWidth={1.1 * unit} />)}
              {BASEMAP.lakes.map((l, i) => <path key={i} d={l.d} className="lake" strokeWidth={0.8 * unit} />)}
              {BASEMAP.rivers.map((r, i) => <path key={i} d={r.d} className="river" strokeWidth={1.3 * unit} />)}
            </g>
            <g className="trail">
              {legs.map((leg, li) => {
                const steps = footsteps(leg.from, leg.to, 9 * unit);
                const newest = li === legs.length - 1 && playing !== null;
                return steps.map((s, i) => (
                  <use key={`${li}-${i}`} href="#foot" className={newest ? 'step walking' : 'step'}
                    transform={`translate(${s.x} ${s.y}) rotate(${s.angle - 90}) scale(${0.42 * unit}) scale(${s.left ? -1 : 1} 1)`}
                    style={newest ? { animationDelay: `${(i / steps.length) * WALK_MS}ms` } : undefined} />
                ));
              })}
            </g>
            {PLACES.filter((p) => shown.has(p.id) && (!reached || reached.has(p.id))).map((p) => {
              const { x, y } = project(p);
              const on = p.id === placeId;
              return (
                <g key={p.id} className={on ? 'place on' : 'place'} onClick={() => choose(p.id)}>
                  <circle cx={x} cy={y} r={(on ? 7 : 5) * unit} strokeWidth={1.4 * unit} />
                  <circle cx={x} cy={y} r={1.6 * unit} className="dot" />
                  {(on || view.w < FULL.w * 0.45) && (
                    <text x={x + 8 * unit} y={y + 4 * unit} fontSize={12 * unit} strokeWidth={3 * unit}>{p.name}</text>
                  )}
                  <title>{p.name}</title>
                </g>
              );
            })}
          </svg>
          <svg className="compass" viewBox="-30 -30 60 60" aria-hidden="true">
            <circle r="17" /><circle r="12" />
            <path d="M0-27 4-4 0 0-4-4z" className="needle" /><path d="M0 27 4 4 0 0-4 4zM27 0 4 4 0 0 4-4zM-27 0-4 4 0 0-4-4z" />
            <text y="-19" dy="-9" textAnchor="middle">N</text>
          </svg>
          <div className="zoom">
            <button aria-label="Zoom in" onClick={() => setView((v) => zoomAt(v, 0.7))}>+</button>
            <button aria-label="Zoom out" onClick={() => setView((v) => zoomAt(v, 1.4))}>−</button>
            <button aria-label="Show the whole map" onClick={() => setView(FULL)}>⤢</button>
          </div>
        </div>
        {current && <p className="now-playing">{playing + 1} of {events.length}: <strong>{current.title}</strong> ({bookById(current.book).label} {current.chapter})</p>}
      </section>

      {period && (
        <section className="card history" aria-labelledby="history">
          <h2 id="history">Historical context</h2>
          {periods.length > 1 && (
            <div className="chips" role="group" aria-label="Choose a period">
              {periods.map((id) => (
                <button key={id} className={id === period.id ? 'chip on' : 'chip'} aria-pressed={id === period.id}
                  onClick={() => { setPlaying(null); setPeriodId(id); }}>{periodById(id).name}</button>
              ))}
            </div>
          )}
          <h3>{period.name}</h3>
          <p className="muted">{period.years}</p>
          <dl>
            <dt>Kingdom or empire</dt><dd>{period.power}</dd>
            <dt>Who was in charge</dt><dd>{period.rulers}</dd>
            <dt>Main culture</dt><dd>{period.culture}</dd>
            <dt>Religion in the region</dt><dd>{period.religion}</dd>
            <dt>How {peopleOf(period.id)} were seen</dt><dd>{period.seen}</dd>
            <dt>Read</dt><dd>{period.scripture}</dd>
          </dl>
        </section>
      )}

      {place && (
        <section className="card" aria-labelledby="place">
          <h2 id="place">{place.name}</h2>
          <ul className="events">
            {eventsAt(place.id).map((e) => (
              <li key={e.id}>
                {e.title}: <a href={superbookLink(e.book, e.chapter)} target="_blank" rel="noreferrer">{bookById(e.book).label} {e.chapter}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card" aria-labelledby="timeline">
        <h2 id="timeline">Events in order</h2>
        <ol className="events">
          {events.map((e, i) => (
            <li key={e.id} className={current?.id === e.id ? 'on' : undefined}>
              <button className="link" onClick={() => { setPlaying(null); setPlaceId(e.place); setPeriodId(periodIdFor(e)); setView(centreOn(project(placeById(e.place)), 320)); }}>{e.title}</button>
              {' '}<span className="muted">{placeById(e.place).name} · {bookById(e.book).label} {e.chapter}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
