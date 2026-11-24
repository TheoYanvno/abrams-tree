import { test } from 'node:test';
import assert from 'node:assert';
import { EVENTS } from '../src/data/places.js';
import { PERIODS, periodIdFor, periodById, peopleOf } from '../src/data/history.js';

test('every period answers each question', () => {
  assert.strictEqual(PERIODS.length, 13);
  assert.strictEqual(new Set(PERIODS.map((p) => p.id)).size, PERIODS.length);
  for (const p of PERIODS) {
    for (const k of ['name', 'years', 'power', 'rulers', 'culture', 'religion', 'seen', 'scripture']) {
      assert.ok(typeof p[k] === 'string' && p[k].length > 5, `${p.id} ${k}`);
    }
    assert.notStrictEqual(peopleOf(p.id), "God's people");
  }
});

test('every map event belongs to a period', () => {
  for (const e of EVENTS) assert.ok(periodById(periodIdFor(e)), `event ${e.id} ${e.title}`);
});

test('events land in the right period', () => {
  const at = (id) => periodIdFor(EVENTS.find((e) => e.id === id));
  assert.strictEqual(at(2), 'early');
  assert.strictEqual(at(3), 'patriarchs');
  assert.strictEqual(at(18), 'egypt');
  assert.strictEqual(at(43), 'judges');
  assert.strictEqual(at(54), 'divided');
  assert.strictEqual(at(65), 'judah');
  assert.strictEqual(at(81), 'judah');
  assert.strictEqual(at(103), 'exile');
  assert.strictEqual(at(132), 'persia');
  assert.strictEqual(at(134), 'maccabees');
  assert.strictEqual(at(146), 'greek');
  assert.strictEqual(periodIdFor(EVENTS.find((e) => e.era === 'jesus')), 'rome');
  assert.strictEqual(periodIdFor(EVENTS.find((e) => e.era === 'church')), 'church');
});
