import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";

const ResponsiveVideoModal = ({ isOpen, onClose, actions, backdropClassName = "bg-black bg-opacity-30" }) => {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${backdropClassName}`}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#232323] rounded-lg shadow-lg w-full max-w-md mx-4 p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
          onClick={onClose}
        >
          <MdClose size={24} />
        </button>
        <div className="flex flex-col gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              className="flex items-center gap-3 w-full px-4 py-2 text-base font-medium text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#313131] transition-colors"
              onClick={action.onClick}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ResponsiveVideoModal;
