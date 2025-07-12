import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import type { Email } from '@shared/types';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DOMPurify from 'dompurify';
import { PaperAirplaneIcon, SparklesIcon, PlusIcon } from './icons';
import { MailroomWizard } from './onboarding/MailroomWizard';

const EmailDetail: React.FC<{ email: Email; onDraftReply: (email: Email) => void }> = ({ email, onDraftReply }) => {
  // Sanitize the HTML body to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(email.html || email.body.replace(/\n/g, '<br>'));

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold">{email.subject}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">From: {email.from}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">To: {email.to}</p>
      </div>
      <div
        className="prose dark:prose-invert max-w-none flex-1 overflow-y-auto py-4"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => onDraftReply(email)}
          className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          Draft Reply with AI
        </button>
      </div>
    </div>
  );
};


export const MailroomView: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ forEmail: Email; content: string } | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const fetchEmails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/emails');
      if (response.success) {
        setEmails(response.emails);
        if (response.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(response.emails[0]);
        }
      } else {
        setError(response.error || 'Failed to fetch emails.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmail]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleDraftReply = async (email: Email) => {
    setDraft({ forEmail: email, content: 'AI is thinking...' });
    try {
      const prompt = `The user wants to reply to the following email:\n\nFrom: ${email.from}\nSubject: ${email.subject}\n\nBody:\n${email.body}\n\nPlease draft a professional and concise reply.`;
      const response = await api.post('/api/gemini/chat', { prompt });
      if (response.data.content) {
        setDraft({ forEmail: email, content: response.data.content });
      } else {
        setDraft({ forEmail: email, content: 'Sorry, I could not generate a draft.' });
      }
    } catch (err) {
      setDraft({ forEmail: email, content: 'An error occurred while drafting the reply.' });
    }
  };

  const handleSend = () => {
    if (!draft) return;
    const { forEmail, content } = draft;
    const userForwardingAddress = forEmail.to; // The user's own forwarding address

    const mailtoLink = `mailto:${forEmail.from}` +
      `?subject=${encodeURIComponent(`Re: ${forEmail.subject}`)}` +
      `&body=${encodeURIComponent(content)}` +
      `&bcc=${encodeURIComponent(userForwardingAddress)}`;
    
    window.location.href = mailtoLink;
  };

  const handleWizardFinish = () => {
    setShowWizard(false);
    fetchEmails(); // Refresh emails after wizard is done
  };

  if (isLoading) return <div className="p-4">Loading mailroom...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      {showWizard && <MailroomWizard onFinish={handleWizardFinish} />}
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={40} minSize={25}>
          <div className="p-2 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4 px-2">
              <h1 className="text-2xl font-bold">Mailroom</h1>
              <button onClick={() => setShowWizard(true)} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
            {emails.length === 0 ? (
              <div className="text-center text-gray-500 p-4">
                <p>No ingested emails yet.</p>
                <button onClick={() => setShowWizard(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
                  Set Up Your First Address
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {emails.map((email) => (
                  <li 
                    key={email.id} 
                    onClick={() => setSelectedEmail(email)}
                    className={`p-3 rounded-lg cursor-pointer ${selectedEmail?.id === email.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <div className="font-semibold truncate">{email.subject}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">From: {email.from}</div>
                    <p className="text-sm mt-1 truncate">{email.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-brand-500 transition-colors" />
        <Panel defaultSize={60} minSize={40}>
          <div className="h-full bg-white dark:bg-gray-900">
            {selectedEmail && !draft && <EmailDetail email={selectedEmail} onDraftReply={handleDraftReply} />}
            {draft && (
              <div className="p-4 h-full flex flex-col">
                <h2 className="text-2xl font-bold pb-4 border-b border-gray-200 dark:border-gray-700">AI Draft</h2>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  className="w-full flex-1 my-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-md resize-none"
                />
                <button 
                  onClick={handleSend}
                  className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                >
                  <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  Open in Email Client to Send
                </button>
              </div>
            )}
            {!selectedEmail && !draft && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select an email to view its content.</p>
              </div>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </>
  );
};
