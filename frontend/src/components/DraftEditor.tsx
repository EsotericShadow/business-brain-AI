import React, { useState, useEffect } from 'react';
import type { EmailDraft } from '@shared/types';
import { PaperAirplaneIcon, TrashIcon, ArrowPathIcon } from '@/components/icons';

interface DraftEditorProps {
  draft: EmailDraft;
  onSend: (prompt: string) => void;
  onDiscard: (prompt: string) => void;
}

// Utility to convert basic HTML to plain text for textarea
const htmlToPlainText = (html: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html.replace(/<br\s*\/?/gi, '\n');
  return tempDiv.textContent || tempDiv.innerText || '';
};

export const DraftEditor: React.FC<DraftEditorProps> = ({ draft, onSend, onDiscard }) => {
  const [isSending, setIsSending] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  
  // Editable state for the draft
  const [to, setTo] = useState(draft.to);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState('');

  useEffect(() => {
    // Initialize body with plain text version of HTML
    setBody(htmlToPlainText(draft.body));
  }, [draft.body]);

  const handleSend = async () => {
    setIsSending(true);
    // Construct a detailed prompt for the AI to update and send the draft
    const prompt = `
      Send the draft with ID ${draft.id}.
      But first, update it with the following content:
      To: ${to}
      Subject: ${subject}
      Body: ${body}
    `;
    await onSend(prompt);
    setIsSending(false);
  };

  const handleDiscard = async () => {
    if (window.confirm('Are you sure you want to discard this draft?')) {
      setIsDiscarding(true);
      await onDiscard(`discard the draft with ID ${draft.id}`);
    }
  };

  const isActionInProgress = isSending || isDiscarding;

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-lg animate-fade-in-up">
      <div className="mb-4 space-y-3">
        <div className="flex items-center">
          <label htmlFor={`draft-to-${draft.id}`} className="w-16 text-sm font-medium text-gray-500 dark:text-gray-400">To:</label>
          <input
            type="email"
            id={`draft-to-${draft.id}`}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor={`draft-subject-${draft.id}`} className="w-16 text-sm font-medium text-gray-500 dark:text-gray-400">Subject:</label>
          <input
            type="text"
            id={`draft-subject-${draft.id}`}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>
      
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full h-48 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-brand-500 focus:border-brand-500"
        placeholder="Email body..."
      />

      <div className="mt-4 flex justify-end space-x-3">
          <button 
            onClick={handleDiscard}
            disabled={isActionInProgress}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Discard
          </button>
          <button 
            onClick={handleSend}
            disabled={isActionInProgress}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
            )}
            {isSending ? 'Sending...' : 'Send Draft'}
          </button>
      </div>
    </div>
  );
};

export default DraftEditor;
