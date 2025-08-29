import React from 'react';
import { useImpression } from '../hooks/useImpression';

export default function HomeThumbnail({ video, source, userId, sessionId, ...props }) {
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '180px', minHeight: '180px', maxHeight: '180px', overflow: 'hidden', borderRadius: '0.5rem' }}>
      <img
        ref={impressionRef}
        src={video.thumbnailUrl || video.thumbnail || ''}
        alt={video.title}
        className={`object-cover w-full h-full rounded-lg transition-transform ${props.className || ''}`}
        style={{ borderRadius: '0.5rem', margin: 0, padding: 0, display: 'block', width: '100%', height: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
        onError={e => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
        {...props}
      />
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
            zIndex: 2,
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
