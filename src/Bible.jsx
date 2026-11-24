import { useEffect, useState } from 'react';
import { BOOKS, bookById, superbookLink } from './lib/books.js';
import { TRANSLATIONS, loadChapter, verseKey, toggleHighlight } from './lib/translations.js';
import { load, save } from './lib/storage.js';

const PLACE_KEY = 'abramstree.reader';
const MARK_KEY = 'abramstree.highlights';

/** Read any chapter of the Bible in a public-domain translation; tap a verse to highlight it. */
export default function Bible() {
  const [place, setPlace] = useState(() => load(PLACE_KEY, { book: 'Genesis', chapter: 1, translation: 'web' }));
  const [marks, setMarks] = useState(() => load(MARK_KEY, {}));
  const [state, setState] = useState({ status: 'loading' });
  const book = bookById(place.book) ?? BOOKS[0];
  const { chapter, translation } = place;

  useEffect(() => save(PLACE_KEY, place), [place]);
  useEffect(() => save(MARK_KEY, marks), [marks]);
  useEffect(() => {
    let live = true;
    setState({ status: 'loading' });
    loadChapter(book.id, chapter, translation)
      .then((verses) => live && setState({ status: 'ready', verses }))
      .catch((e) => live && setState({ status: 'error', message: e.message }));
    return () => { live = false; };
  }, [book.id, chapter, translation]);

  const go = (step) => {
    let i = BOOKS.indexOf(book), c = chapter + step;
    if (c < 1) { i = Math.max(0, i - 1); c = BOOKS[i].chapters; }
    if (c > BOOKS[i].chapters) { i = Math.min(BOOKS.length - 1, i + 1); c = 1; }
    setPlace((p) => ({ ...p, book: BOOKS[i].id, chapter: c }));
    scrollTo?.(0, 0);
  };
  const first = BOOKS.indexOf(book) === 0 && chapter === 1;
  const last = BOOKS.indexOf(book) === BOOKS.length - 1 && chapter === book.chapters;

  return (
    <>
      <section className="card">
        <h2>Read the Bible</h2>
        <div className="row">
          <label>Book
            <select value={book.id} onChange={(e) => setPlace((p) => ({ ...p, book: e.target.value, chapter: 1 }))}>
              <optgroup label="Old Testament">{BOOKS.filter((b) => b.testament === 'old').map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}</optgroup>
              <optgroup label="New Testament">{BOOKS.filter((b) => b.testament === 'new').map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}</optgroup>
            </select>
          </label>
          <label>Chapter
            <select value={chapter} onChange={(e) => setPlace((p) => ({ ...p, chapter: +e.target.value }))}>
              {Array.from({ length: book.chapters }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
            </select>
          </label>
          <label>Translation
            <select value={translation} onChange={(e) => setPlace((p) => ({ ...p, translation: e.target.value }))}>
              {TRANSLATIONS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
        </div>
      </section>

      <article className="card scripture">
        <h2>{book.label} {chapter}</h2>
        {state.status === 'loading' && <p className="muted">Getting {book.label} {chapter}…</p>}
        {state.status === 'error' && <p className="error">{state.message}</p>}
        {state.status === 'ready' && (
          <>
            <p className="muted small">Tap a verse to highlight it.</p>
            <div className="verses">
              {state.verses.map(({ verse, text }) => {
                const key = verseKey(book.id, chapter, verse);
                return (
                  <button key={verse} className={`verse${marks[key] ? ' marked' : ''}`} aria-pressed={!!marks[key]} onClick={() => setMarks((m) => toggleHighlight(m, key))}>
                    <sup>{verse}</sup> {text}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div className="pager">
          <button className="ghost" onClick={() => go(-1)} disabled={first}>‹ Previous</button>
          <a href={superbookLink(book.id, chapter)} target="_blank" rel="noreferrer">Open in SuperBook</a>
          <button className="ghost" onClick={() => go(1)} disabled={last}>Next ›</button>
        </div>
      </article>
    </>
  );
}
