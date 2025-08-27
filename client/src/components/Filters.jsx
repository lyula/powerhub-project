import React from 'react';

const categories = [
  'AI',
  'Mobile apps',
  'MERN',
  'Python',
  'Javascript',
  'HTML & CSS',
  'Entreprenuership',
  'Success Stories',
  'PLP Graduation',
  'Hackathons',
];

export default function Filters() {
  return (
    <div
      className="w-full max-w-full md:max-w-4xl mx-auto"
      style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
    >
      <div
        className="flex gap-2 whitespace-nowrap"
        style={{ minWidth: 0, overflowX: 'auto', width: '100%' }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            className="px-3 py-1 rounded-full text-sm font-medium transition bg-[#0bb6bc] text-white hover:bg-[#c42152] dark:bg-[#222] dark:text-gray-200 dark:hover:bg-[#333]"
            style={{ minWidth: 'max-content', wordBreak: 'keep-all' }}
          >
            {cat}
          </button>
        ))}
      </div>
      <style>{`
        /* Hide scrollbars for filters */
        div::-webkit-scrollbar { display: none !important; }
        div { scrollbar-width: none !important; }
      `}</style>
    </div>
  );
}
