import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, ChevronDoubleLeftIcon } from '@/components/icons';
import type { Chat, User } from '@shared/types';
import { ChatHistory } from '@/components/ChatHistory';
import { SettingsMenu } from '@/components/SettingsMenu';
import { PLAN_DETAILS } from '@shared/utils/initialData';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  user: User;
  chats: Chat[];
  activeChatId: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onExportData: () => void;
  onClearAllChats: () => void;
  onOpenBilling: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { isSidebarOpen, setIsSidebarOpen, chats, activeChatId, onNewChat, onSelectChat, onRenameChat, onDeleteChat, user } = props;
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  
  const currentPlan = PLAN_DETAILS.find(p => p.id === user.planId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
            setIsSettingsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-full">
            <SparklesIcon className="w-6 h-6 text-brand-600 dark:text-brand-300" />
          </div>
          {isSidebarOpen && <span className="ml-3 font-bold text-lg text-gray-800 dark:text-gray-100">Business Brain</span>}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
            <ChatHistory 
                isSidebarOpen={isSidebarOpen}
                chats={chats}
                activeChatId={activeChatId}
                onNewChat={onNewChat}
                onSelectChat={onSelectChat}
                onRenameChat={onRenameChat}
                onDeleteChat={onDeleteChat}
            />
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 relative" ref={settingsMenuRef}>
            {isSettingsMenuOpen && <SettingsMenu {...props} onClose={() => setIsSettingsMenuOpen(false)} />}
            <div className="flex items-center justify-between">
                <button 
                  onClick={() => setIsSettingsMenuOpen(prev => !prev)}
                  className="flex-1 flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-left"
                >
                    <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full flex-shrink-0" />
                    {isSidebarOpen && (
                        <div className="ml-3 overflow-hidden">
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentPlan?.name} Plan</div>
                        </div>
                    )}
                </button>
                 <button 
                   onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                   className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                   title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                  >
                    <ChevronDoubleLeftIcon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${!isSidebarOpen && 'rotate-180'}`} />
                </button>
            </div>
        </div>
      </div>
    </>
  );
};
