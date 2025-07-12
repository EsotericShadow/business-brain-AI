import React from 'react';
import { InfoIcon, XMarkIcon } from './icons';

interface AuthNoticeProps {
    onClose: () => void;
}

export const AuthNotice: React.FC<AuthNoticeProps> = ({ onClose }) => {
    return (
        <div className="bg-brand-50 dark:bg-brand-900/50 border-b border-brand-200 dark:border-brand-800 p-3 flex items-start text-sm text-brand-800 dark:text-brand-200">
            <InfoIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-grow">
                <span className="font-semibold">Note:</span> This is a simulation. A real app requires two separate authentications:
                <strong className="font-semibold"> 1. User&apos;s Google OAuth:</strong> To securely access their data. 
                <strong className="font-semibold"> 2. Application&apos;s API Key:</strong> For this app to use Gemini services, billed to the developer.
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-100 dark:hover:bg-brand-900 ml-4">
                <XMarkIcon className="h-4 w-4" />
            </button>
        </div>
    )
}
