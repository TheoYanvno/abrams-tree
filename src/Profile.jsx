import { useState } from 'react';
import { planById, schedule, dayNumber, today } from './lib/plans.js';
import { empty, streak, completion } from './lib/progress.js';
import { emptyList, open } from './lib/prayers.js';
import { load } from './lib/storage.js';

/** Your journey so far: the plan you are on, your streak, highlights and prayer requests. Everything stays on this device. */
export default function Profile() {
  const [cleared, setCleared] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const setup = load('abramstree.plan', null);
  const plan = setup && planById(setup.planId);
  const progress = plan ? load(`abramstree.progress.${plan.id}`, empty()) : empty();
  const total = plan ? schedule(plan).length : 0;
  const stats = completion(progress, total);
  const now = today();
  const day = setup ? dayNumber(setup.start, now) + 1 : 0;
  const highlights = Object.keys(load('abramstree.highlights', {})).length;
  const prayers = load('abramstree.prayers', emptyList());
  const notes = Object.keys(progress.notes).length;

  const clear = () => {
    try { Object.keys(localStorage).filter((k) => k.startsWith('abramstree.')).forEach((k) => localStorage.removeItem(k)); } catch { /* storage blocked */ }
    setCleared(true); setConfirm(false);
  };

  return (
    <>
      <section className="card profile-head">
        <img src="img/logo.svg" alt="" width="72" height="63" />
        <div>
          <h2>Your faith journey</h2>
          <p className="muted small">Your progress is saved only in this browser, on this device.</p>
        </div>
      </section>

      <section className="card">
        <h2>Reading plan</h2>
        {plan ? (
          <>
            <p className="reading">{plan.name}</p>
            <p className="muted">Started {setup.start}{day > 0 && day <= total ? ` · today is day ${day} of ${total}` : ''}</p>
            <div className="stat-grid">
              <div><strong>{streak(progress, now)}</strong><span>day streak</span></div>
              <div><strong>{stats.done}</strong><span>days read</span></div>
              <div><strong>{stats.percent}%</strong><span>complete</span></div>
            </div>
            <div className="bar" role="progressbar" aria-valuenow={stats.percent} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${stats.percent}%` }} /></div>
            <p><a href="#read">Go to today’s reading ›</a></p>
          </>
        ) : (
          <p>You haven’t started a plan yet. <a href="#read">Choose a reading plan ›</a></p>
        )}
      </section>

      <section className="card">
        <h2>Saved along the way</h2>
        <div className="stat-grid">
          <div><strong>{highlights}</strong><span>highlighted verses</span></div>
          <div><strong>{notes}</strong><span>days with notes</span></div>
          <div><strong>{open(prayers).length}</strong><span>open prayer requests</span></div>
        </div>
        <p><a href="#pray">Prayer requests ›</a> &nbsp; <a href="#bible">Read the Bible ›</a></p>
      </section>

      <section className="card">
        <h2>The Study Bible</h2>
        <p>AbrahamsTree goes with the <em>AbrahamsTree Study Bible</em>: the whole Bible in a year, in four volumes, with saints, prayers, maps and Doré’s engravings. The QR codes in the book open the matching page here.</p>
      </section>

      <section className="card">
        <h2>Start over</h2>
        {cleared ? <p>Your plan, notes, highlights and prayer requests have been cleared from this device.</p> : !confirm ? (
          <button className="ghost" onClick={() => setConfirm(true)}>Clear my data on this device</button>
        ) : (
          <p>This removes your plan, notes, highlights and prayer requests, and can’t be undone.
            <br /><button className="primary danger" onClick={clear}>Yes, clear everything</button> <button className="link" onClick={() => setConfirm(false)}>Keep my data</button></p>
        )}
      </section>
    </>
  );
}
