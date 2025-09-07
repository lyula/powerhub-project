import React, { useState, useEffect, useRef, useCallback } from "react"; // 1. Import useCallback
import { useAuth } from "../context/AuthContext";
import { Link, useParams, useNavigate } from "react-router-dom"; // 2. Import useNavigate
import VideoComments from "../components/VideoComments";
import VideoInteractions from "../components/VideoInteractions";
import DescriptionWithReadMore from "./DescriptionWithReadMore";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MobileHeader from "../components/MobileHeader";
import { VideoCameraIcon } from "../components/icons";
import SubscribeButton from "../components/SubscribeButton";
import ProgressBar from "../components/ProgressBar";
import SimilarContentThumbnail from "../components/SimilarContentThumbnail";
import WatchPageSkeleton from "../components/WatchPageSkeleton";
import { trackVideoWatch } from "../utils/analytics";

// Add hide-scrollbar styles to the Watch page
<style jsx>{`
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`}</style>

// Helper functions (no changes needed here)
function getTotalCommentCount(comments) {
  if (!comments || !Array.isArray(comments)) return 0;
  let total = comments.length;
  comments.forEach((comment) => {
    if (comment.replies && Array.isArray(comment.replies)) {
      total += comment.replies.length;
    }
  });
  return total;
}

function formatPostedAgo(dateString) {
  if (!dateString) return "";
  const posted = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - posted) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return posted.toLocaleDateString();
}

