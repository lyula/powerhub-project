import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import VideoComments from '../components/VideoComments';
import VideoInteractions from '../components/VideoInteractions';
import DescriptionWithReadMore from './DescriptionWithReadMore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MobileHeader from '../components/MobileHeader';
import { VideoCameraIcon } from '../components/icons';
import SubscribeButton from '../components/SubscribeButton';
import ProgressBar from '../components/ProgressBar';
import SimilarContentThumbnail from '../components/SimilarContentThumbnail';

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  // Remove impressionRefs logic from here
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
  const commentsRef = React.useRef(null);

  // Helper to fetch video and recommendations
  const fetchVideoAndRecommendations = async (videoId) => {
    setProgressLoading(true);
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      // Fetch video and channel details first
      const res = await fetch(`${apiUrl}/videos/${videoId}`);
      let data = null;
      if (res.ok) {
        data = await res.json();
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
        setLoading(false); // Render video as soon as possible
        // Fetch recommendations in parallel
        fetch(`${apiUrl}/videos`).then(async (allVideosRes) => {
          if (allVideosRes.ok) {
            const allVideos = await allVideosRes.json();
            const sameCategory = allVideos.filter(v => v.category === data.category && v._id !== videoId);
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
          setProgressLoading(false);
        });
      } else {
        setVideo(null);
        setChannelDetails(null);
        setLoading(false);
        setProgressLoading(false);
      }
    } catch (err) {
      setVideo(null);
      setChannelDetails(null);
      setLoading(false);
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoAndRecommendations(id);
    // Send view count to backend when video is loaded
    const sendView = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        await fetch(`${apiUrl}/videos/${id}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Optionally add auth token if required
          },
        });
      } catch (err) {
        // Ignore errors for view count
      }
    };
    sendView();
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
    // Show ProgressBar and skeleton UI only, no spinner
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818]">
        <ProgressBar loading={progressLoading} />
        {/* Mobile header for Watch page */}
        <MobileHeader icon={<VideoCameraIcon />} label="Watch" />
        {/* Desktop header remains unchanged */}
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
              autoPlay
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
              <VideoInteractions
                liked={liked}
                setLiked={l => { setLiked(l); setLikeCount(count => l ? count + 1 : count - 1); }}
                likeCount={likeCount}
                disliked={disliked}
                setDisliked={d => { setDisliked(d); setDislikeCount(count => d ? count + 1 : count - 1); }}
                dislikeCount={dislikeCount}
                showComments={showComments}
                setShowComments={(val) => {
                  setShowComments(val);
                  if (val && commentsRef.current) {
                    setTimeout(() => {
                      commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
                commentCount={commentCount}
              />
              <div className="flex items-center gap-3 mb-2">
                <Link to={`/channel/${video.channel?._id || video.channel}`} className="flex items-center gap-2 min-w-0">
                  <img src={video.channel?.avatar} alt={video.channel?.name} className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 cursor-pointer" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer truncate max-w-[120px]" title={video.channel?.name}>{video.channel?.name}</span>
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400">{video.viewCount || 0} views • {video.postedAgo || ''}</span>
                {channelDetails && <SubscribeButton channel={channelDetails} />}
              </div>
              {/* Video Description with Read More/Read Less */}
              {video.description && !showComments && (
                <DescriptionWithReadMore description={video.description} />
              )}
              {showComments && (
                <div ref={commentsRef}>
                  <VideoComments
                    videoId={video._id}
                    user={null} // TODO: pass current user object
                    channel={channelDetails}
                    onCountChange={handleCommentCountChange}
                  />
                </div>
              )}
            </div>
          </div>
          {/* Recommendations Section */}
          <aside className="w-full md:w-96 p-4 bg-transparent flex flex-col gap-4">
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">Similar Content</h2>
            {recommendations.map(rec => (
              <div
                key={rec._id}
                className="flex gap-0 items-start bg-white dark:bg-[#222] rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] transition"
                style={{ minHeight: '5rem' }}
                onMouseEnter={() => setHoveredRecId(rec._id)}
                onMouseLeave={() => setHoveredRecId(null)}
                onClick={async () => {
                  await fetchVideoAndRecommendations(rec._id);
                  // Send view count to backend for similar content click
                  try {
                    const apiUrl = import.meta.env.VITE_API_URL;
                    await fetch(`${apiUrl}/videos/${rec._id}/view`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });
                  } catch (err) {
                    // Ignore errors for view count
                  }
                }}
              >
                {hoveredRecId === rec._id ? (
                  <video
                    src={rec.videoUrl}
                    className="w-32 h-20 object-cover rounded-l-lg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ background: '#000', height: '5rem' }}
                  />
                ) : (
                  <SimilarContentThumbnail
                    video={rec}
                    source="similar"
                    userId={null}
                    sessionId={window.sessionStorage.getItem('sessionId') || undefined}
                    className={`w-32 h-20 object-cover ${rec.title && rec.title.length > 40 ? 'rounded-tl-lg rounded-bl-none' : 'rounded-l-lg'}`}
                  />
                )}
                <div className="flex flex-col flex-1 min-w-0 p-2 justify-start">
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
