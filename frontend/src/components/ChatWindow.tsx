
import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { EmailList } from './EmailList';
import DraftEditor from './DraftEditor';
import { SparklesIcon } from './icons';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onEmailSelect: (emailId: string) => void;
  onSendMessage: (prompt: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onEmailSelect, onSendMessage }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const renderMessageContent = (msg: Message) => {
    // Check if the message from the AI has a special 'content' object
    if (msg.sender === 'ai' && msg.content && typeof msg.content === 'object') {
      const { type, data } = msg.content;
      switch (type) {
        case 'emails':
          // This part is for a potential future feature to display email lists directly
          return <EmailList emails={data} onEmailSelect={onEmailSelect} />;
        case 'draft':
          // This is the new path for rendering drafts.
          return (
            <>
              {/* First, render the text part of the message, e.g., "I've started a draft..." */}
              <MessageBubble message={{ ...msg, content: undefined }} />
              {/* Then, render the interactive DraftEditor component below it */}
              <div className="mt-2 ml-12"> {/* Indent the editor to align with the message bubble */}
                <DraftEditor 
                  draft={data} 
                  onSend={onSendMessage} 
                  onDiscard={onSendMessage} 
                />
              </div>
            </>
          );
        default:
          // Fallback for any other unknown special content types
          return <MessageBubble message={msg} />;
      }
    }
    // For all user messages and simple AI text responses, just render the bubble.
    return <MessageBubble message={msg} />;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 h-full">
      {messages.map((msg) => (
        <div key={msg.id}>
            {renderMessageContent(msg)}
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-brand-600 dark:text-brand-300" />
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm max-w-lg">
             <div className="flex items-center space-x-1">
                <span className="text-gray-500 dark:text-gray-400">Thinking</span>
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
