import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import HistoryItemCard from '../components/HistoryItemCard';
import HistorySkeleton from '../components/HistorySkeleton';

export default function WatchHistory() {
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const HISTORY_URL = `${API_BASE_URL}/history`;

  // Helpers
  function relativeDateLabel(dateInput) {
    try {
      const d = new Date(dateInput);
      const now = new Date();
      const diffMs = now - d;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);
      if (diffDay <= 0) {
        if (diffHr > 0) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
        if (diffMin > 0) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
        return 'Just now';
      }
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 7) return `${diffDay} days ago`;
      return d.toLocaleDateString();
    } catch (_) {
      return '';
    }
  }

  function groupByDate(list) {
    const itemsSorted = [...list].sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt));
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    const buckets = {
      'Today': [],
      'Yesterday': [],
      'Last 7 days': [],
      'Earlier': [],
    };

    for (const it of itemsSorted) {
      const d = new Date(it.lastWatchedAt);
      if (d >= startOfToday) buckets['Today'].push(it);
      else if (d >= startOfYesterday && d < startOfToday) buckets['Yesterday'].push(it);
      else if (d >= startOfWeek) buckets['Last 7 days'].push(it);
      else buckets['Earlier'].push(it);
    }

    return Object.entries(buckets).filter(([_, rows]) => rows.length > 0);
  }

  // Load history
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) { setItems([]); return; }
        const res = await fetch(`${HISTORY_URL}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const rows = await res.json();
        if (!cancelled) setItems(rows.map(toClientItem));
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const handler = () => load();
    window.addEventListener('watch-history:updated', handler);
    return () => { cancelled = true; window.removeEventListener('watch-history:updated', handler); };
  }, [token]);

  const grouped = useMemo(() => groupByDate(items), [items]);

  function toClientItem(row) {
    return {
      id: row._id || `${row.videoId}`,
      videoId: row.videoId,
      title: row.title,
      thumbnail: row.thumbnailUrl,
      channel: { name: row.channelName, avatar: '/app-logo.jpg' },
      duration: row.durationSec,
      progress: row.progressPercent,
      completed: row.completed,
      lastWatchedAt: row.lastWatchedAt,
      dateWatchedLabel: relativeDateLabel(row.lastWatchedAt),
    };
  }

  async function handleRemove(idOrVideoId) {
    try {
      setRemoving(idOrVideoId);
      if (!token) return;
      await fetch(`${HISTORY_URL}/${idOrVideoId}` , {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setItems(prev => prev.filter(x => x.videoId !== idOrVideoId && x.id !== idOrVideoId));
    } finally {
      setRemoving(null);
    }
  }

  function handleOpen(item) {
    window.location.href = `/watch/${item.videoId}`;
  }

  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setToast({ type: 'info', message: 'Link copied to clipboard' });
    } catch (_) {
      setToast({ type: 'info', message: 'Link copied to clipboard' });
    }
  }

  async function saveVideoAndGo(videoId) {
    try {
      if (!token) { window.location.href = '/login'; return; }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/videos/${videoId}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Regardless of outcome, take user to saved videos
      window.location.href = '/saved-videos';
    } catch (_) {
      window.location.href = '/saved-videos';
    }
  }

  function addToQueue(videoId) {
    try {
      const key = 'videoQueue';
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.includes(videoId)) arr.push(videoId);
      localStorage.setItem(key, JSON.stringify(arr));
      setToast({ type: 'success', message: 'Added to queue' });
    } catch (_) {}
  }

  function handleAction(key, item) {
    if (key === 'watch-again') return handleOpen(item);
    if (key === 'watch-later') return saveVideoAndGo(item.videoId);
    if (key === 'share') {
      const url = `${window.location.origin}/watch/${item.videoId}`;
      return copyToClipboard(url);
    }
    if (key === 'add-to-queue') return addToQueue(item.videoId);
  }

  async function confirmClear() {
    setConfirmClearOpen(true);
  }

  async function doClearAll() {
    try {
      setClearing(true);
      if (!token) return;
      await fetch(HISTORY_URL, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setItems([]);
      setToast({ type: 'success', message: 'Cleared watch history' });
    } catch (_) {
    } finally {
      setClearing(false);
      setConfirmClearOpen(false);
    }
  }

  // Auto-dismiss toast after 2s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}>
      <div className="fixed top-0 left-0 w-full z-40" style={{ height: '56px' }}>
        <Header onToggleSidebar={handleToggleSidebar} />
      </div>
      <div className="flex flex-row w-full pt-14" style={{ height: '100vh', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent md:block`}>
          <Sidebar collapsed={!sidebarOpen} />
        </div>
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} w-full overflow-y-auto styled-scrollbar min-h-0 h-full`} style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
          <div className="p-2 md:p-4 pb-8">
            <h2 className="text-lg md:text-xl font-bold mb-2 text-[#0bb6bc] dark:text-[#0bb6bc]">Watch History</h2>
            <div className="flex items-center justify-between">
              <div />
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={confirmClear}
                  className="px-3 py-1.5 text-sm rounded-md bg-[#c42152] text-white hover:brightness-110 active:scale-[0.98]"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-4 md:mt-6">
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <HistorySkeleton key={i} />
                  ))}
                </div>
              )}
              {!loading && error && (
                <div className="text-center text-red-500">{error}</div>
              )}
              {!loading && !error && items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-72 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#0bb6bc]/10 flex items-center justify-center border border-[#0bb6bc]/30">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#0bb6bc]">
                      <path d="M3.75 5.25A.75.75 0 0 1 4.5 4.5h15a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-1.155.63l-5.895-3.93a.75.75 0 0 0-.84 0l-5.895 3.93A.75.75 0 0 1 4.5 18.75V5.25Z"/>
                    </svg>
                  </div>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">No watch history yet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Start watching videos and they will appear here.</p>
                </div>
              )}
              {!loading && !error && items.length > 0 && (
                <div className="space-y-6">
                  {grouped.map(([label, rows]) => (
                    <div key={label}>
                      <div className="px-1 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span>{label}</span>
                        <span className="text-[11px] text-gray-400">{rows?.[0]?.lastWatchedAt ? new Date(rows[0].lastWatchedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {rows.map(item => (
                          <HistoryItemCard
                            key={item.id}
                            item={item}
                            variant="list"
                            onRemove={()=>handleRemove(item.videoId)}
                            onOpen={handleOpen}
                            onAction={handleAction}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              )}
            </div>
          </div>
          {/* Tiny toast bottom center */}
          {toast && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
              <div className={`px-3 py-1.5 text-xs rounded-full shadow-md border ${toast.type==='success' ? 'bg-emerald-600/90 border-emerald-500 text-white' : 'bg-gray-800/90 border-gray-700 text-white'}`}>
                {toast.message}
              </div>
            </div>
          )}

          {confirmClearOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => !clearing && setConfirmClearOpen(false)} />
              <div className="relative bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 p-4 w-80">
                <div className="text-sm font-medium mb-3">Clear all watch history?</div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600"
                    onClick={() => setConfirmClearOpen(false)}
                    disabled={clearing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm rounded-md bg-[#c42152] text-white hover:brightness-110 disabled:opacity-60"
                    onClick={doClearAll}
                    disabled={clearing}
                  >
                    {clearing ? 'Clearing…' : 'OK'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
