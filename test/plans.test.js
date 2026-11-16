import test from 'node:test';
import assert from 'node:assert';
import { PLANS, planById, schedule, dayNumber, describe, today } from '../src/lib/plans.js';

test('every plan covers each chapter exactly once, in order, over its days', () => {
  for (const plan of PLANS) {
    const days = schedule(plan);
    assert.strictEqual(days.length, plan.days, plan.id);
    assert.deepStrictEqual(days.flat(), plan.chapters(), plan.id);
    const sizes = days.map((d) => d.length);
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, plan.id);
  }
});

test('Psalms in a month is five a day', () => {
  const days = schedule(planById('psalms-30'));
  assert.deepStrictEqual(describe(days[0]), ['Psalms 1–5']);
  assert.deepStrictEqual(describe(days[29]), ['Psalms 146–150']);
});

test('a day that crosses books reads naturally', () => {
  const day = [{ book: 'Matthew', chapter: 28 }, { book: 'Mark', chapter: 1 }, { book: 'Mark', chapter: 2 }];
  assert.deepStrictEqual(describe(day), ['Matthew 28', 'Mark 1–2']);
});

test('day numbers count calendar days, across months and leap years', () => {
  assert.strictEqual(dayNumber('2026-11-16', '2026-11-16'), 0);
  assert.strictEqual(dayNumber('2026-11-16', '2026-12-01'), 15);
  assert.strictEqual(dayNumber('2028-02-28', '2028-03-01'), 2);
  assert.strictEqual(dayNumber('2026-11-16', '2026-11-10'), -6);
  assert.strictEqual(today(new Date(2026, 10, 16, 23, 30)), '2026-11-16');
});
