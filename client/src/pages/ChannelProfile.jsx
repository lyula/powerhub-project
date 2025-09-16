import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import ChannelActions from '../components/ChannelActions';
import Sidebar from '../components/Sidebar';
import SubscribeButton from '../components/SubscribeButton';
import AboutChannelModal from '../components/AboutChannelModal';
import ProgressBar from '../components/ProgressBar';
import { FaGithub, FaEnvelope, FaWhatsapp, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { MdMoreVert, MdEdit, MdDelete } from 'react-icons/md';
import { colors } from '../theme/colors';
import ChannelProfileThumbnail from '../components/ChannelProfileThumbnail';
import { useImpression } from '../hooks/useImpression';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  // Modal for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVideoDeleteModal, setShowVideoDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [openVideoMenuId, setOpenVideoMenuId] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  // Video grid state for hover and thumb
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [showThumbArr, setShowThumbArr] = useState([]);
  const videoRefs = useRef([]);
  const [durations, setDurations] = useState([]);
  // Remove impressionRefs from ChannelProfile; useImpression should only be called inside ChannelProfileThumbnail
  const [aboutOpen, setAboutOpen] = useState(false);
  // Sidebar expand/collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const handleToggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  // Redirect to channel setup if user is viewing their own channel and has no channel
  React.useEffect(() => {
    if (!loading && user && author === user._id && !channel) {
      navigate('/channel-setup');
    }
  }, [loading, user, author, channel, navigate]);

  const handleEditChannel = () => {
    // Navigate to ChannelSetup with channel data
    navigate(`/channel-setup?edit=true`, { state: { channel } });
  };
  const handleDeleteChannel = async () => {
    setShowDeleteModal(false);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/channel/${channel._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        navigate('/home');
      } else {
        toast.error('Failed to delete channel.');
      }
    } catch (err) {
      toast.error('Error deleting channel.');
    }
  };

  const handleEditVideo = (videoId) => {
    setOpenVideoMenuId(null);
    navigate(`/edit-video/${videoId}`);
  };

  const handleDeleteVideo = (video) => {
    setVideoToDelete(video);
    setShowVideoDeleteModal(true);
    setOpenVideoMenuId(null);
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/videos/${videoToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        // Remove the video from the channel's videos array
        setChannel(prev => ({
          ...prev,
          videos: prev.videos.filter(v => v._id !== videoToDelete._id)
        }));
        setShowVideoDeleteModal(false);
        setVideoToDelete(null);
        toast.success('Video deleted successfully!');
      } else {
        toast.error('Failed to delete video.');
      }
    } catch (err) {
      toast.error('Error deleting video.');
    }
  };

  const isOwner = user && channel && user._id === channel.owner;

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openVideoMenuId) {
        setOpenVideoMenuId(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openVideoMenuId]);

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
    // Skeleton UI for channel loading with ProgressBar
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818]">
        <ProgressBar loading={true} />
        <Header onToggleSidebar={handleToggleSidebar} />
        <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <Sidebar collapsed={sidebarCollapsed} />
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
      <ProgressBar loading={progressLoading} />
      <Header onToggleSidebar={handleToggleSidebar} />
      <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div
          className="flex-1 flex flex-col items-stretch px-0 md:px-8 py-0 overflow-y-auto hide-scrollbar"
          style={{ maxHeight: 'calc(100vh - 56px)', position: 'relative' }}
        >
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none !important; }
            .hide-scrollbar { scrollbar-width: none !important; -ms-overflow-style: none !important; }
          `}</style>
          {/* Banner styled like YouTube */}
          <div className="w-full h-56 md:h-72 lg:h-80 relative bg-black mb-0 mt-6">
            <img src={channel.banner} alt="Channel Banner" className="w-full h-full rounded-lg object-cover bg-black" style={{ objectPosition: 'center' }} />
            {/* Three dots menu for channel owner - top right of banner */}
            {user && channel && user._id === channel.owner && (
              <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 30 }}>
                <ChannelActions
                  onEdit={handleEditChannel}
                  onDelete={() => setShowDeleteModal(true)}
                />
              </div>
            )}
            <div className="absolute left-8 bottom-[-48px] flex items-end">
              <img src={channel.avatar} alt="Channel Avatar" className="w-28 h-28 rounded-full border-4 border-white dark:border-[#222] shadow-lg" />
            </div>
          {/* Delete confirmation modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4 text-red-600">Delete Channel?</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete your channel? This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={handleDeleteChannel}>Delete</button>
                </div>
              </div>
            </div>
          )}

          {/* Video delete confirmation modal */}
          {showVideoDeleteModal && videoToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4 text-red-600">Delete Video?</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete "{videoToDelete.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button 
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200" 
                    onClick={() => {
                      setShowVideoDeleteModal(false);
                      setVideoToDelete(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 rounded bg-red-600 text-white" 
                    onClick={confirmDeleteVideo}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
          {/* About this channel link below the banner */}
          <div className="w-full flex flex-col md:flex-row justify-end items-end gap-2 md:gap-4 px-8 mt-2 mb-2 text-right">
            <button
              type="button"
              className="text-[#0bb6bc] font-semibold hover:underline bg-transparent border-none p-0 m-0 order-1 md:order-none"
              onClick={() => setAboutOpen(true)}
              style={{ width: '100%', textAlign: 'right' }}
            >
              About this channel
            </button>
            <div className="flex flex-row md:flex-row flex-wrap md:flex-nowrap justify-end items-center gap-3 w-full md:w-auto order-2 md:order-none">
              {channel.contactInfo?.github && (
                <a href={channel.contactInfo.github}
                  className="icon-link"
                  title="GitHub"
                  style={{ fontSize: '1.5em', color: 'var(--icon-color, #888)' }}
                  onMouseEnter={e => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--icon-color, #888)'}
                ><FaGithub /></a>
              )}
              {channel.contactInfo?.email && (
                <a href={`mailto:${channel.contactInfo.email}`}
                  className="icon-link"
                  title="Email"
                  style={{ fontSize: '1.5em', color: 'var(--icon-color, #888)' }}
                  onMouseEnter={e => e.currentTarget.style.color = colors.secondary}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--icon-color, #888)'}
                ><FaEnvelope /></a>
              )}
              {channel.contactInfo?.whatsapp && (
                <a href={`https://wa.me/${channel.contactInfo.whatsapp}`}
                  className="icon-link"
                  title="WhatsApp"
                  style={{ fontSize: '1.5em', color: 'var(--icon-color, #888)' }}
                  onMouseEnter={e => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--icon-color, #888)'}
                ><FaWhatsapp /></a>
              )}
              {channel.contactInfo?.instagram && (
                <a href={`https://instagram.com/${channel.contactInfo.instagram}`}
                  className="icon-link"
                  title="Instagram"
                  style={{ fontSize: '1.5em', color: 'var(--icon-color, #888)' }}
                  onMouseEnter={e => e.currentTarget.style.color = colors.secondary}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--icon-color, #888)'}
                ><FaInstagram /></a>
              )}
              {channel.contactInfo?.linkedin && (
                <a href={channel.contactInfo.linkedin}
                  className="icon-link"
                  title="LinkedIn"
                  style={{ fontSize: '1.5em', color: 'var(--icon-color, #888)' }}
                  onMouseEnter={e => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--icon-color, #888)'}
                ><FaLinkedin /></a>
              )}
            </div>
          </div>
          <AboutChannelModal
            open={aboutOpen}
            onClose={() => setAboutOpen(false)}
            description={channel?.description}
            dateJoined={channel?.dateJoined}
          />
          {/* Channel Info */}
          <div className="flex flex-col items-start px-8 pt-4 md:pt-16 pb-4 gap-2">
            <div className="flex flex-row items-center gap-4">
              <h1 className="text-xl md:text-2xl font-bold text-black dark:text-white mr-2">{channel.name}</h1>
              <SubscribeButton channel={channel} className="text-sm md:text-base px-3 py-1" />
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              Subscribers: {channel.subscribers ? channel.subscribers.length : 0}
            </div>
          </div>
          {/* Videos Grid styled like YouTube thumbnails */}
          <div className="px-2 md:px-8 pb-6">
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
                      style={{ minHeight: '180px', paddingBottom: '0.5rem' }}
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
                        // Immediately navigate to Watch page and let skeletons show
                        navigate(`/watch/${video._id}`, { state: { fromProfile: true } });
                      }}
                    >
                      <div className="relative" style={{ width: '100%', height: '180px' }}>
                        {(!showThumbArr[idx] || hoveredIdx === idx) ? (
                          <video
                            ref={videoRefs.current[idx]}
                            src={video.videoUrl}
                            poster={video.thumbnailUrl}
                            muted
                            controls={false}
                            className="w-full h-[180px] object-cover rounded-lg shadow-lg"
                            onClick={() => {
                              window.location.href = `/watch/${video._id}`;
                            }}
                          />
                        ) : (
                          <ChannelProfileThumbnail
                            video={video}
                            source="channel-profile"
                            userId={user?._id}
                            sessionId={window.sessionStorage.getItem('sessionId') || undefined}
                            className="w-full h-[180px] object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform"
                            onClick={() => {
                              window.location.href = `/watch/${video._id}`;
                            }}
                          />
                        )}
                        {video.duration && (
                          <span
                            className="absolute right-2 bottom-2 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded"
                            style={{ zIndex: 2, pointerEvents: 'none' }}
                          >
                            {formatDuration(video.duration)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-base font-semibold text-black dark:text-white truncate">{video.title}</div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
                        <div className="flex items-center gap-2">
                          <span>{video.viewCount || 0} views</span>
                          <span className="font-bold mx-1" style={{fontWeight:700, fontSize:'1.2em'}}>&bull;</span>
                          <span>{postedAgo}</span>
                        </div>
                        
                        {/* Three dots menu for video owner */}
                        {isOwner && (
                          <div className="relative">
                            <button
                              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenVideoMenuId(openVideoMenuId === video._id ? null : video._id);
                              }}
                            >
                              <MdMoreVert size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            
                            {/* Dropdown menu */}
                            {openVideoMenuId === video._id && (
                              <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 w-32 z-20">
                                <button
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditVideo(video._id);
                                  }}
                                >
                                  <MdEdit size={16} />
                                  Edit
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteVideo(video);
                                  }}
                                >
                                  <MdDelete size={16} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
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
