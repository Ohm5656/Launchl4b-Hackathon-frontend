import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { ArrowLeft, Mail, ShieldCheck, ExternalLink } from 'lucide-react';
import { Brand } from './Brand';
import { SESSION_KEY } from '../services/Workspace';
import { toast } from 'sonner';

export function AddGmail() {
  const [busy, setBusy] = useState(false);
  const isDemo = localStorage.getItem(SESSION_KEY) === 'demo';
  if (!isDemo && !localStorage.getItem('authToken'))
    return <Navigate to="/" replace />;
  const connect = () => {
    const backend = import.meta.env.VITE_API_URL;
    if (!backend) {
      toast.info(
        'Gmail connection is not configured yet. You can still add subscriptions manually.',
      );
      return;
    }
    setBusy(true);
    window.location.assign(
      `${backend.replace(/\/$/, '')}/gmail/connect/redirect`,
    );
  };
  return (
    <div className="connection-page">
      <div className="connection-wrap">
        <Brand />
        <Link to="/app/settings" className="connection-back">
          <ArrowLeft size={16} />
          Back to settings
        </Link>
        <section className="panel connection-panel">
          <div className="source-icon">
            <Mail size={22} />
          </div>
          <h1>
            {isDemo
              ? 'Your demo inbox is ready'
              : 'Bring your receipts together'}
          </h1>
          <p>
            {isDemo
              ? 'The demo includes sample receipts. No Gmail permissions are needed to explore your subscriptions.'
              : 'Connect Gmail to find recurring subscriptions in your email receipts.'}
          </p>
          <div className="connection-info">
            <ShieldCheck size={20} />
            <div>
              <h2>
                {isDemo
                  ? 'Sample data, your own workspace'
                  : 'Read-only access'}
              </h2>
              <p>
                {isDemo
                  ? 'Your edits, notes, and preferences stay saved in this browser.'
                  : 'Google will show the permissions requested before you connect. SubTrack requests read-only access to Gmail to find receipts.'}
              </p>
            </div>
          </div>
          {isDemo ? (
            <Link className="button primary" to="/app">
              Back to demo workspace
            </Link>
          ) : (
            <button
              className="button primary"
              disabled={busy}
              onClick={connect}
            >
              {busy ? 'Opening Google…' : 'Connect with Google'}
              <ExternalLink size={16} />
            </button>
          )}
          <small>
            {isDemo
              ? 'No real account is connected.'
              : 'You can revoke access in your Google account settings.'}
          </small>
        </section>
      </div>
    </div>
  );
}
