import React from 'react';
import { useImpression } from '../hooks/useImpression';

export default function SimilarContentThumbnail({ video, source, userId, sessionId, previewedId, setPreviewedId, id, ...props }) {
  // Helper to format duration in mm:ss
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
      style={{ position: 'relative', width: '8rem', height: '5rem', minHeight: '5rem' }}
      onMouseEnter={() => setPreviewedId(id)}
      onMouseLeave={() => setPreviewedId(null)}
      onTouchStart={() => setPreviewedId(id)}
      onTouchEnd={() => setPreviewedId(null)}
    >
      {previewedId !== id && (
        <img
          ref={impressionRef}
          src={video.thumbnailUrl}
          alt={video.title}
          className={`object-cover w-32 h-20 transition-transform ${props.className || ''}`}
          style={{ margin: 0, padding: 0, display: 'block', width: '8rem', height: '5rem', aspectRatio: '16/9' }}
          {...props}
        />
      )}
      {previewedId === id && video.previewUrl && (
        <video
          src={video.previewUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '8rem', height: '5rem', borderRadius: '0.75rem', objectFit: 'cover', zIndex: 2, background: '#000' }}
        />
      )}
  {video.duration && (
        <span
          style={{
            position: 'absolute',
            right: 6,
            bottom: 6,
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 500,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {formatDuration(video.duration)}
        </span>
      )}
    </div>
  );
}
