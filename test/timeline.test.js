import test from 'node:test';
import assert from 'node:assert';
import { genesisPeople, floodYear, laterPeople, lifespan, formatBcAd, formatFromCreation, godTime, formatGodTime,
  godDayOf, godDays, contemporaries, span, percent, ticks, creationWeek, ordinal, GOD_TIME, GOD_DAY } from '../src/lib/timeline.js';
import { bookById } from '../src/lib/books.js';

const G = genesisPeople();
const g = (id) => G.find((p) => p.id === id);
const L = laterPeople();
const l = (id) => L.find((p) => p.id === id);

test('Genesis 5 and 11 add up: the Flood in year 1,656 and Abraham born in year 2,008', () => {
  assert.deepStrictEqual([g('adam').born, g('adam').died], [0, 930]);
  assert.deepStrictEqual([g('seth').born, g('noah').born, g('abraham').born], [130, 1056, 2008]);
  assert.strictEqual(floodYear(G), 1656);
  assert.strictEqual(g('arphaxad').born, floodYear(G) + 2, 'Arphaxad was born two years after the Flood');
  assert.strictEqual(g('joseph').died, 2369);
  assert.strictEqual(g('sarah').born - g('abraham').born, 10);
  assert.strictEqual(g('isaac').born - g('sarah').born, 90, 'Sarah was 90 when Isaac was born');
});

test('what the numbers show: Methuselah died in the Flood year, Adam knew Lamech, Shem saw Isaac born', () => {
  assert.strictEqual(g('methuselah').died, floodYear(G));
  assert.ok(g('adam').died > g('lamech').born);
  assert.ok(g('shem').died > g('isaac').born);
  assert.ok(G.every((p) => p.lived < GOD_DAY), 'no one lived a whole day of God');
  assert.strictEqual(godDayOf(g('adam').died), 1, 'Adam died within the first thousand years (Genesis 2:17)');
});

test('everyone has a real chapter, and lives run forwards', () => {
  for (const p of [...G, ...L]) {
    const book = bookById(p.book);
    assert.ok(book && p.chapter >= 1 && p.chapter <= book.chapters, p.id);
    assert.ok(p.died > p.born && p.lived > 0, p.id);
  }
  for (const v of GOD_TIME) assert.ok(bookById(v[2]) && v[3] <= bookById(v[2]).chapters, v[0]);
});

test('BC and AD dates agree with the lives Scripture gives', () => {
  assert.strictEqual(l('abraham').lived, g('abraham').lived);
  assert.strictEqual(l('isaac').lived, g('isaac').lived);
  assert.strictEqual(l('jacob').lived, g('jacob').lived);
  assert.strictEqual(l('joseph').lived, g('joseph').lived);
  assert.strictEqual(l('moses').lived, 120);
  assert.strictEqual(l('david').lived, 70);
  assert.strictEqual(l('aaron').born + 3, l('moses').born, 'Aaron was three years older than Moses');
  // Israel came out of Egypt 430 years after Jacob went down, when Moses was 80 (Exodus 7:7, 12:40).
  assert.strictEqual(l('moses').born + 80, l('jacob').born + 130 + 430);
  assert.strictEqual(lifespan(-5, 30), 34, 'no year zero');
});

test('formats years', () => {
  assert.strictEqual(formatBcAd(-1446), '1,446 BC');
  assert.strictEqual(formatBcAd(30, true), 'c. AD 30');
  assert.strictEqual(formatFromCreation(1656), 'Year 1,656');
});

test("God's time: a thousand years is one day", () => {
  assert.deepStrictEqual(godTime(1000), { days: 1, hours: 0, minutes: 0 });
  assert.strictEqual(formatGodTime(969), '23 hours 15 minutes');
  assert.strictEqual(formatGodTime(70), '1 hour 41 minutes');
  assert.strictEqual(formatGodTime(2250), '2 days 6 hours');
  assert.strictEqual(formatGodTime(0.1), 'less than a minute');
  assert.deepStrictEqual(godDays(0, 2400).map((d) => [d.day, d.from, d.to]), [[1, 0, 1000], [2, 1000, 2000], [3, 2000, 2400]]);
});

test('who was alive at the same time', () => {
  const withAdam = contemporaries(g('adam'), G).map((p) => p.id);
  assert.ok(withAdam.includes('lamech') && !withAdam.includes('noah'));
  assert.strictEqual(contemporaries(g('noah'), G).find((p) => p.id === 'abraham'), undefined, 'Noah died two years before Abraham was born');
  const withJesus = contemporaries(l('jesus'), L);
  assert.ok(withJesus.some((p) => p.id === 'baptist') && !withJesus.some((p) => p.id === 'nehemiah'));
});

test('chart maths', () => {
  const s = span(G);
  assert.deepStrictEqual(s, { from: 0, to: 2400 });
  assert.strictEqual(percent(1200, s), 50);
  assert.deepStrictEqual(ticks({ from: -2200, to: 100 }, 1000), [-2000, -1000, 0]);
  assert.deepStrictEqual(span(L, 100), { from: -2200, to: 100 });
});

test('six days of making and a day of rest: 7,000 of our years', () => {
  const week = creationWeek();
  assert.strictEqual(week.length, 7);
  assert.strictEqual(week.filter((d) => !d.rest).at(-1).to, 6000, 'six days of making are 6,000 years');
  assert.strictEqual(week.at(-1).to, 7000, 'with the day of rest, 7,000 years');
  assert.ok(week.at(-1).rest && week.slice(0, 6).every((d) => !d.rest));
  assert.deepStrictEqual([1, 2, 3, 4, 11, 12, 13, 21, 22].map(ordinal), ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd']);
});

import { wholeStory, wholeStoryFlood } from '../src/lib/timeline.js';

test('the whole story runs from Adam to St. Paul on one scale', () => {
  const all = wholeStory();
  assert.strictEqual(all[0].id, 'adam');
  assert.ok(all.some((p) => p.id === 'paul'));
  assert.strictEqual(all.filter((p) => p.id === 'abraham').length, 1);
  assert.strictEqual(all.find((p) => p.id === 'abraham').born, -2166);
  assert.strictEqual(all.find((p) => p.id === 'adam').born, -2166 - genesisPeople().find((p) => p.id === 'abraham').born);
  assert.ok(wholeStoryFlood() < -2166 && wholeStoryFlood() > -4114);
});
