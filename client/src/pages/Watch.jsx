import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Comments from '../components/Comments';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SubscribeButton from '../components/SubscribeButton';
import ProgressBar from '../components/ProgressBar';

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [disliked, setDisliked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [channelDetails, setChannelDetails] = useState(null);
  const [hoveredRecId, setHoveredRecId] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  // Helper to fetch video and recommendations
  const fetchVideoAndRecommendations = async (videoId) => {
    setProgressLoading(true);
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/videos/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        setVideo(data);
        setLikeCount(data.likes?.length || 0);
        setDislikeCount(data.dislikes?.length || 0);
        // Fetch channel details for subscribe button
        if (data.channel?._id) {
          const channelRes = await fetch(`${apiUrl}/channel/${data.channel._id}`);
          if (channelRes.ok) {
            const channelData = await channelRes.json();
            setChannelDetails(channelData);
          } else {
            setChannelDetails(data.channel);
          }
        } else {
          setChannelDetails(data.channel);
        }
        // Fetch all videos for recommendations
        const allVideosRes = await fetch(`${apiUrl}/videos`);
        if (allVideosRes.ok) {
          const allVideos = await allVideosRes.json();
          // Filter by same category and exclude current video
          const sameCategory = allVideos.filter(v => v.category === data.category && v._id !== videoId);
          // If any have likes or views, sort and show those first
          const withLikesOrViews = sameCategory.filter(v => (v.likes?.length || 0) > 0 || (v.viewCount || 0) > 0);
          if (withLikesOrViews.length > 0) {
            withLikesOrViews.sort((a, b) => {
              const likesA = a.likes?.length || 0;
              const likesB = b.likes?.length || 0;
              const viewsA = a.viewCount || 0;
              const viewsB = b.viewCount || 0;
              if (likesB !== likesA) return likesB - likesA;
              return viewsB - viewsA;
            });
            setRecommendations(withLikesOrViews);
          } else {
            setRecommendations(sameCategory);
          }
        }
      } else {
        setVideo(null);
        setChannelDetails(null);
      }
    } catch (err) {
      setVideo(null);
      setChannelDetails(null);
    }
    setLoading(false);
    setTimeout(() => setProgressLoading(false), 900); // allow progress bar to animate
  };

  useEffect(() => {
    fetchVideoAndRecommendations(id);
  }, [id]);

  const handleCommentCountChange = (count) => setCommentCount(count);

  function formatPostedAgo(dateString) {
    if (!dateString) return '';
    const posted = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - posted) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
    return posted.toLocaleDateString();
  }

  if (loading) {
    // Show ProgressBar and skeleton UI, no spinner
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818]">
        <ProgressBar loading={progressLoading} />
        <div className="hidden md:block w-full fixed top-0 left-0 z-40">
          <Header />
        </div>
        <div className="flex flex-col md:flex-row pt-0 md:pt-14">
          <div className="hidden md:block fixed top-14 left-0 z-30 h-[calc(100vh-56px)]">
            <Sidebar collapsed={true} />
          </div>
          <div className="md:ml-20 flex-1 p-4 flex flex-col items-center">
            <div className="w-full max-w-3xl aspect-video bg-gray-300 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse" />
            <div className="w-full max-w-3xl mt-4">
              <div className="h-8 w-2/3 bg-gray-300 dark:bg-gray-800 rounded mb-2 animate-pulse" />
              <div className="flex gap-6 mb-3">
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-800 rounded mb-2 animate-pulse" />
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="w-full max-w-3xl mt-4">
              <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-800 rounded mb-2 animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-800 rounded mb-2 animate-pulse" />
            </div>
          </div>
          <aside className="w-full md:w-96 p-4 bg-transparent flex flex-col gap-4">
            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-800 rounded mb-2 animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center bg-white dark:bg-[#222] rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="w-32 h-20 bg-gray-300 dark:bg-gray-800 rounded-l-lg" />
                <div className="flex flex-col flex-1 min-w-0 p-2">
                  <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    );
  }
  if (!video) {
    return <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#181818]">Video not found.</div>;
  }

  return (
    <>
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
            <video
              src={video.videoUrl}
              controls
              controlsList="nodownload"
              className="w-full max-w-full aspect-video rounded-lg shadow-lg mb-2"
              style={{ border: 'none' }}
            />
            <div className="w-full max-w-3xl mt-2 flex flex-col gap-2">
              <h1
                className="text-2xl font-bold text-black dark:text-white leading-tight mb-0 truncate block max-w-full"
                style={{ wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={video.title}
              >
                {video.title}
              </h1>
              <div className="flex flex-wrap gap-4 w-full justify-start items-center mt-2">
                {/* Outlined Heart Like Icon, fill when liked */}
                <button
                  className={`flex items-center gap-2 text-gray-700 dark:text-gray-200 transition bg-transparent border-none p-0 ${liked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                  style={{ minHeight: 40 }}
                  onClick={() => {
                    setLiked(l => !l);
                    setLikeCount(count => liked ? count - 1 : count + 1);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill={liked ? '#c42152' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-sm">Like ({likeCount})</span>
                </button>
                {/* YouTube-style Thumbs Down Dislike Icon */}
                <button
                  className={`flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-gray-400 transition bg-transparent border-none p-0 ${disliked ? 'text-gray-400' : ''}`}
                  style={{ minHeight: 40 }}
                  onClick={() => {
                    setDisliked(d => !d);
                    setDislikeCount(count => disliked ? count - 1 : count + 1);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill={disliked ? '#888' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M22 10.5c0-.83-.67-1.5-1.5-1.5h-6.36l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v8c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-6.5h2c.83 0 1.5-.67 1.5-1.5zM5 10v8c0 .55.45 1 1 1s1-.45 1-1v-8c0-.55-.45-1-1-1s-1 .45-1 1z" />
                  </svg>
                  <span className="text-sm">Dislike ({dislikeCount})</span>
                </button>
                {/* Instagram-style Comments (Speech Bubble) */}
                <button
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition bg-transparent border-none p-0"
                  style={{ minHeight: 40 }}
                  onClick={() => setShowComments((prev) => !prev)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  <span className="text-sm">Comments ({commentCount})</span>
                </button>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Link to={`/channel/${video.channel?._id || video.channel}`} className="flex items-center gap-2 min-w-0">
                  <img src={video.channel?.avatar} alt={video.channel?.name} className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 cursor-pointer" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer truncate max-w-[120px]" title={video.channel?.name}>{video.channel?.name}</span>
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400">{video.viewCount || 0} views • {video.postedAgo || ''}</span>
                {channelDetails && <SubscribeButton channel={channelDetails} />}
              </div>
              <p className="text-gray-700 dark:text-gray-200 text-base mb-4 pl-8">{video.description}</p>
              {showComments && <Comments onCountChange={handleCommentCountChange} />}
            </div>
          </div>
          {/* Recommendations Section */}
          <aside className="w-full md:w-96 p-4 bg-transparent flex flex-col gap-4">
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">Similar Content</h2>
            {recommendations.map(rec => (
              <div
                key={rec._id}
                className="flex gap-3 items-center bg-white dark:bg-[#222] rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] transition"
                onMouseEnter={() => setHoveredRecId(rec._id)}
                onMouseLeave={() => setHoveredRecId(null)}
                onClick={() => fetchVideoAndRecommendations(rec._id)}
              >
                {hoveredRecId === rec._id ? (
                  <video
                    src={rec.videoUrl}
                    className="w-32 h-20 object-cover rounded-l-lg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ background: '#000' }}
                  />
                ) : (
                  <img src={rec.thumbnailUrl} alt={rec.title} className="w-32 h-20 object-cover rounded-l-lg" />
                )}
                <div className="flex flex-col flex-1 min-w-0 p-2">
                  <h3 className="text-base font-semibold text-black dark:text-white line-clamp-2 mb-1">{rec.title}</h3>
                  <span
                    className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate block max-w-[120px]"
                    title={rec.channel?.name || rec.author}
                  >
                    {rec.channel?.name || rec.author}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {rec.viewCount || 0} views
                    <span className="font-bold mx-1">&bull;</span>
                    {formatPostedAgo(rec.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </>
  );
}
