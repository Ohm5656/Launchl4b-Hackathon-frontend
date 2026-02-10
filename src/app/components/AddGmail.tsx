import React, { useState } from 'react';
import { Mail, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export const AddGmail: React.FC = () => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Check if backend is available
      const backendAvailable = await checkBackendAvailability();
      
      if (backendAvailable) {
        // Redirect to backend which will handle OAuth flow
        // No email needed - Google will ask user to choose account
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        window.location.href = `${backendUrl}/gmail/connect/redirect`;
      } else {
        // Fallback: Build Google OAuth URL directly
        redirectToGoogleOAuth();
      }
    } catch (error) {
      console.error('Failed to initiate Gmail connection:', error);
      setIsConnecting(false);
      // Fallback: Try direct OAuth redirect
      redirectToGoogleOAuth();
    }
  };

  const checkBackendAvailability = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/health`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  };

  const redirectToGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/gmail-callback`;
    
    // If no client ID is set, show error
    if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
      toast.error('Please configure Google OAuth credentials in .env file');
      toast.info('Check GOOGLE_OAUTH_SETUP.md for instructions');
      setIsConnecting(false);
      return;
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/app')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4">
              <Mail className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connect Your Gmail
            </h1>
            <p className="text-gray-600">
              Automatically detect subscriptions from your email
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Your Privacy is Protected
                </h3>
                <p className="text-sm text-gray-600">
                  We take your privacy seriously. Here's what you should know:
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>We only read emails related to subscriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>Your data is encrypted and never shared</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>You can disconnect anytime from settings</span>
              </li>
            </ul>
          </div>

          {/* Connect Button - New Design */}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl" />
            
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="relative z-10">Connecting...</span>
              </>
            ) : (
              <>
                {/* Google Icon */}
                <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                
                <span className="relative z-10 text-lg">Continue with Google</span>
                
                {/* Arrow */}
                <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          {/* Info */}
          <div className="mt-6 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
            <p>
              You'll be redirected to Google to securely sign in and grant permissions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};