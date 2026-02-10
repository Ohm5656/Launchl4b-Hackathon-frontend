import React from 'react';
import { 
  Mail, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface IntegrationsProps {
  isSyncing: boolean;
  onSync: () => void;
  lastSync: string;
}

export const Integrations: React.FC<IntegrationsProps> = ({ isSyncing, onSync, lastSync }) => {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Data Sources</h2>
        <p className="text-slate-500 mt-1">Connect your accounts to automate subscription tracking.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Gmail Integration Card */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
              <Mail className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-slate-900">Google Gmail</h3>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Connected</span>
              </div>
              <p className="text-slate-500 text-sm max-w-md">
                We'll scan your receipts and confirmation emails to find active subscriptions automatically.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <button 
                onClick={onSync}
                disabled={isSyncing}
                className={clsx(
                  "w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                  isSyncing ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                )}
              >
                <Plus className={clsx("w-4 h-4", isSyncing && "animate-spin")} />
                {isSyncing ? "Connecting..." : "Add Gmail"}
              </button>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Last sync: {lastSync}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Read-only access
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  AI Scanning Active
                </div>
              </div>
              <button className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                Manage Access <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Future Integrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 border-dashed opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Bank Account (Plaid)</h4>
            <p className="text-sm text-slate-500">Connect your bank to find hidden charges and trials.</p>
            <div className="mt-4 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full w-fit uppercase tracking-widest">Coming Soon</div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 border-dashed opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Apple Subscriptions</h4>
            <p className="text-sm text-slate-500">Import your App Store and iCloud subscriptions.</p>
            <div className="mt-4 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full w-fit uppercase tracking-widest">Coming Soon</div>
          </div>
        </div>
      </div>
    </div>
  );
};