import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { Dashboard, Subscription } from './Dashboard';
import { apiService } from '../services/api';
import { toast } from 'sonner';

const MOCK_SUBSCRIPTIONS: Subscription[] = [
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
  }
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for token in URL (from OAuth callback)
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      apiService.setAuthToken(token);
      toast.success('Successfully signed in with Google!');
      navigate('/app');
    }
  }, [searchParams, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      apiService.setAuthToken('demo-token-' + Date.now());
      navigate('/app');
    }, 1500);
  };

  const handleGoogleSignIn = () => {
    // Google OAuth configuration
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/`;
    
    // If no client ID is set, use backend OAuth endpoint
    if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      window.location.href = `${backendUrl}/auth/google/login`;
      return;
    }

    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '));
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');
    
    // Redirect to Google Sign-In
    window.location.href = googleAuthUrl.toString();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
      {/* Blurred Dashboard Background */}
      <div className="absolute inset-0 opacity-30 blur-lg scale-105 pointer-events-none">
        <div className="p-10 pt-20">
          <Dashboard 
            subscriptions={MOCK_SUBSCRIPTIONS} 
            isSyncing={false} 
            onSync={() => {}}
            lastSync="2 hours ago"
          />
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/50 to-blue-50/80 backdrop-blur-xl pointer-events-none"></div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/90 backdrop-blur-2xl rounded-[48px] shadow-2xl shadow-indigo-100/50 border border-white/50 p-10 md:p-12">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl mb-4 shadow-lg shadow-indigo-200">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">SubTrack</h1>
            <p className="text-slate-500 font-medium">
              AI-powered subscription tracker
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                Forgot?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black py-4 rounded-2xl hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm text-slate-400 font-bold">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 font-medium">
              Don't have an account?{' '}
              <a href="#" className="text-indigo-600 font-black hover:text-indigo-700 transition-colors">
                Sign up free
              </a>
            </p>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-2xl">
            <p className="text-xs text-indigo-600 text-center font-bold">
              🎉 Enter any email & password to try the demo
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6 font-medium">
          Automatically track subscriptions from Gmail
        </p>
      </motion.div>
    </div>
  );
};