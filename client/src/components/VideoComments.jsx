import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import ProfilePictureZoomModal from './ProfilePictureZoomModal';
import ThreeDotsMenu from './ThreeDotsMenu';
import EditPortal from './EditPortal';

const Comments = ({ videoId, channel, initialComments = [], onCountChange }) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState(() => {
    if (Array.isArray(initialComments)) {
      return initialComments.map(comment => ({
        ...comment,
        replies: [...(comment.replies || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }));
    }
    return [];
  });
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, replyId }
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editReplyId, setEditReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [previewedId, setPreviewedId] = useState(null);
  const [likeLoading, setLikeLoading] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({}); // { [commentId]: number }
  const API_BASE_URL = import.meta.env.VITE_API_URL;

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

  // Helper to get avatar
  const getAvatar = (author) => {
    return author?.profilePicture || author?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg';
  };

  // Helper to get display name
  const getDisplayName = (author) => {
    return author?.username || author?.firstName || 'Unknown';
  };

  // Helper to get total comment count
  const getTotalCommentCount = (commentsList) => {
    return commentsList.reduce((total, comment) => {
      const repliesCount = comment.replies?.length || 0;
      return total + 1 + repliesCount;
    }, 0);
  };

  // Notify parent when comment count changes
  useEffect(() => {
    if (typeof onCountChange === 'function') {
      onCountChange(getTotalCommentCount(comments));
    }
  }, [comments, onCountChange]);

  // Sync with new initialComments when video changes
  useEffect(() => {
    if (Array.isArray(initialComments)) {
      setComments(initialComments.map(comment => ({
        ...comment,
        replies: [...(comment.replies || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      })));
    }
  }, [initialComments, videoId]);

  // Fallback fetch if no initialComments were provided
  useEffect(() => {
    if (initialComments && Array.isArray(initialComments) && initialComments.length > 0) return;
    let cancelled = false;
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/videos/${videoId}`);
        if (res.ok) {
          const data = await res.json();
          const commentsWithSortedReplies = (data.comments || []).map(comment => ({
            ...comment,
            replies: [...(comment.replies || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          }));
          if (!cancelled) {
            setComments(prev => {
              const posting = prev.filter(c => c._posting);
              return [...posting, ...commentsWithSortedReplies];
            });
          }
        }
      } catch (err) {}
    };
    fetchComments();
    return () => { cancelled = true; };
  }, [videoId, API_BASE_URL, initialComments]);

  // Helper to render text with styled @usernames
  const renderTextWithStyledMentions = (text) => {
    if (!text) return text;
    
    // Split text by @mentions and render with blue styling
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-[#0bb6bc] font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Handle adding a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !token) return;
    const optimisticComment = {
      _id: `temp_${Date.now()}`,
      text: commentText,
      author: { _id: user._id, ...user },
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
      _posting: true
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setCommentText('');
    try {
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev.filter(c => !c._posting)]);
      } else {
        setComments((prev) => prev.filter(c => !c._posting));
      }
    } catch (err) {
      setComments((prev) => prev.filter(c => !c._posting));
    }
  };

  // Handle adding a reply
  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !token || !replyingTo) return;
    
    // For replies to replies, add @tag but store as regular reply to the main comment
    let replyTextWithTag = replyText;
    if (replyingTo.replyId) {
      const parentComment = comments.find(c => c._id === replyingTo.commentId);
      const repliedToReply = parentComment?.replies.find(r => r._id === replyingTo.replyId);
      if (repliedToReply) {
        replyTextWithTag = `@${getDisplayName(repliedToReply.author)} ${replyText}`;
      }
    }
    
    const optimisticReply = {
      _id: `temp_${Date.now()}`,
      text: replyTextWithTag,
      author: { _id: user._id, ...user },
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
      _posting: true
    };
    setComments((prev) => prev.map(comment => {
      if (comment._id === replyingTo.commentId) {
        // Always add as a direct reply to the main comment (flatten structure)
        return { ...comment, replies: [...(comment.replies || []), optimisticReply] };
      }
      return comment;
    }));
    
    // Store replyingTo before clearing it
    const currentReplyingTo = replyingTo;
    setReplyText('');
    setReplyingTo(null);
    
    try {
      // Always send as reply to main comment, even if replying to a reply
      const body = { text: replyTextWithTag, commentId: currentReplyingTo.commentId };
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const updatedVideo = await res.json();
        // Find the updated comment and extract the new reply
        const updatedComment = updatedVideo.comments?.find(c => c._id === currentReplyingTo.commentId);
        if (updatedComment) {
          setComments((prev) => prev.map(comment => {
            if (comment._id === currentReplyingTo.commentId) {
              // Use the replies from the server response which have populated author data
              // Sort replies so newest appear at the top
              const sortedReplies = [...(updatedComment.replies || [])].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              );
              return { ...comment, replies: sortedReplies };
            }
            return comment;
          }));
        }
      } else {
        setComments((prev) => prev.map(comment => {
          if (comment._id === currentReplyingTo.commentId) {
            return { ...comment, replies: (comment.replies || []).filter(r => !r._posting) };
          }
          return comment;
        }));
      }
    } catch (err) {
      setComments((prev) => prev.map(comment => {
        if (comment._id === currentReplyingTo.commentId) {
          return { ...comment, replies: (comment.replies || []).filter(r => !r._posting) };
        }
        return comment;
      }));
    }
  };

  // Handle editing a comment
  const handleEditCommentSubmit = async (e, commentId) => {
    e.preventDefault();
    if (!editCommentText.trim() || !user || !token) return;
    const prevComments = comments;
    setComments((prev) => prev.map(comment => {
      if (comment._id === commentId) {
        return { ...comment, text: editCommentText, editedAt: new Date().toISOString() };
      }
      return comment;
    }));
    setEditCommentId(null);
    setEditCommentText('');
    try {
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment`, {
  method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId, text: editCommentText })
      });
      if (!res.ok) {
        setComments(prevComments);
      }
    } catch (err) {
      setComments(prevComments);
    }
  };

  // Handle editing a reply
  const handleEditReplySubmit = async (e, commentId, replyId) => {
    e.preventDefault();
    if (!editReplyText.trim() || !user || !token) return;
    const prevComments = comments;
    
    setComments((prev) => prev.map(comment => {
      if (comment._id === commentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply._id === replyId) {
              return { ...reply, text: editReplyText, editedAt: new Date().toISOString() };
            }
            return reply;
          })
        };
      }
      return comment;
    }));
    
    setEditReplyId(null);
    setEditReplyText('');
    
    try {
      const body = { commentId, replyId, text: editReplyText };
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment/reply`, {
  method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        setComments(prevComments);
      }
    } catch (err) {
      setComments(prevComments);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    const prevComments = comments;
    setComments((prev) => prev.filter(comment => comment._id !== commentId));
    try {
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId })
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) {
        setComments(prevComments);
        alert(`Delete failed: ${result?.error || res.status}`);
      }
    } catch (err) {
      setComments(prevComments);
    }
  };

  // Handle deleting a reply
  const handleDeleteReply = async (commentId, replyId) => {
    const prevComments = comments;
    try {
      const body = { commentId, replyId };
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment/reply`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setComments((prev) => prev.map(comment => {
          if (comment._id === commentId) {
            return { ...comment, replies: comment.replies.filter(reply => reply._id !== replyId) };
          }
          return comment;
        }));
      } else {
        setComments(prevComments);
      }
    } catch (err) {
      setComments(prevComments);
    }
  };

  // Like or unlike a comment
  const handleLikeComment = async (commentId, liked) => {
    if (!user || !token) return;
    setLikeLoading((prev) => ({ ...prev, [commentId]: true }));
    const prevComments = comments;
    setComments((prev) => prev.map(comment => {
      if (comment._id === commentId) {
        let likesArr = Array.isArray(comment.likes) ? comment.likes : [];
        let newLikes = liked
          ? likesArr.filter(id => id !== user._id)
          : [...new Set([...likesArr, user._id])];
        return { ...comment, likes: newLikes };
      }
      return comment;
    }));
    try {
      const endpoint = liked ? 'unlike' : 'like';
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.likes)) {
          setComments((prev) => prev.map(comment => {
            if (comment._id === commentId) {
              let likesArr = data.likes;
              if (!liked && !likesArr.includes(user._id)) {
                likesArr = [...likesArr, user._id];
              }
              if (liked && likesArr.includes(user._id)) {
                likesArr = likesArr.filter(id => id !== user._id);
              }
              return { ...comment, likes: likesArr };
            }
            return comment;
          }));
        } else {
          const fetchComments = async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/videos/${videoId}`);
              if (res.ok) {
                const data = await res.json();
                setComments(data.comments || []);
              }
            } catch (err) {}
          };
          fetchComments();
        }
      } else {
        setComments(prevComments);
      }
    } catch (err) {
      setComments(prevComments);
    } finally {
      setLikeLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Like or unlike a reply
  const handleLikeReply = async (commentId, replyId, liked) => {
    if (!user || !token) return;
    
    setComments((prev) => prev.map(comment => {
      if (comment._id === commentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply._id === replyId) {
              let likesArr = Array.isArray(reply.likes) ? reply.likes : [];
              let newLikes = liked
                ? likesArr.filter(id => id !== user._id)
                : [...new Set([...likesArr, user._id])];
              return { ...reply, likes: newLikes };
            }
            return reply;
          })
        };
      }
      return comment;
    }));
    
    try {
      const endpoint = liked ? 'unlike' : 'like';
      const url = `${API_BASE_URL}/videos/${videoId}/comment/reply/${endpoint}`;
      const body = { commentId, replyId };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => prev.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply._id === replyId && Array.isArray(data.likes)) {
                  return { ...reply, likes: data.likes };
                }
                return reply;
              })
            };
          }
          return comment;
        }));
      }
    } catch (err) {
      // Revert on error
      setComments((prev) => prev.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply._id === replyId) {
                let likesArr = Array.isArray(reply.likes) ? reply.likes : [];
                let newLikes = liked
                  ? [...new Set([...likesArr, user._id])]
                  : likesArr.filter(id => id !== user._id);
                return { ...reply, likes: newLikes };
              }
              return reply;
            })
          };
        }
        return comment;
      }));
    }
  };

  // Handle viewing replies
  const handleViewReplies = (commentId, totalReplies) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: Math.min(4, totalReplies) }));
  };

  // Handle showing more replies
  const handleShowMoreReplies = (commentId, totalReplies) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: Math.min((prev[commentId] || 4) + 4, totalReplies) }));
  };

  // Handle hiding replies
  const handleHideReplies = (commentId) => {
    setExpandedReplies((prev) => {
      const copy = { ...prev };
      delete copy[commentId];
      return copy;
    });
  };

  // Handle profile picture click
  const handleProfilePictureClick = async (author) => {
    const authorId = author._id || author.id;
    let hasChannel = false;
    let channelName = author.username || author.firstName || 'Unknown';
    let socialLinks = {};
    if (authorId) {
      try {
        const res = await fetch(`${API_BASE_URL}/channel/by-owner/${authorId}`);
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
      } catch (err) {}
    }
    setModalData({
      profilePicture: author.profilePicture || author.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
      channelName,
      socialLinks,
      authorId,
      hasChannel
    });
    setModalOpen(true);
  };

  // Handle reply
  const handleReply = (commentId, replyId = null) => {
    setReplyingTo({ commentId, replyId });
    setReplyText('');
  };

  // Render comments and replies
  const renderComments = (commentsList) => {
    return commentsList.map((comment) => {
      const totalReplies = comment.replies?.length || 0;
      const shownReplies = expandedReplies[comment._id] || 0;
      const isAuthor = user?._id === comment.author?._id;
      return (
        <div key={comment._id} className="flex gap-3 items-start">
          <img
            src={getAvatar(comment.author)}
            alt={getDisplayName(comment.author)}
            className="w-8 h-8 rounded-full border cursor-pointer"
            onClick={() => handleProfilePictureClick(comment.author)}
          />
          <div className="flex flex-col flex-1">
            <span className="font-semibold text-black dark:text-white">
              {getDisplayName(comment.author)}
              {comment.editedAt && (
                <span className="text-xs text-gray-500 font-normal ml-2">Edited</span>
              )}
              <span className="text-xs text-gray-400 font-normal ml-2">{formatRelativeTime(comment.createdAt)}</span>
            </span>
            {editCommentId === comment._id ? (
              <form onSubmit={(e) => handleEditCommentSubmit(e, comment._id)} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border rounded-full px-4 py-2 text-black dark:text-white bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500">Save</button>
                <button type="button" className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 transition" onClick={() => setEditCommentId(null)}>Cancel</button>
              </form>
            ) : (
              <span className="text-gray-800 dark:text-gray-200 mb-2">{comment.text}</span>
            )}
            <div className="flex items-center gap-6 mb-1 justify-between">
              <div className="flex items-center gap-6">
                <button
                  className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-pink-500 transition bg-transparent border-none p-0"
                  onClick={() => handleLikeComment(comment._id, comment.likes?.includes(user?._id))}
                  disabled={!!likeLoading[comment._id]}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill={comment.likes?.includes(user?._id) ? '#c42152' : 'none'} stroke={comment.likes?.includes(user?._id) ? '#c42152' : 'currentColor'} strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-xs">{comment.likes?.length || 0}</span>
                </button>
                <button
                  className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition bg-transparent border-none p-0"
                  onClick={() => handleReply(comment._id)}
                >
                  <span className="text-xs">Reply ({totalReplies})</span>
                </button>
              </div>
              {isAuthor && (
                <div className="flex gap-2 ml-auto">
                  <button
                    className="text-xs text-blue-500 hover:underline"
                    onClick={() => { setEditCommentId(comment._id); setEditCommentText(comment.text); }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => setModalData({ type: 'delete', commentId: comment._id })}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            {replyingTo && replyingTo.commentId === comment._id && !replyingTo.replyId && (
              <form onSubmit={handleAddReply} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border rounded-full px-4 py-2 text-black dark:text-white bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500">Reply</button>
              </form>
            )}
            {totalReplies > 0 && (
              <div className="ml-8 mt-2 flex flex-col gap-2">
                {shownReplies === 0 ? (
                  <button
                    className="text-xs text-blue-500 hover:underline w-fit"
                    onClick={() => handleViewReplies(comment._id, totalReplies)}
                  >
                    View replies ({totalReplies})
                  </button>
                ) : (
                  <>
                    {comment.replies.slice(0, shownReplies).map((reply) => {
                      const isReplyAuthor = user?._id === reply.author?._id;
                      return (
                        <div key={reply._id} className="flex gap-2 items-start">
                          <img
                            src={getAvatar(reply.author)}
                            alt={getDisplayName(reply.author)}
                            className="w-7 h-7 rounded-full border cursor-pointer"
                            onClick={() => handleProfilePictureClick(reply.author)}
                          />
                          <div className="flex flex-col flex-1">
                            <span className="font-semibold text-black dark:text-white">
                              {getDisplayName(reply.author)}
                              {reply.editedAt && (
                                <span className="text-xs text-gray-500 font-normal ml-2">Edited</span>
                              )}
                              <span className="text-xs text-gray-400 font-normal ml-2">{formatRelativeTime(reply.createdAt)}</span>
                            </span>
                            {editReplyId === reply._id ? (
                              <form onSubmit={(e) => handleEditReplySubmit(e, comment._id, reply._id)} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  className="flex-1 border rounded-full px-4 py-2 text-black dark:text-white bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={editReplyText}
                                  onChange={(e) => setEditReplyText(e.target.value)}
                                  autoFocus
                                />
                                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500">Save</button>
                                <button type="button" className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 transition" onClick={() => setEditReplyId(null)}>Cancel</button>
                              </form>
                            ) : (
                              <span className="text-gray-800 dark:text-gray-200">
                                {renderTextWithStyledMentions(reply.text)}
                              </span>
                            )}
                            <div className="flex items-center gap-4 mt-1">
                              <button
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-pink-500 transition bg-transparent border-none p-0"
                                onClick={() => handleLikeReply(comment._id, reply._id, reply.likes?.includes(user?._id))}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill={reply.likes?.includes(user?._id) ? '#c42152' : 'none'} stroke={reply.likes?.includes(user?._id) ? '#c42152' : 'currentColor'} strokeWidth="2">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                <span className="text-xs">{reply.likes?.length || 0}</span>
                              </button>
                              <button
                                className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition bg-transparent border-none p-0"
                                onClick={() => handleReply(comment._id, reply._id)}
                              >
                                <span className="text-xs">Reply</span>
                              </button>
                              {isReplyAuthor && (
                                <div className="flex gap-2 ml-auto">
                                  <button
                                    className="text-xs text-blue-500 hover:underline"
                                    onClick={() => { setEditReplyId(reply._id); setEditReplyText(reply.text); }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-xs text-red-500 hover:underline"
                                    onClick={() => setModalData({ type: 'deleteReply', commentId: comment._id, replyId: reply._id })}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            {replyingTo && replyingTo.commentId === comment._id && replyingTo.replyId === reply._id && (
                              <form onSubmit={handleAddReply} className="flex gap-2 mb-2 mt-1">
                                <input
                                  type="text"
                                  className="flex-1 border rounded-full px-4 py-2 text-black dark:text-white bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={`Reply to @${getDisplayName(reply.author)}`}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500">Reply</button>
                              </form>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-2 mt-1">
                      {shownReplies < totalReplies && (
                        <button
                          className="text-xs text-blue-500 hover:underline w-fit"
                          onClick={() => handleShowMoreReplies(comment._id, totalReplies)}
                        >
                          Show more replies
                        </button>
                      )}
                      {shownReplies > 0 && (
                        <button
                          className="text-xs text-gray-500 hover:underline w-fit"
                          onClick={() => handleHideReplies(comment._id)}
                        >
                          Hide replies
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <ProfilePictureZoomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profilePicture={modalData.profilePicture}
        channelName={modalData.channelName}
        socialLinks={modalData.socialLinks}
        hasChannel={modalData.hasChannel}
        onViewChannel={async () => {
          setModalOpen(false);
          if (modalData.authorId) {
            try {
              const res = await fetch(`${API_BASE_URL}/channel/by-owner/${modalData.authorId}`);
              if (res.ok) {
                const data = await res.json();
                if (data && data._id) {
                  window.location.href = `/channel/${data._id}`;
                  return;
                }
              }
            } catch (err) {}
          }
          if (channel && channel._id) {
            window.location.href = `/channel/${channel._id}`;
          }
        }}
      />
      {modalData?.type === 'delete' && modalData?.commentId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 min-w-[280px] max-w-[90vw]">
            <div className="mb-4 text-black dark:text-white">Delete this comment?</div>
            <div className="flex gap-2 justify-end">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                onClick={() => { handleDeleteComment(modalData.commentId); setModalData({}); }}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 transition"
                onClick={() => setModalData({})}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {modalData?.type === 'deleteReply' && modalData?.commentId && modalData?.replyId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 min-w-[280px] max-w-[90vw]">
            <div className="mb-4 text-black dark:text-white">Delete this reply?</div>
            <div className="flex gap-2 justify-end">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                onClick={() => { handleDeleteReply(modalData.commentId, modalData.replyId); setModalData({}); }}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 transition"
                onClick={() => setModalData({})}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full">
        <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
          {getTotalCommentCount(comments)} Comments
        </h3>
        
        {/* Comment Input */}
        {user && (
          <form onSubmit={handleAddComment} className="flex gap-3 mb-8 w-full">
            <img
              src={user.profilePicture || user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt={user.username || user.firstName || 'User'}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 w-full">
              <input
                type="text"
                className="w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-0 py-2 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              {commentText.trim() && (
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setCommentText('')}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:opacity-50"
                    disabled={!commentText.trim()}
                  >
                    Comment
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
        
        {/* Comments List */}
        <div className="w-full space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</span>
            </div>
          ) : (
            renderComments(comments)
          )}
        </div>
      </div>
    </>
  );
};

export default Comments;