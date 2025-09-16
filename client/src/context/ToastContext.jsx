import React, { createContext, useContext, useState, useCallback } from 'react';
import { MdCheck, MdError, MdInfo, MdWarning, MdClose } from 'react-icons/md';

// Add keyframes for toast animation
const toastStyles = `
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = toastStyles;
  document.head.appendChild(styleSheet);
}

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <MdCheck size={20} />;
      case 'error': return <MdError size={20} />;
      case 'warning': return <MdWarning size={20} />;
      case 'info': return <MdInfo size={20} />;
      default: return <MdInfo size={20} />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600/90 border-emerald-500 text-white';
      case 'error':
        return 'bg-red-600/90 border-red-500 text-white';
      case 'warning':
        return 'bg-amber-600/90 border-amber-500 text-white';
      case 'info':
        return 'bg-blue-600/90 border-blue-500 text-white';
      default:
        return 'bg-gray-800/90 border-gray-700 text-white';
    }
  };

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm
      transform transition-all duration-300 ease-in-out
      ${getStyles(toast.type)}
    `} 
    style={{
      animation: 'slideInFromRight 0.3s ease-out'
    }}>
      {getIcon(toast.type)}
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <MdClose size={16} />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, type, message };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast('success', message, duration),
    error: (message, duration) => addToast('error', message, duration),
    warning: (message, duration) => addToast('warning', message, duration),
    info: (message, duration) => addToast('info', message, duration),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            toast={toastItem}
            onClose={() => removeToast(toastItem.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
