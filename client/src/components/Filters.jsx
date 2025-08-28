// ...removed duplicate import...

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Filters() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/filters`);
        setCategories(res.data.map(f => f.name));
      } catch (err) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  return (
    <div
      className="w-full max-w-full md:max-w-4xl mx-auto"
      style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
    >
      <div
        className="flex gap-1 whitespace-nowrap"
        style={{ minWidth: 0, overflowX: 'auto', width: '100%' }}
      >
        {loading ? (
          <span className="text-gray-400">Loading filters...</span>
        ) : categories.length === 0 ? (
          <span className="text-gray-400">No filters found</span>
        ) : (
          categories.map((cat) => (
            <button
              key={cat}
              className="px-3 py-1 rounded-full text-xs sm:text-sm md:text-base font-medium transition bg-[#0bb6bc] text-white hover:bg-[#c42152] dark:bg-[#222] dark:text-gray-200 dark:hover:bg-[#333]"
              style={{ minWidth: 'max-content', wordBreak: 'keep-all', fontSize: 'inherit' }}
            >
              {cat}
            </button>
          ))
        )}
      </div>
      <style>{`
        /* Hide scrollbars for filters */
        div::-webkit-scrollbar { display: none !important; }
        div { scrollbar-width: none !important; }
      `}</style>
    </div>
  );
}
