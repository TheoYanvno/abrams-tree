import { useEffect, useMemo, useState } from 'react';
import { PLANS, planById, schedule, dayNumber, describe, today } from './lib/plans.js';
import { superbookLink, bookById } from './lib/books.js';
import { empty, markDone, unmark, setNote, streak, completion, missed } from './lib/progress.js';
import { load, save } from './lib/storage.js';
import Translations from './Translations.jsx';

const PLAN_KEY = 'abramstree.plan';
const progressKey = (planId) => `abramstree.progress.${planId}`;

export default function ReadingPlan() {
  const [setup, setSetup] = useState(() => load(PLAN_KEY, null));   // { planId, start }
  const [planId, setPlanId] = useState(PLANS[0].id);
  const [start, setStart] = useState(today());
  const [progress, setProgress] = useState(() => (setup ? load(progressKey(setup.planId), empty()) : empty()));
  const [viewing, setViewing] = useState(null);                      // a missed day being caught up on

  const plan = setup && planById(setup.planId);
  const days = useMemo(() => (plan ? schedule(plan) : []), [plan]);
  const now = today();
  const n = setup ? dayNumber(setup.start, now) : 0;
  const shown = viewing ?? n;

  useEffect(() => { if (setup) save(progressKey(setup.planId), progress); }, [setup, progress]);

  const begin = (e) => {
    e.preventDefault();
    const next = { planId, start };
    save(PLAN_KEY, next);
    setSetup(next);
    setProgress(load(progressKey(planId), empty()));
  };
  const change = () => { save(PLAN_KEY, null); setSetup(null); setViewing(null); };

  if (!plan) {
    return (
      <>
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
      </>
    );
  }

  const stats = completion(progress, days.length);
  const behind = missed(progress, Math.min(n, days.length));
  const isDone = shown in progress.done;

  return (
    <>
      <section className="stats" aria-label="Your progress">
        <div><strong>{streak(progress, now)}</strong> day streak 🔥</div>
        <div><strong>{stats.done}</strong> of {stats.total} days read</div>
        <div className="bar" role="progressbar" aria-valuenow={stats.percent} aria-valuemin="0" aria-valuemax="100">
          <span style={{ width: `${stats.percent}%` }} />
        </div>
      </section>

      <section className="card" aria-labelledby="reading">
        <h2 id="reading">{plan.name}</h2>
        {shown < 0 && <p>Your plan starts on {setup.start}. Day 1 will show here then.</p>}
        {shown >= days.length && <p>You've reached the end of this plan. Well done! 🎉</p>}
        {shown >= 0 && shown < days.length && (
          <>
            <p className="muted">
              Day {shown + 1} of {days.length}
              {viewing !== null && <> · catching up · <button className="link" onClick={() => setViewing(null)}>back to today</button></>}
            </p>
            <p className="reading">{describe(days[shown]).join(', ')}</p>
            <ul className="chapters">
              {days[shown].map(({ book, chapter }) => (
                <li key={`${book}-${chapter}`}>
                  <a href={superbookLink(book, chapter)} target="_blank" rel="noreferrer">
                    Read {bookById(book).label} {chapter} in SuperBook
                  </a>
                </li>
              ))}
            </ul>
            <button
              className={isDone ? 'done' : 'primary'}
              aria-pressed={isDone}
              onClick={() => setProgress((p) => (isDone ? unmark(p, shown) : markDone(p, shown, now)))}
            >
              {isDone ? '✓ Read' : 'Mark as read'}
            </button>
            <label className="field notes">
              Notes and prayers for this day
              <textarea
                rows="4"
                value={progress.notes[shown] || ''}
                onChange={(e) => setProgress((p) => setNote(p, shown, e.target.value))}
                placeholder="What stood out to you? Something to pray about?"
              />
            </label>
          </>
        )}
      </section>

      {behind.length > 0 && (
        <section className="card">
          <h2>Catch up</h2>
          <p className="muted">{behind.length} earlier {behind.length === 1 ? 'day is' : 'days are'} not marked read yet.</p>
          <ul className="catchup">
            {behind.slice(0, 7).map((d) => (
              <li key={d}><button className="link" onClick={() => setViewing(d)}>Day {d + 1}: {describe(days[d]).join(', ')}</button></li>
            ))}
          </ul>
        </section>
      )}

      {shown >= 0 && shown < days.length && <Translations chapters={days[shown]} />}

      <button className="link" onClick={change}>Choose a different plan</button>
    </>
  );
}
