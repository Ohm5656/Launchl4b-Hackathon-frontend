import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { apiService } from './api';
import {
  createDemoSubscriptions,
  nextBilling,
  type Subscription,
} from './subscriptions';
import { format, isValid, parseISO } from 'date-fns';

export const SESSION_KEY = 'subtrack.session';
export const DEMO_KEY = 'subtrack.demo.v1';
export interface Preferences {
  budget: number;
  reminders: boolean;
}
export interface SavedWorkspace {
  subscriptions: Subscription[];
  preferences: Preferences;
  lastSync: string | null;
}
const defaults: Preferences = { budget: 150, reminders: true };
export function startDemo() {
  // No expiry or reseeding on login. Signing out leaves the workspace intact.
  if (!localStorage.getItem(DEMO_KEY))
    localStorage.setItem(
      DEMO_KEY,
      JSON.stringify({
        subscriptions: createDemoSubscriptions(),
        preferences: defaults,
        lastSync: null,
      }),
    );
  localStorage.setItem(SESSION_KEY, 'demo');
}
const validDate = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  isValid(parseISO(value)) &&
  format(parseISO(value), 'yyyy-MM-dd') === value;
export function parseWorkspace(raw: string): SavedWorkspace {
  const saved = JSON.parse(raw);
  if (
    !saved ||
    !Array.isArray(saved.subscriptions) ||
    saved.subscriptions.length > 1000 ||
    !saved.subscriptions.every(
      (s: Subscription) =>
        s &&
        typeof s.id === 'string' &&
        typeof s.name === 'string' &&
        s.name.trim() &&
        Number.isFinite(s.price) &&
        s.price >= 0 &&
        ['monthly', 'yearly'].includes(s.billingCycle) &&
        validDate(s.nextBillingDate) &&
        typeof s.category === 'string' &&
        /^#[\da-f]{6}$/i.test(s.color) &&
        ['plan', 'paymentMethod', 'notes'].every(
          (key) =>
            s[key as keyof Subscription] === undefined ||
            typeof s[key as keyof Subscription] === 'string',
        ) &&
        (s.startedAt === undefined || validDate(s.startedAt)) &&
        (s.paymentHistory === undefined ||
          (Array.isArray(s.paymentHistory) &&
            s.paymentHistory.every(
              (p) =>
                p &&
                validDate(p.date) &&
                Number.isFinite(p.amount) &&
                p.amount >= 0,
            ))),
    )
  )
    throw new Error('This file does not contain a valid SubTrack workspace.');
  if (
    new Set(saved.subscriptions.map((s: Subscription) => s.id)).size !==
    saved.subscriptions.length
  )
    throw new Error('The backup contains duplicate subscriptions.');
  const preferences = { ...defaults, ...saved.preferences };
  if (
    !Number.isFinite(preferences.budget) ||
    preferences.budget <= 0 ||
    typeof preferences.reminders !== 'boolean'
  )
    throw new Error('The saved preferences are invalid.');
  return {
    subscriptions: saved.subscriptions,
    preferences,
    lastSync:
      typeof saved.lastSync === 'string' &&
      !Number.isNaN(Date.parse(saved.lastSync))
        ? saved.lastSync
        : null,
  };
}
function readWorkspace(key: string, demo: boolean): SavedWorkspace {
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return parseWorkspace(raw);
    } catch {
      /* Keep unreadable storage available for recovery. */
    }
    throw new Error(
      'Your saved workspace could not be read. Export your browser data before clearing this site’s storage.',
    );
  }
  return {
    subscriptions: demo ? createDemoSubscriptions() : [],
    preferences: defaults,
    lastSync: null,
  };
}
function useWorkspaceState() {
  const isDemo = localStorage.getItem(SESSION_KEY) === 'demo';
  const key = isDemo ? DEMO_KEY : 'subtrack.account.v1';
  const [saved, setSaved] = useState(() => readWorkspace(key, isDemo));
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [today, setToday] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60_000);
    const refresh = () => setToday(new Date());
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(saved));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [key, saved]);
  const subscriptions = saved.subscriptions.map((s) => ({
    ...s,
    nextBillingDate: nextBilling(s, today),
  }));
  const restoreWorkspace = (backup: SavedWorkspace) => {
    setSaved(backup);
    toast.success('Workspace restored');
  };
  const sync = async () => {
    if (isDemo) {
      toast.info(
        'Demo receipts are already available. No Gmail account is connected.',
      );
      return;
    }
    setIsSyncing(true);
    try {
      const data = await apiService.getSubscriptions();
      if (
        !Array.isArray(data) ||
        data.some(
          (s) =>
            !s ||
            typeof s.service_name !== 'string' ||
            !s.service_name.trim() ||
            (s.currency !== undefined && typeof s.currency !== 'string') ||
            (s.billing_cycle !== undefined &&
              typeof s.billing_cycle !== 'string') ||
            (s.category !== undefined && typeof s.category !== 'string'),
        )
      ) {
        throw new Error(
          'The receipts could not be read. Your saved data was kept.',
        );
      }
      if (data.some((s) => s.currency && s.currency.toUpperCase() !== 'USD'))
        throw new Error(
          'This workspace supports USD only. Your saved data was kept.',
        );
      const mapped: Subscription[] = data.map((s) => ({
        id: `api-${s.service_name.trim().toLowerCase()}`,
        name: s.service_name.trim(),
        price: s.amount as number,
        billingCycle: ['yearly', 'annual', 'year'].includes(
          s.billing_cycle?.toLowerCase() || '',
        )
          ? 'yearly'
          : 'monthly',
        nextBillingDate: s.next_billing_date || '',
        category: s.category || 'Other',
        color: '#4f46e5',
        isAutoDetected: true,
      }));
      if (
        mapped.some(
          (s) =>
            !Number.isFinite(s.price) ||
            s.price < 0 ||
            !validDate(s.nextBillingDate),
        )
      )
        throw new Error(
          'Some receipts are missing a valid amount or billing date. Your saved data was kept.',
        );
      setSaved((prev) => {
        // Email receipts are authoritative; refresh amounts and billing dates too.
        const unique = [
          ...new Map(mapped.map((item) => [item.id, item])).values(),
        ];
        return {
          ...prev,
          subscriptions: unique.map((item) => ({
            ...prev.subscriptions.find(
              (s) => s.name.toLowerCase() === item.name.toLowerCase(),
            ),
            ...item,
          })),
          lastSync: new Date().toISOString(),
        };
      });
    } catch (error) {
      toast.error(
        error instanceof Error && !error.message.includes('fetch')
          ? error.message
          : 'Could not reach Gmail. Your saved subscriptions are still available.',
      );
    } finally {
      setIsSyncing(false);
    }
  };
  return {
    ...saved,
    subscriptions,
    anchors: saved.subscriptions,
    isDemo,
    storageError,
    isSyncing,
    restoreWorkspace,
    sync,
  };
}
const WorkspaceContext = createContext<ReturnType<
  typeof useWorkspaceState
> | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const workspace = useWorkspaceState();
  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('Workspace provider is missing');
  return value;
}
