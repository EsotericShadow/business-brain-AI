import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface AuthCallbackPageProps {
  onAuthSuccess: (token: string) => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ onAuthSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    console.log('[AuthCallbackPage] Component mounted.');
    const token = searchParams.get('token');
    const authError = searchParams.get('error');

    if (authError) {
        console.error(`[AuthCallbackPage] Authentication failed with error: ${authError}`);
        setError('Authentication failed. Please try logging in again.');
        setStatus('Redirecting to login...');
        setTimeout(() => navigate('/'), 3000);
        return;
    }

    if (token) {
        console.log('[AuthCallbackPage] Session token found in URL.');
        setStatus('Authentication successful! Redirecting to workspace...');
        onAuthSuccess(token);
    } else {
        console.error('[AuthCallbackPage] No session token found in URL.');
        setError('No authentication token found in the callback.');
        setStatus('Redirecting to login...');
        setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate, onAuthSuccess]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-600 mb-6"></div>
      <div className="text-2xl font-semibold">{status}</div>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we securely log you in.</p>
      {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
    </div>
  );
};
