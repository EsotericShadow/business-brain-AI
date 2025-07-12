import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const VerifyPage: React.FC = () => {
  const [status, setStatus] = useState('Verifying your login...');
  const location = useLocation();
  const navigate = useNavigate();
  const hasVerified = useRef(false); // Add a ref to track if verification has been attempted

  useEffect(() => {
    // Only run the verification logic if it hasn't been run before.
    if (!hasVerified.current) {
      hasVerified.current = true; // Mark as attempted immediately
      console.log('[VerifyPage] Component mounted. Verifying token...');
      
      const verifyToken = () => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          console.error('[VerifyPage] No token found in URL.');
          setStatus('Invalid login link. Please try again.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Redirect to the backend API endpoint to handle verification.
        window.location.href = `/api/auth/verify${location.search}`;
      };

      verifyToken();
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p>{status}</p>
      </div>
    </div>
  );
};
