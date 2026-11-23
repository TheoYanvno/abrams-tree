import { useEffect, useState } from 'react';
import { HOURS, hourById, currentHour, nextReminder, emptyList, addRequest, markAnswered, reopen, removeRequest,
  open, answered, prayerCalendar } from './lib/prayers.js';
import { today } from './lib/plans.js';
import { load, save } from './lib/storage.js';

const LIST_KEY = 'abramstree.prayers';
const TIMES_KEY = 'abramstree.prayerTimes';
const hhmm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const canNotify = () => typeof Notification !== 'undefined';

export default function Prayers({ route = {} }) {
  const [hourId, setHourId] = useState(() => (route.kind === 'hour' && hourById(route.id) ? route.id : currentHour(hhmm(new Date())).id));
  const [list, setList] = useState(() => load(LIST_KEY, emptyList()));
  const [times, setTimes] = useState(() => load(TIMES_KEY, []));
  const [text, setText] = useState('');
  const [permission, setPermission] = useState(() => (canNotify() ? Notification.permission : 'unsupported'));
  const hour = hourById(hourId);

  useEffect(() => save(LIST_KEY, list), [list]);
  useEffect(() => save(TIMES_KEY, times), [times]);

  // While the page is open, show a notification at the next chosen prayer time.
  useEffect(() => {
    if (permission !== 'granted') return;
    const next = nextReminder(times);
    if (!next) return;
    const id = setTimeout(() => {
      try { new Notification(`AbrahamsTree: ${next.hour.name}`, { body: next.hour.verse.text }); } catch { /* not allowed here */ }
      setTimes((t) => [...t]);                       // schedule the one after
    }, Math.min(next.at - Date.now(), 2 ** 31 - 1));
    return () => clearTimeout(id);
  }, [times, permission]);

  const toggleTime = (id) => setTimes((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const askPermission = async () => {
    if (!canNotify()) return;
    try { setPermission(await Notification.requestPermission()); } catch { setPermission('denied'); }
  };
  const downloadCalendar = () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const url = URL.createObjectURL(new Blob([prayerCalendar(times, today(), stamp)], { type: 'text/calendar' }));
    Object.assign(document.createElement('a'), { href: url, download: 'abramstree-prayer-times.ics' }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const add = (e) => { e.preventDefault(); setList((l) => addRequest(l, text, today())); setText(''); };
  const next = nextReminder(times);

  return (
    <>
      <section className="card" aria-labelledby="hour">
        <h2 id="hour">Pray now</h2>
        <div className="hours" role="tablist" aria-label="Hours of prayer">
          {HOURS.map((h) => (
            <button key={h.id} role="tab" aria-selected={h.id === hourId} className={h.id === hourId ? 'chip on' : 'chip'} onClick={() => setHourId(h.id)}>
              {h.name} <span className="muted">{h.time}</span>
            </button>
          ))}
        </div>
        <blockquote>{hour.verse.text} <cite>{hour.verse.ref}</cite></blockquote>
        {hour.prayers.map((p) => (
          <div key={p.title} className="prayer">
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </div>
        ))}
        <div className="prayer">
          <h3>Your prayers</h3>
          {open(list).length ? (
            <ul>{open(list).map((i) => <li key={i.id}>{i.text}</li>)}</ul>
          ) : <p className="muted">Add people and needs to your prayer list below, and they'll show here.</p>}
        </div>
      </section>

      <section className="card" aria-labelledby="list">
        <h2 id="list">Prayer list</h2>
        <form className="add" onSubmit={add}>
          <label className="sr-only" htmlFor="request">A person or need to pray for</label>
          <input id="request" value={text} onChange={(e) => setText(e.target.value)} placeholder="Someone or something to pray for" />
          <button className="primary" disabled={!text.trim()}>Add</button>
        </form>
        <ul className="requests">
          {open(list).map((i) => (
            <li key={i.id}>
              <span>{i.text} <span className="muted">since {i.added}</span></span>
              <span>
                <button className="link" onClick={() => setList((l) => markAnswered(l, i.id, today()))}>Answered</button>{' '}
                <button className="link" onClick={() => setList((l) => removeRequest(l, i.id))}>Remove</button>
              </span>
            </li>
          ))}
        </ul>
        {answered(list).length > 0 && (
          <details>
            <summary>Answered prayers ({answered(list).length})</summary>
            <ul className="requests">
              {answered(list).map((i) => (
                <li key={i.id}>
                  <span>✓ {i.text} <span className="muted">answered {i.answered}</span></span>
                  <button className="link" onClick={() => setList((l) => reopen(l, i.id))}>Pray again</button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section className="card" aria-labelledby="times">
        <h2 id="times">Prayer times</h2>
        <p className="muted">Choose the hours you want to be reminded of.</p>
        {HOURS.map((h) => (
          <label key={h.id} className="option">
            <input type="checkbox" checked={times.includes(h.id)} onChange={() => toggleTime(h.id)} /> {h.name} <span className="muted">at {h.time}</span>
          </label>
        ))}
        <p>
          <button className="primary" disabled={!times.length} onClick={downloadCalendar}>Add to my calendar (.ics)</button>
        </p>
        <p className="muted">The calendar file works best: your phone or computer reminds you every day, even when AbrahamsTree is closed.</p>
        {permission === 'default' && <button className="link" onClick={askPermission}>Also remind me here while this page is open</button>}
        {permission === 'granted' && next && <p className="muted">While this page is open, you'll get a reminder for {next.hour.name} at {hhmm(next.at)}.</p>}
        {permission === 'denied' && <p className="muted">Notifications are blocked for this site, so use the calendar file instead.</p>}
      </section>
    </>
  );
}
