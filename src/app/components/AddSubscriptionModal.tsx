import React, { useState } from 'react';
import { X, Plus, Calendar, DollarSign, Tag, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Subscription } from './Dashboard';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sub: Subscription) => void;
}

const PRESETS = [
  { name: 'Netflix', category: 'Streaming', color: '#E50914', price: 15.49 },
  { name: 'Spotify', category: 'Streaming', color: '#1DB954', price: 9.99 },
  { name: 'YouTube', category: 'Streaming', color: '#FF0000', price: 11.99 },
  { name: 'iCloud', category: 'Cloud', color: '#007AFF', price: 0.99 },
  { name: 'Adobe CC', category: 'Productivity', color: '#FF0000', price: 54.99 },
  { name: 'ChatGPT', category: 'AI Tools', color: '#10A37F', price: 20.00 },
];

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Streaming',
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    nextBillingDate: '',
    color: '#6366f1'
  });

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      price: preset.price.toString(),
      category: preset.category,
      color: preset.color
    });
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: Subscription = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      billingCycle: formData.billingCycle,
      nextBillingDate: formData.nextBillingDate || new Date().toISOString().split('T')[0],
      color: formData.color
    };
    onAdd(newSub);
    onClose();
    // Reset
    setStep(1);
    setFormData({
      name: '',
      price: '',
      category: 'Streaming',
      billingCycle: 'monthly',
      nextBillingDate: '',
      color: '#6366f1'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add Subscription</h3>
                <p className="text-sm text-slate-500">Track a new service in your dashboard</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8">
              {step === 1 ? (
                <div className="space-y-6">
                  <h4 className="font-bold text-slate-900">Choose a platform</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetSelect(preset)}
                        className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                      >
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: preset.color }}
                        >
                          {preset.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{preset.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setStep(2)}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-500">Custom</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Platform Name</label>
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Netflix"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Price</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            required
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Category</label>
                        <select 
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 appearance-none"
                        >
                          <option>Streaming</option>
                          <option>Productivity</option>
                          <option>Cloud</option>
                          <option>AI Tools</option>
                          <option>Gaming</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Billing Cycle</label>
                        <div className="flex bg-slate-50 p-1 rounded-2xl">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, billingCycle: 'monthly'})}
                            className={clsx(
                              "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                              formData.billingCycle === 'monthly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                            )}
                          >
                            Monthly
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, billingCycle: 'yearly'})}
                            className={clsx(
                              "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                              formData.billingCycle === 'yearly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                            )}
                          >
                            Yearly
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Next Charge</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            required
                            type="date"
                            value={formData.nextBillingDate}
                            onChange={e => setFormData({...formData, nextBillingDate: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all"
                    >
                      Save Subscription
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
