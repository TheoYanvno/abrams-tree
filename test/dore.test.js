import test from 'node:test';
import assert from 'node:assert';
import { gunzipSync } from 'node:zlib';
import { readFileSync, existsSync } from 'node:fs';
import { weeks } from '../src/lib/book.js';
import { plate, platesByChapter, leadFor, LEAD, PLATE_COUNT } from '../src/lib/dore.js';

const BIBLE = JSON.parse(gunzipSync(readFileSync(new URL('../tools/data/web.json.gz', import.meta.url))).toString('utf8'));

test('every Doré plate sits at a real verse and has its print and app copies', () => {
  assert.ok(PLATE_COUNT > 200);
  for (const list of Object.values(platesByChapter())) for (const p of list) {
    const verses = BIBLE[p.book][String(p.chapter)].flatMap(([, parts]) => parts.map(([v]) => v));
    assert.ok(verses.includes(p.verse), `${p.title}: ${p.book} ${p.chapter}:${p.verse}`);
    const file = `${String(p.n).padStart(3, '0')}.jpg`;
    assert.ok(existsSync(new URL(`../tools/data/dore/print/${file}`, import.meta.url)), file);
    assert.ok(existsSync(new URL(`../public/dore/${file}`, import.meta.url)), file);
  }
});

test('every week opens with a plate, and the chosen leads exist', () => {
  for (const n of Object.values(LEAD)) assert.ok(plate(n), `plate ${n}`);
  for (const w of weeks()) assert.ok(leadFor(w), `week ${w.week}`);
});
