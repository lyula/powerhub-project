import React from 'react';
import { MdBookmark, MdBookmarkBorder } from 'react-icons/md';

export default function MoreVideoActions({ isOpen, onClose, isSaved, onSave, onFlag }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-80">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">More Actions</h2>
        </div>
        <div className="p-4 space-y-4">
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onSave}
          >
            {isSaved ? (
              <span className="flex items-center gap-2">
                <MdBookmark size={22} /> Saved
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MdBookmarkBorder size={22} /> Save Video
              </span>
            )}
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={onFlag}
          >
            Flag Video
          </button>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
