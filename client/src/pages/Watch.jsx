import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Comments from '../components/Comments';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

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
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(120); // example count
  const [disliked, setDisliked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(5); // example count
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(2); // sync with Comments component
  const [subscribed, setSubscribed] = useState(false);

  // Update comment count when Comments component changes
  const handleCommentCountChange = (count) => setCommentCount(count);

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818]">
      {/* Main Header for desktop */}
      <div className="hidden md:block w-full fixed top-0 left-0 z-40">
        <Header />
      </div>
      <div className="flex flex-col md:flex-row pt-0 md:pt-14">
        {/* Fixed Collapsed Sidebar for desktop */}
        <div className="hidden md:block fixed top-14 left-0 z-30 h-[calc(100vh-56px)]">
          <Sidebar collapsed={true} />
        </div>
        <div className="md:ml-20 flex-1 p-4 flex flex-col items-center">
          <div className="w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              src={video.videoUrl}
              controls
              className="w-full h-full"
              style={{ border: 'none' }}
            />
          </div>
          <div className="w-full max-w-3xl mt-4">
            <div className="flex items-start w-full mb-3">
              <h1 className="text-2xl font-bold text-black dark:text-white flex-1 break-words leading-tight mb-0" style={{ wordBreak: 'break-word' }}>{video.title}</h1>
              <div className="flex items-center gap-6 ml-4">
                {/* Outlined Heart Like Icon, fill when liked */}
                <button
                  className={`flex items-center gap-1 text-gray-700 dark:text-gray-200 transition bg-transparent border-none p-0 ${liked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                  onClick={() => {
                    setLiked(l => !l);
                    setLikeCount(count => liked ? count - 1 : count + 1);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill={liked ? '#c42152' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-xs">Like ({likeCount})</span>
                </button>
                {/* YouTube-style Thumbs Down Dislike Icon */}
                <button
                  className={`flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-gray-400 transition bg-transparent border-none p-0 ${disliked ? 'text-gray-400' : ''}`}
                  onClick={() => {
                    setDisliked(d => !d);
                    setDislikeCount(count => disliked ? count - 1 : count + 1);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill={disliked ? '#888' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M22 10.5c0-.83-.67-1.5-1.5-1.5h-6.36l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v8c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-6.5h2c.83 0 1.5-.67 1.5-1.5zM5 10v8c0 .55.45 1 1 1s1-.45 1-1v-8c0-.55-.45-1-1-1s-1 .45-1 1z" />
                  </svg>
                  <span className="text-xs">Dislike ({dislikeCount})</span>
                </button>
                {/* Instagram-style Comments (Speech Bubble) */}
                <button
                  className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition bg-transparent border-none p-0"
                  onClick={() => setShowComments((prev) => !prev)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  <span className="text-xs">Comments ({commentCount})</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Link to={`/channel/${video.author}`} className="flex items-center gap-2 min-w-0">
                <img src={video.authorProfile} alt={video.author} className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 cursor-pointer" />
                <span className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer truncate max-w-[120px]" title={video.author}>{video.author}</span>
              </Link>
              <span className="text-xs text-gray-500 dark:text-gray-400">{video.views} views • {video.posted}</span>
              <button
                className={`ml-2 px-4 py-1 rounded-full font-semibold text-xs transition ${subscribed ? 'bg-gray-300 text-gray-700 cursor-default' : 'bg-red-600 text-white hover:bg-red-700'}`}
                onClick={() => !subscribed && setSubscribed(true)}
                disabled={subscribed}
              >
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-200 text-base mb-4">{video.description}</p>
            {showComments && <Comments onCountChange={handleCommentCountChange} />}
          </div>
        </div>
        {/* Recommendations Section */}
        <aside className="w-full md:w-96 p-4 bg-transparent flex flex-col gap-4">
          <h2 className="text-lg font-bold text-black dark:text-white mb-2">Similar Content</h2>
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
    </div>
  );
}