export default function Watch() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate(); // 3. Initialize useNavigate
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [disliked, setDisliked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [channelDetails, setChannelDetails] = useState(null);
  // 4. Removed unused state variables: hoveredRecId and progressLoading
  const commentsRef = useRef(null);
  const videoRef = useRef(null);
  const watchStartTime = useRef(null);
  const totalWatchTime = useRef(0);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!user || !token || !video) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/videos/saved`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const savedVideos = await res.json();
          setIsSaved(
            savedVideos.some((savedVid) => savedVid._id === video._id)
          );
        }
      } catch (error) {
        console.error("Failed to check saved status:", error);
      }
    };
    checkSavedStatus();
  }, [video, user, token]);

  const handleSave = async () => {
    if (!user || !token || saveLoading) return;
    setSaveLoading(true);
    const endpoint = isSaved ? "unsave" : "save";
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/videos/${id}/${endpoint}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setIsSaved(!isSaved);
      } else {
        const errorData = await res.json();
        console.error(`Failed to ${endpoint} video:`, errorData.message);
      }
    } catch (error) {
      console.error(`Error during video ${endpoint}:`, error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleVideoPlay = () => (watchStartTime.current = Date.now());
  const handleVideoPause = () => {
    if (watchStartTime.current) {
      totalWatchTime.current +=
        (Date.now() - watchStartTime.current) / 1000 / 60;
      watchStartTime.current = null;
    }
  };
  const handleVideoEnded = () => {
    handleVideoPause();
    if (totalWatchTime.current > 0 && video?._id) {
      trackVideoWatch(video._id, Math.round(totalWatchTime.current));
    }
  };

  useEffect(() => {
    return () => {
      if (totalWatchTime.current > 0 && video?._id) {
        trackVideoWatch(video._id, Math.round(totalWatchTime.current));
      }
    };
  }, [video?._id]);

  // 5. Wrapped fetch logic in useCallback to create a stable function reference
  const fetchVideoAndRecommendations = useCallback(
    async (videoId) => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/videos/${videoId}`);
        if (res.ok) {
          const data = await res.json();
          setVideo(data);
          setLikeCount(data.likes?.length || 0);
          setDislikeCount(data.dislikes?.length || 0);
          if (user) {
            setLiked(
              data.likes.some((like) => like.user?.toString() === user._id)
            );
            setDisliked(data.dislikes.some((id) => id.toString() === user._id));
          }
          if (data.channel?._id) {
            const channelRes = await fetch(
              `${apiUrl}/channel/${data.channel._id}`
            );
            if (channelRes.ok) setChannelDetails(await channelRes.json());
          }
          const allVideosRes = await fetch(`${apiUrl}/videos`);
          if (allVideosRes.ok) {
            const allVideos = await allVideosRes.json();
            setRecommendations(
              allVideos.filter((v) => v._id !== videoId).slice(0, 10)
            );
          }
        } else {
          setVideo(null);
        }
      } catch (err) {
        console.error("Failed to fetch video and recommendations:", err); // 6. Used 'err' variable
        setVideo(null);
      } finally {
        setLoading(false);
      }
    },
    [user]
  ); // Dependency for useCallback

  useEffect(() => {
    fetchVideoAndRecommendations(id);
    const sendView = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/videos/${id}/view`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Failed to send view:", err); // 6. Used 'err' variable
      }
    };
    sendView();
  }, [id, fetchVideoAndRecommendations]); // 7. Added fetchVideoAndRecommendations to dependency array

  useEffect(() => {
    if (video && Array.isArray(video.comments)) {
      setCommentCount(getTotalCommentCount(video.comments));
    }
  }, [video]);

  const handleLike = async () => {
    const endpoint = liked ? "unlike" : "like";
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/videos/${id}/${endpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      const updated = await res.json();
      setLiked(
        updated.likes.some((like) => like.user?.toString() === user._id)
      );
      setLikeCount(updated.likes.length);
      setDisliked(updated.dislikes.some((id) => id.toString() === user._id));
      setDislikeCount(updated.dislikes.length);
    }
  };

  const handleDislike = async () => {
    const endpoint = disliked ? "undislike" : "dislike";
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/videos/${id}/${endpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      const updated = await res.json();
      setDisliked(updated.dislikes.some((id) => id.toString() === user._id));
      setDislikeCount(updated.dislikes.length);
      setLiked(
        updated.likes.some((like) => like.user?.toString() === user._id)
      );
      setLikeCount(updated.likes.length);
    }
  };

  if (loading) {
    return (
      <WatchPageSkeleton 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />
    );
  }

  if (!video) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#181818]">
        Video not found.
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818] hide-scrollbar">
        <div className="hidden md:block w-full fixed top-0 left-0 z-40">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        <div className="flex flex-col md:flex-row pt-0 md:pt-14">
          <div className={`hidden md:block fixed top-14 left-0 z-30 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'}`}>
            <Sidebar collapsed={!sidebarOpen} />
          </div>
          <div className={`${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} flex-1 p-4 flex flex-col items-center`}>
            <video
              ref={videoRef}
              src={video.videoUrl}
              controls
              controlsList="nodownload"
              autoPlay
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoEnded}
              className="w-full max-w-full aspect-video rounded-lg shadow-lg mb-2"
              style={{ border: "none" }}
            />
            <div className="w-full max-w-3xl mt-2 flex flex-col gap-2 items-start" style={{paddingLeft:0, marginLeft:0}}>
              <h1
                className="text-2xl font-bold text-black dark:text-white leading-tight mb-0 truncate block max-w-full text-left"
                title={video.title}
                style={{paddingLeft:0, marginLeft:0}}
              >
                {video.title}
              </h1>
              <div className="flex items-center gap-3 mb-2" style={{paddingLeft:0, marginLeft:0}}>
                <Link
                  to={`/channel/${video.channel?._id || video.channel}`}
                  className="flex items-center gap-2 min-w-0"
                  style={{paddingLeft:0, marginLeft:0}}
                >
                  <img
                    src={video.channel?.avatar}
                    alt={video.channel?.name}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700"
                  />
                  <span
                    className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px] text-left"
                    title={video.channel?.name}
                    style={{paddingLeft:0, marginLeft:0}}
                  >
                    {video.channel?.name}
                  </span>
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-left" style={{paddingLeft:0, marginLeft:0}}>
                  {video.viewCount || 0} views •{" "}
                  {formatPostedAgo(video.createdAt)}
                </span>
                {channelDetails && <SubscribeButton channel={channelDetails} />}
              </div>
              <div style={{paddingLeft:0, marginLeft:0}}>
                <VideoInteractions
                  liked={liked}
                  setLiked={setLiked}
                  likeCount={likeCount}
                  disliked={disliked}
                  setDisliked={setDisliked}
                  dislikeCount={dislikeCount}
                  showComments={showComments}
                  setShowComments={setShowComments}
                  commentCount={commentCount}
                  videoUrl={`${window.location.origin}/watch/${video._id}`}
                  shareCount={video.shareCount || 0}
                  handleLike={handleLike}
                  handleDislike={handleDislike}
                  videoId={video._id}
                  videoTitle={video.title}
                  isSaved={isSaved}
                  handleSave={handleSave}
                />
              </div>
              {video.description && !showComments && (
                <div style={{paddingLeft:0, marginLeft:0}}>
                  <DescriptionWithReadMore description={video.description} />
                </div>
              )}
              {showComments && (
                <div ref={commentsRef} style={{paddingLeft:0, marginLeft:0}}>
                  <VideoComments videoId={video._id} channel={channelDetails} />
                </div>
              )}
            </div>
          </div>
          <aside className="w-full md:w-96 p-4 bg-transparent flex flex-col gap-4 hide-scrollbar">
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">
              Similar Content
            </h2>
            {recommendations.map((rec) => (
              <div
                key={rec._id}
                className="flex gap-0 items-start bg-white dark:bg-[#222] rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] transition"
                onClick={() => navigate(`/watch/${rec._id}`)}
              >
                <SimilarContentThumbnail video={rec} source="similar" />
                <div className="flex flex-col flex-1 min-w-0 p-2 justify-start">
                  <h3 className="text-base font-semibold text-black dark:text-white line-clamp-2 mb-1">
                    {rec.title}
                  </h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                    {rec.channel?.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {rec.viewCount || 0} views
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
