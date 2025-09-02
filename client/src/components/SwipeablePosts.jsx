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
  const commentsCount = typeof post.comments === 'number' ? post.comments : (Array.isArray(post.comments) ? post.comments.length : 0);
  const sharesCount = typeof post.shares === 'number' ? post.shares : (typeof post.shareCount === 'number' ? post.shareCount : 0);
  const postUrl = `${window.location.origin}/post/${post._id || post.id}`;

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


  return (
    <div
      className="min-w-[370px] max-w-[400px] h-[260px] bg-white dark:bg-[#222] rounded-lg shadow-sm flex-shrink-0 border border-gray-200 dark:border-gray-700 flex flex-col justify-between font-sans"
      style={{ fontFamily: 'Roboto, Arial, sans-serif' }}
    >
      <div className="flex flex-row items-start px-4 pt-3 pb-2 gap-3 flex-1 relative">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <img src={post.author?.profilePicture || '/default-avatar.png'} alt={post.author?.username || 'User'} className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-700" />
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
            />
          </div>
        ) : null}
      </div>
      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <button
            className={`flex items-center gap-1 ${liked ? 'text-pink-500' : 'text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc]'}`}
            onClick={handleLike}
            disabled={!userId || !token}
            title={!userId || !token ? 'Login to like posts' : liked ? 'Unlike' : 'Like'}
          >
            {liked ? <FaHeart className="text-[20px]" /> : <FaRegHeart className="text-[20px]" />}
            <span className="text-xs font-medium">{formatCount(likeCount)}</span>
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <button className="text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc] flex items-center gap-1">
            <FaRegCommentDots className="text-[20px]" />
            <span className="text-xs font-medium">{formatCount(commentsCount)}</span>
          </button>
          <button className="text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc] flex items-center gap-1" onClick={() => setShareOpen(true)} title="Share post">
            <FaShare className="text-[20px]" />
            <span className="text-xs font-medium">{formatCount(sharesCount)}</span>
          </button>
        </div>
        <SharePostModal open={shareOpen} onClose={() => setShareOpen(false)} postUrl={postUrl} />
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

export default SwipeablePosts;