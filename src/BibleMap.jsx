import { useEffect, useMemo, useRef, useState } from 'react';
import { BASEMAP, PLACES, ERAS, FULL, project, placeById, filterEvents, eventBooks, eventsAt, zoomAt, pan, centreOn, nextIndex } from './lib/map.js';
import { bookById, superbookLink } from './lib/books.js';

const PLAY_MS = 2500;

export default function BibleMap() {
  const [view, setView] = useState(FULL);
  const [era, setEra] = useState('all');
  const [book, setBook] = useState('all');
  const [placeId, setPlaceId] = useState(null);
  const [playing, setPlaying] = useState(null);          // index into the filtered events, or null
  const svg = useRef(null);
  const drag = useRef(null);

  const events = useMemo(() => filterEvents({ era, book }), [era, book]);
  const shown = useMemo(() => new Set(events.map((e) => e.place)), [events]);
  const current = playing !== null ? events[playing] : null;
  const place = placeId && placeById(placeId);
  const unit = view.w / FULL.w;                          // shrink markers and labels as you zoom in

  // Play the events through in order: each one is selected and the map flies to it.
  useEffect(() => {
    if (playing === null) return;
    const e = events[playing];
    if (!e) { setPlaying(null); return; }
    setPlaceId(e.place);
    setView(centreOn(project(placeById(e.place)), Math.min(view.w, 320)));
    const id = setTimeout(() => setPlaying((i) => (i === null ? null : nextIndex(i, events.length))), PLAY_MS);
    return () => clearTimeout(id);
  }, [playing, events]);
  useEffect(() => setPlaying(null), [era, book]);

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
  const choose = (id) => { if (!drag.current?.moved) { setPlaceId(id); setPlaying(null); } };
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
        </div>
        <div className="map-wrap">
          <svg
            ref={svg} className="map" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} role="application" tabIndex={0}
            aria-label="Map of biblical places. Drag or use the arrow keys to move, the mouse wheel or + and - to zoom."
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={leave} onKeyDown={keys}
          >
            <rect x="0" y="0" width={FULL.w} height={FULL.h} className="sea" />
            {BASEMAP.land.map((d, i) => <path key={i} d={d} className="land" fillRule="evenodd" strokeWidth={0.6 * unit} />)}
            {BASEMAP.lakes.map((l, i) => <path key={i} d={l.d} className="lake" strokeWidth={0.4 * unit} />)}
            {BASEMAP.rivers.map((r, i) => <path key={i} d={r.d} className="river" strokeWidth={1.2 * unit} />)}
            {PLACES.filter((p) => shown.has(p.id)).map((p) => {
              const { x, y } = project(p);
              const on = p.id === placeId;
              return (
                <g key={p.id} className={on ? 'place on' : 'place'} onClick={() => choose(p.id)}>
                  <circle cx={x} cy={y} r={(on ? 7 : 5) * unit} strokeWidth={1.5 * unit} />
                  {(on || view.w < FULL.w * 0.45) && (
                    <text x={x + 8 * unit} y={y + 4 * unit} fontSize={12 * unit} strokeWidth={3 * unit}>{p.name}</text>
                  )}
                  <title>{p.name}</title>
                </g>
              );
            })}
          </svg>
          <div className="zoom">
            <button aria-label="Zoom in" onClick={() => setView((v) => zoomAt(v, 0.7))}>+</button>
            <button aria-label="Zoom out" onClick={() => setView((v) => zoomAt(v, 1.4))}>−</button>
            <button aria-label="Show the whole map" onClick={() => setView(FULL)}>⤢</button>
          </div>
        </div>
        {current && <p className="now-playing">{playing + 1} of {events.length}: <strong>{current.title}</strong> ({bookById(current.book).label} {current.chapter})</p>}
      </section>

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
              <button className="link" onClick={() => { setPlaying(null); setPlaceId(e.place); setView(centreOn(project(placeById(e.place)), 320)); }}>{e.title}</button>
              {' '}<span className="muted">{placeById(e.place).name} · {bookById(e.book).label} {e.chapter}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
