import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; // Assuming you have a configured api service

interface GmailAuthComponentProps {
  user: { id: string; email: string; isGmailConnected: boolean };
  onAuthSuccess: () => void;
}

export const GmailAuthComponent: React.FC<GmailAuthComponentProps> = ({ user, onAuthSuccess }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect handles the redirect back from Google's OAuth screen
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code) {
      setIsAuthenticating(true);
      // The backend's /api/auth/google/callback handles the code exchange
      // and redirects back. We just need to notify the parent component.
      onAuthSuccess();
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsAuthenticating(false);
    }
  }, [onAuthSuccess]);

  const initiateAuth = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      // The backend will generate the auth URL and redirect the browser
      window.location.href = `${api.defaults.baseURL}/api/auth/google/login`;
    } catch (err) {
      console.error('Failed to initiate auth:', err);
      setError((err as Error).message || 'Failed to start authentication. Please try again.');
      setIsAuthenticating(false);
    }
  };

  if (user.isGmailConnected) {
    return (
      <div className="p-4 border rounded-lg bg-green-50 text-green-800">
        <p className="font-semibold">Gmail Account Connected</p>
        <p>Email: {user.email}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Connect Your Gmail</h3>
      <p className="text-gray-600 mb-4">
        To enable the AI Gmail agent, you need to connect your Google account.
      </p>
      {error && <div className="my-2 text-red-600 bg-red-100 p-2 rounded">{error}</div>}
      <button 
        onClick={initiateAuth}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={isAuthenticating}
      >
        {isAuthenticating ? 'Authenticating...' : 'Connect Gmail Account'}
      </button>
    </div>
  );
};
