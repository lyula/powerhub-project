import React, { useRef, useEffect, useState } from 'react';
import { useImpression } from '../hooks/useImpression';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
export default function HomeThumbnail({ video, source, userId, sessionId, previewedId, setPreviewedId, id, ...props }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hoveringIcon, setHoveringIcon] = useState(false);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  function getSessionId() {
    const existing = localStorage.getItem('sessionId');
    if (existing) return existing;
    const id = `dev-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('sessionId', id);
    return id;
  }
  async function upsertHistory(videoId) {
    try {
      const sid = getSessionId();
      await fetch(`${API_BASE_URL}/history/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, sessionId: sid })
      });
      window.dispatchEvent(new CustomEvent('watch-history:updated'));
    } catch (_) {}
  }
  function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const impressionRef = useImpression({
    videoId: video._id,
    source,
    userId,
    sessionId,
  });

  const handleMouseEnter = () => {
    setShowPreview(true);
    if (video?._id) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => upsertHistory(video._id), 8000); // count preview as a watch after 8s
    }
  };
  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!hoveringIcon) setShowPreview(false);
    }, 0);
    clearTimeout(timerRef.current);
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '180px', minHeight: '180px', maxHeight: '180px', overflow: 'hidden', borderRadius: '0.75rem', margin: 0, padding: 0, background: 'var(--tw-bg-opacity,1)'}}
      className="rounded-lg p-0 bg-gray-100 dark:bg-[#111111]"
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  onTouchStart={handleMouseEnter}
  onTouchEnd={handleMouseLeave}
    >
      {!showPreview || !(video.previewUrl || video.videoUrl) ? (
        <img
          ref={impressionRef}
          src={video.thumbnailUrl || video.thumbnail || ''}
          alt={video.title}
          className={`object-cover w-full h-full transition-transform ${props.className || ''} rounded-lg`}
          style={{ borderRadius: '0.75rem', margin: 0, padding: 0, display: 'block', width: '100%', height: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
          onError={e => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
          {...props}
        />
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <video
            ref={videoRef}
            src={video.previewUrl || video.videoUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '0.75rem', objectFit: 'cover', zIndex: 2, background: '#000' }}
            onError={e => {
              e.target.style.display = 'none';
              if (impressionRef.current) impressionRef.current.style.display = 'block';
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              zIndex: 3,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={e => {
              e.stopPropagation();
              setIsMuted(m => !m);
              if (videoRef.current) videoRef.current.muted = !isMuted;
            }}
            onMouseEnter={e => { e.stopPropagation(); setHoveringIcon(true); }}
            onMouseLeave={e => { e.stopPropagation(); setHoveringIcon(false); }}
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => { e.stopPropagation(); setHoveringIcon(true); }}
            onTouchEnd={e => { e.stopPropagation(); setHoveringIcon(false); }}
          >
            {isMuted ? <FaVolumeMute color="#fff" size={22} /> : <FaVolumeUp color="#fff" size={22} />}
          </span>
        </div>
      )}
      {video.duration && (
        <span
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 500,
            zIndex: 3,
            pointerEvents: 'none',
            minWidth: '40px',
            textAlign: 'center',
          }}
        >
          {formatDuration(video.duration)}
        </span>
      )}
    </div>
  );
}
