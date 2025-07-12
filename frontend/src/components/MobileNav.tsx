import React from 'react';
import { ChatBubbleLeftEllipsisIcon, FolderIcon } from './icons';

interface MobileNavProps {
  activeView: 'chat' | 'workspace';
  setView: (view: 'chat' | 'workspace') => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:text-brand-500'
    }`}
  >
    {children}
    <span className="text-xs font-medium">{label}</span>
  </button>
);


export const MobileNav: React.FC<MobileNavProps> = ({ activeView, setView }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 shadow-lg z-40">
      <NavButton label="Chat" isActive={activeView === 'chat'} onClick={() => setView('chat')}>
        <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
      </NavButton>
      <NavButton label="Workspace" isActive={activeView === 'workspace'} onClick={() => setView('workspace')}>
        <FolderIcon className="w-6 h-6" />
      </NavButton>
    </nav>
  );
};
