import React from 'react';

const ProgressBar = ({ loading }) => (
  <div className={`fixed top-0 left-0 w-full h-1 z-50 transition-all duration-300 ${loading ? '' : 'opacity-0'}`}>
    <div className="h-full bg-[#ff0000] animate-progress" style={{ width: loading ? '100%' : '0%' }} />
    <style>{`
      @keyframes progress {
        0% { width: 0%; }
        80% { width: 90%; }
        100% { width: 100%; }
      }
      .animate-progress {
        animation: progress 1.2s cubic-bezier(.4,0,.2,1) forwards;
      }
    `}</style>
  </div>
);

export default ProgressBar;
