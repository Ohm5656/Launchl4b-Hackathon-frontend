import { Component, type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import {
  WorkspaceProvider,
  SESSION_KEY,
  useWorkspace,
} from '../services/Workspace';

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
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="workspace-topbar">
          <span>SubTrack</span>
          <div>
            {isDemo && <span className="badge demo-badge">Demo workspace</span>}
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
