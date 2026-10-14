import { Component, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import {
  WorkspaceProvider,
  SESSION_KEY,
  useWorkspace,
} from '../services/Workspace';
import { format } from 'date-fns';

class WorkspaceBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <div className="empty-state">
        <h1>Saved workspace needs attention</h1>
        <p>{this.state.error}</p>
        <a href="/">Back to sign in</a>
      </div>
    ) : (
      this.props.children
    );
  }
}
function WorkspaceLayout() {
  const { isDemo, storageError } = useWorkspace();
  const location = useLocation();
  const title = location.pathname.endsWith('calendar')
    ? 'Billing calendar'
    : location.pathname.endsWith('insights')
      ? 'Spending insights'
      : location.pathname.endsWith('settings')
        ? 'Settings'
        : 'Overview';
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="workspace-topbar">
          <span>
            My workspace <span className="breadcrumb">/</span> {title}
          </span>
          <div>
            {isDemo && <span className="badge demo-badge">Demo workspace</span>}
            <span className="topbar-date">
              {format(new Date(), 'EEE, MMM d')}
            </span>
          </div>
        </div>
        {storageError && (
          <p className="storage-warning" role="alert">
            Browser storage is full or unavailable. Changes are only kept in
            this tab; export a backup in Settings.
          </p>
        )}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
export function MainLayout() {
  if (!localStorage.getItem(SESSION_KEY) && !localStorage.getItem('authToken'))
    return <Navigate to="/" replace />;
  return (
    <WorkspaceBoundary>
      <WorkspaceProvider>
        <WorkspaceLayout />
      </WorkspaceProvider>
    </WorkspaceBoundary>
  );
}
