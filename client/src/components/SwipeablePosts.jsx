// Recursively count all comments, replies, and replies to replies
function countAllComments(comments) {
  let count = 0;
  function countRecursive(arr) {
    for (const item of arr) {
      count++;
      if (item.replies && item.replies.length > 0) {
        countRecursive(item.replies);
      }
    }
  }
  if (Array.isArray(comments)) countRecursive(comments);
  return count;
}
import React, { useEffect, useState } from 'react';
import SharePostModal from './SharePostModal';
import { useAuth } from '../context/AuthContext';
import { FaRegHeart, FaHeart, FaRegThumbsDown, FaThumbsDown, FaRegCommentDots, FaShare } from 'react-icons/fa';

// Fetch actual posts from backend

// ExpandablePostCard component for truncation and expand on tap
function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'm';
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return n;
}

const ExpandablePostCard = ({ post }) => {
  const [shareOpen, setShareOpen] = useState(false);
  const { user, token } = useAuth();
  const userId = user?._id;
  const [liked, setLiked] = React.useState(Array.isArray(post.likes) && userId ? post.likes.includes(userId) : false);
  const [likeCount, setLikeCount] = React.useState(Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0));
  const commentsCount = countAllComments(post.comments);
  const [sharesCount, setSharesCount] = useState(typeof post.shares === 'number' ? post.shares : (typeof post.shareCount === 'number' ? post.shareCount : 0));
  const postUrl = `${window.location.origin}/post/${post._id || post.id}`;

  // Profile picture modal logic
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    profilePicture: '',
    channelName: '',
    socialLinks: {},
    authorId: '',
    hasChannel: false
  });

  // Helper to open modal with profile picture and channel info (copied from VideoComments)
  const handleProfilePictureClick = async (author) => {
    const authorId = author._id || author.id;
    let hasChannel = false;
    if (authorId) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/channel/by-owner/${authorId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            hasChannel = true;
          }
        }
      } catch (err) {}
    }
    setModalData({
      profilePicture: author.profilePicture || author.avatar || author.profile || '/default-avatar.png',
      channelName: author.username || author.firstName || 'Unknown',
      socialLinks: author.socialLinks || {},
      authorId,
      hasChannel
    });
    setModalOpen(true);
  };

  const handleViewChannel = async () => {
    setModalOpen(false);
    if (modalData.authorId) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/channel/by-owner/${modalData.authorId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            window.location.href = `/channel/${data._id}`;
            return;
          }
        }
      } catch (err) {}
    }
  };

  const handleLike = () => {
    if (!userId || !token) return;
    if (!liked) {
      // Like post
      fetch(`${import.meta.env.VITE_API_URL}/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          setLiked(true);
          setLikeCount(data.likes || (likeCount + 1));
        });
    } else {
      // Unlike post
      fetch(`${import.meta.env.VITE_API_URL}/posts/${post._id}/unlike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          setLiked(false);
          setLikeCount(data.likes || (likeCount - 1));
        });
    }
  };

  // Navigation to post details
  const navigateToPostDetails = () => {
    // Save scroll position before navigating
    sessionStorage.setItem('homeFeedScroll', window.scrollY);
    // Use React Router navigation with state
    if (window && window.history && window.history.pushState) {
      window.history.pushState({}, '', `/post/${post._id || post.id}`);
      window.location.assign(`/post/${post._id || post.id}`);
    } else {
      window.location.href = `/post/${post._id || post.id}`;
    }
  };

  return (
    <div
      className="min-w-[370px] max-w-[400px] h-[260px] bg-white dark:bg-[#222] rounded-lg shadow-sm flex-shrink-0 border border-gray-200 dark:border-gray-700 flex flex-col justify-between font-sans cursor-pointer"
      style={{ fontFamily: 'Roboto, Arial, sans-serif' }}
      onClick={navigateToPostDetails}
    >
      <div className="flex flex-row items-start px-4 pt-3 pb-2 gap-3 flex-1 relative">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <img
              src={post.author?.profilePicture || post.author?.avatar || post.author?.profile || '/default-avatar.png'}
              alt={post.author?.username || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-700 cursor-pointer"
              onClick={e => { e.stopPropagation(); handleProfilePictureClick(post.author); }}
              title="View profile picture"
            />
            <span className="text-[18px] font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">{post.author?.username || 'Unknown'}</span>
          </div>
          <span
            className="text-[16px] text-gray-800 dark:text-gray-200 mb-1 leading-snug line-clamp-5"
            style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}
            title={post.content}
          >
            {post.content}
          </span>
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0bb6bc] dark:text-[#0bb6bc] font-medium underline hover:text-[#099ca1] text-[15px] mt-1"
              onClick={e => e.stopPropagation()}
            >
              Learn more
            </a>
          )}
        </div>
        {Array.isArray(post.images) && post.images.length > 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <img
              src={post.images[0]}
              alt={post.content?.slice(0, 20) || 'Post image'}
              className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ minWidth: '8rem', minHeight: '8rem' }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        ) : null}
      </div>
      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <button
            className={`flex items-center gap-1 ${liked ? 'text-pink-500' : 'text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc]'}`}
            onClick={e => { e.stopPropagation(); handleLike(); }}
            disabled={!userId || !token}
            title={!userId || !token ? 'Login to like posts' : liked ? 'Unlike' : 'Like'}
          >
            {liked ? <FaHeart className="text-[20px]" /> : <FaRegHeart className="text-[20px]" />}
            <span className="text-xs font-medium">{formatCount(likeCount)}</span>
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <button className="text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc] flex items-center gap-1" onClick={e => { e.stopPropagation(); navigateToPostDetails(); }}>
            <FaRegCommentDots className="text-[20px]" />
            <span className="text-xs font-medium">{formatCount(commentsCount)}</span>
          </button>
          <button className="text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc] flex items-center gap-1" onClick={e => { e.stopPropagation(); setShareOpen(true); }} title="Share post">
            <FaShare className="text-[20px]" />
            <span className="text-xs font-medium">{formatCount(sharesCount)}</span>
          </button>
        </div>
        <SharePostModal open={shareOpen} onClose={() => setShareOpen(false)} postUrl={postUrl} onShare={(newCount) => { if (typeof newCount === 'number') setSharesCount(newCount); }} />
        {/* Profile picture zoom modal */}
        {modalOpen && (
          <ProfilePictureZoomModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            profilePicture={modalData.profilePicture}
            channelName={modalData.channelName}
            socialLinks={modalData.socialLinks}
            hasChannel={modalData.hasChannel}
            onViewChannel={handleViewChannel}
          />
        )}
      </div>
    </div>
  );
};

const SwipeablePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  const data = await res.json();
  // If backend returns an array, use it directly; if object, use .posts
  setPosts(Array.isArray(data) ? data : (data.posts || []));
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <section className="w-full mt-2 mb-8">
      <h2 className="text-[1.25rem] font-medium font-sans mb-4 text-[#0bb6bc] dark:text-[#0bb6bc]">PowerHub Community posts</h2>
      {loading ? (
        <div className="text-gray-500 dark:text-gray-400 px-4 py-6">Loading posts...</div>
      ) : error ? (
        <div className="text-red-500 px-4 py-6">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 px-4 py-6">No posts found.</div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {posts.map(post => (
            <ExpandablePostCard key={post._id || post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
};

import ProfilePictureZoomModal from './ProfilePictureZoomModal';
export default SwipeablePosts;