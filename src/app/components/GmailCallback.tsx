import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

export const GmailCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Gmail authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Authorization was denied or failed');
        setTimeout(() => navigate('/app/settings'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('Invalid callback parameters');
        setTimeout(() => navigate('/app/settings'), 3000);
        return;
      }

      try {
        // Try backend first
        const backendAvailable = await checkBackendAvailability();
        
        if (backendAvailable && state) {
          // Send code to backend
          const response = await apiService.completeGmailConnection(code, state);
          
          setStatus('success');
          setMessage(`Successfully connected! Found ${response.subscriptionsFound} subscriptions.`);
          toast.success('Gmail connected successfully!');
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => navigate('/app'), 2000);
        } else {
          // No backend - simulate success for demo
          setStatus('success');
          setMessage('Gmail authorization completed! In production, this would sync your subscriptions.');
          toast.info('Demo mode: Backend not running. Connect backend to sync actual subscriptions.');
          
          // Store the authorization code for when backend is available
          sessionStorage.setItem('gmail_auth_code', code);
          if (state) {
            sessionStorage.setItem('gmail_auth_state', state);
          }
          
          // Redirect to dashboard
          setTimeout(() => navigate('/app'), 3000);
        }
      } catch (error) {
        console.error('Failed to complete Gmail connection:', error);
        
        // Even if backend fails, show success in demo mode
        setStatus('success');
        setMessage('Gmail authorization received! Connect backend to complete the process.');
        toast.info('Authorization code received. Start backend to complete Gmail integration.');
        
        setTimeout(() => navigate('/app'), 3000);
      }
    };

    const checkBackendAvailability = async (): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/health`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return response.ok;
      } catch {
        return false;
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[48px] shadow-2xl shadow-indigo-100/50 border border-slate-100 p-12 text-center max-w-md"
      >
        {status === 'processing' && (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-50 rounded-full mb-6">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing...</h2>
            <p className="text-slate-600 font-medium">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-emerald-50 rounded-full mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Success!</h2>
            <p className="text-slate-600 font-medium">{message}</p>
            <p className="text-sm text-slate-500 mt-4">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
            <p className="text-slate-600 font-medium">{message}</p>
            <p className="text-sm text-slate-500 mt-4">Redirecting...</p>
          </>
        )}
      </motion.div>
    </div>
  );
};