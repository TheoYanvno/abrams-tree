import { useMemo, useState } from 'react';
import { PLANS, planById, schedule, dayNumber, describe, today } from './lib/plans.js';
import { superbookLink, bookById } from './lib/books.js';

const STORE = 'abramstree.plan';
const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || null; } catch { return null; } };
const save = (v) => { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch { /* private mode */ } };

export default function App() {
  const [setup, setSetup] = useState(load);       // { planId, start } once a plan is chosen
  const [planId, setPlanId] = useState(PLANS[0].id);
  const [start, setStart] = useState(today());

  const plan = setup && planById(setup.planId);
  const days = useMemo(() => (plan ? schedule(plan) : []), [plan]);
  const n = setup ? dayNumber(setup.start, today()) : 0;

  const begin = (e) => {
    e.preventDefault();
    const next = { planId, start };
    save(next);
    setSetup(next);
  };

  return (
    <div className="app">
      <header>
        <h1>📜 AbramsTree</h1>
        <p className="tagline">A Bible study guide: a daily reading plan, prayers and a map of where it happened.</p>
      </header>

      {!plan ? (
        <form className="card" onSubmit={begin}>
          <h2>Choose a reading plan</h2>
          {PLANS.map((p) => (
            <label key={p.id} className="option">
              <input type="radio" name="plan" value={p.id} checked={planId === p.id} onChange={() => setPlanId(p.id)} />
              {p.name} <span className="muted">({p.days} days)</span>
            </label>
          ))}
          <label className="field">Start on <input type="date" value={start} onChange={(e) => setStart(e.target.value)} required /></label>
          <button className="primary">Start this plan</button>
        </form>
      ) : (
        <section className="card" aria-labelledby="today">
          <h2 id="today">{plan.name}</h2>
          {n < 0 && <p>Your plan starts on {setup.start}. Day 1 will show here then.</p>}
          {n >= days.length && <p>You've reached the end of this plan. Well done! 🎉</p>}
          {n >= 0 && n < days.length && (
            <>
              <p className="muted">Day {n + 1} of {days.length}</p>
              <p className="reading">{describe(days[n]).join(', ')}</p>
              <ul className="chapters">
                {days[n].map(({ book, chapter }) => (
                  <li key={`${book}-${chapter}`}>
                    <a href={superbookLink(book, chapter)} target="_blank" rel="noreferrer">
                      Read {bookById(book).label} {chapter} in SuperBook
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <button className="link" onClick={() => { save(null); setSetup(null); }}>Choose a different plan</button>
        </section>
      )}
      <footer className="muted">Bible text from the World English Bible (public domain), read in <a href="https://theoyanvno.github.io/SuperBook/">SuperBook</a>.</footer>
    </div>
  );
}
