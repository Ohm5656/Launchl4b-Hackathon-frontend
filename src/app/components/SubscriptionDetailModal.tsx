import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { format, parseISO } from 'date-fns';
import { X, Pencil, Mail, Check, Trash2 } from 'lucide-react';
import { useWorkspace } from '../services/Workspace';
import {
  dateLabel,
  nextBilling,
  money,
  monthlyCost,
  type Subscription,
} from '../services/subscriptions';
import { AddSubscriptionModal } from './AddSubscriptionModal';

export function SubscriptionDetailModal({
  subscription: s,
  onClose,
}: {
  subscription: Subscription;
  onClose: () => void;
}) {
  const { isDemo, removeSubscription } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const history = s.paymentHistory || [];
  if (editing)
    return <AddSubscriptionModal isOpen subscription={s} onClose={onClose} />;
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content detail-dialog">
          <div className="dialog-header">
            <div className="detail-title">
              <span className="service-logo" style={{ background: s.color }}>
                {s.name.slice(0, 1)}
              </span>
              <div>
                <Dialog.Title>{s.name}</Dialog.Title>
                <Dialog.Description>{s.plan || s.category}</Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={20} />
            </Dialog.Close>
          </div>
          <div className="detail-body">
            <div className="detail-price">
              <strong>{money(s.price)}</strong>
              <span>per {s.billingCycle === 'monthly' ? 'month' : 'year'}</span>
              <span className="badge active-badge">Tracked</span>
            </div>
            <dl className="detail-facts">
              <div>
                <dt>Next renewal</dt>
                <dd>{dateLabel(nextBilling(s))}</dd>
              </div>
              <div>
                <dt>Yearly cost</dt>
                <dd>{money(monthlyCost(s) * 12)}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{s.category}</dd>
              </div>
              <div>
                <dt>Payment method</dt>
                <dd>{s.paymentMethod || 'Not specified'}</dd>
              </div>
            </dl>
            <div className="detail-notes">
              <h3>Your notes</h3>
              <p>
                {s.notes ||
                  'No notes yet. Add a reminder for yourself when you edit this subscription.'}
              </p>
            </div>
            {isDemo && s.id.startsWith('demo-') && (
              <div className="payment-history">
                <h3>Sample payment history</h3>
                <p>Example receipts saved with your demo workspace.</p>
                {history.map((payment) => (
                  <div className="history-row" key={payment.date}>
                    <span>
                      <Check size={14} />
                      {format(parseISO(payment.date), 'MMM d, yyyy')}
                    </span>
                    <span>{money(payment.amount)}</span>
                  </div>
                ))}
                {!history.length && (
                  <p>No sample receipts for this billing period.</p>
                )}
              </div>
            )}
            <p className="detail-source">
              <Mail size={14} />
              {s.isAutoDetected
                ? isDemo
                  ? 'From a sample email receipt'
                  : 'From an email receipt'
                : 'Added manually'}
              <span>Renewals are projected from your billing cycle.</span>
            </p>
            {confirming && (
              <div className="remove-confirm" role="alert">
                <strong>Remove {s.name} from tracking?</strong>
                <p>
                  This removes the saved details. It does not cancel your
                  subscription with the provider.
                </p>
                <div>
                  <button
                    className="button secondary"
                    onClick={() => setConfirming(false)}
                  >
                    Keep subscription
                  </button>
                  <button
                    className="button danger"
                    onClick={() => {
                      removeSubscription(s.id);
                      onClose();
                    }}
                  >
                    Remove subscription
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="dialog-footer">
            <button
              className="button text-button"
              onClick={() => setConfirming(true)}
            >
              <Trash2 size={15} />
              Remove
            </button>
            <button className="button primary" onClick={() => setEditing(true)}>
              <Pencil size={15} />
              Edit details
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
