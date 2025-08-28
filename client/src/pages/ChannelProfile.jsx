import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SubscribeButton from '../components/SubscribeButton';

export default function ChannelProfile() {
  const { user, token } = useAuth();
  const { author } = useParams();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannel = async () => {
      if (!author) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/channel/${author}`);
        if (response.ok) {
          const data = await response.json();
          setChannel(data);
        } else {
          setChannel(null);
        }
      } catch (err) {
        setChannel(null);
      }
      setLoading(false);
    };
    fetchChannel();
  }, [author]);

  if (loading) {
    // Skeleton UI for channel loading
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818]">
        <Header />
        <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <Sidebar collapsed={true} />
          <div className="flex-1 flex flex-col items-stretch px-0 md:px-8 py-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
            {/* Banner skeleton */}
            <div className="w-full h-56 md:h-72 lg:h-80 relative bg-gray-300 dark:bg-gray-800 animate-pulse mb-0 mt-6" />
            {/* Avatar and info skeleton */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 pt-16 pb-4">
              <div>
                <div className="h-8 w-48 bg-gray-300 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-gray-300 dark:bg-gray-800 rounded-full animate-pulse" />
            </div>
            {/* Description skeleton */}
            <div className="px-8 pb-6">
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-800 rounded mb-2 animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!channel) {
    return <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#181818]">No channel found.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818]">
      <Header />
      <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <Sidebar collapsed={true} />
        <div className="flex-1 flex flex-col items-stretch px-0 md:px-8 py-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          {/* Banner styled like YouTube */}
          <div className="w-full h-56 md:h-72 lg:h-80 relative bg-black mb-0 mt-6">
            <img src={channel.banner} alt="Channel Banner" className="w-full h-full rounded-lg object-cover bg-black" style={{ objectPosition: 'center' }} />
            <div className="absolute left-8 bottom-[-48px] flex items-end">
              <img src={channel.avatar} alt="Channel Avatar" className="w-28 h-28 rounded-full border-4 border-white dark:border-[#222] shadow-lg" />
            </div>
          </div>
          {/* Channel Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 pt-16 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">{channel.name}</h1>
              <div className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                Subscribers: {channel.subscribers ? channel.subscribers.length : 0}
              </div>
            </div>
            <SubscribeButton channel={channel} />
          </div>
          {/* Description */}
          <div className="px-8 pb-6">
            <p className="text-gray-700 dark:text-gray-200 text-base">{channel.description}</p>
          </div>
          {/* Videos Grid styled like YouTube thumbnails */}
          {/* You can add channel.videos here if available */}
        </div>
      </div>
    </div>
  );
}
