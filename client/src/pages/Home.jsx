import React, { useState, useEffect, useRef } from 'react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import PostCard from '../components/PostCard';
import postCardData from '../components/PostCardData';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StudentUtility from '../components/StudentUtility';
import BottomTabs from '../components/BottomTabs';
import Filters from '../components/Filters';
// import removed: fetchThumbnails
import HomeThumbnail from '../components/HomeThumbnail';

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

// ...existing code...

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [videoDurations, setVideoDurations] = useState([]);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const navigate = useNavigate();
  // Impression refs for each video
  const location = useLocation();
  // Fix: Declare videoRefs for video element refs
  const videoRefs = useRef([]);

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
    const [initialPreview, setInitialPreview] = useState(true);

  // Load videos from API or fallback to sample
  useEffect(() => {
    async function loadVideos() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/videos`);
        if (res.ok) {
          const dbVideos = await res.json();
          if (dbVideos && dbVideos.length > 0) {
            // Map database videos to the expected format if needed
            const formattedVideos = dbVideos.map(v => {
              let postedAgo = '';
              if (v.createdAt) {
                const posted = new Date(v.createdAt);
                const now = new Date();
                const diff = Math.floor((now - posted) / 1000);
                if (diff < 60) postedAgo = `${diff}s ago`;
                else if (diff < 3600) postedAgo = `${Math.floor(diff/60)}m ago`;
                else if (diff < 86400) postedAgo = `${Math.floor(diff/3600)}h ago`;
                else if (diff < 2592000) postedAgo = `${Math.floor(diff/86400)}d ago`;
                else postedAgo = posted.toLocaleDateString();
              }
              return {
                videoUrl: v.videoUrl,
                thumbnailUrl: v.thumbnailUrl || v.thumbnail || '/vite.svg',
                title: v.title,
                author: v.channel?.name || v.author || 'Unknown',
                profile: v.channel?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
                views: v.viewCount || 0,
                posted: postedAgo,
                duration: typeof v.duration === 'number' ? v.duration : 0,
                _id: v._id,
                channelId: v.channel?._id || v.channel, // ensure channelId is present
                createdAt: v.createdAt ? new Date(v.createdAt) : null
              };
            });
            // Sort by createdAt descending (latest first)
            formattedVideos.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
            setVideos(formattedVideos);
            setLoading(false);
            return;
          }
        }
        // Fallback to sample videos if no real videos
        const sampleVideos = [
          // ...existing code...
        ];
    // Load videos from API only
        setVideos(sampleVideos);
      } catch (err) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  // Extract durations from video elements after metadata loads
  // Use API duration directly for display
  useEffect(() => {
    if (!videos || videos.length === 0) return;
    console.log('Fetched videos:', videos);
  setVideoDurations(videos.map(v => formatDuration(Number(v.duration))));
  }, [videos]);

  // Initial preview for first video for 10 seconds
  useEffect(() => {
    if (videos.length > 0) {
      setHoveredIdx(0);
      setInitialPreview(true);
      const timer = setTimeout(() => {
        setHoveredIdx(-1);
        setInitialPreview(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Only show database videos, never demo videos
  let displayVideos = videos;

  return (
    <React.Fragment>
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <span className="font-bold">Channel created successfully!</span>
          <button
            className="ml-4 px-3 py-1 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-100 transition"
            onClick={() => document.querySelector('[aria-label="Create"]').click()}
          >
            Proceed to Create Content
          </button>
          <button
            className="ml-2 px-2 py-1 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition"
            onClick={() => setShowSuccess(false)}
          >
            ×
          </button>
        </div>
      )}
      <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}>
        <HeaderFixed onToggleSidebar={handleToggleSidebar} showCreateModal={showCreateModal} setShowCreateModal={setShowCreateModal} />
        <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 44px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <SidebarFixed sidebarOpen={sidebarOpen} />
          {!sidebarOpen && (
            <div className="md:ml-20">
              <StudentUtility />
            </div>
          )}
          <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
            <div className="p-2 md:p-4">
              <h2 className="text-lg md:text-xl font-bold mb-2 text-[#0bb6bc] dark:text-[#0bb6bc]">Welcome to PowerHub</h2>
              <div className="mt-4 md:mt-6">
                <Filters />
              </div>
            </div>
            <main className="flex-1 p-1 sm:p-2 pb-0 overflow-y-auto w-full" style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-6 w-full"
                style={{ margin: 0, maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}
              >
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 dark:bg-[#111111] shadow-md overflow-hidden flex flex-col min-w-0 w-full animate-pulse"
                      style={{ maxWidth: '100%', minWidth: 0 }}
                    >
                      <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700" style={{ borderRadius: 0, margin: 0, padding: 0 }} />
                      <div className="block sm:hidden" style={{ height: '12px' }} />
                      <div className="p-0 sm:p-3 flex-1 flex flex-col justify-between pb-1">
                        <div className="flex items-start gap-2 sm:gap-3 mb-1">
                          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <div className="h-4 sm:h-5 bg-gray-300 dark:bg-gray-700 rounded w-32 sm:w-40 mb-1" />
                            <div className="hidden md:block h-3 bg-gray-300 dark:bg-gray-700 rounded w-20" />
                          </div>
                        </div>
                        <div
                          className="flex flex-row items-center gap-1 md:gap-3 pl-7 sm:pl-14 text-xs text-gray-600 dark:text-gray-400 truncate"
                          style={{ marginBottom: '0' }}

                        >
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-10" />
                          <span>•</span>
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-10" />
                          <span>•</span>
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-10" />
                        </div>
                        <div style={{ height: '0.7em' }} />
                      </div>
                    </div>
                  ))
                ) : (
                  displayVideos.map((video, i) => {
                  const showDuration = videoDurations[i];
                    // Add extra margin-bottom to last video on mobile
                    const isLast = i === displayVideos.length - 1;
                    return (
                      <div
                        key={video._id || i}
                        className={`relative group cursor-pointer bg-gray-100 dark:bg-[#111111] flex flex-col min-w-0 w-full rounded-lg${isLast ? ' mb-16 sm:mb-0' : ''}`}
                        style={{ minHeight: '180px', paddingBottom: '0.5rem' }}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(-1)}
                        onClick={() => navigate(`/watch/${video._id || i + 1}`)}
                      >
                        <div className="relative" style={{ width: '100%', height: '180px' }}>
                          {(hoveredIdx === i || (initialPreview && i === 0)) ? (
                            <video
                              src={video.videoUrl}
                              autoPlay
                              muted={!video.unmuted}
                              loop
                              playsInline
                              className="w-full h-[180px] object-cover rounded-lg"
                              style={{ borderRadius: '0.75rem' }}
                              onClick={e => e.preventDefault()}
                              ref={el => {
                                if (el) {
                                  el.muted = !video.unmuted;
                                }
                              }}
                            />
                          ) : (
                            <HomeThumbnail
                              video={video}
                              source="homepage"
                              userId={video.userId}
                              sessionId={window.sessionStorage.getItem('sessionId') || undefined}
                              className="w-full h-[180px] object-cover rounded-lg hover:scale-105 transition-transform"
                              style={{ borderRadius: '0.75rem' }}
                            />
                          )}
                          {video.duration && (
                            <span
                              className="absolute right-2 bottom-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded"
                              style={{ zIndex: 2, pointerEvents: 'none' }}
                            >
                              {formatDuration(video.duration)}
                            </span>
                          )}
                        </div>
                        <div className="block sm:hidden" style={{ height: '12px' }} />
                        <div className="p-0 sm:p-3 flex-1 flex flex-col justify-between pb-1">
                          <div className="flex items-start gap-2 sm:gap-3 mb-0">
                            <button
                              type="button"
                              onClick={() => navigate(`/channel/${video.channelId}`)}
                              className="p-0 m-0 bg-transparent border-none"
                              style={{ lineHeight: 0 }}
                            >
                              <img src={video.profile} alt={video.author} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" style={{ width: '40px', height: '40px', objectFit: 'cover', aspectRatio: '1/1', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px' }} />
                            </button>
                            <div className="flex flex-col min-w-0">
                              <h3
                                className="font-bold text-xs sm:text-base md:text-lg text-black dark:text-white line-clamp-2"
                                title={video.title}
                                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', minHeight: '2.4em', marginBottom: '2px' }}
                              >
                                {video.title}
                              </h3>
                              <div className="flex flex-col gap-0">
                                {/* On mobile, channel name and views are on the same line. On PC, channel name is above views. */}
                                <div className="flex flex-row items-center gap-1 text-xs text-gray-600 dark:text-gray-400 truncate sm:hidden">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/channel/${video.channelId}`)}
                                    className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate hover:underline bg-transparent border-none p-0 m-0"
                                    style={{ textAlign: 'left' }}
                                  >
                                    {video.author}
                                  </button>
                                  <span>•</span>
                                  <span>{formatViews(video.views)} views</span>
                                  <span>•</span>
                                  <span>{video.posted}</span>
                                </div>
                                <div className="hidden sm:flex flex-col gap-0 text-xs text-gray-600 dark:text-gray-400 truncate">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/channel/${video.channelId}`)}
                                    className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate hover:underline bg-transparent border-none p-0 m-0"
                                    style={{ textAlign: 'left' }}
                                  >
                                    {video.author}
                                  </button>
                                  <div className="flex flex-row items-center gap-3">
                                    <span>{formatViews(video.views)} views</span>
                                    <span>•</span>
                                    <span>{video.posted}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </main>
          </div>
        </div>
        <BottomTabs />
      </div>
    </React.Fragment>
  );
}

function HeaderFixed({ onToggleSidebar, showCreateModal, setShowCreateModal }) {
  return (
    <div className="fixed top-0 left-0 w-full z-40" style={{ height: '44px' }}>
      <Header onToggleSidebar={onToggleSidebar} showCreateModal={showCreateModal} setShowCreateModal={setShowCreateModal} />
    </div>
  );
}

function SidebarFixed({ sidebarOpen }) {
  // If sidebarOpen is false, collapse to icons-only (width 20, hide labels)
  return (
    <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent md:block`}>
      <Sidebar collapsed={!sidebarOpen} />
    </div>
  );
}