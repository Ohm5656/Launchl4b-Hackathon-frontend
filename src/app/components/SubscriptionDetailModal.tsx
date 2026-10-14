import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { X, Mail } from 'lucide-react';
import { useWorkspace } from '../services/Workspace';
import {
  dateLabel,
  nextBilling,
  money,
  type Subscription,
} from '../services/subscriptions';
import { ServiceIcon } from './ServiceIcon';

export function SubscriptionDetailModal({
  subscription: s,
  onClose,
}: {
  subscription: Subscription;
  onClose: () => void;
}) {
  const { isDemo } = useWorkspace();
  const [open, setOpen] = useState(true);
  const [returnFocus] = useState(() =>
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (open) return;
    const timer = window.setTimeout(onClose, reducedMotion ? 0 : 180);
    return () => window.clearTimeout(timer);
  }, [open, onClose, reducedMotion]);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content detail-dialog readonly-detail"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocus?.isConnected)
              returnFocus.focus({ preventScroll: true });
          }}
        >
          <div className="dialog-header">
            <div className="detail-title">
              <ServiceIcon subscription={s} />
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
