import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [direction, setDirection] = useState(1);
  const reducedMotion = useReducedMotion();
  const changeMonth = (step: number) => {
    setDirection(step);
    setMonth((current) => addMonths(current, step));
  };
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
        <h1>Billing calendar</h1>
      </header>
      <section className="panel calendar-panel">
        <div className="calendar-header">
          <div>
            <h2>{format(month, 'MMMM yyyy')}</h2>
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
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Next month"
              onClick={() => changeMonth(1)}
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
        <motion.div
          key={format(month, 'yyyy-MM')}
          className="calendar-grid"
          initial={reducedMotion ? false : { opacity: 0, x: direction * 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25 }}
        >
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
        </motion.div>
        <div className="calendar-total">
          <span>Scheduled this month</span>
          <strong>
            {money(payments.reduce((sum, s) => sum + s.price, 0))}
          </strong>
        </div>
        <details className="calendar-agenda">
          <summary>Payment list</summary>
          <div className="agenda-list">
            {payments.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(anchors.find((a) => a.id === s.id)!)}
              >
                <span className="agenda-date">
                  {format(parseISO(s.date), 'MMM d')}
                </span>
                <span>
                  <strong>{s.name}</strong>
                </span>
                <strong>{money(s.price)}</strong>
              </button>
            ))}
            {!payments.length && (
              <div className="empty-state">
                <p>No payments scheduled this month.</p>
              </div>
            )}
          </div>
        </details>
      </section>
      {selected && (
        <SubscriptionDetailModal
          subscription={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
