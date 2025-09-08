import React, { useState, useRef, useEffect } from 'react';
import { useImpression } from '../hooks/useImpression';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

export default function SimilarContentThumbnail({ video, source, userId, sessionId, previewedId, setPreviewedId, id, ...props }) {
  const [localShowPreview, setLocalShowPreview] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hoveringIcon, setHoveringIcon] = useState(false);
  const videoRef = useRef(null);

  // Use external preview state if provided, otherwise use local state
  const showPreview = previewedId !== undefined ? previewedId === id : localShowPreview;
  const setShowPreview = previewedId !== undefined ? 
    (show) => show ? setPreviewedId?.(id) : setPreviewedId?.(null) :
    setLocalShowPreview;

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

  const handleMouseEnter = () => {
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!hoveringIcon) setShowPreview(false);
    }, 0);
  };

  // Effect to handle video play/pause based on showPreview state
  useEffect(() => {
    if (videoRef.current) {
      if (showPreview && (video.previewUrl || video.videoUrl)) {
        videoRef.current.play().catch(e => console.log('Video play failed:', e));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // Reset to beginning
      }
    }
  }, [showPreview, video.previewUrl, video.videoUrl]);

  // Cleanup effect to pause video when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  return (
    <div
      style={{ position: 'relative', width: '8rem', height: '5rem', minHeight: '5rem', overflow: 'hidden', borderRadius: '0.75rem 0 0 0' }}
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
          className={`object-cover w-32 h-20 transition-transform ${props.className || ''}`}
          style={{ margin: 0, padding: 0, display: 'block', width: '8rem', height: '5rem', aspectRatio: '16/9', borderRadius: '0.75rem 0 0 0', objectFit: 'cover' }}
          onError={e => { e.target.onerror = null; e.target.src = '/vite.svg'; }}
          {...props}
        />
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <video
            ref={videoRef}
            src={video.previewUrl || video.videoUrl}
            muted={isMuted}
            loop
            playsInline
            style={{ position: 'absolute', top: 0, left: 0, width: '8rem', height: '5rem', borderRadius: '0.75rem 0 0 0', objectFit: 'cover', zIndex: 2, background: '#000' }}
            onError={e => {
              e.target.style.display = 'none';
              if (impressionRef.current) impressionRef.current.style.display = 'block';
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: 6,
              left: 6,
              zIndex: 3,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '50%',
              padding: '4px',
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
            {isMuted ? <FaVolumeMute color="#fff" size={16} /> : <FaVolumeUp color="#fff" size={16} />}
          </span>
        </div>
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
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          {formatDuration(video.duration)}
        </span>
      )}
    </div>
  );
}
