import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  Bell,
  LogOut,
  CreditCard,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/app' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/app/calendar' },
    { id: 'insights', label: 'Insights', icon: BarChart3, path: '/app/insights' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/app/settings' },
  ];

  const handleSignOut = () => {
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-3 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-600"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 bg-white border-r border-border flex flex-col z-40 transition-all duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">SubTrack</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 font-bold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4 mb-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-black text-orange-900 uppercase tracking-wider">Upcoming</span>
            </div>
            <p className="text-sm text-orange-800 font-medium">Netflix is due in 2 days</p>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};