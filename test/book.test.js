import test from 'node:test';
import assert from 'node:assert';
import { weeks, route, parseRoute, pageFor, volumeOf, PLAN, WEEKS } from '../src/lib/book.js';
import { schedule } from '../src/lib/plans.js';
import PAGES from '../src/data/bookPages.json' with { type: 'json' };

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

test('four volumes of thirteen weeks', () => {
  assert.deepStrictEqual([1, 13, 14, 26, 27, 39, 40, 52].map(volumeOf), [1, 1, 2, 2, 3, 3, 4, 4]);
});

test('the page map has every week in its own volume, opening on a left-hand page, and the app finds it', () => {
  for (let w = 1; w <= WEEKS; w++) {
    const hit = pageFor(route('read', 'week', w));
    assert.ok(hit, `week ${w}`);
    assert.strictEqual(hit.volume, volumeOf(w), `week ${w} volume`);
    assert.strictEqual(hit.page % 2, 0, `week ${w} opens on a left-hand page`);
  }
  for (let w = 2; w <= WEEKS; w++) {
    const [a, b] = [pageFor(route('read', 'week', w - 1)), pageFor(route('read', 'week', w))];
    if (a.volume === b.volume) assert.ok(b.page > a.page, `week ${w} comes after week ${w - 1}`);
  }
  for (const link of Object.keys(PAGES)) assert.ok(['read', 'pray', 'map', 'timeline'].includes(parseRoute(link).tab), link);
  assert.ok(pageFor('#pray/hour/ninth') && pageFor('#map/era/church') && pageFor('#timeline/genesis'));
  assert.strictEqual(pageFor('#nowhere'), null);
  assert.deepStrictEqual(parseRoute('#read/week/12'), { tab: 'read', kind: 'week', id: '12' });
});
