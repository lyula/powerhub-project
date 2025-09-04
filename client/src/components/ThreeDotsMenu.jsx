import React, { useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

export default function ThreeDotsMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left" style={{ minWidth: 0 }}>
      <button
        className="p-2 rounded-full bg-white/80 hover:bg-gray-200 dark:bg-black/60 dark:hover:bg-gray-800 shadow"
        aria-label="Channel options"
        onClick={() => setOpen((prev) => !prev)}
        style={{ position: 'relative', zIndex: 40 }}
      >
        <FiMoreVertical size={24} color="#fff" />
      </button>
      {open && (
        <div
          className="absolute top-1/2 right-full -translate-y-1/2 mr-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-30"
          style={{ zIndex: 30 }}
        >
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => { setOpen(false); onEdit && onEdit(); }}
          >
            Edit Channel Profile
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={() => { setOpen(false); onDelete && onDelete(); }}
          >
            Delete Channel
          </button>
        </div>
      )}
    </div>
  );
}
