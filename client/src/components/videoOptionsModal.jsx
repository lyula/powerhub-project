import React from 'react';
import {
  MdFlag,
  MdBookmark,
  MdBookmarkBorder,
  MdQueue,
  MdPlaylistAdd,
} from "react-icons/md";

export default function VideoOptionsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onFlag, 
  onAddToQueue, 
  onAddToPlaylist, 
  isSaved = false 
}) {
  if (!isOpen) return null;

  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleFlag = () => {
    onFlag();
    onClose();
  };

  const handleAddToQueue = () => {
    onAddToQueue();
    onClose();
  };

  const handleAddToPlaylist = () => {
    onAddToPlaylist();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-80">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Video Options</h2>
        </div>
        <div className="p-4 space-y-2">
          <button
            className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={handleSave}
          >
            {isSaved ? (
              <MdBookmark size={22} className="dark:text-gray-400 text-black" />
            ) : (
              <MdBookmarkBorder size={22} className="dark:text-gray-400 text-black" />
            )}
            {isSaved ? "Saved" : "Save Video"}
          </button>
          
          <button
            className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={handleFlag}
          >
            <MdFlag size={22} className="dark:text-gray-400 text-black" />
            Flag Video
          </button>
          
          <button
            className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={handleAddToQueue}
          >
            <MdQueue size={22} className="dark:text-gray-400 text-black" />
            Add to Queue
          </button>
          
          <button
            className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={handleAddToPlaylist}
          >
            <MdPlaylistAdd size={22} className="dark:text-gray-400 text-black" />
            Add to Playlist
          </button>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
