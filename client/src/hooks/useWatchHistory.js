import { useEffect, useRef } from 'react';

// Reusable hook to manage watch history upsert, progress reporting, and resume
// Usage:
// const { upsert, start, stop, sendOnce, resumeFromHistory, getSessionId } = useWatchHistory({ videoId, token });
export default function useWatchHistory({ videoId, token }) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const progressTimerRef = useRef(null);
  const upsertedRef = useRef(false);

  function getSessionId() {
    const existing = localStorage.getItem('sessionId');
    if (existing) return existing;
    const id = `dev-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('sessionId', id);
    return id;
  }

  async function upsert() {
    if (!videoId) return;
    try {
      const sessionId = getSessionId();
      const res = await fetch(`${API_BASE_URL}/history/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ videoId, sessionId })
      });
      // If the API base URL is wrong, avoid throwing to keep UX smooth
      if (!res.ok) {
        // Surface in dev console but continue
        try { const j = await res.json(); console.debug('history upsert failed', j); } catch (_) {}
      }
      upsertedRef.current = true;
      window.dispatchEvent(new CustomEvent('watch-history:updated'));
    } catch (_) {}
  }

  async function sendOnce(videoRef) {
    if (!videoId || !videoRef?.current) return;
    try {
      const el = videoRef.current;
      const sessionId = getSessionId();
      const lastPositionSec = Math.max(0, Math.floor(el.currentTime || 0));
      const durationSec = Math.max(0, Math.floor(el.duration || 0));
      await fetch(`${API_BASE_URL}/history/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ videoId, lastPositionSec, durationSec, sessionId })
      });
      window.dispatchEvent(new CustomEvent('watch-history:updated'));
    } catch (_) {}
  }

  function start(videoRef) {
    if (progressTimerRef.current || !videoRef?.current) return;
    progressTimerRef.current = setInterval(() => sendOnce(videoRef), 5000);
  }

  function stop() {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }

  async function fetchLastPosition() {
    try {
      const sessionId = getSessionId();
      const res = await fetch(`${API_BASE_URL}/history?sessionId=${encodeURIComponent(sessionId)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      });
      if (!res.ok) return 0;
      const rows = await res.json();
      const row = Array.isArray(rows) ? rows.find(r => String(r.videoId) === String(videoId)) : null;
      return Math.max(0, Math.floor(row?.lastPositionSec || 0));
    } catch (_) {
      return 0;
    }
  }

  async function resumeFromHistory(videoRef, overrideSeconds) {
    if (!videoRef?.current) return;
    try {
      const el = videoRef.current;
      const toSec = typeof overrideSeconds === 'number' && overrideSeconds > 0
        ? Math.floor(overrideSeconds)
        : await fetchLastPosition();
      if (toSec > 0 && Number.isFinite(el.duration)) {
        // If metadata not loaded yet, wait for it
        if (!el.duration || isNaN(el.duration) || el.duration === Infinity) {
          const onLoaded = () => {
            try { el.currentTime = Math.min(toSec, Math.floor(el.duration || toSec)); } catch (_) {}
            el.removeEventListener('loadedmetadata', onLoaded);
          };
          el.addEventListener('loadedmetadata', onLoaded);
        } else {
          try { el.currentTime = Math.min(toSec, Math.floor(el.duration || toSec)); } catch (_) {}
        }
      }
    } catch (_) {}
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, []);

  return { getSessionId, upsert, start, stop, sendOnce, resumeFromHistory };
}


