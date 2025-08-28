
import React from 'react';

export default function ChannelProfile() {
  // Dummy channel data for design
  const channel = {
    name: 'Channel Name',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', // Dummy profile picture
  banner: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80', // New cover image
    subscribers: '1.2M',
    description: 'This is a sample channel description. It can be a few lines long and describes the channel purpose, content, and more.',
    videos: [
      { id: 1, title: 'First Video', thumbnail: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg', views: '120K', date: '2 days ago' },
      { id: 2, title: 'Second Video', thumbnail: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg', views: '98K', date: '1 week ago' },
      { id: 3, title: 'Third Video', thumbnail: 'https://i.ytimg.com/vi/ltrMfT4Qz5Y/hqdefault.jpg', views: '75K', date: '2 weeks ago' },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818]">
      {/* Banner styled like YouTube */}
      <div className="w-full h-56 md:h-72 lg:h-80 relative bg-black">
        <img src={channel.banner} alt="Channel Banner" className="w-full h-full object-cover" style={{ objectPosition: 'center' }} />
        <div className="absolute left-8 bottom-[-48px] flex items-end">
          <img src={channel.avatar} alt="Channel Avatar" className="w-28 h-28 rounded-full border-4 border-white dark:border-[#222] shadow-lg" />
        </div>
      </div>
      {/* Channel Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 pt-16 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">{channel.name}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{channel.subscribers} subscribers</p>
        </div>
        <button className="mt-4 md:mt-0 px-6 py-2 rounded-full bg-[#c42152] text-white font-semibold hover:bg-[#0bb6bc] transition">Subscribe</button>
      </div>
      {/* Description */}
      <div className="px-8 pb-6">
        <p className="text-gray-700 dark:text-gray-200 text-base">{channel.description}</p>
      </div>
      {/* Videos Grid styled like YouTube thumbnails */}
      <div className="px-8 pb-12">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {channel.videos.map(video => (
            <div key={video.id} className="bg-white dark:bg-[#222] rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="relative w-full h-48 bg-black">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" style={{ objectPosition: 'center' }} />
                {/* Play icon overlay like YouTube */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-black dark:text-white line-clamp-2">{video.title}</h3>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span>{video.views} views</span>
                  <span>{video.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
