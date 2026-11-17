import test from 'node:test';
import assert from 'node:assert';
import { TRANSLATIONS, loadChapter, sideBySide, verseKey, toggleHighlight } from '../src/lib/translations.js';

const reply = (status, body) => async () => ({ status, ok: status === 200, json: async () => body });

test('public-domain translations, the World English Bible first', () => {
  assert.strictEqual(TRANSLATIONS[0].id, 'web');
  assert.ok(TRANSLATIONS.length >= 4);
});

test('a chapter is fetched once, tidied, and errors explain themselves', async () => {
  let calls = 0;
  const ok = async (url) => {
    calls++;
    assert.strictEqual(url, 'https://bible-api.com/John%203?translation=kjv');
    return { status: 200, ok: true, json: async () => ({ verses: [{ verse: 16, text: 'For God so loved\nthe world ' }] }) };
  };
  assert.deepStrictEqual(await loadChapter('John', 3, 'kjv', ok), [{ verse: 16, text: 'For God so loved the world' }]);
  await loadChapter('John', 3, 'kjv', ok);
  assert.strictEqual(calls, 1);
  await assert.rejects(loadChapter('Tobit', 1, 'kjv', reply(404)), /isn't in the King James Version/);
  await assert.rejects(loadChapter('John', 4, 'web', reply(429)), /busy/);
  await assert.rejects(loadChapter('John', 5, 'web', async () => { throw new TypeError('fetch failed'); }), /Check your connection/);
});

test('translations line up by verse, and highlights toggle', () => {
  const rows = sideBySide([[{ verse: 1, text: 'a' }, { verse: 2, text: 'b' }], [{ verse: 2, text: 'B' }, { verse: 3, text: 'C' }]]);
  assert.deepStrictEqual(rows, [{ verse: 1, texts: ['a', ''] }, { verse: 2, texts: ['b', 'B'] }, { verse: 3, texts: ['', 'C'] }]);
  const key = verseKey('John', 3, 16);
  assert.strictEqual(key, 'John 3:16');
  const on = toggleHighlight({}, key);
  assert.deepStrictEqual(on, { 'John 3:16': true });
  assert.deepStrictEqual(toggleHighlight(on, key), {});
});
