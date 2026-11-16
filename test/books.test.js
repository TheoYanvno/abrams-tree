import test from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { BIBLE, BOOKS, bookById, superbookLink } from '../src/lib/books.js';

const SUPERBOOK = new URL('../../superbook/src/books.js', import.meta.url);

test('the Orthodox canon: Old Testament then 27 New Testament books', () => {
  assert.strictEqual(BOOKS.filter((b) => b.testament === 'new').length, 27);
  assert.strictEqual(BOOKS[0].id, 'Genesis');
  assert.strictEqual(bookById('Sirach').testament, 'old');
  assert.strictEqual(bookById('1 Samuel').label, '1 Kingdoms (1 Samuel)');
});

test('links open SuperBook at the chapter', () => {
  assert.strictEqual(superbookLink('Psalms', 23), 'https://theoyanvno.github.io/SuperBook/?book=Psalms&chapter=23');
  assert.strictEqual(superbookLink('1 John', 4), 'https://theoyanvno.github.io/SuperBook/?book=1%20John&chapter=4');
});

test('matches SuperBook exactly (when SuperBook is checked out next to this repo)', { skip: !existsSync(SUPERBOOK) }, () => {
  const body = readFileSync(SUPERBOOK, 'utf8').match(/export const BIBLE = \[([\s\S]*?)\n\];/)[1];
  const theirs = Function(`return [${body}]`)();
  assert.deepStrictEqual(BIBLE, theirs);
});
