import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router';
import { Dashboard, Subscription } from '../components/Dashboard';
import { toast } from 'sonner';
import { apiService } from '../services/api';

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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setActiveTab } = useOutletContext<OutletContext>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [lastSync, setLastSync] = useState('Never');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch subscriptions from backend
  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSubscriptions();
      
      if (response.subscriptions && response.subscriptions.length > 0) {
        setSubscriptions(response.subscriptions);
        setLastSync('Just now');
      } else {
        // Use mock data if no subscriptions found
        setSubscriptions(INITIAL_SUBSCRIPTIONS);
      }
    } catch (error) {
      console.log('Backend not available, using mock data');
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab('dashboard');

    // Check for Gmail connection success
    const gmailConnected = searchParams.get('gmail_connected');
    const email = searchParams.get('email');
    const error = searchParams.get('error');

    if (gmailConnected === 'true' && email) {
      toast.success(`Gmail connected successfully!`);
      toast.info(`Scanning ${email} for subscriptions...`);
      
      // Clear query params
      setSearchParams({});
      
      // Fetch subscriptions after a short delay to allow backend to scan
      setTimeout(() => {
        fetchSubscriptions();
      }, 3000);
    } else if (error) {
      const errorMessages: Record<string, string> = {
        'invalid_callback': 'Invalid callback from Google',
        'invalid_state': 'Security check failed. Please try again.',
        'token_exchange_failed': 'Failed to exchange authorization code',
        'gmail_service_failed': 'Failed to connect to Gmail service',
        'profile_failed': 'Failed to get Gmail profile',
      };
      toast.error(errorMessages[error] || `Error: ${error}`);
      // Clear query params
      setSearchParams({});
    } else {
      // Try to fetch subscriptions on initial load
      fetchSubscriptions();
    }
  }, [setActiveTab, searchParams, setSearchParams]);

  const handleAddGmail = () => {
    navigate('/add-gmail');
  };

  return (
    <Dashboard 
      subscriptions={subscriptions} 
      isSyncing={isLoading} 
      onSync={handleAddGmail}
      lastSync={lastSync}
    />
  );
};