import React, { useState } from 'react';
import { useOutletContext } from 'react-router';
import { Insights } from '../components/Insights';
import { Subscription } from '../components/Dashboard';

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 15.49,
    billingCycle: 'monthly',
    nextBillingDate: '2026-02-12',
    category: 'streaming',
    color: '#E50914',
    isAutoDetected: true
  },
  {
    id: '2',
    name: 'Spotify',
    price: 9.99,
    billingCycle: 'monthly',
    nextBillingDate: '2026-02-15',
    category: 'streaming',
    color: '#1DB954',
    isAutoDetected: true
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    price: 54.99,
    billingCycle: 'monthly',
    nextBillingDate: '2026-02-28',
    category: 'productivity',
    color: '#FF0000',
    isAutoDetected: true
  },
  {
    id: '4',
    name: 'iCloud+',
    price: 0.99,
    billingCycle: 'monthly',
    nextBillingDate: '2026-02-20',
    category: 'cloud',
    color: '#007AFF',
    isAutoDetected: true
  },
  {
    id: '5',
    name: 'ChatGPT Plus',
    price: 20.00,
    billingCycle: 'monthly',
    nextBillingDate: '2026-03-05',
    category: 'AI Tools',
    color: '#10A37F',
    isAutoDetected: true
  }
];

interface OutletContext {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const InsightsPage: React.FC = () => {
  const { setActiveTab } = useOutletContext<OutletContext>();
  const [subscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);

  React.useEffect(() => {
    setActiveTab('insights');
  }, [setActiveTab]);

  return <Insights subscriptions={subscriptions} />;
};
