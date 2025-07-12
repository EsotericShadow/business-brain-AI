import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { api } from '../services/api';
import { PaperAirplaneIcon, TrashIcon, XMarkIcon } from './icons';

export const EmailEditor: React.FC = () => {
  const { isOpen, mode, email: initialEmail, draftId, closeEditor, setEditorState } = useEditorStore();
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  if (!isOpen || !email) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmail(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSend = async () => {
    if (!email) return;
    try {
      if (draftId) {
        await api.post('/api/gmail/send-draft', { draftId, ...email });
      } else {
        const draftResponse = await api.post('/api/gmail/create-draft', email);
        if (draftResponse.success) {
          await api.post('/api/gmail/send-draft', { draftId: draftResponse.draft.id });
        }
      }
      closeEditor();
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleSaveDraft = async () => {
    if (!email) return;
    try {
      if (draftId) {
        await api.post('/api/gmail/update-draft', { draftId, ...email });
      } else {
        const response = await api.post('/api/gmail/create-draft', email);
        if (response.success) {
          setEditorState({ draftId: response.draft.id });
        }
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const handleDiscard = async () => {
    if (draftId) {
      try {
        await api.post('/api/gmail/delete-draft', { draftId });
      } catch (error) {
        console.error('Failed to delete draft:', error);
      }
    }
    closeEditor();
  };

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-20 flex flex-col">
      <header className="flex items-center justify-between p-2 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold">
          {mode === 'compose' ? 'New Message' : `Re: ${initialEmail?.subject}`}
        </h2>
        <button onClick={handleDiscard} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <XMarkIcon />
        </button>
      </header>
      <div className="p-4 space-y-4 flex-grow">
        <div className="flex items-center">
          <label htmlFor="to" className="text-sm font-medium text-gray-500 w-16">To:</label>
          <input
            type="email"
            id="to"
            name="to"
            value={email.to || ''}
            onChange={handleInputChange}
            className="w-full p-2 bg-transparent focus:outline-none border-b dark:border-gray-700"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="subject" className="text-sm font-medium text-gray-500 w-16">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={email.subject || ''}
            onChange={handleInputChange}
            className="w-full p-2 bg-transparent focus:outline-none border-b dark:border-gray-700"
          />
        </div>
        <textarea
          name="body"
          value={email.body || ''}
          onChange={handleInputChange}
          className="w-full h-full p-2 bg-transparent focus:outline-none resize-none"
          placeholder="Compose your email..."
        />
      </div>
      <footer className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button onClick={handleSend} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700">
            <PaperAirplaneIcon className="w-5 h-5 mr-2" />
            Send
          </button>
          <button onClick={handleSaveDraft} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            Save Draft
          </button>
        </div>
        <button onClick={handleDiscard} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <TrashIcon />
        </button>
      </footer>
    </div>
  );
};
