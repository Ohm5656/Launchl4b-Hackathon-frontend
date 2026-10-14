import { useState } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  ArrowUpRight,
  CalendarDays,
  Mail,
  RefreshCw,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useWorkspace } from '../services/Workspace';
import {
  dateLabel,
  daysUntil,
  money,
  monthlyCost,
  type Subscription,
} from '../services/subscriptions';
import { AddSubscriptionModal } from './AddSubscriptionModal';
import { SubscriptionDetailModal } from './SubscriptionDetailModal';
export type { Subscription } from '../services/subscriptions';

export function Dashboard() {
  const {
    subscriptions,
    isDemo,
    preferences,
    isSyncing,
    lastSync,
    sync,
    anchors,
    storageError,
  } = useWorkspace();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('renewal');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Subscription | null>(null);
  const total = subscriptions.reduce((n, s) => n + monthlyCost(s), 0);
  const upcoming = [...subscriptions].sort((a, b) =>
    a.nextBillingDate.localeCompare(b.nextBillingDate),
  );
  const soon = upcoming.filter((s) => daysUntil(s.nextBillingDate) <= 7);
  const filtered = subscriptions
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) &&
        (category === 'All categories' || s.category === category),
    )
    .sort((a, b) =>
      sort === 'price'
        ? monthlyCost(b) - monthlyCost(a)
        : sort === 'name'
          ? a.name.localeCompare(b.name)
          : a.nextBillingDate.localeCompare(b.nextBillingDate),
    );
  const categories = [...new Set(subscriptions.map((s) => s.category))];
  const budgetPercent = Math.min((total / preferences.budget) * 100, 100);
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Your subscriptions</h1>
          <p>A clear view of what’s renewing and where your money goes.</p>
        </div>
        <button className="button primary" onClick={() => setAdding(true)}>
          <Plus size={17} />
          Add subscription
        </button>
      </header>
      <div className="overview-summary">
        <div className="summary-spend">
          <span>Monthly spending</span>
          <div>
            <strong>{money(total)}</strong>
            <small>/ month</small>
          </div>
          <p>{money(total * 12)} projected over a year</p>
        </div>
        <div className="summary-detail">
          <span>Active subscriptions</span>
          <strong>
            {subscriptions.length}
            <small> services</small>
          </strong>
          <p>{categories.length} categories in your workspace</p>
        </div>
        <div className="summary-detail">
          <span>Renewing this week</span>
          <strong>{money(soon.reduce((n, s) => n + s.price, 0))}</strong>
          <p>
            {soon.length} {soon.length === 1 ? 'payment' : 'payments'} in the
            next 7 days
          </p>
        </div>
        <div className="summary-budget">
          <div>
            <span>Monthly budget</span>
            <Link to="/app/settings">
              Edit <ArrowUpRight size={13} />
            </Link>
          </div>
          <strong>{money(preferences.budget)}</strong>
          <div
            className={`budget-track ${total > preferences.budget ? 'over-budget' : ''}`}
          >
            <span style={{ width: `${budgetPercent}%` }} />
          </div>
          <p>
            {total > preferences.budget
              ? `${money(total - preferences.budget)} over budget`
              : `${money(preferences.budget - total)} left this month`}
          </p>
        </div>
      </div>
      <div className="dashboard-columns">
        <section className="panel subscription-panel">
          <div className="panel-heading">
            <div>
              <h2>
                All subscriptions{' '}
                <span className="count">{subscriptions.length}</span>
              </h2>
              <p>Recurring bills, without the guesswork.</p>
            </div>
            <span className="currency-label">USD</span>
          </div>
          <div className="table-toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                aria-label="Search subscriptions"
                placeholder="Search subscriptions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <label className="select-field">
              <SlidersHorizontal size={15} />
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <select
              className="sort-select"
              aria-label="Sort subscriptions"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="renewal">Next renewal</option>
              <option value="price">Highest cost</option>
              <option value="name">Name</option>
            </select>
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
                onClick={() => setSelected(anchors.find((a) => a.id === s.id)!)}
                aria-label={`View ${s.name}`}
              >
                <span className="service-cell">
                  <span
                    className="service-logo"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.name === 'Adobe Creative Cloud'
                      ? 'Ad'
                      : s.name === 'iCloud+'
                        ? 'iC'
                        : s.name === 'YouTube Premium'
                          ? '▶'
                          : s.name.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{s.name}</strong>
                    <small>
                      {s.plan || s.category}
                      {s.isAutoDetected && (
                        <Mail size={12} aria-label="From email receipt" />
                      )}
                    </small>
                  </span>
                </span>
                <span className="renewal-cell">
                  <strong>
                    {dateLabel(s.nextBillingDate).replace(/, \d{4}/, '')}
                  </strong>
                  <small
                    className={
                      daysUntil(s.nextBillingDate) <= 3 ? 'due-soon' : ''
                    }
                  >
                    {daysUntil(s.nextBillingDate) === 0
                      ? 'Today'
                      : `In ${daysUntil(s.nextBillingDate)} days`}
                  </small>
                </span>
                <span className="amount-cell">
                  <strong>{money(s.price)}</strong>
                  <small>
                    /{s.billingCycle === 'monthly' ? 'month' : 'year'}
                  </small>
                </span>
                <ChevronDown className="row-arrow" size={15} />
              </button>
            ))}
            {!filtered.length && (
              <div className="empty-state">
                <Search size={24} />
                <h3>
                  {subscriptions.length
                    ? 'No matching subscriptions'
                    : 'Your workspace is ready'}
                </h3>
                <p>
                  {subscriptions.length
                    ? 'Try another name or category.'
                    : 'Add your first subscription or connect Gmail in Settings.'}
                </p>
                {subscriptions.length ? (
                  <button
                    className="button secondary"
                    onClick={() => {
                      setSearch('');
                      setCategory('All categories');
                    }}
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    className="button primary"
                    onClick={() => setAdding(true)}
                  >
                    Add subscription
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="table-footer">
            <span>
              Showing {filtered.length} of {subscriptions.length} subscriptions
            </span>
            <span>
              <Check size={13} />
              {storageError ? 'Changes not saved' : 'Saved in this browser'}
            </span>
          </div>
        </section>
        <aside className="overview-aside">
          <section className="panel upcoming-panel">
            <div className="panel-heading">
              <h2>Coming up</h2>
              <CalendarDays size={17} />
            </div>
            <p className="aside-description">Your next three renewals.</p>
            <div className="upcoming-list">
              {upcoming.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setSelected(anchors.find((a) => a.id === s.id)!)
                  }
                >
                  <span className="upcoming-date">
                    <strong>
                      {new Date(`${s.nextBillingDate}T00:00:00`).getDate()}
                    </strong>
                    <small>
                      {new Date(
                        `${s.nextBillingDate}T00:00:00`,
                      ).toLocaleDateString('en-US', { month: 'short' })}
                    </small>
                  </span>
                  <span>
                    <strong>{s.name}</strong>
                    <small>
                      {money(s.price)} · {s.billingCycle}
                    </small>
                  </span>
                  <span
                    className="renewal-dot"
                    style={{ background: s.color }}
                  />
                </button>
              ))}
              {!upcoming.length && (
                <p className="aside-description">No renewals to show yet.</p>
              )}
            </div>
            <Link className="panel-link" to="/app/calendar">
              Open billing calendar <ArrowUpRight size={15} />
            </Link>
          </section>
          <section className="receipt-source">
            <div className="source-icon">
              <Mail size={19} />
            </div>
            <h3>{isDemo ? 'From your demo inbox' : 'Email receipts'}</h3>
            <p>
              {isDemo
                ? `${subscriptions.filter((s) => s.isAutoDetected).length} subscriptions matched to sample receipts. Add a service yourself whenever you need.`
                : lastSync
                  ? `Last refreshed ${new Date(lastSync).toLocaleDateString()}.`
                  : 'Connect Gmail to bring your subscription receipts together.'}
            </p>
            <button
              className="button secondary"
              disabled={isSyncing}
              onClick={() => (isDemo ? sync() : navigate('/add-gmail'))}
            >
              <RefreshCw size={14} />
              {isSyncing
                ? 'Refreshing…'
                : isDemo
                  ? 'Review demo receipts'
                  : 'Connect Gmail'}
            </button>
            <small>
              {isDemo
                ? 'Sample data · no inbox connection'
                : 'Read-only Gmail access'}
            </small>
          </section>
          <div className="workspace-note">
            <span className="note-pin" />
            <p>Make it yours.</p>
            <small>
              Add notes to a subscription to remember what you use it for, or
              when to review it.
            </small>
          </div>
        </aside>
      </div>
      {adding && (
        <AddSubscriptionModal isOpen onClose={() => setAdding(false)} />
      )}
      {selected && (
        <SubscriptionDetailModal
          subscription={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
