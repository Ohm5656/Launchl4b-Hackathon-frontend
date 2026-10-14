import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Dashboard } from '../components/Dashboard';
import { useWorkspace } from '../services/Workspace';
import { toast } from 'sonner';
export function DashboardPage() {
  const { isDemo, sync } = useWorkspace();
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    if (!isDemo) void sync();
    if (params.get('gmail_connected') === 'true') {
      toast.success('Gmail connected');
      setParams({}, { replace: true });
    } else if (params.get('error')) {
      toast.error('Gmail connection did not finish. Try again from Settings.');
      setParams({}, { replace: true });
    }
  }, []);
  return <Dashboard />;
}
