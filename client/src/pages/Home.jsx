import React, { useState, useEffect, useRef } from 'react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import SwipeablePosts from '../components/SwipeablePosts';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StudentUtility from '../components/StudentUtility';
import BottomTabs from '../components/BottomTabs';
import Filters from '../components/Filters';
// import removed: fetchThumbnails
import HomeThumbnail from '../components/HomeThumbnail';
import { searchAndSortContent } from '../utils/searchUtility';
import { filterAndSortContent } from '../utils/filterUtility';

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
  const [allVideos, setAllVideos] = useState([]); // Store original videos for search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [filterLoading, setFilterLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [videoDurations, setVideoDurations] = useState([]);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [previewedId, setPreviewedId] = useState(null);
  const navigate = useNavigate();
  // Impression refs for each video
  const location = useLocation();
  // Fix: Declare videoRefs for video element refs
  const videoRefs = useRef([]);

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
  const [initialPreview, setInitialPreview] = useState(true);

  // Handle search functionality with debouncing
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    // Clear filter when searching
    if (term !== '') {
      setSelectedFilter('');
    }
  };

  // Handle filter selection
  const handleFilterChange = (filterName) => {
    setSelectedFilter(filterName);
    // Clear search when filtering
    setSearchTerm('');
  };

  // Debounced search effect
  useEffect(() => {
    if (searchTerm !== '') {
      setSearchLoading(true);
    }
    
    const timeoutId = setTimeout(() => {
      const sortedVideos = searchAndSortContent(allVideos, searchTerm);
      setVideos(sortedVideos);
      setSearchLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, allVideos]);

  // Filter effect
  useEffect(() => {
    if (selectedFilter !== '') {
      setFilterLoading(true);
    }
    
    const timeoutId = setTimeout(() => {
      const filteredVideos = filterAndSortContent(allVideos, selectedFilter);
      setVideos(filteredVideos);
      setFilterLoading(false);
    }, 100); // Shorter delay for filters since no typing

    return () => clearTimeout(timeoutId);
  }, [selectedFilter, allVideos]);

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
                description: v.description || '',
                hashtags: v.hashtags || [],
                author: v.channel?.name || v.author || 'Unknown',
                profile: v.channel?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
                views: v.viewCount || 0,
                comments: v.comments || [],
                likes: v.likes || [],
                posted: postedAgo,
                duration: typeof v.duration === 'number' ? v.duration : 0,
                _id: v._id,
                channelId: v.channel?._id || v.channel, // ensure channelId is present
                channel: v.channel || {},
                createdAt: v.createdAt ? new Date(v.createdAt) : null
              };
            });
            // Sort by createdAt descending (latest first)
            const sortedVideos = searchAndSortContent(formattedVideos, '');
            setAllVideos(formattedVideos); // Store original videos
            setVideos(sortedVideos);
            setLoading(false);
            return;
          }
        }
        // Fallback to sample videos if no real videos
        const sampleVideos = [
          // ...existing code...
        ];
    // Load videos from API only
        setAllVideos(sampleVideos);
        setVideos(sampleVideos);
      } catch (err) {
        setAllVideos([]);
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
        <HeaderFixed 
          onToggleSidebar={handleToggleSidebar} 
          showCreateModal={showCreateModal} 
          setShowCreateModal={setShowCreateModal}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
  <div className="flex flex-row w-full" style={{ height: '100vh', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <SidebarFixed sidebarOpen={sidebarOpen} />
          {!sidebarOpen && (
            <div className="md:ml-20">
              <StudentUtility />
            </div>
          )}
          <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full pt-12`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
            <div className="p-2 md:p-4">
              {searchTerm && (
                <div className="mb-4 px-3 py-2 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Search results for:</span> "{searchTerm}"
                    {searchLoading ? (
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        <span className="inline-block animate-spin mr-1">⟳</span>
                        Searching videos...
                      </span>
                    ) : (
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        ({videos.length} video{videos.length !== 1 ? 's' : ''} found)
                      </span>
                    )}
                  </p>
                  {!searchLoading && videos.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      No videos found matching your search. Try different keywords.
                    </p>
                  )}
                </div>
              )}
              {selectedFilter && !searchTerm && (
                <div className="mb-4 px-3 py-2 bg-green-50 dark:bg-gray-800 rounded-lg border border-green-200 dark:border-gray-700 relative">
                  <p className="text-sm text-green-700 dark:text-green-300 pr-8">
                    <span className="font-medium">Filtered by:</span> "{selectedFilter}"
                    {filterLoading ? (
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        <span className="inline-block animate-spin mr-1">⟳</span>
                        Filtering videos...
                      </span>
                    ) : (
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        ({videos.length} video{videos.length !== 1 ? 's' : ''} found)
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => handleFilterChange('')}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-green-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Clear filter"
                    title="Clear filter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-green-600 dark:text-green-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {!filterLoading && videos.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      No videos found for this filter. Try a different category.
                    </p>
                  )}
                </div>
              )}
              {!searchTerm && (
                <div className="mt-4 md:mt-6">
                  <Filters 
                    selectedFilter={selectedFilter}
                    onFilterChange={handleFilterChange}
                    loading={filterLoading}
                  />
                </div>
              )}
            </div>
            <main className="flex-1 p-1 sm:p-2 pb-0 overflow-y-auto w-full scrollbar-hide" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
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
                  <React.Fragment>
                    {displayVideos.slice(0, 6).map((video, i) => {
                      const showDuration = videoDurations[i];
                      const isLast = i === displayVideos.length - 1;
                      return (
                        <div
                          key={video._id || i}
                          className={`relative group cursor-pointer bg-gray-100 dark:bg-[#111111] flex flex-col min-w-0 w-full rounded-lg${isLast ? ' mb-16 sm:mb-0' : ''}`}
                          style={{ minHeight: '180px', paddingBottom: '0.5rem' }}
                          onClick={(e) => {
                            if (e.target.closest('.channel-link')) return;
                            navigate(`/watch/${video._id || i + 1}`);
                          }}
                        >
                          {/* ...existing code for video card... */}
                          <div className="relative" style={{ width: '100%', height: '180px' }}>
                            <HomeThumbnail
                              video={video}
                              source="homepage"
                              userId={video.userId}
                              sessionId={window.sessionStorage.getItem('sessionId') || undefined}
                              className="w-full h-[180px] object-cover rounded-lg hover:scale-105 transition-transform"
                              style={{ borderRadius: '0.75rem' }}
                              id={video._id || i}
                            />
                          </div>
                          <div className="block sm:hidden" style={{ height: '12px' }} />
                          <div className="p-0 sm:p-3 flex-1 flex flex-col justify-between pb-1">
                            <div className="flex items-start gap-2 sm:gap-3 mb-0">
                              <Link
                                to={`/channel/${video.channelId}`}
                                className="p-0 m-0 bg-transparent border-none channel-link"
                                style={{ lineHeight: 0, display: 'inline-block' }}
                                aria-label={`Go to ${video.author} channel`}
                                onClick={e => e.stopPropagation()}
                              >
                                <img src={video.profile} alt={video.author} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" style={{ width: '40px', height: '40px', objectFit: 'cover', aspectRatio: '1/1', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', pointerEvents: 'auto' }} />
                              </Link>
                              <div className="flex flex-col min-w-0">
                                <h3
                                  className="font-bold text-xs sm:text-base md:text-lg text-black dark:text-white line-clamp-2"
                                  title={video.title}
                                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', minHeight: '2.4em', marginBottom: '2px' }}
                                >
                                  {video.title}
                                </h3>
                                <div className="flex flex-col gap-0">
                                  <div className="flex flex-row items-center gap-1 text-xs text-gray-600 dark:text-gray-400 truncate sm:hidden">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); navigate(`/channel/${video.channelId}`); }}
                                      className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate hover:underline bg-transparent border-none p-0 m-0 channel-link"
                                      style={{ textAlign: 'left' }}
                                      aria-label={`Go to ${video.author} channel`}
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
                    })}
                    {/* Swipeable Posts Section after first two video rows - Hidden during search */}
                    {!searchTerm && !selectedFilter && (
                      <div style={{ gridColumn: '1/-1', width: '100%' }}>
                        <SwipeablePosts />
                      </div>
                    )}
                    {/* Render remaining videos after swipeable posts */}
                    {displayVideos.slice(6).map((video, i) => {
                      const showDuration = videoDurations[i + 6];
                      const isLast = i + 6 === displayVideos.length - 1;
                      return (
                        <div
                          key={video._id || i + 6}
                          className={`relative group cursor-pointer bg-gray-100 dark:bg-[#111111] flex flex-col min-w-0 w-full rounded-lg${isLast ? ' mb-16 sm:mb-0' : ''}`}
                          style={{ minHeight: '180px', paddingBottom: '0.5rem' }}
                          onClick={(e) => {
                            if (e.target.closest('.channel-link')) return;
                            navigate(`/watch/${video._id || i + 7}`);
                          }}
                        >
                          {/* ...existing code for video card... */}
                          <div className="relative" style={{ width: '100%', height: '180px' }}>
                            <HomeThumbnail
                              video={video}
                              source="homepage"
                              userId={video.userId}
                              sessionId={window.sessionStorage.getItem('sessionId') || undefined}
                              className="w-full h-[180px] object-cover rounded-lg hover:scale-105 transition-transform"
                              style={{ borderRadius: '0.75rem' }}
                              id={video._id || i + 6}
                            />
                          </div>
                          <div className="block sm:hidden" style={{ height: '12px' }} />
                          <div className="p-0 sm:p-3 flex-1 flex flex-col justify-between pb-1">
                            <div className="flex items-start gap-2 sm:gap-3 mb-0">
                              <Link
                                to={`/channel/${video.channelId}`}
                                className="p-0 m-0 bg-transparent border-none channel-link"
                                style={{ lineHeight: 0, display: 'inline-block' }}
                                aria-label={`Go to ${video.author} channel`}
                                onClick={e => e.stopPropagation()}
                              >
                                <img src={video.profile} alt={video.author} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" style={{ width: '40px', height: '40px', objectFit: 'cover', aspectRatio: '1/1', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', pointerEvents: 'auto' }} />
                              </Link>
                              <div className="flex flex-col min-w-0">
                                <h3
                                  className="font-bold text-xs sm:text-base md:text-lg text-black dark:text-white line-clamp-2"
                                  title={video.title}
                                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', minHeight: '2.4em', marginBottom: '2px' }}
                                >
                                  {video.title}
                                </h3>
                                <div className="flex flex-col gap-0">
                                  <div className="flex flex-row items-center gap-1 text-xs text-gray-600 dark:text-gray-400 truncate sm:hidden">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); navigate(`/channel/${video.channelId}`); }}
                                      className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate hover:underline bg-transparent border-none p-0 m-0 channel-link"
                                      style={{ textAlign: 'left' }}
                                      aria-label={`Go to ${video.author} channel`}
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
                    })}
                  </React.Fragment>
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

function HeaderFixed({ onToggleSidebar, showCreateModal, setShowCreateModal, searchTerm, onSearchChange }) {
  return (
    <div className="fixed top-0 left-0 w-full z-40" style={{ height: '44px' }}>
      <Header 
        onToggleSidebar={onToggleSidebar} 
        showCreateModal={showCreateModal} 
        setShowCreateModal={setShowCreateModal}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
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