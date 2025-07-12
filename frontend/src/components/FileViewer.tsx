import React from 'react';
import type { FileItem, SpreadsheetFile, DocumentFile } from '../types';
import { SpreadsheetView } from './SpreadsheetView';
import { DocumentView } from './DocumentView';
import { FileArrowLeftIcon, FileTextIcon, TableCellsIcon } from './icons';

interface FileViewerProps {
    file: FileItem;
    onClose: () => void;
    onUpdateContent: (fileId: string, newContent: string | string[][]) => void;
}

const FileTypeIcon = ({ type }: { type: 'spreadsheet' | 'document' }) => {
    if (type === 'spreadsheet') {
        return <TableCellsIcon className="w-6 h-6 text-green-500 flex-shrink-0" />;
    }
    return <FileTextIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />;
};

export const FileViewer: React.FC<FileViewerProps> = ({ file, onClose, onUpdateContent }) => {
    
    const handleContentUpdate = (newContent: string | string[][]) => {
        onUpdateContent(file.id, newContent);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-3" title="Back to Directory">
                    <FileArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <FileTypeIcon type={file.type} />
                <h2 className="ml-3 font-semibold text-lg text-gray-800 dark:text-gray-100 truncate">{file.name}</h2>
            </header>
            <div className="flex-1 overflow-auto p-4">
                {file.type === 'spreadsheet' ? (
                    <SpreadsheetView 
                        content={(file as SpreadsheetFile).content} 
                        onUpdate={(newContent) => handleContentUpdate(newContent)}
                    />
                ) : (
                    <DocumentView
                        content={(file as DocumentFile).content}
                        onUpdate={(newContent) => handleContentUpdate(newContent)}
                    />
                )}
            </div>
        </div>
    );
};
