import React from 'react';

interface DocumentViewProps {
    content: string;
    onUpdate: (newContent: string) => void;
}

export const DocumentView: React.FC<DocumentViewProps> = ({ content, onUpdate }) => {
    return (
        <textarea
            value={content}
            onChange={(e) => onUpdate(e.target.value)}
            className="w-full h-full p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
    );
};