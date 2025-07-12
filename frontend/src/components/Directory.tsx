import React, { useMemo } from 'react';
import type { DirectoryItem, ItemId } from '../types';
import { 
    FileTextIcon, 
    TableCellsIcon, 
    EyeIcon, 
    EyeSlashIcon,
    FolderIcon,
    TrashIcon,
    ClipboardIcon,
    ClipboardCopyIcon,
    ScissorsIcon,
    DownloadIcon,
    FolderPlusIcon,
    FilePlusIcon
} from './icons';
import { EmptyState } from './EmptyState';

interface DirectoryProps {
  items: DirectoryItem[];
  breadcrumbs: { id: ItemId; name: string }[];
  selectedItemIds: Set<ItemId>;
  clipboard: { mode: 'cut' | 'copy'; itemIds: ItemId[] } | null;
  cutItemIds: Set<ItemId>;
  onNavigate: (directoryId: ItemId) => void;
  onOpenItem: (itemId: ItemId) => void;
  onToggleVisibility: (fileId: ItemId) => void;
  onSetSelectedItemIds: (updater: (prev: Set<ItemId>) => Set<ItemId>) => void;
  onCreate: (type: 'directory' | 'spreadsheet' | 'document') => void;
  onDelete: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDownload: () => void;
}

const ItemIcon = ({ item }: { item: DirectoryItem }) => {
    if (item.type === 'directory') {
        return <FolderIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
    }
    if (item.type === 'spreadsheet') {
        return <TableCellsIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
    }
    return <FileTextIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
};

const ToolbarButton: React.FC<{ onClick: () => void; disabled: boolean; title: string; children: React.ReactNode }> = ({ onClick, disabled, title, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="p-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-gray-200 enabled:dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
    >
        {children}
    </button>
);

export const Directory: React.FC<DirectoryProps> = (props) => {
    const { items, breadcrumbs, selectedItemIds, clipboard, cutItemIds, onNavigate, onOpenItem, onToggleVisibility, onSetSelectedItemIds, onCreate, onDelete, onCut, onCopy, onPaste, onDownload } = props;

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSetSelectedItemIds(() => {
            if (e.target.checked) {
                return new Set(items.map(item => item.id));
            }
            return new Set();
        });
    };

    const handleItemSelect = (itemId: ItemId, e: React.ChangeEvent<HTMLInputElement>) => {
        onSetSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (e.target.checked) {
                newSet.add(itemId);
            } else {
                newSet.delete(itemId);
            }
            return newSet;
        });
    };
    
    const selectionCount = selectedItemIds.size;
    const canPaste = useMemo(() => {
        if (!clipboard) return false;
        // Prevent pasting a folder into itself
        const currentDirectoryId = breadcrumbs[breadcrumbs.length - 1]?.id;
        return !clipboard.itemIds.includes(currentDirectoryId);
    }, [clipboard, breadcrumbs]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        {/* Header and Breadcrumbs */}
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.id}>
                        {index > 0 && <span className="mx-2">/</span>}
                        <button 
                            onClick={() => onNavigate(crumb.id)} 
                            className={`hover:text-brand-600 dark:hover:text-brand-400 ${index === breadcrumbs.length - 1 ? 'text-gray-800 dark:text-gray-200 font-semibold' : ''}`}
                        >
                            {crumb.name}
                        </button>
                    </React.Fragment>
                ))}
            </nav>
        </header>
        
        {/* Toolbar */}
        <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-wrap">
            <ToolbarButton onClick={() => onCreate('directory')} disabled={false} title="New Folder"><FolderPlusIcon className="w-5 h-5"/></ToolbarButton>
            <ToolbarButton onClick={() => onCreate('document')} disabled={false} title="New Document"><FilePlusIcon className="w-5 h-5"/></ToolbarButton>
            <ToolbarButton onClick={() => onCreate('spreadsheet')} disabled={false} title="New Spreadsheet"><TableCellsIcon className="w-5 h-5 text-green-500"/></ToolbarButton>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
            <ToolbarButton onClick={onCut} disabled={selectionCount === 0} title="Cut"><ScissorsIcon className="w-5 h-5"/></ToolbarButton>
            <ToolbarButton onClick={onCopy} disabled={selectionCount === 0} title="Copy"><ClipboardCopyIcon className="w-5 h-5"/></ToolbarButton>
            <ToolbarButton onClick={onPaste} disabled={!canPaste} title="Paste"><ClipboardIcon className="w-5 h-5"/></ToolbarButton>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
            <ToolbarButton onClick={onDownload} disabled={selectionCount === 0} title="Download"><DownloadIcon className="w-5 h-5"/></ToolbarButton>
            <ToolbarButton onClick={onDelete} disabled={selectionCount === 0} title="Delete"><TrashIcon className="w-5 h-5 text-red-500"/></ToolbarButton>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
                <EmptyState 
                    icon={<FolderIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />}
                    title="This folder is empty"
                    description="Create a new file or folder to get started."
                />
            ) : (
                <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                        <tr>
                            <th className="p-2 w-8">
                                <input type="checkbox" onChange={handleSelectAll} checked={items.length > 0 && selectionCount === items.length} className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-brand-500" />
                            </th>
                            <th className="p-2 text-left font-semibold text-gray-600 dark:text-gray-300">Name</th>
                            <th className="p-2 w-16 text-center font-semibold text-gray-600 dark:text-gray-300">Visible</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} onDoubleClick={() => onOpenItem(item.id)} className={`group border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${cutItemIds.has(item.id) ? 'opacity-50' : ''}`}>
                                <td className="p-2 w-8">
                                    <input type="checkbox" onChange={(e) => handleItemSelect(item.id, e)} checked={selectedItemIds.has(item.id)} className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-brand-500" />
                                </td>
                                <td className="p-2">
                                    <div className="flex items-center">
                                        <ItemIcon item={item} />
                                        <span className="ml-3 flex-1 truncate text-gray-800 dark:text-gray-200">{item.name}</span>
                                    </div>
                                </td>
                                <td className="p-2 w-16 text-center">
                                    {item.type !== 'directory' && (
                                        <button onClick={() => onToggleVisibility(item.id)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title={item.isVisible ? 'Hide from AI' : 'Make visible to AI'}>
                                            {item.isVisible
                                                ? <EyeIcon solid className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                                : <EyeSlashIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
  );
};