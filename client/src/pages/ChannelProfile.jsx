import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SubscribeButton from '../components/SubscribeButton';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ChannelProfile() {
  const { user, token } = useAuth();
  const { author } = useParams();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  // Video grid state for hover and thumb
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [showThumbArr, setShowThumbArr] = useState([]);
  const videoRefs = useRef([]);
  const [durations, setDurations] = useState([]);

  useEffect(() => {
    const fetchChannel = async () => {
      if (!author) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/channel/${author}`);
        if (response.ok) {
          const data = await response.json();
          setChannel(data);
          // Initialize thumb state and refs for videos
          if (Array.isArray(data.videos)) {
            setShowThumbArr(data.videos.map((_, idx) => idx === 0 ? false : true));
            videoRefs.current = data.videos.map(() => React.createRef());
            setDurations(data.videos.map(v => v.duration || null));
          }
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

  // Extract durations from video elements after metadata loads
  useEffect(() => {
    if (!channel || !Array.isArray(channel.videos)) return;
    const listeners = [];
    channel.videos.forEach((video, idx) => {
      const vidEl = videoRefs.current[idx]?.current;
      if (vidEl && (durations[idx] == null || isNaN(durations[idx]))) {
        const handler = () => {
          setDurations(durs => {
            const newArr = [...durs];
            newArr[idx] = vidEl.duration;
            return newArr;
          });
        };
        vidEl.addEventListener('loadedmetadata', handler);
        listeners.push({ vidEl, handler });
        // If metadata already loaded, set immediately
        if (vidEl.readyState >= 1 && vidEl.duration && !isNaN(vidEl.duration)) {
          setDurations(durs => {
            const newArr = [...durs];
            newArr[idx] = vidEl.duration;
            return newArr;
          });
        }
      }
    });
    return () => {
      listeners.forEach(({ vidEl, handler }) => {
        vidEl.removeEventListener('loadedmetadata', handler);
      });
    };
    // eslint-disable-next-line
  }, [channel, videoRefs, durations]);

  // First video: autoplay for 15s then show thumb
  useEffect(() => {
    if (channel && Array.isArray(channel.videos) && channel.videos.length > 0 && !showThumbArr[0] && videoRefs.current[0]?.current) {
      videoRefs.current[0].current.currentTime = 0;
      videoRefs.current[0].current.play();
      const timer = setTimeout(() => {
        videoRefs.current[0].current.pause();
        setShowThumbArr(arr => arr.map((v, idx) => idx === 0 ? true : v));
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [channel, showThumbArr]);

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
          {/* About this channel link below the banner */}
          <div className="w-full flex justify-end px-8 mt-2 mb-2">
            <a href="#about" className="text-[#0bb6bc] font-semibold">About this channel</a>
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
          {/* Videos Grid styled like YouTube thumbnails */}
          <div className="px-8 pb-6">
            {Array.isArray(channel.videos) && channel.videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {channel.videos.map((video, idx) => {
                  const postedAgo = (() => {
                    const posted = new Date(video.createdAt);
                    const now = new Date();
                    const diff = Math.floor((now - posted) / 1000);
                    if (diff < 60) return `${diff}s ago`;
                    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
                    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
                    if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
                    return posted.toLocaleDateString();
                  })();
                  const formattedDuration = formatDuration(durations[idx] || video.duration);
                  return (
                    <div
                      key={video._id}
                      className="relative group cursor-pointer"
                      style={{ minHeight: '220px' }}
                      onMouseEnter={() => {
                        // Pause all other videos and show their thumbnails
                        setHoveredIdx(idx);
                        setShowThumbArr(arr => arr.map((v, i) => i === idx ? false : true));
                        videoRefs.current.forEach((ref, i) => {
                          if (ref?.current && i !== idx) {
                            ref.current.pause();
                            ref.current.currentTime = 0;
                          }
                        });
                        if (videoRefs.current[idx]?.current) {
                          videoRefs.current[idx].current.currentTime = 0;
                          videoRefs.current[idx].current.play();
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredIdx(-1);
                        setShowThumbArr(arr => arr.map((v, i) => i === idx ? true : v));
                        if (videoRefs.current[idx]?.current) {
                          videoRefs.current[idx].current.pause();
                          videoRefs.current[idx].current.currentTime = 0;
                        }
                      }}
                      onClick={() => {
                        console.log('[ChannelProfile] Clicked video id:', video._id);
                        window.location.href = `/watch/${video._id}`;
                      }}
                    >
                      <div className="relative">
                          {(!showThumbArr[idx] || hoveredIdx === idx) ? (
                            <video
                              ref={videoRefs.current[idx]}
                              src={video.videoUrl}
                              poster={video.thumbnailUrl}
                              muted
                              controls={false}
                              className="w-full h-48 object-cover rounded-lg shadow-lg"
                              onClick={() => {
                                window.location.href = `/watch/${video._id}`;
                              }}
                            />
                          ) : (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform"
                              onClick={() => {
                                window.location.href = `/watch/${video._id}`;
                              }}
                            />
                          )}
                        {/* Hidden video for duration extraction */}
                        <video
                          ref={videoRefs.current[idx]}
                          src={video.videoUrl}
                          poster={video.thumbnailUrl}
                          muted
                          controls={false}
                          className="hidden"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {formattedDuration}
                        </div>
                      </div>
                      <div className="mt-2 text-base font-semibold text-black dark:text-white truncate">{video.title}</div>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mt-1 gap-2">
                        <span>{video.viewCount || 0} views</span>
                        <span className="font-bold mx-1" style={{fontWeight:700, fontSize:'1.2em'}}>&bull;</span>
                        <span>{postedAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-300">No videos yet.</div>
            )}
          </div>
          {/* About section, hidden by default, shown when link is clicked */}
          <div id="about" className="px-8 pb-6 hidden">
            <h2 className="text-xl font-bold mb-2 text-black dark:text-white">About this channel</h2>
            <p className="text-gray-700 dark:text-gray-200 text-base">{channel.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
