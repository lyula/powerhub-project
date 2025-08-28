import React from 'react';

// Dummy data for video and recommendations
const video = {
  id: 1,
  title: 'React Hooks Deep Dive',
  author: 'Alex Kim',
  authorProfile: 'https://randomuser.me/api/portraits/men/32.jpg',
  views: '120K',
  posted: '2 days ago',
  description: 'Learn all about React Hooks in this comprehensive deep dive. We cover useState, useEffect, useContext, and more! Perfect for beginners and advanced devs.',
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
};

const recommendations = [
  {
    id: 2,
    title: 'Building REST APIs with Node.js',
    author: 'Priya Singh',
  thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    views: '98K',
    posted: '1 week ago',
  },
  {
    id: 3,
    title: 'Mastering JavaScript ES6+',
    author: 'John Doe',
  thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    views: '75K',
    posted: '2 weeks ago',
  },
  {
    id: 4,
    title: 'Responsive Web Design with CSS',
    author: 'Maria Lopez',
  thumbnail: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    views: '60K',
    posted: '3 weeks ago',
  },
];

export default function Watch() {
  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818] flex flex-col md:flex-row">
      {/* Main Video Section */}
      <div className="flex-1 p-4 flex flex-col items-center">
        <div className="w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            src={video.videoUrl}
            controls
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
        <div className="w-full max-w-3xl mt-4">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">{video.title}</h1>
          <div className="flex items-center gap-3 mb-2">
            <img src={video.authorProfile} alt={video.author} className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">{video.author}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{video.views} views • {video.posted}</span>
          </div>
          <p className="text-gray-700 dark:text-gray-200 text-base mb-4">{video.description}</p>
        </div>
      </div>
      {/* Recommendations Section */}
      <aside className="w-full md:w-96 p-4 bg-transparent flex flex-col gap-4">
        <h2 className="text-lg font-bold text-black dark:text-white mb-2">Recommended</h2>
        {recommendations.map(rec => (
          <div key={rec.id} className="flex gap-3 items-center bg-white dark:bg-[#222] rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] transition">
            <img src={rec.thumbnail} alt={rec.title} className="w-32 h-20 object-cover rounded-l-lg" />
            <div className="flex flex-col flex-1 min-w-0 p-2">
              <h3 className="text-base font-semibold text-black dark:text-white line-clamp-2 mb-1">{rec.title}</h3>
              <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">{rec.author}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{rec.views} views • {rec.posted}</span>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
