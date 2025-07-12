import React, { useState } from 'react';
import type { Theme, User } from '../types';
import { SunIcon, MoonIcon, Cog6ToothIcon, CreditCardIcon, ArchiveBoxArrowDownIcon, TrashIcon, LogoutIcon, InboxIcon, XMarkIcon } from './icons';
import { ForwardingAddressSettings } from './settings/ForwardingAddressSettings';

interface SettingsMenuProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onExportData: () => void;
  onClearAllChats: () => void;
  onOpenBilling: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const MenuButton: React.FC<{ onClick?: () => void; children: React.ReactNode; isSelected?: boolean; }> = ({ onClick, children, isSelected }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-2 text-sm text-left rounded-md transition-colors ${
            isSelected ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
        {children}
    </button>
);

const SettingsModal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            {children}
        </div>
    </div>
);

export const SettingsMenu: React.FC<SettingsMenuProps> = (props) => {
    const { theme, setTheme, user, onExportData, onClearAllChats, onLogout, onOpenBilling, onClose } = props;
    const [isForwardingModalOpen, setIsForwardingModalOpen] = useState(false);
    
    const handleManageSubscription = () => {
        onOpenBilling();
        onClose();
    };

    return (
        <>
            <div className="absolute bottom-full left-2 right-2 mb-2 w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-fade-in-up p-2 z-50">
                {/* Theme Section */}
                <div className="p-2">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Theme</p>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setTheme('light')} className={`flex-1 p-2 rounded-md text-sm transition-colors ${theme === 'light' ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><SunIcon className="w-5 h-5 mx-auto"/></button>
                        <button onClick={() => setTheme('dark')} className={`flex-1 p-2 rounded-md text-sm transition-colors ${theme === 'dark' ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><MoonIcon className="w-5 h-5 mx-auto"/></button>
                        <button onClick={() => setTheme('system')} className={`flex-1 p-2 rounded-md text-sm transition-colors ${theme === 'system' ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Cog6ToothIcon className="w-5 h-5 mx-auto"/></button>
                    </div>
                </div>
                
                <hr className="my-2 border-gray-200 dark:border-gray-700"/>

                {/* Account & Billing */}
                <div className="space-y-1 p-2">
                    <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-200 px-2 py-1">
                        <span>Token Balance:</span>
                        <span className="font-semibold">{user.tokenBalance?.toLocaleString()}</span>
                    </div>
                    <MenuButton onClick={() => setIsForwardingModalOpen(true)}>
                        <InboxIcon className="w-5 h-5 mr-3"/>
                        <span>Manage Forwarding Addresses</span>
                    </MenuButton>
                    <MenuButton onClick={handleManageSubscription}>
                        <CreditCardIcon className="w-5 h-5 mr-3"/>
                        <span>Manage Subscription</span>
                    </MenuButton>
                </div>

                <hr className="my-2 border-gray-200 dark:border-gray-700"/>

                {/* Data Management */}
                <div className="space-y-1 p-2">
                    <MenuButton onClick={onExportData}>
                        <ArchiveBoxArrowDownIcon className="w-5 h-5 mr-3"/>
                        <span>Export All Data</span>
                    </MenuButton>
                    <MenuButton onClick={onClearAllChats}>
                        <TrashIcon className="w-5 h-5 mr-3 text-red-500"/>
                        <span className="text-red-500">Clear All Chat History</span>
                    </MenuButton>
                </div>
                
                <hr className="my-2 border-gray-200 dark:border-gray-700"/>
                
                <div className="p-2">
                    <MenuButton onClick={onLogout}>
                        <LogoutIcon className="w-5 h-5 mr-3"/>
                        <span>Logout</span>
                    </MenuButton>
                </div>

                {/* Add animation styles */}
                <style>{`
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
                `}</style>
            </div>
            {isForwardingModalOpen && (
                <SettingsModal title="Forwarding Addresses" onClose={() => setIsForwardingModalOpen(false)}>
                    <ForwardingAddressSettings />
                </SettingsModal>
            )}
        </>
    );
};