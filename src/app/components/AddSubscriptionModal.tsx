import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useWorkspace } from '../services/Workspace';
import type { Subscription } from '../services/subscriptions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription?: Subscription;
}
export function AddSubscriptionModal({ isOpen, onClose, subscription }: Props) {
  const { saveSubscription } = useWorkspace();
  const [form, setForm] = useState({
    name: subscription?.name || '',
    price: subscription?.price.toString() || '',
    category: subscription?.category || 'Entertainment',
    billingCycle: subscription?.billingCycle || 'monthly',
    nextBillingDate:
      subscription?.nextBillingDate || format(new Date(), 'yyyy-MM-dd'),
    plan: subscription?.plan || '',
    paymentMethod: subscription?.paymentMethod || '',
    notes: subscription?.notes || '',
  });
  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !form.name.trim() ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    )
      return;
    saveSubscription({
      ...subscription,
      ...form,
      name: form.name.trim(),
      id: subscription?.id || crypto.randomUUID(),
      price: Number(form.price),
      billingCycle: form.billingCycle as 'monthly' | 'yearly',
      color: subscription?.color || '#4f46e5',
      startedAt: subscription?.startedAt || form.nextBillingDate,
    });
    onClose();
  };
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content editor-dialog">
          <div className="dialog-header">
            <div>
              <Dialog.Title>
                {subscription ? 'Edit subscription' : 'Add a subscription'}
              </Dialog.Title>
              <Dialog.Description>
                Keep the details you’ll want at the next renewal.
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={20} />
            </Dialog.Close>
          </div>
          <form onSubmit={submit} className="subscription-form">
            <label>
              Service name
              <input
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Figma"
              />
            </label>
            <label>
              Plan
              <input
                maxLength={100}
                value={form.plan}
                onChange={(e) => update('plan', e.target.value)}
                placeholder="e.g. Professional · 1 seat"
              />
            </label>
            <div className="form-grid">
              <label>
                Amount (USD)
                <input
                  type="number"
                  required
                  min="0"
                  max="1000000"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                  placeholder="0.00"
                />
              </label>
              <label>
                Billing cycle
                <select
                  value={form.billingCycle}
                  onChange={(e) => update('billingCycle', e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
            </div>
            <div className="form-grid">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                >
                  {[
                    ...new Set([
                      'Entertainment',
                      'Productivity',
                      'Cloud storage',
                      'AI tools',
                      'Gaming',
                      'Other',
                      form.category,
                    ]),
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Billing date
                <input
                  type="date"
                  required
                  value={form.nextBillingDate}
                  onChange={(e) => update('nextBillingDate', e.target.value)}
                />
              </label>
            </div>
            <label>
              Payment method
              <input
                maxLength={100}
                value={form.paymentMethod}
                onChange={(e) => update('paymentMethod', e.target.value)}
                placeholder="e.g. Visa ending in 4242"
              />
            </label>
            <label>
              Notes
              <textarea
                rows={3}
                maxLength={1000}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="What do you use it for? When should you review it?"
              />
            </label>
            <div className="dialog-footer">
              <button
                type="button"
                className="button secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button className="button primary" type="submit">
                Save subscription
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
