import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, Loader2, CircleAlert } from 'lucide-react';
import { apiService } from '../services/api';
import { Brand } from './Brand';

export function GmailCallback() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing',
  );
  const [message, setMessage] = useState(
    'Finishing your Gmail connection. This may take a moment.',
  );
  useEffect(() => {
    let cancelled = false;
    const complete = async () => {
      const code = params.get('code');
      const state = params.get('state');
      if (params.get('error') || !code || !state) {
        setStatus('error');
        setMessage(
          'Gmail connection did not finish. Return to Settings and try again.',
        );
        return;
      }
      try {
        const result = await apiService.completeGmailConnection(code, state);
        if (cancelled) return;
        if (!result.success)
          throw new Error('Connection could not be completed.');
        setStatus('success');
        setMessage(
          `Gmail connected. ${result.subscriptionsFound} subscriptions found. Open your workspace to refresh the receipts.`,
        );
      } catch {
        if (!cancelled) {
          setStatus('error');
          setMessage(
            'Could not finish the connection. Your saved subscriptions are still available. Try connecting again from Settings.',
          );
        }
      }
    };
    void complete();
    return () => {
      cancelled = true;
    };
  }, [params]);
  return (
    <div className="connection-page">
      <div className="connection-wrap">
        <Brand />
        <section
          className="panel connection-panel callback-panel"
          role="status"
        >
          <div className="source-icon">
            {status === 'processing' ? (
              <Loader2 size={22} className="loading-spinner" />
            ) : status === 'success' ? (
              <CheckCircle2 size={22} />
            ) : (
              <CircleAlert size={22} />
            )}
          </div>
          <h1>
            {status === 'processing'
              ? 'Connecting Gmail'
              : status === 'success'
                ? 'Your receipts are ready'
                : 'Connection needs another try'}
          </h1>
          <p>{message}</p>
          <Link
            className="button primary"
            to={status === 'success' ? '/app' : '/app/settings'}
          >
            {status === 'success' ? 'Open workspace' : 'Back to settings'}
          </Link>
        </section>
      </div>
    </div>
  );
}
