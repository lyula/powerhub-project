import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Filters({ selectedFilter, onFilterChange, loading: filterLoading }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/filters`);
        // Sort by createdAt descending (newest first)
        const sorted = [...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCategories(sorted.map(f => f.name));
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
      className="w-full max-w-full md:max-w-4xl mx-auto pt-4 sm:pt-0"
      style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
    >
      <div
        className="flex gap-1 whitespace-nowrap"
        style={{ minWidth: 0, overflowX: 'auto', width: '100%' }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="px-3 py-1 rounded-full text-xs sm:text-sm md:text-base font-medium bg-gray-200 dark:bg-gray-700 animate-pulse"
              style={{ minWidth: 'max-content', wordBreak: 'keep-all', fontSize: 'inherit' }}
            >
              &nbsp;
            </div>
          ))
        ) : categories.length === 0 ? (
          <span className="text-gray-400">No filters found</span>
        ) : (
          <>
            {/* All/Clear filter button */}
            <button
              onClick={() => onFilterChange('')}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm md:text-base font-medium transition ${
                selectedFilter === '' 
                  ? 'bg-[#c42152] text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              style={{ minWidth: 'max-content', wordBreak: 'keep-all', fontSize: 'inherit' }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterChange(cat)}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm md:text-base font-medium transition ${
                  selectedFilter === cat 
                    ? 'bg-[#c42152] text-white' 
                    : 'bg-[#0bb6bc] text-white hover:bg-[#0aa3a8] dark:bg-[#222] dark:text-gray-200 dark:hover:bg-[#333]'
                }`}
                style={{ minWidth: 'max-content', wordBreak: 'keep-all', fontSize: 'inherit' }}
                disabled={filterLoading}
              >
                {cat}
              </button>
            ))}
          </>
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
