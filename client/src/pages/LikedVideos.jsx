import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function LikedVideos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}>
      <div className="fixed top-0 left-0 w-full z-40" style={{ height: '56px' }}>
        <Header onToggleSidebar={handleToggleSidebar} />
      </div>
      <div className="flex flex-row w-full pt-14" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent md:block`}>
          <Sidebar collapsed={!sidebarOpen} />
        </div>
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="p-2 md:p-4">
            <h2 className="text-lg md:text-xl font-bold mb-2 text-[#0bb6bc] dark:text-[#0bb6bc]">Liked Videos</h2>
            <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dummy liked videos */}
              {[1,2,3,4,5].map((id) => (
                <div key={id} className="bg-white dark:bg-[#222] rounded-lg shadow-md overflow-hidden flex flex-col">
                  <img
                    src="https://via.placeholder.com/400x225?text=Video+Thumbnail"
                    alt="Video Thumbnail"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sample Video Title {id}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Channel Name {id}</p>
                    <span className="text-xs text-gray-400">1.2M views • 2 days ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
