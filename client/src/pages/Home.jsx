import React, { useState, useEffect } from 'react';
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

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  useEffect(() => {
    async function loadVideos() {
      try {
        const thumbs = await fetchThumbnails(6);
        const authors = [
          { name: 'Alex Kim', profile: 'https://randomuser.me/api/portraits/men/32.jpg' },
          { name: 'Priya Singh', profile: 'https://randomuser.me/api/portraits/women/44.jpg' },
          { name: 'John Doe', profile: 'https://randomuser.me/api/portraits/men/65.jpg' },
          { name: 'Maria Lopez', profile: 'https://randomuser.me/api/portraits/women/68.jpg' },
          { name: 'Chen Wei', profile: 'https://randomuser.me/api/portraits/men/21.jpg' },
          { name: 'Fatima Zahra', profile: 'https://randomuser.me/api/portraits/women/12.jpg' },
        ];
        const codingTitles = [
          'React Hooks Deep Dive',
          'Building REST APIs with Node.js',
          'Mastering JavaScript ES6+',
          'Responsive Web Design with CSS',
          'Python for Data Science',
          'Debugging MERN Stack Apps',
        ];
        const videos = thumbs.map((thumb, i) => ({
          thumbnail: thumb,
          title: codingTitles[i % codingTitles.length],
          views: Math.floor(Math.random() * 10000) + 100,
          posted: `${Math.floor(Math.random() * 12) + 1} days ago`,
          author: authors[i % authors.length].name,
          profile: authors[i % authors.length].profile,
        }));
        setVideos(videos);
      } catch (err) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, []);

  return (
  <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none' }}>
      <HeaderFixed onToggleSidebar={handleToggleSidebar} />
  <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <SidebarFixed sidebarOpen={sidebarOpen} />
        {/* Render StudentUtility only when sidebar is collapsed on desktop */}
        {!sidebarOpen && (
          <div className="md:ml-20">
            <StudentUtility />
          </div>
        )}
  <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#0bb6bc] dark:text-[#0bb6bc]">Welcome to PowerHub</h2>
            {/* Removed the statement as requested */}

            {/* Category Filters */}
            <Filters />
          </div>
          <main className="flex-1 p-2 sm:p-4 pb-0 overflow-y-auto w-full" style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full"
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
                    style={{ maxWidth: '100%', minWidth: 0 }}
                  >
                    <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 flex items-center justify-center" style={{ borderRadius: '0', margin: 0, padding: 0 }}>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="object-cover w-full h-full rounded-none"
                        style={{ borderRadius: 0, margin: 0, padding: 0, display: 'block' }}
                      />
                    </div>
                    {/* Add spacing below thumbnail for mobile */}
                    <div className="block sm:hidden" style={{ height: '12px' }} />
                    <div className="p-0 sm:p-3 flex-1 flex flex-col justify-between">
                      <div className="flex items-start gap-2 sm:gap-3 mb-1">
                        <img src={video.profile} alt={video.author} className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <h3
                            className="font-bold text-xs sm:text-base md:text-lg text-white line-clamp-2"
                            title={video.title}
                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', minHeight: '1.2em' }}
                          >
                            {video.title}
                          </h3>
                          {/* Author above details on desktop/large screens, hidden on mobile/tablet */}
                          <span className="hidden md:block text-xs font-medium text-gray-600 dark:text-gray-400 mt-0 truncate">{video.author}</span>
                        </div>
                      </div>
                      {/* Responsive row for views, author, and time */}
                      <div
                        className="flex flex-row items-center gap-1 md:gap-3 pl-7 sm:pl-14 text-xs text-gray-600 dark:text-gray-400 truncate"
                        style={{ marginBottom: '0' }}
                      >
                        {/* On desktop/large screens, hide author in details row */}
                        <span className="md:hidden">{video.author}</span>
                        <span className="md:hidden">•</span>
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{video.posted}</span>
                      </div>
                      {/* Add gap at the end to compensate for long titles in the row */}
                      <div style={{ height: '0.7em' }} />
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
    <div className="fixed top-0 left-0 w-full z-40">
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
