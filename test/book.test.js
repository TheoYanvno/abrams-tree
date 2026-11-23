import test from 'node:test';
import assert from 'node:assert';
import { layout, weeks, route, parseRoute, pageFor, contents, PLAN, WEEKS } from '../src/lib/book.js';
import { schedule } from '../src/lib/plans.js';
import { HOURS } from '../src/lib/prayers.js';
import { ERAS } from '../src/lib/map.js';

const pages = layout();

test('52 weeks cover all 365 days of the Bible-in-a-year plan, every chapter once', () => {
  const w = weeks();
  assert.strictEqual(w.length, WEEKS);
  assert.ok(w.slice(0, -1).every((x) => x.days.length === 7));
  assert.strictEqual(w.at(-1).days.length, 8, 'day 365 joins the last week');
  const days = w.flatMap((x) => x.days);
  assert.deepStrictEqual(days.map((d) => d.day), Array.from({ length: 365 }, (_, i) => i + 1));
  assert.strictEqual(days.flatMap((d) => d.chapters).length, schedule(PLAN).flat().length);
  assert.strictEqual(days[0].text, 'Genesis 1–4');
});

test('pages are numbered in order, the book has an even number of pages, and parts open on the right', () => {
  assert.deepStrictEqual(pages.map((p) => p.n), pages.map((_, i) => i + 1));
  assert.strictEqual(pages.length % 2, 0);
  for (const p of pages.filter((x) => x.kind === 'part')) assert.strictEqual(p.n % 2, 1, `part ${p.part}`);
  assert.deepStrictEqual(contents(pages).map((c) => c.part), [1, 2, 3, 4, 5]);
  assert.ok(pages.length >= 24 && pages.length <= 828, 'within KDP page limits');
});

test("each week's readings face its notes page", () => {
  const ws = pages.filter((p) => p.kind === 'week');
  assert.strictEqual(ws.length, WEEKS);
  for (const w of ws) {
    assert.strictEqual(w.n % 2, 0, `week ${w.week} is on a left-hand page`);
    assert.deepStrictEqual([pages[w.n].kind, pages[w.n].week], ['notes', w.week]);
  }
});

test('every QR link is a route the app understands, and the app can find the page again', () => {
  const linked = pages.filter((p) => p.link);
  assert.ok(linked.length > WEEKS + HOURS.length + ERAS.length);
  for (const p of linked) {
    const { tab } = parseRoute(p.link);
    assert.ok(['read', 'pray', 'map', 'timeline'].includes(tab), p.link);
  }
  assert.strictEqual(pageFor(route('read', 'week', 12)), pages.find((p) => p.kind === 'week' && p.week === 12).n);
  assert.strictEqual(pageFor('#map/era/exodus'), pages.find((p) => p.era === 'exodus').n);
  assert.strictEqual(pageFor('#pray/hour/ninth'), pages.find((p) => p.hour === 'ninth').n);
  assert.strictEqual(pageFor('#nowhere'), null);
  assert.deepStrictEqual(parseRoute('#read/week/12'), { tab: 'read', kind: 'week', id: '12' });
  assert.deepStrictEqual(parseRoute('#map'), { tab: 'map', kind: null, id: null });
});
