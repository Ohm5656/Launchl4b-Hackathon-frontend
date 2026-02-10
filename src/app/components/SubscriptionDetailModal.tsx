import React from 'react';
import { X, Mail, Calendar, DollarSign, Tag, TrendingDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subscription } from './Dashboard';

interface SubscriptionDetailModalProps {
  subscription: Subscription | null;
  onClose: () => void;
}

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({ subscription, onClose }) => {
  if (!subscription) return null;

  // Mock payment history
  const paymentHistory = [
    { date: '2026-01-12', amount: subscription.price, status: 'Paid' },
    { date: '2025-12-12', amount: subscription.price, status: 'Paid' },
    { date: '2025-11-12', amount: subscription.price, status: 'Paid' },
    { date: '2025-10-12', amount: subscription.price, status: 'Paid' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-lg"
                  style={{ backgroundColor: subscription.color }}
                >
                  {subscription.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-slate-900">{subscription.name}</h2>
                    {subscription.isAutoDetected && (
                      <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Auto-detected</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 capitalize">{subscription.category}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Price Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Current Price</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">${subscription.price.toFixed(2)}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
                  {subscription.billingCycle}
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Next Payment</p>
                </div>
                <p className="text-xl font-bold text-slate-900">
                  {new Date(subscription.nextBillingDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {Math.ceil((new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days away
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-400px)]">
            {/* Stats */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-indigo-500" />
                Annual Cost
              </h3>
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <p className="text-sm text-slate-600 mb-2">If you keep this subscription for a year</p>
                <p className="text-4xl font-bold text-slate-900">
                  ${(subscription.billingCycle === 'monthly' ? subscription.price * 12 : subscription.price).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500 mt-1">per year</p>
              </div>
            </div>

            {/* Payment History */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {new Date(payment.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{payment.status}</p>
                    </div>
                    <p className="font-bold text-slate-900">${payment.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 text-sm mb-1">Cancellation Notice</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  To cancel this subscription, please visit the service provider's website directly. 
                  We'll continue to monitor your email for any changes.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // This would open the service provider's website
                  alert(`Opening ${subscription.name} management page...`);
                }}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
