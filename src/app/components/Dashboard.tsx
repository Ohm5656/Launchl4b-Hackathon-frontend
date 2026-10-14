import { useState } from 'react';
import { Search, ChevronRight, Mail, RefreshCw } from 'lucide-react';
import { Link } from 'react-router';
import { useWorkspace } from '../services/Workspace';
import {
  dateLabel,
  money,
  monthlyCost,
  type Subscription,
} from '../services/subscriptions';
import { SubscriptionDetailModal } from './SubscriptionDetailModal';
export type { Subscription } from '../services/subscriptions';

export function Dashboard() {
  const { subscriptions, isDemo, isSyncing, sync, anchors, lastSync } =
    useWorkspace();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Subscription | null>(null);
  const total = subscriptions.reduce((sum, s) => sum + monthlyCost(s), 0);
  const sorted = [...subscriptions].sort((a, b) =>
    a.nextBillingDate.localeCompare(b.nextBillingDate),
  );
  const next = sorted[0];
  const filtered = sorted.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page-stack simple-overview">
      <header className="page-header">
        <div>
          <h1>Your subscriptions</h1>
          <p>
            {isDemo
              ? 'A preview with sample email receipts.'
              : 'Found automatically from your email receipts.'}
          </p>
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
      <section className="simple-summary" aria-label="Subscription summary">
        <div className="summary-spend">
          <span>Monthly total</span>
          <strong>
            {money(total)}
            <small> / month</small>
          </strong>
          <p>
            {subscriptions.length} subscriptions · annual plans averaged monthly
          </p>
        </div>
        <div className="summary-next">
          <span>Next payment</span>
          {next ? (
            <>
              <strong>{next.name}</strong>
              <p>
                {money(next.price)} on {dateLabel(next.nextBillingDate)}
              </p>
            </>
          ) : (
            <p>No upcoming payments</p>
          )}
        </div>
      </section>
      <section className="panel simple-list">
        <div className="simple-list-header">
          <h2>
            Subscriptions <span className="count">{subscriptions.length}</span>
          </h2>
          {subscriptions.length > 0 && (
            <div className="search-field">
              <Search size={16} />
              <input
                aria-label="Search subscriptions"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="subscription-table">
          <div className="table-labels">
            <span>Service</span>
            <span>Next payment</span>
            <span>Amount</span>
            <span />
          </div>
          {filtered.map((s) => (
            <button
              className="subscription-row"
              key={s.id}
              aria-label={`View ${s.name}`}
              onClick={() => setSelected(anchors.find((a) => a.id === s.id)!)}
            >
              <span className="service-cell">
                <span className="service-logo" style={{ background: s.color }}>
                  {s.name === 'Adobe Creative Cloud'
                    ? 'Ad'
                    : s.name === 'iCloud+'
                      ? 'iC'
                      : s.name === 'YouTube Premium'
                        ? '▶'
                        : s.name.charAt(0)}
                </span>
                <strong>{s.name}</strong>
              </span>
              <span
                className="renewal-cell"
                title={dateLabel(s.nextBillingDate)}
              >
                <strong>
                  {dateLabel(s.nextBillingDate).replace(/, \d{4}/, '')}
                </strong>
              </span>
              <span className="amount-cell">
                <strong>{money(s.price)}</strong>
                <small>
                  /{s.billingCycle === 'monthly' ? 'month' : 'year'}
                </small>
              </span>
              <ChevronRight className="simple-row-arrow" size={15} />
            </button>
          ))}
          {!filtered.length && (
            <div className="empty-state">
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
                    : 'Connect Gmail to find your subscriptions automatically.'}
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
        </div>
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
