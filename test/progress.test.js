import test from 'node:test';
import assert from 'node:assert';
import { empty, markDone, unmark, setNote, streak, completion, missed } from '../src/lib/progress.js';

test('marking and unmarking days never changes the original object', () => {
  const a = empty();
  const b = markDone(a, 0, '2026-11-16');
  assert.deepStrictEqual(a.done, {});
  assert.deepStrictEqual(unmark(b, 0).done, {});
});

test('the streak counts days in a row and survives the morning before reading', () => {
  let p = empty();
  p = markDone(p, 0, '2026-11-14');
  p = markDone(p, 1, '2026-11-15');
  assert.strictEqual(streak(p, '2026-11-16'), 2);   // nothing yet today: still 2
  p = markDone(p, 2, '2026-11-16');
  assert.strictEqual(streak(p, '2026-11-16'), 3);
  assert.strictEqual(streak(p, '2026-11-18'), 0);   // missed the 17th
});

test('two readings on one day count once, across a month boundary', () => {
  let p = empty();
  p = markDone(p, 0, '2026-11-30');
  p = markDone(p, 1, '2026-12-01');
  p = markDone(p, 2, '2026-12-01');
  assert.strictEqual(streak(p, '2026-12-01'), 2);
});

test('notes are kept, and clearing one removes it', () => {
  let p = setNote(empty(), 3, 'Pray for patience');
  assert.strictEqual(p.notes[3], 'Pray for patience');
  p = setNote(p, 3, '   ');
  assert.ok(!(3 in p.notes));
});

test('completion and missed days', () => {
  let p = markDone(empty(), 0, '2026-11-16');
  p = markDone(p, 2, '2026-11-18');
  assert.deepStrictEqual(completion(p, 30), { done: 2, total: 30, percent: 7 });
  assert.deepStrictEqual(missed(p, 4), [1, 3]);
});
