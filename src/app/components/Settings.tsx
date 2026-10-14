import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router';
import {
  Bell,
  Download,
  Mail,
  Check,
  Wallet,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
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
    setPreferences,
    isDemo,
    anchors,
    lastSync,
    isSyncing,
    sync,
    storageError,
    restoreWorkspace,
  } = useWorkspace();
  const [budget, setBudget] = useState(preferences.budget.toString());
  const fileInput = useRef<HTMLInputElement>(null);
  const [backup, setBackup] = useState<SavedWorkspace | null>(null);
  const readBackup = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 2_000_000)
        throw new Error('Choose a workspace backup smaller than 2 MB.');
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
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtrack-${isDemo ? 'demo' : 'workspace'}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('Workspace backup exported');
  };
  return (
    <div className="page-stack settings-page">
      <header className="page-header">
        <div>
          <h1>Workspace settings</h1>
          <p>A few small preferences to make SubTrack work for you.</p>
        </div>
      </header>
      <section className="panel settings-section">
        <div className="settings-section-title">
          <Wallet size={19} />
          <div>
            <h2>Monthly budget</h2>
            <p>A personal limit for your recurring subscriptions.</p>
          </div>
        </div>
        <form
          className="budget-form"
          onSubmit={(e) => {
            e.preventDefault();
            const value = Number(budget);
            if (Number.isFinite(value) && value > 0) {
              setPreferences({ ...preferences, budget: value });
              toast.success('Budget saved');
            }
          }}
        >
          <label htmlFor="monthly-budget">Budget (USD)</label>
          <div>
            <input
              id="monthly-budget"
              type="number"
              min="1"
              max="1000000"
              step="0.01"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <button type="submit" className="button primary">
              Save budget
            </button>
          </div>
          <small>Annual subscriptions count as their monthly equivalent.</small>
        </form>
      </section>
      <section className="panel settings-section">
        <div className="settings-section-title">
          <Bell size={19} />
          <div>
            <h2>Renewal reminders</h2>
            <p>Keep the next renewal visible in your workspace.</p>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <strong>Show next renewal in the sidebar</strong>
            <p>A quick reminder while you browse your subscriptions.</p>
          </div>
          <button
            className={`toggle ${preferences.reminders ? 'on' : ''}`}
            role="switch"
            aria-label="Show next renewal in the sidebar"
            aria-checked={preferences.reminders}
            onClick={() =>
              setPreferences({
                ...preferences,
                reminders: !preferences.reminders,
              })
            }
          >
            <span />
          </button>
        </div>
      </section>
      <section className="panel settings-section">
        <div className="settings-section-title">
          <Mail size={19} />
          <div>
            <h2>Email receipts</h2>
            <p>
              {isDemo
                ? 'A sample inbox for exploring the product.'
                : 'Bring receipts into your workspace with Gmail.'}
            </p>
          </div>
        </div>
        <div className="setting-row">
          <div className="email-account">
            <span className="source-icon">
              <Mail size={20} />
            </span>
            <div>
              <strong>
                {isDemo ? 'jamie.davis@example.com' : 'Google Gmail'}
              </strong>
              <p>
                {isDemo
                  ? `${anchors.filter((s) => s.isAutoDetected).length} sample subscriptions · no real Gmail connection`
                  : lastSync
                    ? `Last refreshed ${new Date(lastSync).toLocaleString()}`
                    : 'Connect your account to scan receipts.'}
              </p>
            </div>
          </div>
          <span className="badge">
            {isDemo
              ? 'Demo inbox'
              : lastSync
                ? 'Receipts imported'
                : 'Not connected'}
          </span>
        </div>
        <div className="settings-actions">
          {isDemo ? (
            <span className="muted-inline">
              <Check size={14} />
              Sample receipts are available offline.
            </span>
          ) : (
            <>
              <Link to="/add-gmail" className="button secondary">
                Connect Gmail
              </Link>
              <button
                className="button secondary"
                disabled={isSyncing}
                onClick={sync}
              >
                <RefreshCw size={14} />
                {isSyncing ? 'Refreshing…' : 'Refresh receipts'}
              </button>
            </>
          )}
        </div>
      </section>
      <section className="panel settings-section">
        <div className="settings-section-title">
          <HardDrive size={19} />
          <div>
            <h2>Your saved workspace</h2>
            <p>
              {storageError
                ? 'Browser storage is unavailable. Export your changes now.'
                : 'Your subscriptions, notes, and preferences have no expiry.'}
            </p>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <strong>Keep a copy</strong>
            <p>
              Data stays in this browser after sign-out. Clearing site data or
              changing browsers removes access to that copy. Export a backup to
              keep it elsewhere.
            </p>
          </div>
          <button className="button secondary" onClick={exportData}>
            <Download size={16} />
            Export backup
          </button>
        </div>
        <div className="settings-actions">
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
          <span className="muted-inline">
            Bring back your details from an exported file.
          </span>
        </div>
      </section>
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
                <Dialog.Title>Restore this workspace?</Dialog.Title>
                <Dialog.Description>
                  This replaces the current {isDemo ? 'demo' : 'account'}{' '}
                  workspace with {backup?.subscriptions.length} saved
                  subscriptions, notes, and preferences. Export your current
                  details first if you want to keep both.
                </Dialog.Description>
              </div>
            </div>
            <div className="dialog-footer">
              <Dialog.Close className="button secondary">Cancel</Dialog.Close>
              <button
                className="button primary"
                onClick={() => {
                  if (backup) {
                    restoreWorkspace(backup);
                    setBudget(backup.preferences.budget.toString());
                  }
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
