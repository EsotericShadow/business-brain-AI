import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/ChatWindow';
import { InputField } from '@/components/InputField';
import { CalendarDaysIcon, FolderIcon, PhotoIcon, InboxIcon } from '@/components/icons';
import type { Message, DirectoryItem, FileItem, ItemId, AppTab, MediaItem, CalendarEvent, ToastMessage, User, Plan, TokenPack } from '@shared/types';
import { api } from '@/services/api';
import { Directory } from '@/components/Directory';
import { FileViewer } from '@/components/FileViewer';
import { initialDirectory, initialMedia, initialCalendarEvents, initialChats } from '@shared/utils/initialData';
import { findPath, downloadItems, createItem, deleteItems, pasteItems, toggleVisibility } from '@shared/utils/directoryUtils';
import { MediaView } from '@/components/MediaView';
import { CalendarView } from '@/components/CalendarView';
import { MailroomView } from '@/components/MailroomView';
import { MediaViewerModal } from '@/components/MediaViewerModal';
import { ToastContainer } from '@/components/ToastContainer';
import { MobileNav } from '@/components/MobileNav';
import { PricingPage } from '@/components/pricing/PricingPage';
import { TrialBanner } from '@/components/TrialBanner';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { CheckoutModal } from '@/components/pricing/CheckoutModal';
import { useMessageStore } from './stores/messageStore';
import { useEditorStore } from './stores/editorStore';
import './Workspace.css';

