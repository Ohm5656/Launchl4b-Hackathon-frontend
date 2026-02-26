import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router';
import { Dashboard, Subscription } from '../components/Dashboard';
import { toast } from 'sonner';
import { apiService } from '../services/api';

// ===== Mock (fallback) =====
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
  }
];

interface OutletContext {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// ===== util: map service → color (เพิ่มทีหลังได้) =====
const SERVICE_COLOR_MAP: Record<string, string> = {
  netflix: '#E50914',
  spotify: '#1DB954',
  adobe: '#FF0000',
  'adobe creative cloud': '#FF0000',
  icloud: '#007AFF',
  chatgpt: '#10A37F'
};

function getColor(serviceName: string) {
  const key = serviceName.toLowerCase();
  return SERVICE_COLOR_MAP[key] || '#6366F1'; // default indigo
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setActiveTab } = useOutletContext<OutletContext>();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [lastSync, setLastSync] = useState('Never');
  const [isLoading, setIsLoading] = useState(false);

  // ===== Fetch from backend =====
  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);

      // 👈 response เป็น array ตรง ๆ
      const data = await apiService.getSubscriptions();

      if (Array.isArray(data) && data.length > 0) {
        // 🔁 Map จาก AI JSON → UI Subscription
        const mapped: Subscription[] = data.map((item: any, index: number) => ({
          id: `${index}-${item.service_name}`,
          name: item.service_name,
          price: item.amount ?? 0,
          billingCycle: item.billing_cycle ?? 'monthly',
          nextBillingDate: item.next_billing_date ?? '-',
          category: item.category ?? 'other',
          color: getColor(item.service_name),
          isAutoDetected: true
        }));

        setSubscriptions(mapped);
        setLastSync('Just now');
      } else {
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

    const gmailConnected = searchParams.get('gmail_connected');
    const email = searchParams.get('email');
    const error = searchParams.get('error');

    if (gmailConnected === 'true' && email) {
      toast.success(`Gmail connected successfully!`);
      toast.info(`Scanning ${email} for subscriptions...`);

      setSearchParams({});

      setTimeout(() => {
        fetchSubscriptions();
      }, 3000);
    } else if (error) {
      toast.error(`Error: ${error}`);
      setSearchParams({});
    } else {
      fetchSubscriptions();
    }
  }, [setActiveTab]);

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
