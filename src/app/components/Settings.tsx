import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router';
import { Download, Mail, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  parseWorkspace,
  useWorkspace,
  type SavedWorkspace,
} from '../services/Workspace';

export function Settings() {
  const {
    preferences,
    isDemo,
    anchors,
    lastSync,
    isSyncing,
    sync,
    restoreWorkspace,
  } = useWorkspace();
  const fileInput = useRef<HTMLInputElement>(null);
  const [backup, setBackup] = useState<SavedWorkspace | null>(null);
  const readBackup = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 2_000_000)
        throw new Error('Choose a backup smaller than 2 MB.');
      setBackup(parseWorkspace(await file.text()));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'The backup could not be read.',
      );
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };
  const exportData = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { version: 1, subscriptions: anchors, preferences, lastSync },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subtrack-${isDemo ? 'demo' : 'workspace'}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('Backup exported');
  };
  return (
    <div className="page-stack settings-page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Your email connection.</p>
        </div>
      </header>
      <section className="panel settings-section">
        <div className="email-account">
          <span className="source-icon">
            <Mail size={20} />
          </span>
          <div>
            <h2>{isDemo ? 'Demo inbox' : 'Gmail'}</h2>
            <p>
              {isDemo
                ? 'Sample receipts. No real email account is connected.'
                : lastSync
                  ? `Last refreshed ${new Date(lastSync).toLocaleString()}`
                  : 'Connect Gmail to find your subscriptions.'}
            </p>
          </div>
        </div>
        {!isDemo && (
          <div className="settings-actions">
            <Link to="/add-gmail" className="button primary">
              Connect Gmail
            </Link>
            {lastSync && (
              <button
                className="button secondary"
                disabled={isSyncing}
                onClick={sync}
              >
                <RefreshCw size={14} />
                {isSyncing ? 'Refreshing…' : 'Refresh receipts'}
              </button>
            )}
          </div>
        )}
      </section>
      <details className="panel saved-data">
        <summary>Saved data and backups</summary>
        <div className="saved-data-body">
          <p>
            Receipts stay saved in this browser with no expiry. Export a copy
            before clearing site data or changing devices.
          </p>
          <div className="settings-actions">
            <button className="button secondary" onClick={exportData}>
              <Download size={15} />
              Export backup
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              aria-label="Workspace backup file"
              hidden
              onChange={(e) => {
                void readBackup(e.target.files?.[0]);
              }}
            />
            <button
              className="button secondary"
              onClick={() => fileInput.current?.click()}
            >
              Restore backup
            </button>
          </div>
        </div>
      </details>
      <Dialog.Root
        open={!!backup}
        onOpenChange={(open) => {
          if (!open) setBackup(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <div className="dialog-header">
              <div>
                <Dialog.Title>Restore saved data?</Dialog.Title>
                <Dialog.Description>
                  This replaces the saved data with{' '}
                  {backup?.subscriptions.length} subscriptions from your backup.
                </Dialog.Description>
              </div>
            </div>
            <div className="dialog-footer">
              <Dialog.Close className="button secondary">Cancel</Dialog.Close>
              <button
                className="button primary"
                onClick={() => {
                  if (backup) restoreWorkspace(backup);
                  setBackup(null);
                }}
              >
                Restore workspace
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
