import React from 'react';
import type { MediaItem } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, PhotoIcon, XMarkIcon } from './icons';

interface MediaViewerModalProps {
  mediaItem: MediaItem;
  onClose: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ mediaItem, onClose, onNavigate }) => {
  return (
    <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-80 flex items-center justify-center animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Navigation Buttons */}
        <button 
          onClick={() => onNavigate('prev')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={() => onNavigate('next')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <ArrowRightIcon className="w-6 h-6" />
        </button>

        {/* Media Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {mediaItem.type === 'image' ? (
            <img src={mediaItem.url} alt={mediaItem.name} className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
                <PhotoIcon className="w-1/4 h-1/4 text-gray-500" />
                <p className="absolute bottom-20 text-white">Video preview not available</p>
            </div>
          )}
        </div>

        {/* Media Info */}
        <div className="flex-shrink-0 text-center text-white p-4">
          <h3 className="font-bold text-lg">{mediaItem.name}</h3>
          <p className="text-sm text-gray-300">
            Created: {mediaItem.createdAt} | Size: {mediaItem.size}
          </p>
        </div>
      </div>
    </div>
  );
};

// Add this to your main CSS file or a style tag in index.html for the animation
const styles = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
`;
// A simple way to inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
