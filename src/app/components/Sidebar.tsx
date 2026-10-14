import { NavLink, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  CalendarDays,
  ChartNoAxesCombined,
  Mail,
  LogOut,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Brand } from './Brand';
import { SESSION_KEY, useWorkspace } from '../services/Workspace';
import { apiService } from '../services/api';

export function Sidebar() {
  const { isDemo } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const items = [
    { path: '/app', label: 'Home', icon: LayoutDashboard },
    { path: '/app/calendar', label: 'Calendar', icon: CalendarDays },
    {
      path: '/app/insights',
      label: 'Insights',
      icon: ChartNoAxesCombined,
    },
    { path: '/app/settings', label: 'Inbox', icon: Mail },
  ];
  return (
    <header className="consumer-header">
      <div className="consumer-header-inner">
        <NavLink to="/app" aria-label="SubTrack home">
          <Brand />
        </NavLink>
        <nav className="consumer-nav" aria-label="Main navigation">
          {items.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/app'}
              className={({ isActive }) =>
                `consumer-nav-link ${isActive ? 'active' : ''}`
              }
            >
              {location.pathname === path && (
                <motion.span
                  className="nav-active-pill"
                  layoutId="active-navigation"
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 380, damping: 34 }
                  }
                />
              )}
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="consumer-account">
          {isDemo && (
            <span className="consumer-demo-label">
              <span />
              Demo
            </span>
          )}
          <button
            className="icon-button consumer-signout"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => {
              localStorage.removeItem(SESSION_KEY);
              apiService.clearAuthToken();
              navigate('/', { replace: true });
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
