// Reading a chapter in several translations side by side, from bible-api.com (the same free service
// SuperBook reads). Every translation here is in the public domain. Chapters are cached, so switching
// back and forth doesn't ask the service again, and errors explain themselves.

export const TRANSLATIONS = [
  { id: 'web', name: 'World English Bible' },
  { id: 'kjv', name: 'King James Version' },
  { id: 'asv', name: 'American Standard Version (1901)' },
  { id: 'dra', name: 'Douay-Rheims (1899)' },
  { id: 'ylt', name: "Young's Literal Translation" },
  { id: 'bbe', name: 'Bible in Basic English' },
];

export const translationById = (id) => TRANSLATIONS.find((t) => t.id === id);

const cache = new Map();

/** A chapter as [{ verse, text }], fetched once per book, chapter and translation. */
export function loadChapter(book, chapter, translation, fetchFn = globalThis.fetch) {
  const key = `${book} ${chapter} ${translation}`;
  if (!cache.has(key)) {
    const url = `https://bible-api.com/${encodeURIComponent(`${book} ${chapter}`)}?translation=${translation}`;
    cache.set(key, fetchFn(url).then(async (r) => {
      if (r.status === 429) throw new Error('The Bible text service is busy. Wait a minute and try again.');
      if (r.status === 404) throw new Error(`${book} ${chapter} isn't in the ${translationById(translation)?.name ?? translation}.`);
      if (!r.ok) throw new Error(`The Bible text service answered ${r.status}. Try again later.`);
      const data = await r.json();
      return (data.verses ?? []).map((v) => ({ verse: v.verse, text: v.text.replace(/\s+/g, ' ').trim() }));
    }).catch((e) => {
      cache.delete(key);
      throw e instanceof TypeError ? new Error("Couldn't reach the Bible text service. Check your connection.") : e;
    }));
  }
  return cache.get(key);
}

/** Lines up two or more translations by verse number: [{ verse, texts: [text or '' per translation] }]. */
export function sideBySide(chapters) {
  const verses = [...new Set(chapters.flatMap((c) => c.map((v) => v.verse)))].sort((a, b) => a - b);
  return verses.map((verse) => ({ verse, texts: chapters.map((c) => c.find((v) => v.verse === verse)?.text ?? '') }));
}

// --- highlights: { 'Book chapter:verse': true } ---------------------------------------------------

export const verseKey = (book, chapter, verse) => `${book} ${chapter}:${verse}`;

export function toggleHighlight(highlights, key) {
  const next = { ...highlights };
  if (next[key]) delete next[key];
  else next[key] = true;
  return next;
}
