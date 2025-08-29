import React from 'react';

export default function AboutChannelModal({ open, onClose, description, dateJoined }) {
  if (!open) return null;

  const formattedDate = dateJoined
    ? new Date(dateJoined).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-70">
      <div className="bg-white dark:bg-[#181818] rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-red-500 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">About this channel</h2>
        <div className="mb-3 text-gray-700 dark:text-gray-200">
          <span className="font-semibold">Description:</span>
          <div className="mt-1 whitespace-pre-line">{description || 'No description provided.'}</div>
        </div>
        <div className="text-gray-700 dark:text-gray-200">
          <span className="font-semibold">Date Joined:</span>
          <span className="ml-2">{formattedDate || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
}
