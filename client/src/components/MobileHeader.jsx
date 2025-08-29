import React from 'react';

// Accepts icon and label as props
export default function MobileHeader({ icon, label }) {
  return (
    <header className="md:hidden w-full bg-gray-100 dark:bg-[#111111] border-b border-gray-200 dark:border-gray-900 px-4 py-3 flex items-center gap-2 justify-start z-40 fixed top-0 left-0" style={{ minHeight: '44px', height: '44px' }}>
      <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
      <span className="text-base font-bold text-[#0bb6bc] dark:text-[#0bb6bc]">{label}</span>
    </header>
  );
}
