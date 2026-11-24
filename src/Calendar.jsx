import { ORTHODOXY } from './data/orthodoxy.js';
import { upcoming, longDate, daysUntil } from './lib/calendar.js';
import { today } from './lib/plans.js';

const MONTH = (d) => new Date(`${d}T12:00:00Z`).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** The feasts of the coming year, the next one first, and the fasting seasons. */
export default function Calendar() {
  const now = today();
  const list = upcoming(now);
  const next = list.find((f) => f.great) ?? list[0];
  const away = daysUntil(now, next.date);
  const months = [];
  for (const f of list) {
    const m = MONTH(f.date);
    if (months.at(-1)?.month !== m) months.push({ month: m, feasts: [] });
    months.at(-1).feasts.push(f);
  }
  return (
    <>
      <section className="card next-feast">
        <p className="kicker-sm">Next Great Feast</p>
        <h2>{next.name}</h2>
        <p className="when">{longDate(next.date)} · {away === 0 ? 'today' : away === 1 ? 'tomorrow' : `in ${away} days`}</p>
        <p>{next.text}</p>
      </section>

      <section className="card">
        <h2>The coming year</h2>
        <p className="muted small">{ORTHODOXY.calendarNote}</p>
        {months.map(({ month, feasts }) => (
          <div key={month} className="month">
            <h3>{month}</h3>
            <ul className="feasts">
              {feasts.map((f) => (
                <li key={f.date + f.name} className={f.great ? 'great' : undefined}>
                  <span className="date">{longDate(f.date).replace(/, \d{4}$/, '')}</span>
                  <span>{f.name}{f.great && <span className="badge">Great Feast</span>}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Fasting seasons</h2>
        <dl className="fasts">
          {ORTHODOXY.fasts.map(([when, text]) => (
            <div key={when}><dt>{when}</dt><dd>{text}</dd></div>
          ))}
        </dl>
      </section>
    </>
  );
}
