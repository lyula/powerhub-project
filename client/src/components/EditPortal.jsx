import React from 'react';
import ReactDOM from 'react-dom';

const EditPortal = ({ isOpen, children, onClose }) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default EditPortal;
