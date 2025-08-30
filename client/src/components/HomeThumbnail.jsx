import React, { useState } from 'react';
import { useImpression } from '../hooks/useImpression';

export default function HomeThumbnail({ video, source, userId, sessionId, ...props }) {
  const [showPreview, setShowPreview] = useState(false);
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
    <div
      style={{ position: 'relative', width: '100%', height: '180px', minHeight: '180px', maxHeight: '180px', overflow: 'hidden', borderRadius: '0.75rem', margin: 0, padding: 0, background: 'var(--tw-bg-opacity,1)'}}
      className="rounded-lg p-0 bg-gray-100 dark:bg-[#111111]"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      onTouchStart={() => setShowPreview(true)}
      onTouchEnd={() => setShowPreview(false)}
    >
      {!showPreview && (
        <img
          ref={impressionRef}
          src={video.thumbnailUrl || video.thumbnail || ''}
          alt={video.title}
          className={`object-cover w-full h-full transition-transform ${props.className || ''} rounded-lg`}
          style={{ borderRadius: '0.75rem', margin: 0, padding: 0, display: 'block', width: '100%', height: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
          onError={e => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
          {...props}
        />
      )}
      {showPreview && video.previewUrl && (
        <video
          src={video.previewUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '0.75rem', objectFit: 'cover', zIndex: 2 }}
        />
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