interface WorkspaceProps {
    user: User;
    onLogout: () => void;
    onUpdateUser: (user: Partial<User>) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ user, onLogout, onUpdateUser }) => {
  const { messages, chats, activeChatId, setActiveChatId, addMessage, updateMessage, setChats } = useMessageStore();
  const { setEditorState, isOpen: isEditorOpen, email: editorEmail } = useEditorStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab | 'mailroom'>('directory');
  const [mobileView, setMobileView] = useState<'chat' | 'workspace'>('chat');
  
  const [directory, setDirectory] = useState<{ [id: ItemId]: DirectoryItem }>(initialDirectory);
  const [currentDirectoryId, setCurrentDirectoryId] = useState<ItemId>('root');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<ItemId>>(new Set());
  const [clipboard, setClipboard] = useState<{ mode: 'cut' | 'copy'; itemIds: ItemId[] } | null>(null);
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);

  const [mediaItems, ] = useState<MediaItem[]>(initialMedia);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  const [calendarEvents, ] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [isTyping, setIsTyping] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPricingVisible, setIsPricingVisible] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<Plan | TokenPack | null>(null);

  useEffect(() => {
    setChats(initialChats);
  }, [setChats]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleFileAction = (action: 'create' | 'delete' | 'copy' | 'cut' | 'paste' | 'download' | 'toggleVisibility', type?: 'directory' | 'spreadsheet' | 'document') => {
    if (action === 'create' && type) {
        const { newDirectory } = createItem(directory, type, currentDirectoryId);
        setDirectory(newDirectory);
    } else if (action === 'delete') {
        setDirectory(deleteItems(directory, Array.from(selectedItemIds)));
        setSelectedItemIds(new Set());
    } else if (action === 'copy' || action === 'cut') {
        setClipboard({ mode: action, itemIds: Array.from(selectedItemIds) });
        addToast(`Copied ${selectedItemIds.size} items.`, 'info');
    } else if (action === 'paste' && clipboard) {
        const newDir = pasteItems(directory, clipboard, currentDirectoryId);
        setDirectory(newDir);
        if (clipboard.mode === 'cut') setClipboard(null);
    } else if (action === 'download') {
        downloadItems(Array.from(selectedItemIds), directory);
    } else if (action === 'toggleVisibility') {
        const newDir = toggleVisibility(directory, Array.from(selectedItemIds)[0]);
        setDirectory(newDir);
    }
  };
  
  const handleSendMessage = async (text: string) => {
    const currentChatId = activeChatId || 'chat-1';
    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text };
    addMessage(currentChatId, userMessage);
    setIsTyping(true);
    try {
      const history = (messages[currentChatId] || []).map(msg => ({
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Ensure the history starts with a user message
      if (history.length > 0 && history[0].role !== 'user') {
        history.unshift({ role: 'user', parts: [{ text: '' }] });
      }

      const response = await api.post('/api/gemini/chat', { prompt: text, history });
      
      if (response.functionCall) {
        await handleAiFunctionCall(response.functionCall);
      } else {
        addMessage(currentChatId, { id: Date.now().toString(), sender: 'ai', text: response.data.content });
      }
    } catch (err) {
      addMessage(currentChatId, { id: Date.now().toString(), sender: 'ai', text: 'Sorry, something went wrong.' });
    } finally {
      setIsTyping(false);
    }
  };

  const handleAiFunctionCall = async (call: { name: string, args: unknown}) => {
    const currentChatId = activeChatId || 'chat-1';
    if (call.name === 'update_draft' && isEditorOpen) {
      const currentContent = editorEmail || {};
      setEditorState({ email: { ...currentContent, ...(call.args as object) } });
      return;
    }
    const messageId = Date.now().toString();
    addMessage(currentChatId, { id: messageId, sender: 'ai', text: `Calling tool: ${call.name}` });
    setIsTyping(true);
    try {
      const response = await api.post('/api/gmail/ai', { prompt: `Execute the function call: ${JSON.stringify(call)}` });
      updateMessage(currentChatId, messageId, { text: response.data.content || `Executed: ${call.name}` });
    } catch (err) {
      updateMessage(currentChatId, messageId, { text: 'Sorry, I failed to execute that action.' });
    } finally {
      setIsTyping(false);
    }
  };

  const currentDirectoryItems = Object.values(directory).filter(item => item.parentId === currentDirectoryId);
  const breadcrumbs = findPath(currentDirectoryId, directory);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'directory':
        return <Directory items={currentDirectoryItems} breadcrumbs={breadcrumbs} selectedItemIds={selectedItemIds} clipboard={clipboard} cutItemIds={clipboard?.mode === 'cut' ? new Set(clipboard.itemIds) : new Set()} onNavigate={setCurrentDirectoryId} onOpenItem={(id) => setActiveFile(directory[id] as FileItem)} onToggleVisibility={(id) => handleFileAction('toggleVisibility', id)} onSetSelectedItemIds={setSelectedItemIds} onCreate={(type) => handleFileAction('create', type)} onDelete={() => handleFileAction('delete')} onCut={() => handleFileAction('cut')} onCopy={() => handleFileAction('copy')} onPaste={() => handleFileAction('paste')} onDownload={() => handleFileAction('download')} />;
      case 'mailroom': return <MailroomView />;
      case 'media': return <MediaView mediaItems={mediaItems} onOpenViewer={setActiveMediaIndex} />;
      case 'calendar': return <CalendarView events={calendarEvents} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <TrialBanner user={user} onOpenBilling={() => setIsPricingVisible(true)} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div className="hidden md:flex">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} user={user} chats={Object.values(chats)} activeChatId={activeChatId || ''} onNewChat={() => {}} onSelectChat={setActiveChatId} onRenameChat={() => {}} onDeleteChat={() => {}} onUpdateUser={onUpdateUser} onExportData={() => {}} onClearAllChats={() => {}} onOpenBilling={() => setIsPricingVisible(true)} onLogout={onLogout} />
      </div>
      <main className="flex-1 flex flex-col h-screen">
        <div className="md:hidden">
            <MobileNav activeView={mobileView} setView={setMobileView} />
        </div>
        <div className={`h-full ${mobileView !== 'chat' && 'hidden'} md:flex md:flex-col`}>
            <PanelGroup direction="horizontal" className="flex-1">
              <Panel defaultSize={50} minSize={30}>
                <div className="h-full flex flex-col bg-white dark:bg-gray-800">
                  <ChatWindow messages={messages[activeChatId || ''] || []} isLoading={isTyping} onEmailSelect={() => {}} onSendMessage={handleSendMessage} />
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <InputField onSendMessage={handleSendMessage} isLoading={isTyping} />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-brand-500 transition-colors" />
              <Panel defaultSize={50} minSize={30}>
                <div className="h-full flex flex-col">
                  <div className="hidden md:flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <nav className="flex space-x-1">
                      {[
                        { id: 'directory', icon: FolderIcon, label: 'Directory' },
                        { id: 'mailroom', icon: InboxIcon, label: 'Mailroom' },
                        { id: 'media', icon: PhotoIcon, label: 'Media' },
                        { id: 'calendar', icon: CalendarDaysIcon, label: 'Calendar' },
                      ].map(tab => (
                        <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as AppTab | 'mailroom')}
                          className={`flex items-center space-x-2 p-2 rounded-md ${activeTab === tab.id ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                          aria-label={tab.label}
                        >
                          <tab.icon className="w-5 h-5" />
                          <span className="hidden lg:inline">{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                  <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                    {renderActiveTab()}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
        </div>
         <div className={`h-full ${mobileView !== 'workspace' && 'hidden'} md:hidden`}>
            {renderActiveTab()}
        </div>
      </main>
      {activeFile && <FileViewer file={activeFile} onClose={() => setActiveFile(null)} onUpdateContent={(id, content) => setDirectory(dir => ({...dir, [id]: {...dir[id], content}}))} />}
      {activeMediaIndex !== null && <MediaViewerModal mediaItem={mediaItems[activeMediaIndex]} onClose={() => setActiveMediaIndex(null)} onNavigate={(dir) => setActiveMediaIndex(i => (i! + (dir === 'next' ? 1 : -1) + mediaItems.length) % mediaItems.length)} />}
      {isPricingVisible && <PricingPage user={user} onSelectPurchase={(item) => { setCheckoutItem(item); setIsPricingVisible(false); }} onClose={() => setIsPricingVisible(false)} />}
      {checkoutItem && <CheckoutModal item={checkoutItem} onClose={() => setCheckoutItem(null)} onConfirm={() => console.log('Confirm purchase')} />}
    </div>
  );
};