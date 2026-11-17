import { useEffect, useState } from 'react';
import { bookById } from './lib/books.js';
import { TRANSLATIONS, loadChapter, sideBySide, verseKey, toggleHighlight } from './lib/translations.js';
import { load, save } from './lib/storage.js';

const PICK_KEY = 'abramstree.translations';
const MARK_KEY = 'abramstree.highlights';

/** Today's chapters in two translations side by side; tap a verse to highlight it. */
export default function Translations({ chapters }) {
  const [open, setOpen] = useState(false);
  const [which, setWhich] = useState(0);
  const [pick, setPick] = useState(() => load(PICK_KEY, ['web', 'kjv']));
  const [marks, setMarks] = useState(() => load(MARK_KEY, {}));
  const [state, setState] = useState({ status: 'idle' });
  const { book, chapter } = chapters[Math.min(which, chapters.length - 1)];

  useEffect(() => save(PICK_KEY, pick), [pick]);
  useEffect(() => save(MARK_KEY, marks), [marks]);
  useEffect(() => setWhich(0), [chapters]);
  useEffect(() => {
    if (!open) return;
    let live = true;
    setState({ status: 'loading' });
    Promise.all(pick.map((t) => loadChapter(book, chapter, t)))
      .then((cs) => live && setState({ status: 'ready', rows: sideBySide(cs) }))
      .catch((e) => live && setState({ status: 'error', message: e.message }));
    return () => { live = false; };
  }, [open, book, chapter, pick.join()]);

  const label = `${bookById(book).label} ${chapter}`;
  return (
    <section className="card" aria-labelledby="compare">
      <h2 id="compare">Compare translations</h2>
      {!open ? (
        <button className="primary" onClick={() => setOpen(true)}>Read today's chapters side by side</button>
      ) : (
        <>
          <div className="row">
            {chapters.length > 1 && (
              <label>Chapter
                <select value={which} onChange={(e) => setWhich(+e.target.value)}>
                  {chapters.map((c, i) => <option key={i} value={i}>{bookById(c.book).label} {c.chapter}</option>)}
                </select>
              </label>
            )}
            {pick.map((t, i) => (
              <label key={i}>{i === 0 ? 'Left' : 'Right'}
                <select value={t} onChange={(e) => setPick((p) => p.map((x, j) => (j === i ? e.target.value : x)))}>
                  {TRANSLATIONS.map((tr) => <option key={tr.id} value={tr.id}>{tr.name}</option>)}
                </select>
              </label>
            ))}
          </div>
          {state.status === 'loading' && <p className="muted">Getting {label}…</p>}
          {state.status === 'error' && <p className="error">{state.message}</p>}
          {state.status === 'ready' && (
            <table className="compare">
              <caption className="muted">{label}. Tap a verse to highlight it.</caption>
              <tbody>
                {state.rows.map(({ verse, texts }) => {
                  const key = verseKey(book, chapter, verse);
                  return (
                    <tr key={verse} className={marks[key] ? 'marked' : undefined} onClick={() => setMarks((m) => toggleHighlight(m, key))}>
                      <th scope="row">{verse}</th>
                      {texts.map((t, i) => <td key={i}>{t || <span className="muted">(not in this translation)</span>}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}
