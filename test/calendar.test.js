import { test } from 'node:test';
import assert from 'node:assert';
import { pascha, feastDate, upcoming, longDate, daysUntil, iso } from '../src/lib/calendar.js';

test('Orthodox Pascha falls on the known dates', () => {
  assert.strictEqual(iso(pascha(2024)), '2024-05-05');
  assert.strictEqual(iso(pascha(2025)), '2025-04-20');
  assert.strictEqual(iso(pascha(2026)), '2026-04-12');
  assert.strictEqual(iso(pascha(2027)), '2027-05-02');
  assert.strictEqual(iso(pascha(2028)), '2028-04-16');
});

test('movable and fixed feasts', () => {
  assert.strictEqual(iso(feastDate('The Sunday before Pascha', 2027)), '2027-04-25');
  assert.strictEqual(iso(feastDate('Forty days after Pascha', 2027)), '2027-06-10');
  assert.strictEqual(iso(feastDate('Fifty days after Pascha', 2027)), '2027-06-20');
  assert.strictEqual(iso(feastDate('December 25', 2026)), '2026-12-25');
});

test('the next year of feasts, in order', () => {
  const list = upcoming('2026-11-24');
  assert.strictEqual(list[0].name, 'St. Nicholas the Wonderworker');
  assert.ok(list.some((f) => f.name.startsWith('Pascha') && f.date === '2027-05-02'));
  assert.ok(list.every((f, i) => i === 0 || list[i - 1].date <= f.date));
  assert.strictEqual(list.filter((f) => f.great).length, 13);
});

test('dates for people', () => {
  assert.strictEqual(longDate('2027-05-02'), 'Sunday, May 2, 2027');
  assert.strictEqual(daysUntil('2026-11-24', '2026-12-25'), 31);
});
