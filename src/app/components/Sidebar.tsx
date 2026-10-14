import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  CalendarDays,
  ChartNoAxesCombined,
  Settings2,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Brand } from './Brand';
import { SESSION_KEY, useWorkspace } from '../services/Workspace';
import { apiService } from '../services/api';
import { dateLabel, money } from '../services/subscriptions';

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const { subscriptions, isDemo, preferences } = useWorkspace();
  const navigate = useNavigate();
  const next = [...subscriptions].sort((a, b) =>
    a.nextBillingDate.localeCompare(b.nextBillingDate),
  )[0];
  const items = [
    { path: '/app', label: 'Overview', icon: LayoutDashboard },
    { path: '/app/calendar', label: 'Billing calendar', icon: CalendarDays },
    {
      path: '/app/insights',
      label: 'Spending insights',
      icon: ChartNoAxesCombined,
    },
    { path: '/app/settings', label: 'Settings', icon: Settings2 },
  ];
  return (
    <>
      <button
        className="mobile-menu icon-button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="workspace-sidebar"
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="workspace-sidebar"
        className={`sidebar ${open ? 'is-open' : ''}`}
      >
        <Brand />
        <div className="workspace-label">
          <span className="workspace-avatar">M</span>
          <div>
            My workspace<small>Personal subscriptions</small>
          </div>
        </div>
        <nav aria-label="Main navigation">
          {items.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/app'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {next && preferences.reminders && (
            <NavLink
              to="/app/calendar"
              onClick={() => setOpen(false)}
              className="sidebar-renewal"
            >
              <span>
                Next renewal <ChevronRight size={14} />
              </span>
              <strong>{next.name}</strong>
              <small>
                {money(next.price)} on{' '}
                {dateLabel(next.nextBillingDate).replace(/, \d{4}/, '')}
              </small>
            </NavLink>
          )}
          <div className="profile">
            <span className="profile-avatar">{isDemo ? 'JD' : 'ME'}</span>
            <div>
              <strong>{isDemo ? 'Jamie Davis' : 'My account'}</strong>
              <small>
                {isDemo ? 'Personal demo account' : 'Personal workspace'}
              </small>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out"
              title="Sign out"
              onClick={() => {
                localStorage.removeItem(SESSION_KEY);
                apiService.clearAuthToken();
                navigate('/', { replace: true });
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
