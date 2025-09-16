// client/src/pages/SavedVideos.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../utils/timeAgo";

// Helper function to format duration
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SavedVideos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/videos/saved`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch saved videos");
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        setError(err.message || "Error fetching saved videos");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSavedVideos();
  }, [token]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center text-gray-500">
          Loading your saved videos...
        </div>
      );
    }
    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }
    if (videos.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
          <h2 className="text-2xl font-semibold mb-2">No saved videos</h2>
          <p>
            You haven't saved any videos yet. Click the "Save" button on a video
            to add it to this list.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {videos.map((video) => (
          <Link
            to={`/watch/${video._id}`}
            key={video._id}
            className="flex items-start gap-4 p-3 bg-white dark:bg-[#222] rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div className="relative w-48 h-28 flex-shrink-0">
              <img
                src={
                  video.thumbnailUrl ||
                  "https://via.placeholder.com/400x225?text=Video"
                }
                alt={video.title}
                className="w-full h-full object-cover rounded-md"
              />
              {video.duration && (
                <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2"
                title={video.title}
              >
                {video.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>{video.viewCount || 0} views</span>
                <span>•</span>
                <span>{timeAgo(video.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={video.channel?.avatar}
                  alt={video.channel?.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {video.channel?.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full"
      style={{ overflowX: "hidden", scrollbarWidth: "none", maxWidth: "100vw" }}
    >
      <div
        className="fixed top-0 left-0 w-full z-40"
        style={{ height: "56px" }}
      >
        <Header onToggleSidebar={handleToggleSidebar} />
      </div>
      <div
        className="flex flex-row w-full pt-14"
        style={{
          height: "100vh",
          maxWidth: "100vw",
          overflowX: "hidden",
          scrollbarWidth: "none",
        }}
      >
        <div
          className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${
            sidebarOpen ? "w-64" : "w-20"
          } z-30 bg-transparent hidden md:block`}
        >
          <Sidebar collapsed={!sidebarOpen} />
        </div>
        <div
          className={`flex-1 flex flex-col ${
            sidebarOpen ? "md:ml-64" : "md:ml-20"
          } w-full overflow-y-auto scrollbar-hide`}
        >
          <div className="p-4 md:p-8 pb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#0bb6bc] dark:text-[#0bb6bc]">
              Saved Videos
            </h2>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
