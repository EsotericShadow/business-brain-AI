import React from 'react';
import type { EmailMessage } from '@shared/types';

interface EmailListProps {
  emails: EmailMessage[];
  onEmailSelect: (emailId: string) => void;
}

export const EmailList: React.FC<EmailListProps> = ({ emails, onEmailSelect }) => {
  if (!emails || emails.length === 0) {
    return <div className="p-4 text-center text-gray-500">No emails found.</div>;
  }

  return (
    <div className="divide-y divide-gray-200">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onEmailSelect(email.id)}
          className="p-4 hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex justify-between">
            <p className="font-semibold text-gray-900">{email.from}</p>
            <p className="text-sm text-gray-500">{new Date(email.date).toLocaleDateString()}</p>
          </div>
          <p className="text-gray-800">{email.subject}</p>
          <p className="text-sm text-gray-600 truncate">{email.body.substring(0, 100)}</p>
        </div>
      ))}
    </div>
  );
};

