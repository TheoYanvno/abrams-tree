import test from 'node:test';
import assert from 'node:assert';
import { BASEMAP, PLACES, EVENTS, ERAS, FULL, MIN_WIDTH, project, placeById, filterEvents, eventBooks, eventsAt,
  clampView, zoomAt, pan, centreOn, nextIndex } from '../src/lib/map.js';
import { bookById } from '../src/lib/books.js';

test('the base map has land, the Dead Sea and Sea of Galilee, and the great rivers', () => {
  assert.ok(BASEMAP.land.length > 10);
  const lakes = BASEMAP.lakes.map((l) => l.name);
  assert.ok(lakes.includes('Dead Sea') && lakes.includes('Sea of Galilee'));
  for (const r of ['Nile', 'Jordan', 'Tigris', 'Euphrates']) assert.ok(BASEMAP.rivers.some((x) => x.name === r), r);
});

test('every place is on the map and every event has a real place, era, book and chapter', () => {
  for (const p of PLACES) {
    const { x, y } = project(p);
    assert.ok(x >= 0 && x <= FULL.w && y >= 0 && y <= FULL.h, p.id);
  }
  for (const e of EVENTS) {
    assert.ok(placeById(e.place), e.title);
    assert.ok(ERAS.some((era) => era.id === e.era), e.title);
    const book = bookById(e.book);
    assert.ok(book && e.chapter >= 1 && e.chapter <= book.chapters, e.title);
  }
  const eras = EVENTS.map((e) => ERAS.findIndex((era) => era.id === e.era));
  assert.deepStrictEqual(eras, [...eras].sort((a, b) => a - b), 'events run in order, era by era');
});

test('Jerusalem sits east of Joppa and south of Damascus', () => {
  const j = project(placeById('jerusalem')), joppa = project(placeById('joppa')), d = project(placeById('damascus'));
  assert.ok(j.x > joppa.x && j.y > d.y);
});

test('filters by era and book, and lists what happened at a place', () => {
  assert.ok(filterEvents({ era: 'church' }).every((e) => e.era === 'church'));
  assert.deepStrictEqual(filterEvents({ book: 'Jonah' }).map((e) => e.place), ['joppa', 'nineveh']);
  assert.strictEqual(filterEvents().length, EVENTS.length);
  assert.ok(eventBooks().indexOf('Genesis') < eventBooks().indexOf('Acts'));
  assert.ok(eventsAt('jerusalem').length >= 5);
  assert.strictEqual(nextIndex(0, 2), 1);
  assert.strictEqual(nextIndex(1, 2), null);
});

test('zooming keeps the point under the pointer, and the view stays on the map', () => {
  const v = zoomAt(FULL, 0.5, 400, 300);
  assert.ok(Math.abs((400 - v.x) / v.w - 400 / FULL.w) < 1e-9);
  assert.ok(Math.abs(v.h / v.w - FULL.h / FULL.w) < 1e-9);
  assert.deepStrictEqual(zoomAt(FULL, 3), FULL);                       // can't zoom out past the whole map
  assert.strictEqual(zoomAt(FULL, 0.0001).w, MIN_WIDTH);
  const moved = pan(v, -10000, -10000);
  assert.deepStrictEqual([moved.x, moved.y], [0, 0]);
  const c = centreOn({ x: FULL.w - 1, y: 1 }, 100);
  assert.ok(c.x + c.w <= FULL.w && c.y >= 0);
  assert.deepStrictEqual(clampView({ x: 5, y: 5, w: 1e6 }), FULL);
});

import { weeks } from '../src/lib/book.js';
import { BOOKS } from '../src/lib/books.js';
import { BOOK_ENDS } from '../src/data/bookEnds.js';

test('every week of the reading plan has places on the map, and every book has its closing summary and timeline', () => {
  for (const w of weeks()) {
    const keys = new Set(w.days.flatMap((d) => d.chapters.map((c) => `${c.book}|${c.chapter}`)));
    assert.ok(EVENTS.some((e) => keys.has(`${e.book}|${e.chapter}`)), `week ${w.week}`);
  }
  for (const b of BOOKS) {
    const end = BOOK_ENDS[b.id];
    assert.ok(end && end.summary.length > 60 && end.span.length === 2 && end.events.length, b.id);
  }
});
