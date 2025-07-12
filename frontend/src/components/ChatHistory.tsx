import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '../types';
import { PlusIcon, ChatBubbleLeftEllipsisIcon, PencilIcon, TrashIcon } from './icons';

interface ChatHistoryProps {
  isSidebarOpen: boolean;
  chats: Chat[];
  activeChatId: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ isSidebarOpen, chats, activeChatId, onNewChat, onSelectChat, onRenameChat, onDeleteChat }) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingChatId]);

  const handleStartEditing = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleCancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleSaveRename = () => {
    if (editingChatId && editingTitle.trim()) {
      onRenameChat(editingChatId, editingTitle.trim());
    }
    handleCancelEditing();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSaveRename();
    } else if (e.key === 'Escape') {
        handleCancelEditing();
    }
  };


  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onNewChat}
        className="flex-shrink-0 flex items-center justify-between p-2 m-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {isSidebarOpen && <span className="text-sm font-medium text-gray-800 dark:text-gray-100">New Chat</span>}
        <PlusIcon className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${isSidebarOpen ? '' : 'mx-auto'}`} />
      </button>
      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {chats.map(chat => (
          <div key={chat.id} className="group relative">
            <button
              onClick={() => onSelectChat(chat.id)}
              className={`w-full flex items-center p-2 text-sm rounded-md transition-colors ${
                activeChatId === chat.id
                  ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChatBubbleLeftEllipsisIcon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                 editingChatId === chat.id ? (
                     <input
                        ref={inputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={handleSaveRename}
                        onKeyDown={handleKeyDown}
                        className="ml-3 flex-1 bg-transparent border-b border-brand-500 focus:outline-none"
                    />
                 ) : (
                    <span className="ml-3 flex-1 text-left truncate">{chat.title}</span>
                 )
              )}
            </button>
            {isSidebarOpen && activeChatId === chat.id && editingChatId !== chat.id && (
                 <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-brand-100 dark:bg-brand-900/50 rounded-md">
                     <button onClick={() => handleStartEditing(chat)} className="p-1 hover:text-brand-600 dark:hover:text-brand-300"><PencilIcon className="w-4 h-4"/></button>
                     <button onClick={() => onDeleteChat(chat.id)} className="p-1 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                 </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
