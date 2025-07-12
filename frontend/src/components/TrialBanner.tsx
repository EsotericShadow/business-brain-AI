import React, { useState, useMemo } from 'react';
import type { User } from '../types';
import { SparklesIcon, XMarkIcon } from './icons';

interface TrialBannerProps {
    user: User;
    onOpenBilling: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ user, onOpenBilling }) => {
    const [isVisible, setIsVisible] = useState(true);

    const daysRemaining = useMemo(() => {
        if (!user.trialEndsAt) return 0;
        const endDate = new Date(user.trialEndsAt);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }, [user.trialEndsAt]);

    if (!user.trialEndsAt || daysRemaining <= 0 || !isVisible) {
        return null;
    }

    return (
        <div className="bg-brand-50 dark:bg-brand-900/50 border-b border-brand-200 dark:border-brand-800 p-3 flex items-center justify-center text-sm text-brand-800 dark:text-brand-200 relative">
            <SparklesIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="text-center">
                You have <span className="font-bold">{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span> left on your free trial.
                <button onClick={onOpenBilling} className="font-bold underline ml-2 hover:text-brand-600 dark:hover:text-brand-300">
                    Upgrade Now
                </button>
            </div>
            <button onClick={() => setIsVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-brand-100 dark:hover:bg-brand-900">
                <XMarkIcon className="h-4 w-4" />
            </button>
        </div>
    );
};
