import React from 'react';
import { useImpression } from '../hooks/useImpression';

export default function ChannelProfileThumbnail({ video, source, userId, sessionId, ...props }) {
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
    <div style={{ position: 'relative', width: '100%', height: '180px' }}>
      <img
        ref={impressionRef}
        src={video.thumbnailUrl}
        alt={video.title}
        className={`object-cover w-full h-[200px] rounded-lg transition-transform ${props.className || ''}`}
        style={{ borderRadius: '0.5rem', margin: 0, padding: 0, display: 'block', aspectRatio: '16/9' }}
        {...props}
      />
      {video.duration && (
        <span
          className="absolute right-2 bottom-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded"
          style={{ zIndex: 2, pointerEvents: 'none' }}
        >
          {formatDuration(video.duration)}
        </span>
      )}
    </div>
  );
}
