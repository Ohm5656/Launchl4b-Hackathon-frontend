import React from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Integrations } from '../components/Integrations';

interface OutletContext {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveTab } = useOutletContext<OutletContext>();

  React.useEffect(() => {
    setActiveTab('settings');
  }, [setActiveTab]);

  const handleAddGmail = () => {
    navigate('/add-gmail');
  };

  return (
    <Integrations 
      isSyncing={false} 
      onSync={handleAddGmail}
      lastSync="2 hours ago"
    />
  );
};
