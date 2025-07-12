import React from 'react';
import type { MediaItem } from '../types';
import { PhotoIcon } from './icons';
import { EmptyState } from './EmptyState';

interface MediaViewProps {
  mediaItems: MediaItem[];
  onOpenViewer: (index: number) => void;
}

export const MediaView: React.FC<MediaViewProps> = ({ mediaItems, onOpenViewer }) => {
  if (mediaItems.length === 0) {
    return (
        <EmptyState 
            icon={<PhotoIcon className="w-16 h-16 text-gray-300 dark:text-gray-600"/>}
            title="No images or videos"
            description="Your media gallery is empty. Upload files to see them here."
        />
    )
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mediaItems.map((item, index) => (
          <div key={item.id} onClick={() => onOpenViewer(index)} className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700">
                {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                        <PhotoIcon className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400"/>
                    </div>
                )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white text-xs p-2 truncate">
                {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};