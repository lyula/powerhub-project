import React, { useState, useEffect, useRef } from 'react';
import { FaChartBar } from 'react-icons/fa';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StudentUtility from '../components/StudentUtility';
import BottomTabs from '../components/BottomTabs';
import ProfilePictureZoomModal from '../components/ProfilePictureZoomModal';
import ConfirmationModal from '../components/ConfirmationModal';

// Helper to format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'just now';
  const posted = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - posted) / 1000);
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
};

// Helper to count all comments and replies (flattened structure)
const countAllComments = (comments) => {
  if (!comments || !Array.isArray(comments)) return 0;
  
  let total = comments.length; // Count the main comments
  
  // Add count of all replies
  comments.forEach(comment => {
    if (comment.replies && Array.isArray(comment.replies)) {
      total += comment.replies.length;
    }
  });
  
  return total;
};

// CommentThread component for rendering comments and replies
const CommentThread = ({ comments, postId, token, userId, onReply, replyingTo, replyText, setReplyText, handleAddReply, handleLike, handleLikeReply, onProfileClick, editingCommentId, editContent, setEditContent, handleEditComment, handleEditCommentSave, handleEditCommentCancel, editingReply, handleEditReply, handleEditReplySave, handleEditReplyCancel, handleDeleteComment, handleDeleteReply, autoExpandReplies, onRemoveAutoExpand }) => {
  const [expandedReplies, setExpandedReplies] = useState({});
  const [shownReplies, setShownReplies] = useState({});
  const REPLIES_BATCH = 3;

  // Auto-expand effect: when a comment is added to autoExpandReplies, set its state
  React.useEffect(() => {
    if (autoExpandReplies && autoExpandReplies.size > 0) {
      autoExpandReplies.forEach(commentId => {
        if (!expandedReplies[commentId]) {
          setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
          // Find the comment to get the total replies count
          const comment = comments.find(c => c._id === commentId);
          if (comment && comment.replies) {
            const totalReplies = countAllComments(comment.replies);
            setShownReplies(prev => ({ 
              ...prev, 
              [commentId]: Math.min(REPLIES_BATCH, totalReplies) 
            }));
          }
        }
      });
    }
  }, [autoExpandReplies, comments, expandedReplies]);

  const handleViewReplies = (commentId, total) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    setShownReplies((prev) => ({ ...prev, [commentId]: Math.min(REPLIES_BATCH, total) }));
  };

  const handleShowMoreReplies = (commentId, total) => {
    setShownReplies((prev) => ({ ...prev, [commentId]: Math.min((prev[commentId] || REPLIES_BATCH) + REPLIES_BATCH, total) }));
  };

  const handleHideReplies = (commentId) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: false }));
    setShownReplies((prev) => ({ ...prev, [commentId]: 0 }));
    // Remove from auto-expand set when manually collapsed
    if (onRemoveAutoExpand) {
      onRemoveAutoExpand(commentId);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {comments.map((comment) => {
        const totalReplies = countAllComments(comment.replies || []);
        const isExpanded = expandedReplies[comment._id];
        const numToShow = shownReplies[comment._id] || 0;
        const isAuthor = comment.author?._id === userId || comment.author?.id === userId;

        return (
          <div key={comment._id} className="py-2 px-0">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={comment.author?.profilePicture || comment.author?.avatar || '/default-avatar.png'}
                alt={comment.author?.username || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-gray-300 dark:border-gray-700 cursor-pointer"
                onClick={() => onProfileClick(comment.author)}
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{comment.author?.username || 'Unknown'}</span>
              {comment.createdAt && (
                <span className="text-xs text-gray-400 ml-2">{formatRelativeTime(comment.createdAt)}</span>
              )}
            </div>
            <div className="flex flex-col pl-9">
              <div className="text-gray-800 dark:text-gray-200 text-sm mb-1">
                {comment.taggedUser && <span className="text-[#0bb6bc] font-semibold mr-1">@{comment.taggedUser}</span>}
                {editingCommentId === comment._id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditCommentSave(comment._id);
                    }}
                    className="flex gap-2 mt-1"
                  >
                    <input
                      type="text"
                      className="flex-1 rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#0bb6bc]"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                      Save
                    </button>
                    <button
                      type="button"
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
                      onClick={handleEditCommentCancel}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  comment.content
                )}
              </div>
              <div className="flex gap-4 items-center mt-1">
                <button
                  className={`text-xs flex items-center ${
                    Array.isArray(comment.likes) && comment.likes.includes(userId) ? 'text-pink-500' : 'text-gray-500'
                  } hover:text-pink-500 font-medium px-2 py-1 rounded transition`}
                  onClick={() => handleLike(comment._id, Array.isArray(comment.likes) && comment.likes.includes(userId))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={Array.isArray(comment.likes) && comment.likes.includes(userId) ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 010-6.364z"
                    />
                  </svg>
                  <span className="ml-1">{Array.isArray(comment.likes) ? comment.likes.length : 0}</span>
                </button>
                <button
                  className="text-xs text-gray-500 hover:text-[#0bb6bc] font-medium px-2 py-1 rounded transition"
                  onClick={() => onReply(comment._id, null, comment.author?.username)}
                >
                  Reply
                </button>
                {isAuthor && (
                  <>
                    <button
                      className="text-xs text-blue-500 hover:underline ml-2"
                      onClick={() => handleEditComment(comment._id, comment.content)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs text-red-500 hover:underline ml-1"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            {replyingTo && replyingTo.commentId === comment._id && !replyingTo.replyId && (
              <form
                onSubmit={(e) => handleAddReply(e, comment._id, null, comment.author?.username)}
                className="flex gap-2 mt-2 ml-9"
              >
                <input
                  type="text"
                  className="flex-1 rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#0bb6bc]"
                  placeholder={`Reply to @${replyingTo.taggedUser || comment.author?.username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                {replyText.trim() && (
                  <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                    Reply
                  </button>
                )}
              </form>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-2 flex flex-col gap-2">
                {!isExpanded ? (
                  <button
                    className="text-xs text-blue-500 hover:underline w-fit"
                    onClick={() => handleViewReplies(comment._id, totalReplies)}
                  >
                    View replies ({totalReplies})
                  </button>
                ) : (
                  <>
                    {comment.replies.slice(0, numToShow).filter(reply => reply).map((reply) => (
                      <div key={reply._id} className="py-2 px-0">
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={reply.author?.profilePicture || reply.author?.avatar || '/default-avatar.png'}
                            alt={reply.author?.username || 'User'}
                            className="w-7 h-7 rounded-full object-cover border border-gray-300 dark:border-gray-700 cursor-pointer"
                            onClick={() => onProfileClick(reply.author)}
                          />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{reply.author?.username || 'Unknown'}</span>
                          {reply.createdAt && (
                            <span className="text-xs text-gray-400 ml-2">{formatRelativeTime(reply.createdAt)}</span>
                          )}
                        </div>
                        <div className="flex flex-col pl-9">
                          <span className="text-gray-800 dark:text-gray-200 text-sm mb-1">
                            {reply.taggedUser && <span className="text-[#0bb6bc] font-semibold mr-1">@{reply.taggedUser}</span>}
                            {editingReply.commentId === comment._id && editingReply.replyId === reply._id ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleEditReplySave(comment._id, reply._id);
                                }}
                                className="flex gap-2 mt-1"
                              >
                                <input
                                  type="text"
                                  className="flex-1 rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#0bb6bc]"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  autoFocus
                                />
                                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition"
                                  onClick={handleEditReplyCancel}
                                >
                                  Cancel
                                </button>
                              </form>
                            ) : (
                              reply.content
                            )}
                          </span>
                          <div className="flex gap-4 items-center mt-1">
                            <button
                              className={`text-xs flex items-center ${
                                Array.isArray(reply.likes) && reply.likes.includes(userId) ? 'text-pink-500' : 'text-gray-500'
                              } hover:text-pink-500 font-medium px-2 py-1 rounded transition`}
                              onClick={() => handleLikeReply(reply._id, comment._id, Array.isArray(reply.likes) && reply.likes.includes(userId))}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill={Array.isArray(reply.likes) && reply.likes.includes(userId) ? 'currentColor' : 'none'}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-4 h-4 mr-1"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 010-6.364z"
                                />
                              </svg>
                              <span className="ml-1">{Array.isArray(reply.likes) ? reply.likes.length : 0}</span>
                            </button>
                            <button
                              className="text-xs text-gray-500 hover:text-[#0bb6bc] font-medium px-2 py-1 rounded transition"
                              onClick={() => onReply(comment._id, reply._id, reply.author?.username)}
                            >
                              Reply
                            </button>
                            {(reply.author?._id === userId || reply.author?.id === userId) && (
                              <>
                                <button
                                  className="text-xs text-blue-500 hover:underline ml-2"
                                  onClick={() => handleEditReply(comment._id, reply._id, reply.content)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="text-xs text-red-500 hover:underline ml-1"
                                  onClick={() => handleDeleteReply(comment._id, reply._id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {replyingTo && replyingTo.commentId === comment._id && replyingTo.replyId === reply._id && (
                          <form
                            onSubmit={(e) => handleAddReply(e, comment._id, reply._id, reply.author?.username)}
                            className="flex gap-2 mt-2 ml-9"
                          >
                            <input
                              type="text"
                              className="flex-1 rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-[#0bb6bc]"
                              placeholder={`Reply to @${replyingTo.taggedUser || reply.author?.username}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            {replyText.trim() && (
                              <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                                Reply
                              </button>
                            )}
                          </form>
                        )}
                      </div>
                    ))}
                    {numToShow < totalReplies && (
                      <button
                        className="text-xs text-blue-500 hover:underline w-fit"
                        onClick={() => handleShowMoreReplies(comment._id, totalReplies)}
                      >
                        Show more replies
                      </button>
                    )}
                    {numToShow > 0 && (
                      <button
                        className="text-xs text-gray-500 hover:underline w-fit"
                        onClick={() => handleHideReplies(comment._id)}
                      >
                        Hide replies
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// HeaderFixed component
const HeaderFixed = ({ onToggleSidebar }) => (
  <div className="fixed top-0 left-0 w-full z-40" style={{ height: '44px' }}>
    <Header onToggleSidebar={onToggleSidebar} />
  </div>
);

// SidebarFixed component
const SidebarFixed = ({ sidebarOpen }) => (
  <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent md:block`}>
    <Sidebar collapsed={!sidebarOpen} />
  </div>
);

// Main PostDetails component
const PostDetails = () => {
  const { token, user } = useAuth();
  const { postId } = useParams();
  const navigate = useNavigate();
  const hasIncrementedView = useRef(false);
  const [post, setPost] = useState(() => {
    const location = typeof window !== 'undefined' && window.location && window.location.state ? window.location : null;
    if (location && location.state && location.state.post) {
      return location.state.post;
    }
    const localPost = localStorage.getItem('postDetailsData');
    if (localPost) {
      try {
        return JSON.parse(localPost);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(!post);
  const [error, setError] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editingReply, setEditingReply] = useState({ commentId: null, replyId: null });
  const [autoExpandReplies, setAutoExpandReplies] = useState(new Set());
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    profilePicture: '',
    channelName: '',
    socialLinks: {},
    hasChannel: false,
    authorId: ''
  });
  const [searchParams] = useSearchParams();
  const commentsRef = useRef(null);

  // Handle scroll to comments from notification
  useEffect(() => {
    const scrollToComments = searchParams.get('scrollToComments');
    if (scrollToComments === 'true' && post && commentsRef.current) {
      // Wait for comments to render, then scroll
      setTimeout(() => {
        if (commentsRef.current) {
          commentsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500); // Give time for comments to load
    }
  }, [post, searchParams]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  const handleProfileClick = async (author) => {
    if (!author) return;
    const authorId = author._id || author.id;
    let hasChannel = false;
    let channelName = author.username || 'Unknown';
    let socialLinks = {};
    if (authorId) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/channel/by-owner/${authorId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            hasChannel = true;
            channelName = data.name || channelName;
          }
          if (data.contactInfo) {
            socialLinks = data.contactInfo;
          }
        }
      } catch {}
    }
    setModalData({
      profilePicture: author.profilePicture || author.avatar || '/default-avatar.png',
      channelName,
      socialLinks,
      hasChannel,
      authorId
    });
    setModalOpen(true);
  };

  const handleReply = (commentId, replyId, taggedUser) => {
    setReplyingTo({ commentId, replyId, taggedUser });
    setReplyText('');
  };

  const handleEditComment = (commentId, currentContent) => {
    setEditingCommentId(commentId);
    setEditContent(currentContent);
  };

  const handleEditCommentCancel = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleEditReply = (commentId, replyId, currentContent) => {
    setEditingReply({ commentId, replyId });
    setEditContent(currentContent);
  };

  const handleEditReplyCancel = () => {
    setEditingReply({ commentId: null, replyId: null });
    setEditContent('');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !user || !token) return;
    setCommentLoading(true);
    setCommentError('');
    const optimisticComment = {
      _id: `temp_${Date.now()}`,
      content: commentInput,
      author: { _id: user._id, ...user },
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
      _posting: true
    };
    setPost((prev) => ({
      ...prev,
      comments: [optimisticComment, ...(prev.comments || [])]
    }));
    setCommentInput('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentInput })
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const data = await res.json();
      setPost((prev) => ({
        ...prev,
        comments: [data.comment, ...prev.comments.filter((c) => c && !c._posting)]
      }));
    } catch (err) {
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c && !c._posting)
      }));
      setCommentError(err.message || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleRemoveAutoExpand = (commentId) => {
    setAutoExpandReplies(prev => {
      const newSet = new Set(prev);
      newSet.delete(commentId);
      return newSet;
    });
  };

  const handleSetShownReplies = (commentId, count) => {
    // This will be passed to CommentThread to allow it to update shownReplies state
    // when auto-expanding
  };

  const handleAddReply = async (e, commentId, replyId, taggedUser) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !token) return;
    
    // For replies to replies, add @tag but store as regular reply to the main comment
    let replyContent = replyText;
    if (replyId && taggedUser) {
      replyContent = `@${taggedUser} ${replyText}`;
    }
    
    setReplyText('');
    setReplyingTo(null);
    
    // Auto-expand replies for this comment
    setAutoExpandReplies(prev => new Set([...prev, commentId]));
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          commentId, 
          content: replyContent,
          // Don't send replyId to flatten the structure on server side
          taggedUser: replyId ? taggedUser : undefined 
        })
      });
      if (!res.ok) throw new Error('Failed to add reply');
      const data = await res.json();
      
      // Always add as direct reply to the main comment (flattened structure)
      setPost((prev) => {
        const newPost = {
          ...prev,
          comments: prev.comments.map((c) => {
            if (c._id === commentId) {
              // Always add at the top as direct reply
              return { ...c, replies: [data.reply, ...(c.replies || [])] };
            }
            return c;
          })
        };
        return newPost;
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      setReplyText(replyContent); // Restore text on error
    }
  };

  const handleEditCommentSave = async (commentId) => {
    if (!editContent.trim() || !user || !token) return;
    let prevComments;
    setPost((prev) => {
      prevComments = prev.comments;
      return {
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId ? { ...c, content: editContent, _editing: true } : c
        )
      };
    });
    setEditingCommentId(null);
    setEditContent('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent })
      });
      if (!res.ok) throw new Error('Failed to edit comment');
      const data = await res.json();
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId ? { ...c, content: data.comment?.content || editContent, _editing: undefined } : c
        )
      }));
    } catch {
      setPost((prev) => ({ ...prev, comments: prevComments }));
    }
  };

  const handleEditReplySave = async (commentId, replyId) => {
    if (!editContent.trim() || !user || !token) return;
    let prevComments;
    setPost((prev) => {
      prevComments = prev.comments;
      return {
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId ? { 
            ...c, 
            replies: c.replies.map((r) =>
              r._id === replyId
                ? { ...r, content: editContent, _editing: true }
                : r
            )
          } : c
        )
      };
    });
    setEditingReply({ commentId: null, replyId: null });
    setEditContent('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment/${commentId}/reply/${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent })
      });
      if (!res.ok) throw new Error('Failed to edit reply');
      const data = await res.json();
      setPost((prev) => {
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c._id === commentId ? { 
              ...c, 
              replies: c.replies.map((r) =>
                r._id === replyId
                  ? { ...r, content: data.reply?.content || editContent, _editing: undefined }
                  : r
              )
            } : c
          )
        };
      });
    } catch {
      setPost((prev) => ({ ...prev, comments: prevComments }));
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = () => {
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
      performDeleteComment(commentId);
    };

    setConfirmationModal({
      isOpen: true,
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment? This action cannot be undone.',
      onConfirm: confirmDelete
    });
  };

  const performDeleteComment = async (commentId) => {
    let prevComments;
    setPost((prev) => {
      prevComments = prev.comments;
      return { ...prev, comments: prev.comments.filter((c) => c._id !== commentId) };
    });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete comment');
    } catch (error) {
      console.error('Error deleting comment:', error);
      setPost((prev) => ({ ...prev, comments: prevComments }));
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    const confirmDelete = () => {
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
      performDeleteReply(commentId, replyId);
    };

    setConfirmationModal({
      isOpen: true,
      title: 'Delete Reply',
      message: 'Are you sure you want to delete this reply? This action cannot be undone.',
      onConfirm: confirmDelete
    });
  };

  const performDeleteReply = async (commentId, replyId) => {
    let prevComments;
    setPost((prev) => {
      prevComments = prev.comments;
      return {
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId ? { 
            ...c, 
            replies: c.replies.filter((r) => r._id !== replyId)
          } : c
        )
      };
    });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment/${commentId}/reply/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete reply');
    } catch (error) {
      console.error('Error deleting reply:', error);
      setPost((prev) => ({ ...prev, comments: prevComments }));
    }
  };

  const handleLike = async (commentId, liked) => {
    if (!user || !token) return;
    let prevComments;
    setPost((prev) => {
      prevComments = prev.comments;
      return {
        ...prev,
        comments: prev.comments.map((c) => {
          if (c._id === commentId) {
            let likesArr = Array.isArray(c.likes) ? c.likes : [];
            let newLikes = liked
              ? likesArr.filter((id) => id !== user._id)
              : [...new Set([...likesArr, user._id])];
            return { ...c, likes: newLikes };
          }
          return c;
        })
      };
    });
    try {
      const endpoint = liked ? 'unlike' : 'like';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId })
      });
      if (!res.ok) throw new Error('Failed to like/unlike comment');
      const data = await res.json();
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId ? { ...c, likes: Array.isArray(data.likes) ? data.likes : [] } : c
        )
      }));
    } catch {
      setPost((prev) => ({ ...prev, comments: prevComments }));
    }
  };

  const handleLikeReply = async (replyId, commentId, liked) => {
    if (!user || !token) return;
    let prevComments;
    setPost((prev) => {
      prevComments = prev.comments;
      return {
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId ? { 
            ...c, 
            replies: c.replies.map((r) =>
              r._id === replyId
                ? {
                    ...r,
                    likes: liked
                      ? (r.likes || []).filter((id) => id !== user._id)
                      : [...new Set([...(r.likes || []), user._id])]
                  }
                : r
            )
          } : c
        )
      };
    });
    try {
      const endpoint = liked ? 'unlike' : 'like';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comment/reply/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId, replyId })
      });
      if (!res.ok) throw new Error('Failed to like/unlike reply');
      const data = await res.json();
      setPost((prev) => {
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c._id === commentId ? { 
              ...c, 
              replies: c.replies.map((r) =>
                r._id === replyId
                  ? { ...r, likes: Array.isArray(data.likes) ? data.likes : [] }
                  : r
              )
            } : c
          )
        };
      });
    } catch {
      setPost((prev) => ({ ...prev, comments: prevComments }));
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}`);
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        const postData = data.post || data;
        // Sort replies within each comment so newest appear at the top
        if (postData.comments) {
          postData.comments = postData.comments.map(comment => ({
            ...comment,
            replies: [...(comment.replies || [])].sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            )
          }));
        }
        setPost(postData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (!post) {
      fetchPost();
    }
    localStorage.removeItem('postDetailsData');
  }, [postId]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#111111] flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading post...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#111111] flex items-center justify-center">
        <div className="text-xl text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  // Show not found state
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#111111] flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Post not found</div>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full"
        style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}
      >
        <HeaderFixed onToggleSidebar={handleToggleSidebar} />
        <div className="flex flex-row w-full" style={{ height: '100vh', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <SidebarFixed sidebarOpen={sidebarOpen} />
          {!sidebarOpen && (
            <div className="md:ml-20">
              <StudentUtility />
            </div>
          )}
          <div
            className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full`}
            style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}
          >
            <main
              className="flex-1 p-4 md:p-8 pb-0 overflow-y-auto w-full"
              style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none', marginTop: '3.5rem' }}
            >
              {loading ? (
                <div className="text-gray-500 dark:text-gray-400 px-4 py-6">Loading post...</div>
              ) : error ? (
                <div className="text-red-500 px-4 py-6">{error}</div>
              ) : post ? (
                <div
                  className="bg-white dark:bg-[#181818] rounded-lg shadow-md overflow-hidden flex flex-col min-w-0 w-full border border-gray-200 dark:border-gray-700"
                  style={{ maxWidth: '100%', minWidth: 0, fontSize: '1.05em', padding: '0.5em', marginBottom: '0.75em' }}
                >
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-700 dark:text-gray-200"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <img
                      src={post.author?.profilePicture || post.author?.avatar || post.author?.profile || '/default-avatar.png'}
                      alt={post.author?.username || 'User'}
                      className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0 cursor-pointer"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', aspectRatio: '1/1', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px' }}
                      onClick={() => handleProfileClick(post.author)}
                    />
                    <div className="flex flex-col min-w-0" style={{ flex: 1, minWidth: 0 }}>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{post.author?.username || 'Unknown'}</span>
                      {post.createdAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{formatRelativeTime(post.createdAt)}</span>
                      )}
                      <span className="text-xs text-[#c42152] font-semibold">{post.specialization}</span>
                    </div>
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
                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-[#0bb6bc] underline">
                          View Link
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-black dark:text-white">
                        Comments ({countAllComments(post?.comments || [])})
                      </h3>
                      <div className="flex items-center gap-1">
                        <FaChartBar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                          {post.viewCount ?? (Array.isArray(post.views) ? post.views.length : 0)}
                        </span>
                      </div>
                    </div>
                    <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
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
                      {commentError && <div className="text-red-500 text-sm mt-2">{commentError}</div>}
                    </form>
                    {Array.isArray(post.comments) && post.comments.length > 0 ? (
                      <div ref={commentsRef} className="flex flex-col gap-4">
                        <CommentThread
                          comments={post.comments}
                          postId={postId}
                          token={token}
                          userId={user?._id?.toString() || user?.id?.toString() || ''}
                          handleLike={handleLike}
                          handleLikeReply={handleLikeReply}
                          onReply={handleReply}
                          replyingTo={replyingTo}
                          replyText={replyText}
                          setReplyText={setReplyText}
                          handleAddReply={handleAddReply}
                          onProfileClick={handleProfileClick}
                          editingCommentId={editingCommentId}
                          editContent={editContent}
                          setEditContent={setEditContent}
                          handleEditComment={handleEditComment}
                          handleEditCommentSave={handleEditCommentSave}
                          handleEditCommentCancel={handleEditCommentCancel}
                          editingReply={editingReply}
                          handleEditReply={handleEditReply}
                          handleEditReplySave={handleEditReplySave}
                          handleEditReplyCancel={handleEditReplyCancel}
                          handleDeleteComment={handleDeleteComment}
                          handleDeleteReply={handleDeleteReply}
                          autoExpandReplies={autoExpandReplies}
                          onRemoveAutoExpand={handleRemoveAutoExpand}
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
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default PostDetails;