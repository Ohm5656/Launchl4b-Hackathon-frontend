import { useState } from 'react';
import {
  addMonths,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameDay,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useWorkspace } from '../services/Workspace';
import {
  billingInMonth,
  money,
  type Subscription,
} from '../services/subscriptions';
import { SubscriptionDetailModal } from './SubscriptionDetailModal';

export function CalendarView() {
  const { anchors } = useWorkspace();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState<Subscription | null>(null);
  const payments = anchors
    .flatMap((s) => {
      const date = billingInMonth(s, month);
      return date ? [{ ...s, date }] : [];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  const days = [
    ...Array(getDay(month)).fill(null),
    ...eachDayOfInterval({ start: month, end: endOfMonth(month) }),
  ];
  while (days.length % 7) days.push(null);
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Billing calendar</h1>
          <p>Plan around your renewals, one month at a time.</p>
        </div>
        <span className="badge">
          <CalendarDays size={14} />
          Recurring schedule
        </span>
      </header>
      <div className="calendar-layout">
        <section className="panel calendar-panel">
          <div className="calendar-header">
            <div>
              <h2>{format(month, 'MMMM yyyy')}</h2>
              <span>
                {payments.length} scheduled{' '}
                {payments.length === 1 ? 'payment' : 'payments'}
              </span>
            </div>
            <div>
              <button
                className="button secondary today-button"
                onClick={() => setMonth(startOfMonth(new Date()))}
              >
                Today
              </button>
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() => setMonth(addMonths(month, -1))}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() => setMonth(addMonths(month, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {days.map((day: Date | null, i) => (
              <div className={`calendar-day ${!day ? 'outside' : ''}`} key={i}>
                {day && (
                  <>
                    <span
                      className={`day-number ${isSameDay(day, new Date()) ? 'today' : ''}`}
                    >
                      {format(day, 'd')}
                    </span>
                    <div>
                      {payments
                        .filter((s) => isSameDay(parseISO(s.date), day))
                        .map((s) => (
                          <button
                            className="calendar-event"
                            key={s.id}
                            style={{ borderLeftColor: s.color }}
                            aria-label={`View ${s.name} on ${format(day, 'MMM d')}`}
                            onClick={() =>
                              setSelected(anchors.find((a) => a.id === s.id)!)
                            }
                          >
                            <span>{s.name}</span>
                            <small>{money(s.price)}</small>
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <p className="calendar-footnote">
            Renewals are projected from your saved billing dates and cycles.
          </p>
        </section>
        <aside className="calendar-aside">
          <section className="month-summary">
            <span>Scheduled this month</span>
            <strong>{money(payments.reduce((n, s) => n + s.price, 0))}</strong>
            <p>Across {payments.length} recurring payments</p>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Monthly agenda</h2>
            </div>
            <div className="agenda-list">
              {payments.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setSelected(anchors.find((a) => a.id === s.id)!)
                  }
                >
                  <span className="agenda-date">
                    {format(parseISO(s.date), 'MMM d')}
                  </span>
                  <span>
                    <strong>{s.name}</strong>
                    <small>{s.plan || s.category}</small>
                  </span>
                  <strong>{money(s.price)}</strong>
                </button>
              ))}
              {!payments.length && (
                <div className="empty-state">
                  <p>No renewals scheduled this month.</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
      {selected && (
        <SubscriptionDetailModal
          subscription={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
