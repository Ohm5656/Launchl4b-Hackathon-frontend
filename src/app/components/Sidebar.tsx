import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  CalendarDays,
  ChartNoAxesCombined,
  Mail,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Brand } from './Brand';
import { SESSION_KEY, useWorkspace } from '../services/Workspace';
import { apiService } from '../services/api';

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const { isDemo } = useWorkspace();
  const navigate = useNavigate();
  const items = [
    { path: '/app', label: 'Overview', icon: LayoutDashboard },
    { path: '/app/calendar', label: 'Billing calendar', icon: CalendarDays },
    {
      path: '/app/insights',
      label: 'Spending insights',
      icon: ChartNoAxesCombined,
    },
    { path: '/app/settings', label: 'Settings', icon: Mail },
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
        <div className="sidebar-bottom simple-sidebar-bottom">
          <span>{isDemo ? 'Demo account' : 'My account'}</span>
          <button
            className="button sign-out-button"
            onClick={() => {
              localStorage.removeItem(SESSION_KEY);
              apiService.clearAuthToken();
              navigate('/', { replace: true });
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
