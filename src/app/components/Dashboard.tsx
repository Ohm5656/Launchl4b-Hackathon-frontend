import React from 'react';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Layers, 
  RefreshCcw, 
  ChevronRight,
  AlertCircle,
  Sparkles,
  Mail,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { SubscriptionDetailModal } from './SubscriptionDetailModal';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  category: string;
  color: string;
  isAutoDetected?: boolean;
}

interface DashboardProps {
  subscriptions: Subscription[];
  isSyncing: boolean;
  onSync: () => void;
  lastSync: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ subscriptions, isSyncing, onSync, lastSync }) => {
  const [selectedSubscription, setSelectedSubscription] = React.useState<Subscription | null>(null);
  
  const totalMonthly = subscriptions.reduce((acc, sub) => {
    return acc + (sub.billingCycle === 'monthly' ? sub.price : sub.price / 12);
  }, 0);

  const upcomingCharges = subscriptions.filter(sub => {
    const nextDate = new Date(sub.nextBillingDate);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-bold text-slate-900">Subscription Overview</h2>
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-slate-500">Last scanned from <span className="text-indigo-600 font-semibold">Gmail</span> {lastSync}</p>
        </div>
        <button 
          onClick={onSync}
          disabled={isSyncing}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95",
            isSyncing 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
          )}
        >
          <Plus className={clsx("w-5 h-5", isSyncing && "animate-spin")} />
          {isSyncing ? "Connecting..." : "Add Gmail"}
        </button>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-slate-500 font-medium">Monthly Burn</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">${totalMonthly.toFixed(2)}</span>
            <span className="text-slate-400 text-sm font-medium">/mo</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-slate-500 font-medium">Tracked Apps</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{subscriptions.length}</span>
            <span className="text-slate-400 text-sm font-medium">services</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <span className="text-slate-500 font-medium">Coming Soon</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{upcomingCharges.length}</span>
            <span className="text-slate-400 text-sm font-medium">due in 7d</span>
          </div>
        </motion.div>
      </section>

      {/* Subscription List */}
      <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Active Subscriptions</h3>
            <p className="text-xs text-slate-400 mt-1">Automatically detected from your email receipts</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              Auto-detected
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {subscriptions.map((sub) => {
            const isUpcoming = upcomingCharges.some(u => u.id === sub.id);
            return (
              <div 
                key={sub.id} 
                onClick={() => setSelectedSubscription(sub)}
                className="p-6 md:p-8 flex items-center gap-6 hover:bg-slate-50/50 transition-colors group cursor-pointer"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-md shrink-0"
                  style={{ backgroundColor: sub.color }}
                >
                  {sub.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-slate-900 truncate">{sub.name}</h4>
                    {sub.isAutoDetected && (
                      <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg tooltip" title="Detected via Gmail AI">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {isUpcoming && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider rounded-md">
                        Due
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="capitalize">{sub.category}</span>
                    <span>•</span>
                    <span className="uppercase tracking-tighter font-medium">Next: {new Date(sub.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-lg">${sub.price.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub.billingCycle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <SubscriptionDetailModal 
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
        />
      )}
    </div>
  );
};