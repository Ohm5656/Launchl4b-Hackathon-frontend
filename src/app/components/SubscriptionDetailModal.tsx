import * as Dialog from '@radix-ui/react-dialog';
import { X, Mail } from 'lucide-react';
import { useWorkspace } from '../services/Workspace';
import {
  dateLabel,
  nextBilling,
  money,
  type Subscription,
} from '../services/subscriptions';

export function SubscriptionDetailModal({
  subscription: s,
  onClose,
}: {
  subscription: Subscription;
  onClose: () => void;
}) {
  const { isDemo } = useWorkspace();
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content detail-dialog readonly-detail">
          <div className="dialog-header">
            <div className="detail-title">
              <span className="service-logo" style={{ background: s.color }}>
                {s.name.charAt(0)}
              </span>
              <div>
                <Dialog.Title>{s.name}</Dialog.Title>
                <Dialog.Description>
                  {s.plan || 'Subscription from an email receipt'}
                </Dialog.Description>
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
            </div>
            <dl className="readonly-facts">
              <div>
                <dt>Next payment</dt>
                <dd>{dateLabel(nextBilling(s))}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{s.category}</dd>
              </div>
              {s.paymentMethod && (
                <div>
                  <dt>Payment method</dt>
                  <dd>{s.paymentMethod}</dd>
                </div>
              )}
            </dl>
            {s.paymentHistory && s.paymentHistory.length > 0 && (
              <details className="receipt-history">
                <summary>
                  {isDemo ? 'Sample receipt history' : 'Receipt history'}
                </summary>
                {s.paymentHistory.map((payment) => (
                  <div className="history-row" key={payment.date}>
                    <span>{dateLabel(payment.date)}</span>
                    <span>{money(payment.amount)}</span>
                  </div>
                ))}
              </details>
            )}
            <p className="detail-source">
              <Mail size={14} />
              {isDemo ? 'Sample email receipt' : 'From your email receipt'}
            </p>
          </div>
          <div className="dialog-footer">
            <Dialog.Close className="button secondary">Close</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
