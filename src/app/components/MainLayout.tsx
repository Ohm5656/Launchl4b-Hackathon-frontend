import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';

export const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-right" closeButton richColors />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 min-w-0">
        <div className="max-w-7xl mx-auto mt-16 lg:mt-0">
          <Outlet context={{ activeTab, setActiveTab }} />
        </div>
      </main>
    </div>
  );
};
