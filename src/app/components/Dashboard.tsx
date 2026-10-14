import { useState } from 'react';
import {
  Search,
  ChevronRight,
  Mail,
  RefreshCw,
  CalendarDays,
  ArrowUpRight,
  Heart,
} from 'lucide-react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { useWorkspace } from '../services/Workspace';
import {
  dateLabel,
  daysUntil,
  money,
  monthlyCost,
  type Subscription,
} from '../services/subscriptions';
import { SubscriptionDetailModal } from './SubscriptionDetailModal';
import { ServiceIcon } from './ServiceIcon';
export type { Subscription } from '../services/subscriptions';

export function Dashboard() {
  const { subscriptions, isDemo, isSyncing, sync, anchors, lastSync } =
    useWorkspace();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Subscription | null>(null);
  const reducedMotion = useReducedMotion();
  const total = subscriptions.reduce((sum, s) => sum + monthlyCost(s), 0);
  const sorted = [...subscriptions].sort((a, b) =>
    a.nextBillingDate.localeCompare(b.nextBillingDate),
  );
  const next = sorted[0];
  const filtered = sorted.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page-stack consumer-overview">
      <header className="page-header consumer-page-header">
        <div>
          <h1>Your subscriptions</h1>
          <p>Keep enjoying. We’ll keep track of the renewals.</p>
        </div>
        {!isDemo &&
          (lastSync ? (
            <button
              className="button primary"
              disabled={isSyncing}
              onClick={sync}
            >
              <RefreshCw
                size={16}
                className={isSyncing ? 'loading-spinner' : undefined}
              />
              {isSyncing ? 'Refreshing…' : 'Refresh'}
            </button>
          ) : (
            <Link className="button primary" to="/add-gmail">
              <Mail size={16} />
              Connect Gmail
            </Link>
          ))}
      </header>
      <section className="consumer-summary" aria-label="Subscription summary">
        <div className="spending-card summary-spend">
          <div className="spending-copy">
            <span className="spend-label">
              <Heart size={17} />
              Your monthly total
            </span>
            <strong>
              {money(total)}
              <small> / month</small>
            </strong>
            <p>
              {subscriptions.length}{' '}
              {subscriptions.length === 1 ? 'subscription' : 'subscriptions'},
              all in one place.
            </p>
            <small className="spend-explainer">
              Annual plans averaged monthly
            </small>
          </div>
          {subscriptions.length > 0 && (
            <div className="service-stack" aria-hidden="true">
              {subscriptions.slice(0, 3).map((s, i) => (
                <div
                  key={s.id}
                  className={`stacked-service stacked-service-${i}`}
                >
                  <ServiceIcon subscription={s} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="next-renewal-card">
          <div className="renewal-card-label">
            <span>
              <CalendarDays size={17} />
              Up next
            </span>
            <Link
              to="/app/calendar"
              className="icon-button"
              aria-label="Open billing calendar"
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>
          {next ? (
            <>
              <div className="next-service">
                <ServiceIcon subscription={next} />
                <div>
                  <strong>{next.name}</strong>
                  <span>
                    {money(next.price)} on{' '}
                    {format(parseISO(next.nextBillingDate), 'MMM d')}
                  </span>
                </div>
              </div>
              <div className="next-renewal-footer">
                <span className="renewal-timing">
                  {daysUntil(next.nextBillingDate) === 0
                    ? 'Renews today'
                    : `Renews in ${daysUntil(next.nextBillingDate)} days`}
                </span>
                <span>
                  {next.billingCycle === 'monthly'
                    ? 'Monthly plan'
                    : 'Annual plan'}
                </span>
              </div>
            </>
          ) : (
            <p className="no-next-payment">No upcoming payments yet.</p>
          )}
        </div>
      </section>
      <section className="consumer-collection">
        <div className="collection-heading">
          <h2>
            Your apps <span className="count">{subscriptions.length}</span>
          </h2>
          {subscriptions.length > 0 && (
            <div className="search-field">
              <Search size={17} />
              <input
                aria-label="Search subscriptions"
                placeholder="Find a subscription"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="subscription-grid">
          {filtered.map((s) => (
            <motion.button
              className="subscription-row subscription-tile"
              key={s.id}
              aria-label={`View ${s.name}`}
              onClick={() => setSelected(anchors.find((a) => a.id === s.id)!)}
              whileHover={reducedMotion ? undefined : { y: -5 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <div className="tile-top">
                <ServiceIcon subscription={s} />
                <ChevronRight size={17} className="tile-chevron" />
              </div>
              <h3>{s.name}</h3>
              <div className="tile-price">
                <strong>{money(s.price)}</strong>
                <span>/{s.billingCycle === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <div className="tile-renewal">
                <CalendarDays size={13} />
                <span>
                  Renews {dateLabel(s.nextBillingDate).replace(/, \d{4}/, '')}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
        {!filtered.length && (
          <div className="panel empty-state">
            <div className="empty-illustration">
              <Mail size={26} />
            </div>
            <h3>
              {subscriptions.length
                ? 'No matching subscriptions'
                : 'No subscriptions yet'}
            </h3>
            <p>
              {subscriptions.length
                ? 'Try a different service name.'
                : isDemo
                  ? 'No sample receipts are saved in this demo.'
                  : 'Connect Gmail and let your receipts do the work.'}
            </p>
            {subscriptions.length ? (
              <button
                className="button secondary"
                onClick={() => setSearch('')}
              >
                Clear search
              </button>
            ) : (
              !isDemo && (
                <Link className="button primary" to="/add-gmail">
                  Connect Gmail
                </Link>
              )
            )}
          </div>
        )}
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
