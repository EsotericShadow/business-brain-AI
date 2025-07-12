import React, { useState, useEffect } from 'react';
import type { Email } from '../types';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, EnvelopeIcon, TrashIcon } from './icons';
import { EmptyState } from './EmptyState';
import { api } from '../services/api'; // Assuming you have a configured api client

const ConnectGmailButton = () => (
    <button
        onClick={() => window.location.href = 'http://localhost:8000/api/auth/google/login'}
        className="px-4 py-2 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-md transition-colors"
    >
        Connect Gmail Account
    </button>
);


interface EmailViewProps {
  // Props are removed as the component will manage its own state
}

const EmailListItem: React.FC<{email: Email, isSelected: boolean, onSelect: () => void}> = ({ email, isSelected, onSelect }) => (
  <li onClick={onSelect} className={`p-3 border-l-4 cursor-pointer transition-colors ${isSelected ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/50' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
    <div className="flex justify-between items-baseline">
      <p className={`text-sm font-semibold truncate ${!email.isRead && !isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
        {email.sender}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
        {new Date(email.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </p>
    </div>
    <p className={`text-sm truncate mt-1 ${!email.isRead && !isSelected ? 'text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-400'}`}>
      {email.subject}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
      {email.snippet}
    </p>
  </li>
);

const ActionButton: React.FC<{children: React.ReactNode; label: string}> = ({children, label}) => (
    <button className="flex items-center space-x-2 p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors">
        {children}
        <span>{label}</span>
    </button>
);


export const EmailView: React.FC<EmailViewProps> = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setIsLoading(true);
        const fetchedEmails = await api.get('/gmail/emails');
        setEmails(fetchedEmails);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 403) {
            setError('Gmail not connected. Please grant permissions to view your emails.');
        } else {
            console.error('Failed to fetch emails:', err);
            setError('An unexpected error occurred while fetching your emails.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handleSelectEmail = (emailId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (email) {
        setSelectedEmail(email);
    }
  };

  if (isLoading) {
      return (
          <EmptyState 
            icon={<EnvelopeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 animate-pulse"/>}
            title="Loading Emails..."
            description="Please wait while we fetch your inbox."
        />
      )
  }

  if (error) {
    return (
        <EmptyState 
            icon={<EnvelopeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600"/>}
            title="Can't Load Emails"
            description={error}
        >
            <div className="mt-6">
                <ConnectGmailButton />
            </div>
        </EmptyState>
    )
  }

  if (emails.length === 0) {
    return (
        <EmptyState 
            icon={<EnvelopeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600"/>}
            title="No emails"
            description="Your inbox is empty. Emails you receive will appear here."
        />
    )
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-800">
      <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {emails.map((email) => (
            <EmailListItem 
              key={email.id} 
              email={email}
              isSelected={selectedEmail?.id === email.id}
              onSelect={() => handleSelectEmail(email.id)}
            />
          ))}
        </ul>
      </div>
      <div className="w-2/3 flex-col hidden md:flex">
        {selectedEmail ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedEmail.subject}</h2>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    From: <span className="font-medium">{selectedEmail.sender}</span>
                </div>
                 <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(selectedEmail.timestamp).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short'})}
                </div>
            </div>
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                <ActionButton label="Reply"><ArrowUturnLeftIcon className="w-4 h-4"/></ActionButton>
                <ActionButton label="Forward"><ArrowUturnRightIcon className="w-4 h-4"/></ActionButton>
                <ActionButton label="Delete"><TrashIcon className="w-4 h-4 text-red-500"/></ActionButton>
            </div>
            <div className="flex-1 p-6 overflow-y-auto text-gray-800 dark:text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedEmail.body }}>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<EnvelopeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600"/>}
            title="Select an email"
            description="Choose an email from the list to read its content."
           />
        )}
      </div>
    </div>
  );
};