import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { Workspace } from './Workspace';
import type { User } from '@shared/types';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { api } from './services/api';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { VerifyPage } from './pages/VerifyPage';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const userData = await api.get('/api/me');
                setUser(userData);
            } catch (error) {
                console.error("Token verification failed, logging out.", error);
                localStorage.removeItem('authToken');
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleAuthSuccess = (token: string) => {
        localStorage.setItem('authToken', token);
        fetchUser().then(() => {
             navigate('/workspace'); // Navigate to workspace after successful login
        });
    };
    
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        navigate('/'); // Navigate to home page after logout
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <div className="app-content">
                <Routes>
                    <Route path="/auth/verify" element={<VerifyPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage onAuthSuccess={handleAuthSuccess} />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage onContinue={() => {
                        fetchUser();
                        navigate('/workspace');
                    }} />} />
                    <Route path="/" element={<HomePage />} />
                    <Route 
                        path="/workspace/*" 
                        element={
                            user ? (
                                <Workspace user={user} onLogout={handleLogout} onUpdateUser={setUser} />
                            ) : (
                                <HomePage />
                            )
                        } 
                    />
                </Routes>
            </div>
        </div>
    );
};

export default App;