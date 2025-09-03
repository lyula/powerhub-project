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
import { FaChartBar } from 'react-icons/fa';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StudentUtility from '../components/StudentUtility';
import BottomTabs from '../components/BottomTabs';
import { useParams, useNavigate } from 'react-router-dom';
import { timeAgo } from '../utils/timeAgo';
import { useAuth } from '../context/AuthContext';
import ProfilePictureZoomModal from '../components/ProfilePictureZoomModal';

// Recursive comment/reply renderer
function CommentThread({ comments, postId, token, userId, onReply, replyingTo, replyText, setReplyText, handleAddReply, handleLike, handleLikeReply, onProfileClick }) {
  // Helper to count all replies and subreplies recursively
  function countReplies(replies) {
    let count = 0;
    function recurse(arr) {
      for (const r of arr) {
        count++;
        if (r.replies && r.replies.length > 0) recurse(r.replies);
      }
    }
    if (Array.isArray(replies)) recurse(replies);
    return count;
  }

  // State to track expanded replies per comment
  const [expandedReplies, setExpandedReplies] = useState({});
  const [shownReplies, setShownReplies] = useState({}); // how many replies to show per comment
  const REPLIES_BATCH = 3;

  const handleViewReplies = (commentId, total) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
    setShownReplies(prev => ({ ...prev, [commentId]: Math.min(REPLIES_BATCH, total) }));
  };
  const handleShowMoreReplies = (commentId, total) => {
    setShownReplies(prev => ({ ...prev, [commentId]: Math.min((prev[commentId] || REPLIES_BATCH) + REPLIES_BATCH, total) }));
  };
  const handleHideReplies = (commentId) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: false }));
    setShownReplies(prev => ({ ...prev, [commentId]: 0 }));
  };

  return (
    <div className="flex flex-col gap-2">
      {comments.map((comment) => {
        const totalReplies = countReplies(comment.replies || []);
        const isExpanded = expandedReplies[comment._id];
        const numToShow = shownReplies[comment._id] || 0;
        return (
          <div key={comment._id} className="py-2 px-0">
            <div className="flex items-center gap-2 mb-1">
              <img src={comment.author?.profilePicture || comment.author?.avatar || '/default-avatar.png'} alt={comment.author?.username || 'User'} className="w-7 h-7 rounded-full object-cover border border-gray-300 dark:border-gray-700 cursor-pointer" onClick={() => onProfileClick(comment.author)} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{comment.author?.username || 'Unknown'}</span>
              {comment.createdAt && (
                <span className="text-xs text-gray-400 ml-2">{timeAgo(comment.createdAt)}</span>
              )}
            </div>
            <span className="text-gray-800 dark:text-gray-200 text-sm block mb-1 pl-9">
              {comment.taggedUser ? <span className="text-[#0bb6bc] font-semibold mr-1">@{comment.taggedUser}</span> : null}
              {comment.content}
            </span>
            <div className="flex gap-4 items-center mt-1 pl-9">
              <button className={`text-xs flex items-center ${Array.isArray(comment.likes) && comment.likes.includes(userId) ? 'text-pink-500' : 'text-gray-500'} hover:text-pink-500 font-medium px-2 py-1 rounded transition`} onClick={() => handleLike(comment._id, Array.isArray(comment.likes) && comment.likes.includes(userId))}>
                <svg xmlns="http://www.w3.org/2000/svg" fill={Array.isArray(comment.likes) && comment.likes.includes(userId) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
                <span className="ml-1">{Array.isArray(comment.likes) ? comment.likes.length : 0}</span>
              </button>
              <button className="text-xs text-gray-500 hover:text-[#0bb6bc] font-medium px-2 py-1 rounded transition" onClick={() => onReply(comment._id, null, comment.author?.username)}>
                Reply
              </button>
            </div>
            {replyingTo && replyingTo.commentId === comment._id && !replyingTo.replyId && (
              <form onSubmit={e => handleAddReply(e, comment._id, null, comment.author?.username)} className="flex gap-2 mt-2 ml-9">
                <input type="text" className="flex-1 rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#0bb6bc]" placeholder={`Reply to @${replyingTo.taggedUser || comment.author?.username}...`} value={replyText} onChange={e => setReplyText(e.target.value)} />
                {replyText.trim() && (
                  <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Reply</button>
                )}
              </form>
            )}
            {/* Replies section: show view/hide link and replies batch */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-2 flex flex-col gap-2">
                {!isExpanded ? (
                  <button className="text-xs text-blue-500 hover:underline w-fit" onClick={() => handleViewReplies(comment._id, totalReplies)}>
                    View replies ({totalReplies})
                  </button>
                ) : (
                  <>
                    {comment.replies.slice(0, numToShow).map(reply => (
                      <div key={reply._id} className="py-2 px-0">
                        <div className="flex items-center gap-2 mb-1">
                          <img src={reply.author?.profilePicture || reply.author?.avatar || '/default-avatar.png'} alt={reply.author?.username || 'User'} className="w-7 h-7 rounded-full object-cover border border-gray-300 dark:border-gray-700 cursor-pointer" onClick={() => onProfileClick(reply.author)} />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{reply.author?.username || 'Unknown'}</span>
                          {reply.createdAt && (
                            <span className="text-xs text-gray-400 ml-2">{timeAgo(reply.createdAt)}</span>
                          )}
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 text-sm block mb-1 pl-9">
                          {reply.taggedUser ? <span className="text-[#0bb6bc] font-semibold mr-1">@{reply.taggedUser}</span> : null}
                          {reply.content}
                        </span>
                        <div className="flex gap-4 items-center mt-1 pl-9">
                          <button className={`text-xs flex items-center ${Array.isArray(reply.likes) && reply.likes.includes(userId) ? 'text-pink-500' : 'text-gray-500'} hover:text-pink-500 font-medium px-2 py-1 rounded transition`} onClick={() => handleLikeReply(reply._id, comment._id, Array.isArray(reply.likes) && reply.likes.includes(userId))}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill={Array.isArray(reply.likes) && reply.likes.includes(userId) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                            </svg>
                            <span className="ml-1">{Array.isArray(reply.likes) ? reply.likes.length : 0}</span>
                          </button>
                          <button className="text-xs text-gray-500 hover:text-[#0bb6bc] font-medium px-2 py-1 rounded transition" onClick={() => onReply(comment._id, reply._id, reply.author?.username)}>
                            Reply
                          </button>
                        </div>
                        {replyingTo && replyingTo.commentId === comment._id && replyingTo.replyId === reply._id && (
                          <form onSubmit={e => handleAddReply(e, comment._id, reply._id, reply.author?.username)} className="flex gap-2 mt-2 ml-9">
                            <input type="text" className="flex-1 rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#0bb6bc]" placeholder={`Reply to @${replyingTo.taggedUser || reply.author?.username}...`} value={replyText} onChange={e => setReplyText(e.target.value)} />
                            {replyText.trim() && (
                              <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Reply</button>
                            )}
                          </form>
                        )}
                        {/* Recursively render deeper replies if present */}
                        {reply.replies && reply.replies.length > 0 && (
                          <div className="ml-8 mt-2 flex flex-col gap-2">
                            <CommentThread
                              comments={reply.replies}
                              postId={postId}
                              token={token}
                              userId={userId}
                              handleLike={handleLike}
                              handleLikeReply={handleLikeReply}
                              onReply={onReply}
                              replyingTo={replyingTo}
                              replyText={replyText}
                              setReplyText={setReplyText}
                              handleAddReply={handleAddReply}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Show more/hide buttons */}
                    {numToShow < totalReplies && (
                      <button className="text-xs text-blue-500 hover:underline w-fit" onClick={() => handleShowMoreReplies(comment._id, totalReplies)}>
                        Show more replies
                      </button>
                    )}
                    <button className="text-xs text-gray-500 hover:underline w-fit" onClick={() => handleHideReplies(comment._id)}>
                      Hide replies
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const PostDetails = () => {
  // Profile modal state
  const hasIncrementedView = React.useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ profilePicture: '', channelName: '', socialLinks: {}, hasChannel: false, authorId: '' });

  // Helper to open modal with profile picture and channel info
  const handleProfileClick = async (author) => {
    if (!author) return;
    setModalData({
      profilePicture: author.profilePicture || author.avatar || '/default-avatar.png',
      channelName: author.username || '',
      socialLinks: {},
      hasChannel: false,
      authorId: author._id || author.id || ''
    });
    // Fetch channel info if author has a channel
    if (author._id || author.id) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/channel/by-owner/${author._id || author.id}`);
        if (res.ok) {
          const data = await res.json();
          let hasChannel = false;
          let channelName = author.username || '';
          let socialLinks = {};
          if (data && data._id) {
            hasChannel = true;
            channelName = data.name || channelName;
            socialLinks = data.socialLinks || {};
          } else if (data.channel && data.channel._id) {
            hasChannel = true;
            channelName = data.channel.name || channelName;
            socialLinks = data.channel.socialLinks || {};
          }
          setModalData(prev => ({
            ...prev,
            hasChannel,
            channelName,
            socialLinks
          }));
        }
      } catch {}
    }
    setModalOpen(true);
  };
  // Reply state for comments
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Handler to show reply input
  const handleReply = (commentId, replyId, taggedUser) => {
    setReplyingTo({ commentId, replyId, taggedUser });
    setReplyText('');
  };

  // Handler to add reply
  const handleAddReply = async (e, commentId, replyId, taggedUser) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ commentId, content: replyText, taggedUser })
      });
      if (!res.ok) throw new Error('Failed to add reply');
      const data = await res.json();
      // Update replies in state (recursive update)
      setPost(prev => ({
        ...prev,
        comments: prev.comments.map(c =>
          c._id === commentId
            ? { ...c, replies: data }
            : c
        )
      }));
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      // Optionally handle error
    }
  };
  // Like a comment
  const handleLike = async (commentId, liked) => {
    try {
      const endpoint = liked
        ? `${import.meta.env.VITE_API_URL}/posts/${postId}/comment/unlike`
        : `${import.meta.env.VITE_API_URL}/posts/${postId}/comment/like`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ commentId })
      });
      if (!res.ok) throw new Error('Failed to like/unlike comment');
      const data = await res.json();
      setPost(prev => ({
        ...prev,
        comments: prev.comments.map(c =>
          c._id === commentId ? { ...c, likes: data.likes } : c
        )
      }));
    } catch (err) {
      // Optionally handle error
    }
  };

  // Like a reply
  const handleLikeReply = async (replyId, commentId, liked) => {
    try {
      const endpoint = liked
        ? `${import.meta.env.VITE_API_URL}/posts/${postId}/comment/reply/unlike`
        : `${import.meta.env.VITE_API_URL}/posts/${postId}/comment/reply/like`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ commentId, replyId })
      });
      if (!res.ok) throw new Error('Failed to like/unlike reply');
      const data = await res.json();
      function updateReplies(replies) {
        return replies.map(r =>
          r._id === replyId ? { ...r, likes: data.likes } :
          r.replies ? { ...r, replies: updateReplies(r.replies) } : r
        );
      }
      setPost(prev => ({
        ...prev,
        comments: prev.comments.map(c =>
          c.replies ? { ...c, replies: updateReplies(c.replies) } : c
        )
      }));
    } catch (err) {
      // Optionally handle error
    }
  };
  // Auth context for token
  const { token, user } = useAuth();
  // Comment input state
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const { postId } = useParams();
  const location = typeof window !== 'undefined' && window.location && window.location.state ? window.location : null;
  const [post, setPost] = useState(() => {
    // Try to get post from route state
    if (location && location.state && location.state.post) {
      return location.state.post;
    }
    // Fallback: try localStorage
    const localPost = localStorage.getItem('postDetailsData');
    if (localPost) {
      try {
        return JSON.parse(localPost);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(!post);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only run on mount or postId change
    const fetchPost = async () => {
      setLoading(true);
      setError('');
      try {
        // If post is not present, fetch only
        const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}`);
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        setPost(data.post || data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    if (!post) {
      fetchPost();
    } else {
      setLoading(false);
    }
    localStorage.removeItem('postDetailsData');
    // eslint-disable-next-line
  }, [postId]);

  // Sidebar expand/collapse logic
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  const navigate = useNavigate();

  return (
    <React.Fragment>
      <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}>
        <HeaderFixed onToggleSidebar={handleToggleSidebar} />
  <div className="flex flex-row w-full" style={{ height: '100vh', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <SidebarFixed sidebarOpen={sidebarOpen} />
          {!sidebarOpen && (
            <div className="md:ml-20">
              <StudentUtility />
            </div>
          )}
          <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
            <main className="flex-1 p-4 md:p-8 pb-0 overflow-y-auto w-full" style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none', marginTop: '3.5rem' }}>
              {/* ...existing code... */}
              {loading ? (
                <div className="text-gray-500 dark:text-gray-400 px-4 py-6">Loading post...</div>
              ) : error ? (
                <div className="text-red-500 px-4 py-6">{error}</div>
              ) : post ? (
                <div className="bg-white dark:bg-[#181818] rounded-lg shadow-md overflow-hidden flex flex-col min-w-0 w-full border border-gray-200 dark:border-gray-700" style={{ maxWidth: '100%', minWidth: 0, fontSize: '1.05em', padding: '0.5em', marginBottom: '0.75em' }}>
                  <div className="p-3 flex items-start gap-3">
                    <button
                      onClick={() => {
                        sessionStorage.setItem('homeFeedScroll', window.scrollY);
                        navigate(-1);
                      }}
                      className="mr-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-700"
                      aria-label="Go back"
                      style={{ minWidth: '32px', minHeight: '32px', maxWidth: '32px', maxHeight: '32px', marginRight: '8px' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700 dark:text-gray-200">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <img src={post.author?.profilePicture || post.author?.avatar || post.author?.profile || '/default-avatar.png'} alt={post.author?.username || 'User'} className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0" style={{ width: '48px', height: '48px', objectFit: 'cover', aspectRatio: '1/1', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px' }} />
                    <div className="flex flex-col min-w-0" style={{ flex: 1, minWidth: 0 }}>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{post.author?.username || 'Unknown'}</span>
                      {post.createdAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{timeAgo(post.createdAt)}</span>
                      )}
                      <span className="text-xs text-[#c42152] font-semibold">{post.specialization}</span>
                    </div>
                    {/* Views icon and count */}
                  </div>
                  {post.images && post.images.length > 0 && (
                    <>
                      {post.images.length === 1 ? (
                        <div className="w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-[#222] py-4">
                          <img
                            src={post.images[0]}
                            alt={post.content}
                            className="max-w-xs w-full rounded-lg shadow cursor-pointer"
                            style={{ maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                            onClick={() => window.open(post.images[0], '_blank')}
                          />
                        </div>
                      ) : (
                        <div className="w-full flex flex-row items-start gap-3 bg-gray-100 dark:bg-[#222] py-4">
                          {post.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={post.content}
                              className="max-w-xs w-full rounded-lg shadow cursor-pointer"
                              style={{ maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                              onClick={() => window.open(img, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  <div className="p-4 pt-3 text-gray-900 dark:text-gray-100 text-base">
                    {post.content}
                    {post.link && (
                      <div className="mt-2">
                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-[#0bb6bc] underline">View Link</a>
                      </div>
                    )}
                  </div>
                  {/* Comments section */}
                  <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-black dark:text-white">
                        Comments ({countAllComments(post.comments)})
                      </h3>
                      <div className="flex items-center gap-1">
                        <FaChartBar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{post.viewCount ?? (Array.isArray(post.views) ? post.views.length : 0)}</span>
                      </div>
                    </div>
                    {/* Comments input for engagement */}
                    <div className="mb-4">
                      <form
                        className="flex items-center gap-2"
                        onSubmit={async e => {
                          e.preventDefault();
                          if (!commentInput.trim()) return;
                          setCommentLoading(true);
                          setCommentError('');
                          try {
                            const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                              },
                              body: JSON.stringify({ text: commentInput })
                            });
                            if (!res.ok) throw new Error('Failed to post comment');
                            const data = await res.json();
                            // Update comments list
                            setPost(prev => ({ ...prev, comments: [data.comment, ...(prev.comments || [])] }));
                            setCommentInput('');
                          } catch (err) {
                            setCommentError(err.message || 'Failed to post comment');
                          }
                          setCommentLoading(false);
                        }}
                      >
                        <input
                          type="text"
                          value={commentInput}
                          onChange={e => setCommentInput(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 rounded-lg border-0 bg-white dark:bg-[#222] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0bb6bc]"
                          disabled={commentLoading}
                        />
                        {commentInput.trim() && (
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-[#0bb6bc] text-white font-semibold hover:bg-[#099ca1] transition"
                            disabled={commentLoading}
                          >
                            {commentLoading ? 'Posting...' : 'Post'}
                          </button>
                        )}
                    {commentError && <div className="text-red-500 text-sm mb-2">{commentError}</div>}
                      </form>
                    </div>
                    {Array.isArray(post.comments) && post.comments.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        <CommentThread
                          comments={post.comments}
                          postId={postId}
                          token={token}
                          userId={user?._id}
                          handleLike={handleLike}
                          handleLikeReply={handleLikeReply}
                          onReply={handleReply}
                          replyingTo={replyingTo}
                          replyText={replyText}
                          setReplyText={setReplyText}
                          handleAddReply={handleAddReply}
                          onProfileClick={handleProfileClick}
                        />
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">No comments yet.</div>
                    )}
                  </div>
                </div>
              ) : null}
            </main>
          </div>
        </div>
  <BottomTabs />
      </div>
    {modalOpen && (
      <ProfilePictureZoomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profilePicture={modalData.profilePicture}
        channelName={modalData.channelName}
        socialLinks={modalData.socialLinks}
        hasChannel={modalData.hasChannel}
        onViewChannel={() => {
          if (modalData.authorId && modalData.hasChannel) {
            window.open(`/channel/${modalData.authorId}`, '_blank');
            setModalOpen(false);
          }
        }}
      />
    )}
    </React.Fragment>
  );
}

function HeaderFixed({ onToggleSidebar }) {
  return (
    <div className="fixed top-0 left-0 w-full z-40" style={{ height: '44px' }}>
      <Header onToggleSidebar={onToggleSidebar} />
    </div>
  );
}

function SidebarFixed({ sidebarOpen }) {
  return (
    <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent md:block`}>
      <Sidebar collapsed={!sidebarOpen} />
    </div>
  );
}

export default PostDetails;

// Helper to format relative time (e.g., '2 hours ago')
function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000); // seconds
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}
