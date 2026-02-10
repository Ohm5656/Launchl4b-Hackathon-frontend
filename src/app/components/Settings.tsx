import React, { useState } from 'react';
import { Bell, Mail, Shield, Smartphone, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export const Settings: React.FC = () => {
  const [reminders, setReminders] = useState({
    sevenDay: true,
    threeDay: true,
    oneDay: true,
    email: false,
    push: true
  });

  const toggle = (key: keyof typeof reminders) => {
    setReminders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your notification preferences and account security.</p>
      </header>

      <div className="space-y-6">
        {/* Notifications Section */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              Reminders & Alerts
            </h3>
            <p className="text-sm text-slate-500 mt-1">Choose how and when you want to be reminded of upcoming bills.</p>
          </div>
          
          <div className="divide-y divide-slate-50 p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Timing</h4>
              {[
                { id: 'sevenDay', label: '7 days before charge', desc: 'A week notice to review your upcoming bill' },
                { id: 'threeDay', label: '3 days before charge', desc: 'A quick nudge as the date approaches' },
                { id: 'oneDay', label: '1 day before charge', desc: 'Final reminder before funds are withdrawn' },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => toggle(item.id as keyof typeof reminders)}
                    className={clsx(
                      "w-12 h-6 rounded-full transition-colors relative",
                      reminders[item.id as keyof typeof reminders] ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <div className={clsx(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      reminders[item.id as keyof typeof reminders] ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Channels</h4>
              {[
                { id: 'email', label: 'Email Notifications', desc: 'Receive detailed reports to your inbox', icon: Mail },
                { id: 'push', label: 'Push Notifications', desc: 'Get instant alerts on your mobile device', icon: Smartphone },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggle(item.id as keyof typeof reminders)}
                      className={clsx(
                        "w-12 h-6 rounded-full transition-colors relative",
                        reminders[item.id as keyof typeof reminders] ? "bg-indigo-600" : "bg-slate-200"
                      )}
                    >
                      <div className={clsx(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        reminders[item.id as keyof typeof reminders] ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Account Security */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-emerald-500" />
            Security & Data
          </h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-left group">
              <div>
                <p className="font-semibold text-slate-900">Connected Bank Accounts</p>
                <p className="text-sm text-slate-500">Chase Bank •••• 4242</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-left group">
              <div>
                <p className="font-semibold text-slate-900">Privacy Mode</p>
                <p className="text-sm text-slate-500">Hide pricing in dashboard view</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
            </button>
          </div>
        </section>

        <div className="pt-4">
          <p className="text-xs text-center text-slate-400">
            SubTracker v1.4.2 • Made with care for your digital life
          </p>
        </div>
      </div>
    </div>
  );
};
