import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper function to group videos by date (YouTube-style)
function groupVideosByDate(videos) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  
  // Get start of current week (Sunday)
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  // Get start of last week
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  
  // Get start of current month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Get start of last month
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  const buckets = {
    'Today': [],
    'Yesterday': [],
    'Sunday': [],
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': [],
    'Saturday': [],
    'Last week': [],
    'Last month': [],
    'Older': [],
  };

  for (const video of videos) {
    const likedDate = new Date(video.userLike?.likedAt || video.createdAt);
    const dayOfWeek = likedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (likedDate >= startOfToday) {
      buckets['Today'].push(video);
    } else if (likedDate >= startOfYesterday && likedDate < startOfToday) {
      buckets['Yesterday'].push(video);
    } else if (likedDate >= startOfWeek && likedDate < startOfYesterday) {
      // This week (excluding today and yesterday)
      buckets[dayNames[dayOfWeek]].push(video);
    } else if (likedDate >= startOfLastWeek && likedDate < startOfWeek) {
      buckets['Last week'].push(video);
    } else if (likedDate >= startOfLastMonth && likedDate < startOfMonth) {
      buckets['Last month'].push(video);
    } else {
      buckets['Older'].push(video);
    }
  }

  // Return only non-empty buckets in the desired order
  const orderedKeys = ['Today', 'Yesterday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Last week', 'Last month', 'Older'];
  return orderedKeys
    .map(key => [key, buckets[key]])
    .filter(([_, videos]) => videos.length > 0);
}

// Format duration as h:mm:ss or m:ss
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViews(views) {
  if (views >= 1000000) return (views / 1000000).toFixed(views % 1000000 === 0 ? 0 : 1) + 'm';
  if (views >= 1000) return (views / 1000).toFixed(views % 1000 === 0 ? 0 : 1) + 'k';
  return views;
}
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SubscribeButton from '../components/SubscribeButton';

import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';

