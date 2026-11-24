import test from 'node:test';
import assert from 'node:assert';
import { INTROS, QUOTES, MEMORY, MEMORY_STEPS, FACTS, memoryFor } from '../src/data/study.js';
import { BOOKS } from '../src/lib/books.js';

test('every book has an introduction, and every week a quote and a "Did you know?"', () => {
  assert.deepStrictEqual(BOOKS.filter((b) => !INTROS[b.id]).map((b) => b.id), []);
  assert.strictEqual(QUOTES.length, 52);
  assert.strictEqual(FACTS.length, 52);
  for (const [words, who] of QUOTES) assert.ok(words && (who.startsWith('St.') || who.startsWith('Abba')), who);
});

test('thirteen prayers, four weeks each, cover the year', () => {
  assert.strictEqual(MEMORY.length * 4, 52);
  assert.strictEqual(MEMORY_STEPS.length, 4);
  assert.deepStrictEqual(memoryFor(1), { prayer: MEMORY[0], step: 1 });
  assert.deepStrictEqual(memoryFor(8), { prayer: MEMORY[1], step: 4 });
  assert.deepStrictEqual(memoryFor(52), { prayer: MEMORY[12], step: 4 });
});

import { ORTHODOXY } from '../src/data/orthodoxy.js';

test('the Orthodox Faith section has Scripture and saints for every point, and the twelve Great Feasts', () => {
  const O = ORTHODOXY;
  for (const list of [O.history, O.beliefs, O.values, O.join, O.holyWeek, O.fasts]) {
    for (const item of list) {
      const [scripture, saints] = item.at(-1);
      assert.ok(scripture && saints, item[0]);
    }
  }
  assert.strictEqual(O.feasts.length, 12);
  for (const [when, name, text, [scripture, saints]] of O.feasts) assert.ok(when && name && text && scripture && saints, name);
  for (const [, name, [scripture, saints]] of O.otherFeasts) assert.ok(scripture && saints, name);
  assert.ok(O.pascha[2][0] && O.pascha[2][1]);
  assert.strictEqual(O.join.length, 11);
});

import { LESSONS, SAINTS, saintLife } from '../src/data/study.js';

test('every week has a lesson, and every saint quoted has a short life', () => {
  assert.strictEqual(LESSONS.length, 52);
  for (const [lesson, text, ref] of LESSONS) assert.ok(lesson && text && ref, lesson);
  for (const [, who] of QUOTES) assert.ok(saintLife(who), who);
  for (const [life] of Object.values(SAINTS)) assert.ok(life.length > 40);
});

import { TALKING } from '../src/data/study.js';

test('every week ends with at least three talking points', () => {
  assert.strictEqual(TALKING.length, 52);
  for (const points of TALKING) assert.ok(points.length >= 3 && points.every((p) => p.endsWith('?') || p.endsWith('.')));
});

import { CHURCH } from '../src/data/orthodoxy.js';

test('going to church: the Liturgy step by step and its prayers, each with Scripture and saints', () => {
  assert.strictEqual(CHURCH.liturgy.length, 11);
  for (const list of [CHURCH.liturgy, CHURCH.prayers, CHURCH.visit, CHURCH.home]) for (const [k, t, [sc, sa]] of list) assert.ok(k && t && sc && sa, k);
  assert.ok(CHURCH.prayers.some(([k]) => k === 'The Nicene Creed'));
});
