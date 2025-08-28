import PostCard from '../components/PostCard';
import postCardData from '../components/PostCardData';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StudentUtility from '../components/StudentUtility';
import BottomTabs from '../components/BottomTabs';
import Filters from '../components/Filters';
import { fetchThumbnails } from '../utils/fetchThumbnails';
function formatViews(views) {
  if (views >= 1000000) return (views / 1000000).toFixed(views % 1000000 === 0 ? 0 : 1) + 'm';
  if (views >= 1000) return (views / 1000).toFixed(views % 1000 === 0 ? 0 : 1) + 'k';
  return views;
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  useEffect(() => {
    async function loadVideos() {
      try {
        // Sample videos and thumbnails
        const sampleVideos = [
          {
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
            title: 'React Hooks Deep Dive',
            author: 'Alex Kim',
            profile: 'https://randomuser.me/api/portraits/men/32.jpg',
            views: 120000,
            posted: '2 days ago',
          },
          {
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
            title: 'Building REST APIs with Node.js',
            author: 'Priya Singh',
            profile: 'https://randomuser.me/api/portraits/women/44.jpg',
            views: 98000,
            posted: '1 week ago',
          },
          {
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
            title: 'Mastering JavaScript ES6+',
            author: 'John Doe',
            profile: 'https://randomuser.me/api/portraits/men/65.jpg',
            views: 75000,
            posted: '2 weeks ago',
          },
          {
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
            title: 'Responsive Web Design with CSS',
            author: 'Maria Lopez',
            profile: 'https://randomuser.me/api/portraits/women/68.jpg',
            views: 60000,
            posted: '3 weeks ago',
          },
          {
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
            title: 'Python for Data Science',
            author: 'Chen Wei',
            profile: 'https://randomuser.me/api/portraits/men/21.jpg',
            views: 50000,
            posted: '4 weeks ago',
          },
          {
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
            title: 'Debugging MERN Stack Apps',
            author: 'Fatima Zahra',
            profile: 'https://randomuser.me/api/portraits/women/12.jpg',
            views: 42000,
            posted: '1 month ago',
          },
        ];
        setVideos(sampleVideos);
      } catch (err) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  return (
  <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}>
    <HeaderFixed onToggleSidebar={handleToggleSidebar} />
  <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 44px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <SidebarFixed sidebarOpen={sidebarOpen} />
        {/* Render StudentUtility only when sidebar is collapsed on desktop */}
        {!sidebarOpen && (
          <div className="md:ml-20">
            <StudentUtility />
          </div>
        )}
  <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="p-2 md:p-4">
            <h2 className="text-lg md:text-xl font-bold mb-2 text-[#0bb6bc] dark:text-[#0bb6bc]">Welcome to PowerHub</h2>
            {/* Removed the statement as requested */}

            {/* Category Filters */}
            <div className="mt-4 md:mt-6">
              <Filters />
            </div>
          </div>
          <main className="flex-1 p-1 sm:p-2 pb-0 overflow-y-auto w-full" style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full"
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
                      <div className="p-0 sm:p-3 flex-1 flex flex-col justify-between">
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
                videos.map((video, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 dark:bg-[#111111] rounded-lg shadow-md overflow-hidden flex flex-col min-w-0 w-full"
                    style={{ maxWidth: '100%', minWidth: 0, height: '320px', fontSize: '0.95em' }}
                  >
                    <div className="w-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center cursor-pointer" style={{ borderRadius: '0', margin: 0, padding: 0, height: '180px', minHeight: '180px', maxHeight: '180px', aspectRatio: '16/9' }}
                      onClick={() => navigate(`/watch/${i + 1}`)}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="object-cover w-full h-full rounded-none hover:scale-[1.03] transition-transform"
                        style={{ borderRadius: 0, margin: 0, padding: 0, display: 'block', width: '100%', height: '100%', aspectRatio: '16/9', minHeight: '180px', maxHeight: '180px' }}
                      />
                    </div>
                    {/* Add spacing below thumbnail for mobile */}
                    <div className="block sm:hidden" style={{ height: '12px' }} />
                    <div className="p-0 sm:p-3 flex-1 flex flex-col justify-between">
                      <div className="flex items-start gap-2 sm:gap-3 mb-0">
                        <button
                          type="button"
                          onClick={() => navigate(`/channel/${encodeURIComponent(video.author)}`)}
                          className="p-0 m-0 bg-transparent border-none"
                          style={{ lineHeight: 0 }}
                        >
                          <img src={video.profile} alt={video.author} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" />
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
                            <button
                              type="button"
                              onClick={() => navigate(`/channel/${encodeURIComponent(video.author)}`)}
                              className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate hover:underline bg-transparent border-none p-0 m-0"
                              style={{ marginBottom: '0', textAlign: 'left' }}
                            >
                              {video.author}
                            </button>
                            <div
                              className="flex flex-row items-center gap-1 md:gap-3 text-xs text-gray-600 dark:text-gray-400 truncate"
                              style={{ marginTop: '0' }}
                            >
                              <span>{formatViews(video.views)} views</span>
                              <span>•</span>
                              <span>{video.posted}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* ...existing code... */}
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
}

function HeaderFixed({ onToggleSidebar }) {
  return (
    <div className="fixed top-0 left-0 w-full z-40" style={{ height: '44px' }}>
      <Header onToggleSidebar={onToggleSidebar} />
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