// Utility function to truncate text by word count
function truncateWords(text, maxWords = 6) {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

export default function LikedVideos() {
  const [previewPaused, setPreviewPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const previewTimeoutRef = React.useRef();
  const videoRef = React.useRef();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Group videos by date
  const groupedVideos = useMemo(() => groupVideosByDate(videos), [videos]);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/videos/liked`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch liked videos');
        const data = await res.json();
  let likedVideos = Array.isArray(data) ? data : (data.videos || []);
        // Sort by userLike.likedAt descending if available
        likedVideos = likedVideos.sort((a, b) => {
          const aLiked = a.userLike?.likedAt ? new Date(a.userLike.likedAt).getTime() : 0;
          const bLiked = b.userLike?.likedAt ? new Date(b.userLike.likedAt).getTime() : 0;
          return bLiked - aLiked;
        });
        setVideos(likedVideos);
      } catch (err) {
        setError(err.message || 'Error fetching liked videos');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchLikedVideos();
  }, [token]);

  // Responsive logic
  const isLargeScreen = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      <div className="fixed top-0 left-0 w-full z-40" style={{ height: '56px' }}>
        <Header onToggleSidebar={handleToggleSidebar} />
      </div>
  <div className="flex flex-row w-full pt-14" style={{ height: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
        <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent md:block`}>
          <Sidebar collapsed={!sidebarOpen} />
        </div>
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} w-full h-full overflow-y-auto`} style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
          <div className="p-2 md:p-4 h-full flex flex-col pb-8">
            <h2 className="text-lg md:text-xl font-bold mb-2 text-[#0bb6bc] dark:text-[#0bb6bc] flex-shrink-0">
              Liked Videos{videos.length > 0 ? ` (${videos.length})` : ''}
            </h2>
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
              {/* Video list (vertical) */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="overflow-y-auto scrollbar-hide flex-1" style={{ maxHeight: 'calc(100vh - 100px)', padding: '10px' }}>
                {loading ? (
                  <div className="flex flex-col gap-2" aria-label="Loading skeleton">
                    {[...Array(6)].map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 bg-white dark:bg-[#222] rounded-lg shadow-md overflow-hidden animate-pulse"
                        style={{ minHeight: '80px' }}
                      >
                        <div className="relative w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-l-lg" />
                        <div className="flex-1 min-w-0 py-2">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1" />
                          <div className="flex gap-2">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : videos.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">No liked videos found.</div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {groupedVideos.map(([dateLabel, dateVideos]) => (
                      <div key={dateLabel} className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {dateLabel}
                          </h3>
                          <span className="text-xs text-gray-400">
                            ({dateVideos.length} video{dateVideos.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {dateVideos.map((video, videoIndex) => {
                            // Calculate global index for selectedIdx tracking
                            const globalIndex = videos.findIndex(v => v._id === video._id);
                            const isHovered = hoveredIdx === globalIndex;
                            return (
                              <div
                                key={video._id}
                                className={`group flex items-center gap-4 bg-white dark:bg-[#222] rounded-lg shadow-md overflow-hidden transition hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer ${isLargeScreen && selectedIdx === globalIndex ? 'ring-2 ring-[#00cccc]' : ''}`}
                                onClick={() => {
                                  if (isLargeScreen) {
                                    setSelectedIdx(globalIndex);
                                    setPreviewPaused(false);
                                    setIsMuted(true);
                                  } else {
                                    navigate(`/watch/${video._id}`);
                                  }
                                }}
                                onMouseEnter={() => setHoveredIdx(globalIndex)}
                                onMouseLeave={() => setHoveredIdx(null)}
                              >
                                <div className="relative w-32 h-20">
                                  {isHovered && video.videoUrl ? (
                                    <video
                                      src={video.videoUrl}
                                      autoPlay
                                      muted
                                      loop
                                      poster={video.thumbnailUrl}
                                      className="w-32 h-20 object-cover rounded-l-lg transition-transform duration-700 scale-110 z-10"
                                      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
                                    />
                                  ) : (
                                    <img
                                      src={video.thumbnailUrl || 'https://via.placeholder.com/400x225?text=Video+Thumbnail'}
                                      alt={video.title || 'Video Thumbnail'}
                                      className="w-32 h-20 object-cover rounded-l-lg transition-transform duration-700 group-hover:scale-110"
                                    />
                                  )}
                                  {video.duration !== undefined && (
                                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                      {formatDuration(video.duration)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 py-3">
                                  <h3 
                                    className="text-base font-semibold text-gray-900 dark:text-white mb-1 overflow-hidden" 
                                    title={video.title || 'Untitled Video'}
                                    style={{ 
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      lineHeight: '1.3em',
                                      maxHeight: '2.6em',
                                      paddingTop: '2px',
                                      paddingBottom: '2px'
                                    }}
                                  >
                                    {truncateWords(video.title || 'Untitled Video', 6)}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate" title={video.channel?.name}>{video.channel?.name || 'Unknown Channel'}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{formatViews(video.viewCount || 0)} views</span>
                                    <span>•</span>
                                    <span>{timeAgo(video.userLike?.likedAt || video.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
              {/* Highlighted video player (large screens only) */}
              {isLargeScreen && videos[selectedIdx] && (
                <div className="w-full lg:w-[500px] xl:w-[600px] flex flex-col items-start justify-start text-left flex-shrink-0">
                  <div className="w-full aspect-video bg-black rounded-lg shadow-lg overflow-hidden mb-4 relative sticky top-0">
                    {previewPaused ? (
                      <div className="w-full h-full relative">
                        <img
                          src={videos[selectedIdx].thumbnailUrl || 'https://via.placeholder.com/400x225?text=Video+Thumbnail'}
                          alt={videos[selectedIdx].title || 'Video Thumbnail'}
                          className="w-full h-full object-contain"
                        />
                        <button
                          className="absolute bottom-4 left-4 bg-[#0bb6bc] text-white rounded-full p-3 shadow-lg hover:bg-[#099ca3] focus:outline-none z-10 flex items-center justify-center"
                          style={{ fontSize: '2rem', width: '48px', height: '48px' }}
                          onClick={() => {
                            setPreviewPaused(false);
                            setIsMuted(false);
                            setTimeout(() => {
                              if (videoRef.current) {
                                videoRef.current.play();
                              }
                            }, 0);
                          }}
                          aria-label="Play video"
                        >
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="14" cy="14" r="14" fill="none" />
                            <polygon points="10,8 22,14 10,20" fill="white" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        src={videos[selectedIdx].videoUrl}
                        controls
                        controlsList="nodownload"
                        poster={videos[selectedIdx].thumbnailUrl}
                        className="w-full h-full object-contain"
                        autoPlay
                        muted={isMuted}
                        onPlay={() => {
                          setPreviewPaused(false);
                          if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
                          if (videoRef.current && isMuted) {
                            previewTimeoutRef.current = setTimeout(() => {
                              if (videoRef.current && isMuted) {
                                videoRef.current.pause();
                                setPreviewPaused(true);
                              }
                            }, 5000);
                          }
                        }}
                        onVolumeChange={() => {
                          if (videoRef.current && !videoRef.current.muted) {
                            setIsMuted(false);
                            if (previewTimeoutRef.current) {
                              clearTimeout(previewTimeoutRef.current);
                              previewTimeoutRef.current = null;
                            }
                          } else {
                            setIsMuted(true);
                          }
                        }}
                        onPause={() => {
                          if (previewTimeoutRef.current) {
                            clearTimeout(previewTimeoutRef.current);
                            previewTimeoutRef.current = null;
                          }
                          setPreviewPaused(true);
                        }}
                      />
                    )}
                  </div>
                  <h3 
                    className="text-lg font-bold text-gray-900 dark:text-white mb-1 text-left overflow-hidden" 
                    title={videos[selectedIdx].title}
                    style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.4em',
                      maxHeight: '2.8em',
                      paddingTop: '4px',
                      paddingBottom: '4px'
                    }}
                  >
                    {truncateWords(videos[selectedIdx].title, 6)}
                  </h3>
                  <div className="flex items-center gap-3 mb-2 justify-start text-left">
                    {videos[selectedIdx].channel?.avatar && (
                      <img
                        src={videos[selectedIdx].channel.avatar}
                        alt={videos[selectedIdx].channel.name || 'Channel Avatar'}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={videos[selectedIdx].channel?.name}>{videos[selectedIdx].channel?.name || 'Unknown Channel'}</span>
                    <span className="text-xs text-gray-400">{formatViews(videos[selectedIdx].viewCount || 0)} views</span>
                    <SubscribeButton channelId={videos[selectedIdx].channel?._id} />
                  </div>
                  {/* Limit description to two lines, add a 'Read more' link, and make the whole description clickable */}
{videos[selectedIdx].description && (
  <div
    className="text-xs text-gray-700 dark:text-gray-300 mt-2 max-h-[2.8em] overflow-hidden cursor-pointer flex items-center"
    style={{
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      lineHeight: '1.4em',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal',
    }}
    onClick={() => navigate(`/watch/${videos[selectedIdx]._id}`)}
    title="Click to view full description"
  >
    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {videos[selectedIdx].description}
    </span>
    <span className="ml-2 text-[#e53e3e] underline font-bold" style={{ flexShrink: 0 }}>
      Read more
    </span>
  </div>
)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
