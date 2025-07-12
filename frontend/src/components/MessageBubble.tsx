import React from 'react';
import DOMPurify from 'dompurify';
import type { Message } from '@shared/types';
import { SparklesIcon } from './icons';
import { EmailDraft } from './EmailDraft';
import { EmailList } from './EmailList';
import { sendDraft, updateDraft } from '@/services/gmailService';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const bubbleClasses = isUser
    ? 'bg-brand-600 text-white'
    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm';

  const containerClasses = isUser
    ? 'flex items-end justify-end space-x-3'
    : 'flex items-start space-x-3';

  const handleSendDraft = async (draftId: string) => {
    try {
      await sendDraft(draftId);
      // Maybe show a toast notification
    } catch (error) {
      console.error('Failed to send draft:', error);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    // TODO: Implement delete draft functionality
    console.log('Deleting draft:', draftId);
  };

  const handleUpdateDraft = async (draftId: string, to: string, subject: string, body: string) => {
    try {
      await updateDraft(draftId, to, subject, body);
      // Maybe show a toast notification
    } catch (error) {
      console.error('Failed to update draft:', error);
    }
  };

  const renderContent = () => {
    if (message.contentType === 'gmail/draft') {
      return <EmailDraft draft={message.content} onSend={handleSendDraft} onDelete={handleDeleteDraft} onUpdate={handleUpdateDraft} />;
    }

    if (message.contentType === 'gmail/emails') {
      return <EmailList emails={message.content} />;
    }

    // Sanitize the AI's response before rendering, as it could contain markdown/HTML.
    const sanitizedHtml = DOMPurify.sanitize(message.text?.replace(/\n/g, '<br />') || '');

    return (
      <p
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  };



  const Avatar = () => (
    isUser ? (
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
        <img src="https://picsum.photos/seed/user/40/40" alt="User Avatar" className="w-10 h-10 rounded-full" />
      </div>
    ) : (
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
        <SparklesIcon className="w-5 h-5 text-brand-600 dark:text-brand-300" />
      </div>
    )
  );

  return (
    <div className={containerClasses}>
      {!isUser && <Avatar />}
      <div className={`p-4 rounded-lg max-w-lg ${bubbleClasses}`}>
        {renderContent()}
      </div>
      {isUser && <Avatar />}
    </div>
  );
};

