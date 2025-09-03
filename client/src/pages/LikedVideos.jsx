import React, { useState, useEffect } from 'react';
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

import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';

export default function LikedVideos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              {loading ? (
                <div className="text-center col-span-3 text-gray-500 dark:text-gray-400">Loading liked videos...</div>
              ) : error ? (
                <div className="text-center col-span-3 text-red-500">{error}</div>
              ) : videos.length === 0 ? (
                <div className="text-center col-span-3 text-gray-500 dark:text-gray-400">No liked videos found.</div>
              ) : (
                videos.map((video) => {
                  // Debug log for each video object
                  // Check if current user liked this video (new format)
                  const likedByCurrentUser = Array.isArray(video.likes) && video.likes.some(like => like.user?.toString() === (video.userLike?.user?.toString() || ''));
                  return (
                    <div key={video._id} className="bg-white dark:bg-[#222] rounded-lg shadow-md overflow-hidden flex flex-col">
                      <div className="relative">
                        <img
                          src={video.thumbnailUrl || 'https://via.placeholder.com/400x225?text=Video+Thumbnail'}
                          alt={video.title || 'Video Thumbnail'}
                          className="w-full h-48 object-cover"
                        />
                        {video.duration !== undefined && (
                          <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{video.title || 'Untitled Video'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{video.channel?.name || 'Unknown Channel'}</p>
                        <span className="text-xs text-gray-400">{formatViews(video.viewCount || 0)} views • {video.createdAt ? timeAgo(video.createdAt) : ''}</span>
                        {/* Optionally show liked status for current user */}
                        {/* {likedByCurrentUser && <span className="text-xs text-pink-500">Liked</span>} */}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
