import React, { useState } from 'react';
import { FiPlay, FiClock, FiShare2, FiMoreVertical, FiX } from 'react-icons/fi';

function formatViews(num) {
  if (num == null) return '';
  if (num < 1000) return `${num} views`;
  if (num < 1_000_000) return `${(num / 1000).toFixed(1)}K views`;
  if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M views`;
  return `${(num / 1_000_000_000).toFixed(1)}B views`;
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HistoryItemCard({ item, onRemove, onOpen, onAction, variant = 'list', hideMenu = false, showRemoveAlways = false, removeTooltip = 'Remove' }) {
  const transparentGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const [menuOpen, setMenuOpen] = useState(false);
  const [pressed, setPressed] = useState(null);
  const isPressed = (key) => pressed === key;
  const handleAction = async (key) => {
    setPressed(key);
    try {
      const maybe = onAction?.(key, item);
      if (maybe && typeof maybe.then === 'function') {
        await maybe;
      } else {
        await new Promise(r => setTimeout(r, 300));
      }
    } finally {
      setPressed(null);
    }
  };
  const isList = variant === 'list';
  return (
    <div className={`group relative bg-white dark:bg-[#181818] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#0bb6bc]/60 transition-all shadow-sm hover:shadow-md ${isList ? 'p-2' : ''}`}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(item); } }}
        onClick={() => onOpen?.(item)}
        className={`w-full text-left ${isList ? 'flex gap-3 items-start' : ''}`}
      >
        {/* Thumbnail */}
        <div className={`${isList ? 'relative w-40 sm:w-56 md:w-64 lg:w-72 shrink-0' : 'relative w-full'} aspect-video overflow-hidden rounded-lg`}>
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" onError={(e)=>{e.currentTarget.src=transparentGif}} />
          <span className="absolute right-2 bottom-2 text-xs font-semibold bg-black/70 text-white px-2 py-0.5 rounded">
            {formatDuration(item.duration)}
          </span>
        </div>
        {/* Meta */}
        <div className={`${isList ? 'flex-1 p-1' : 'p-3'} flex gap-3`}>
          <img src={item.channel.avatar} alt={item.channel.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700" onError={(e)=>{e.currentTarget.src=transparentGif}} />
          <div className="min-w-0">
            <h3 className={`font-semibold text-gray-900 dark:text-white leading-tight ${isList ? 'text-[15px] line-clamp-2' : 'text-[15px] line-clamp-2'}`}>
              {item.title}
            </h3>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-2 gap-y-0.5">
              <span className="hover:text-[#0bb6bc] cursor-pointer">{item.channel.name}</span>
              <span>•</span>
              <span>{formatViews(item.views)}</span>
              <span>•</span>
              <span>{item.dateWatchedLabel}</span>
            </div>
            {/* Quick actions */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`px-3 py-1.5 text-[12px] rounded-full bg-[#0bb6bc] text-white shadow-sm hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0bb6bc] transition ${isPressed('watch-again') ? 'opacity-70 pointer-events-none' : ''}`}
                onClick={(e)=>{ e.stopPropagation(); handleAction('watch-again'); }}
                aria-label="Watch again"
                aria-busy={isPressed('watch-again')}
                disabled={isPressed('watch-again')}
              >
                <span className="inline-flex items-center gap-1.5">
                  {isPressed('watch-again') ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  ) : <FiPlay />}
                  Watch again
                </span>
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-[12px] rounded-full bg-[#c42152] text-white shadow-sm hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c42152] transition ${isPressed('watch-later') ? 'opacity-70 pointer-events-none' : ''}`}
                onClick={(e)=>{ e.stopPropagation(); handleAction('watch-later'); }}
                aria-label="Watch later"
                aria-busy={isPressed('watch-later')}
                disabled={isPressed('watch-later')}
              >
                <span className="inline-flex items-center gap-1.5">
                  {isPressed('watch-later') ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  ) : <FiClock />}
                  Watch later
                </span>
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-[12px] rounded-full border border-[#0bb6bc] text-[#0bb6bc] bg-[#0bb6bc]/10 hover:bg-[#0bb6bc]/20 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0bb6bc] transition ${isPressed('share') ? 'opacity-70 pointer-events-none' : ''}`}
                onClick={(e)=>{ e.stopPropagation(); handleAction('share'); }}
                aria-label="Share"
                aria-busy={isPressed('share')}
                disabled={isPressed('share')}
              >
                <span className="inline-flex items-center gap-1.5">
                  {isPressed('share') ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                  ) : <FiShare2 />}
                  Share
                </span>
              </button>
            </div>
            {/* Progress */}
            <div className="mt-2">
              <div className="h-1.5 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div className="h-full bg-[#0bb6bc]" style={{ width: `${Math.max(0, Math.min(100, item.progress || 0))}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{Math.round(item.progress || 0)}% watched</div>
            </div>
          </div>
        </div>
      </div>
      {/* Corner actions */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <div className={`relative group/remove`}>
          <button
            className={`${showRemoveAlways ? 'opacity-100' : 'opacity-100 md:opacity-0 group-hover:opacity-100'} transition bg-[#c42152] text-white hover:bg-[#0bb6bc] rounded-full p-1 text-xs shadow`}
            aria-label="Remove"
            title={removeTooltip}
            onClick={(e) => { e.stopPropagation(); onRemove?.(item.id); }}
          >
            <FiX className="w-4 h-4" />
          </button>
          <span className={`${showRemoveAlways ? 'opacity-0' : ''} hidden md:block pointer-events-none absolute right-0 mt-1 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] whitespace-nowrap transition-opacity duration-150 opacity-0 group-hover/remove:opacity-100`}>{removeTooltip}</span>
        </div>
        {!hideMenu && (
          <div className="relative">
            <button
              className="opacity-100 md:opacity-0 group-hover:opacity-100 transition bg-white/95 dark:bg-[#0f172a]/95 border border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-200 hover:text-white hover:bg-gray-700 rounded-full p-1 text-xs shadow"
              aria-label="More actions"
              onClick={(e)=>{ e.stopPropagation(); setMenuOpen(m => !m); }}
            >
              <FiMoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 dark:bg-[#0f172a] dark:text-gray-100 border border-gray-200 dark:border-[#334155] rounded-md shadow-xl z-10">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#1e293b]" onClick={(e)=>{e.stopPropagation(); setMenuOpen(false); onAction?.('add-to-queue', item);}}>Add to queue</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#1e293b]" onClick={(e)=>{e.stopPropagation(); setMenuOpen(false); onAction?.('watch-later', item);}}>Save to Watch Later</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#1e293b]" onClick={(e)=>{e.stopPropagation(); setMenuOpen(false); onAction?.('share', item);}}>Share</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


