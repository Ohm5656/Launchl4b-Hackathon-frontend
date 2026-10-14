import { Component, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
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
  const { storageError } = useWorkspace();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        {storageError && (
          <p className="storage-warning" role="alert">
            Browser storage is full or unavailable. Changes are only kept in
            this tab; export a backup in Settings.
          </p>
        )}
        <motion.div
          key={location.pathname}
          className="page-content"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.38,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Outlet />
        </motion.div>
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
