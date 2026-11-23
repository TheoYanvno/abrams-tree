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
