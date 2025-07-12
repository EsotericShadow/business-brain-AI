
import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './pages/HomePage';
import { Workspace } from './frontend/Workspace';
import type { User } from './types';
import { api } from './services/api';

type AppState = 'authenticating' | 'unauthenticated' | 'authenticated';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('authenticating');
    const [user, setUser] = useState<User | null>(null);

    const verifyUser = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setAppState('unauthenticated');
            return;
        }

        try {
            const response = await api.get('/api/me'); 
            setUser(response.data);
            setAppState('authenticated');
        } catch (error) {
            console.error("Auth token verification failed", error);
            localStorage.removeItem('authToken');
            setUser(null);
            setAppState('unauthenticated');
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const errorFromUrl = urlParams.get('error');

        // Clean the auth-related query params from the URL
        if (tokenFromUrl || errorFromUrl) {
            window.history.replaceState({}, document.title, "/");
        }

        if (errorFromUrl) {
            console.error('OAuth Error:', errorFromUrl);
            // In a real app, you might show a toast message here.
            setAppState('unauthenticated');
            return;
        }

        if (tokenFromUrl) {
            localStorage.setItem('authToken', tokenFromUrl);
            verifyUser();
        } else {
            verifyUser();
        }
    }, [verifyUser]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        setAppState('unauthenticated');
    };
    
    // This function allows child components like Workspace to update the user state
    const handleUserUpdate = (updatedUser: User | null) => {
        setUser(updatedUser);
    };

    switch (appState) {
        case 'authenticating':
            return (
                <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-600"></div>
                </div>
            );
        case 'unauthenticated':
            return <HomePage />;
        case 'authenticated':
            if (user) {
                return <Workspace user={user} onLogout={handleLogout} onUpdateUser={handleUserUpdate} />;
            }
            // Fallback if state is inconsistent
            return <HomePage />;
        default:
            return <HomePage />;
    }
};

export default App;
