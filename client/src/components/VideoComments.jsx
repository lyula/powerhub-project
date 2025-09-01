import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';

// Helper to recursively render comments and replies
function renderComments(comments, handleReply, replyingTo, replyText, setReplyText, handleAddReply, getDisplayName) {
  return comments.map((comment) => (
    <div key={comment.id} className="flex gap-3 items-start">
      <img src={comment.authorProfile} alt={comment.author} className="w-8 h-8 rounded-full border" />
      <div className="flex flex-col flex-1">
        <span className="font-semibold text-black dark:text-white">{getDisplayName(comment.author, comment.channel)}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{comment.posted}</span>
        <span className="text-gray-800 dark:text-gray-200 mb-2">{comment.text}</span>
        <div className="flex items-center gap-6 mb-1">
          <button className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-pink-500 transition bg-transparent border-none p-0" onClick={() => handleReply(comment.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="text-xs">Reply ({comment.replies?.length || 0})</span>
          </button>
        </div>
        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleAddReply(e, comment.id)} className="flex gap-2 mb-2">
            <input type="text" className="flex-1 border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Reply</button>
          </form>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-2 flex flex-col gap-2">
            {renderComments(comment.replies, handleReply, replyingTo, replyText, setReplyText, handleAddReply, getDisplayName)}
          </div>
        )}
      </div>
    </div>
  ));
}

export default function VideoComments({ videoId, onCountChange }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  // replyingTo: { commentId, replyId } or null
  const [replyingTo, setReplyingTo] = useState(null);
  const [likeLoading, setLikeLoading] = useState({}); // { [commentId]: boolean }
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch comments and update count immediately on mount and when videoId changes
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/videos/${videoId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
          if (onCountChange) onCountChange((data.comments || []).length);
        }
      } catch (err) {}
    };
    if (videoId) fetchComments();
  }, [videoId, onCountChange]);

  const getDisplayName = (authorObj) => {
    if (authorObj.username) return authorObj.username;
    return "Unknown";
  };

  const getAvatar = (authorObj) => {
    if (authorObj.avatar) return authorObj.avatar;
    return "https://randomuser.me/api/portraits/lego/1.jpg";
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
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
        const data = await res.json();
        setComments(data.comments || []);
        setCommentText("");
        if (onCountChange) onCountChange((data.comments || []).length);
      }
    } catch (err) {}
  };

  // If replyId is provided, it's a reply to a reply
  const handleReply = (commentId, replyId = null) => {
    if (replyingTo && replyingTo.commentId === commentId && replyingTo.replyId === replyId) {
      setReplyingTo(null);
      setReplyText("");
    } else {
      setReplyingTo({ commentId, replyId });
      setReplyText("");
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo) return;
    const { commentId, replyId } = replyingTo;
    let textToSend = replyText;
    if (replyId) {
      // Prepend @username for replies to replies
      const parentComment = comments.find(c => c._id === commentId);
      const parentReply = parentComment?.replies?.find(r => r._id === replyId);
      if (parentReply) {
        const username = parentReply.author?.username || 'user';
        if (!replyText.startsWith(`@${username}`)) {
          textToSend = `@${username} ${replyText}`;
        }
      }
    }
    const payload = replyId ? { commentId, replyId, text: textToSend } : { commentId, text: textToSend };
    console.log('Sending reply:', payload);
    try {
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setReplyText("");
        setReplyingTo(null);
        if (onCountChange) onCountChange((data.comments || []).length);
      }
    } catch (err) {
      console.error('Reply error:', err);
    }
  };

  // Like or unlike a comment
  const handleLikeComment = async (commentId, liked) => {
    if (likeLoading[commentId]) return; // Prevent double click
    setLikeLoading((prev) => ({ ...prev, [commentId]: true }));
    // Optimistic UI update
    const prevComments = comments;
    setComments((prevComments) => prevComments.map(comment => {
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
        // Always sync likes with backend response
        if (Array.isArray(data.likes)) {
          setComments((prevComments) => prevComments.map(comment => {
            if (comment._id === commentId) {
              return { ...comment, likes: data.likes };
            }
            return comment;
          }));
        } else {
          // If backend response is missing likes, re-fetch comments
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
        // Revert optimistic update if backend fails
        setComments(prevComments);
      }
    } catch (err) {
      // Revert optimistic update on error
      setComments(prevComments);
    } finally {
      setLikeLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Like or unlike a reply
  const handleLikeReply = async (commentId, replyId, liked) => {
    // Optimistic UI update
    setComments((prevComments) => prevComments.map(comment => {
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
      const url = endpoint === 'like'
        ? `${API_BASE_URL}/videos/${videoId}/comment/reply/like`
        : `${API_BASE_URL}/videos/${videoId}/comment/reply/unlike`;
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
        // Always sync likes with backend response
        setComments((prevComments) => prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply._id === replyId ? { ...reply, likes: Array.isArray(data.likes) ? data.likes : [] } : reply
              )
            };
          }
          return comment;
        }));
      }
      // If backend fails, do nothing (keep optimistic state)
    } catch (err) {
      // If error, do nothing (keep optimistic state)
    }
  };

  // Helper to format relative time
  function formatRelativeTime(dateString) {
    if (!dateString) return '';
    const posted = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - posted) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
    if (diff < 31536000) return `${Math.floor(diff/2592000)}mth ago`;
    return `${Math.floor(diff/31536000)}yr ago`;
  }

  // Track which comments have replies expanded and how many replies are shown
  const [expandedReplies, setExpandedReplies] = useState({}); // { [commentId]: number }

  function handleViewReplies(commentId, totalReplies) {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: Math.min(4, totalReplies) }));
  }

  function handleShowMoreReplies(commentId, totalReplies) {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: Math.min((prev[commentId] || 4) + 4, totalReplies) }));
  }

  function handleHideReplies(commentId) {
    setExpandedReplies((prev) => {
      const copy = { ...prev };
      delete copy[commentId];
      return copy;
    });
  }

  function renderComments(commentsList) {
    return commentsList.map((comment) => {
      const totalReplies = comment.replies?.length || 0;
      const shownReplies = expandedReplies[comment._id] || 0;
      return (
        <div key={comment._id} className="flex gap-3 items-start">
          <img src={getAvatar(comment.author)} alt={getDisplayName(comment.author)} className="w-8 h-8 rounded-full border" />
          <div className="flex flex-col flex-1">
            <span className="font-semibold text-black dark:text-white">
              {getDisplayName(comment.author)}
              <span className="text-xs text-gray-400 font-normal ml-2">{formatRelativeTime(comment.createdAt)}</span>
            </span>
            <span className="text-gray-800 dark:text-gray-200 mb-2">{comment.text}</span>
            <div className="flex items-center gap-6 mb-1">
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
              <button className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition bg-transparent border-none p-0" onClick={() => handleReply(comment._id)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                <span className="text-xs">Reply ({comment.replies?.length || 0})</span>
              </button>
            </div>
            {replyingTo && replyingTo.commentId === comment._id && !replyingTo.replyId && (
              <form onSubmit={handleAddReply} className="flex gap-2 mb-2">
                <input type="text" className="flex-1 border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Reply</button>
              </form>
            )}
            {/* Replies */}
            {totalReplies > 0 && (
              <div className="ml-8 mt-2 flex flex-col gap-2">
                {shownReplies === 0 ? (
                  <button className="text-xs text-blue-500 hover:underline w-fit" onClick={() => handleViewReplies(comment._id, totalReplies)}>
                    View replies ({totalReplies})
                  </button>
                ) : (
                  <React.Fragment>
                    {comment.replies.slice(0, shownReplies).map((reply) => (
                      <div key={reply._id} className="flex gap-2 items-start">
                        <img src={getAvatar(reply.author)} alt={getDisplayName(reply.author)} className="w-7 h-7 rounded-full border" />
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-black dark:text-white">
                            {getDisplayName(reply.author)}
                            <span className="text-xs text-gray-400 font-normal ml-2">{formatRelativeTime(reply.createdAt)}</span>
                          </span>
                          <span className="text-gray-800 dark:text-gray-200">{reply.text}</span>
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
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                              </svg>
                              <span className="text-xs">Reply</span>
                            </button>
                          </div>
                          {replyingTo && replyingTo.commentId === comment._id && replyingTo.replyId === reply._id && (
                            <form onSubmit={handleAddReply} className="flex gap-2 mb-2 mt-1">
                              <input
                                type="text"
                                className="flex-1 border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                                placeholder={`Reply to @${getDisplayName(reply.author)}`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Reply</button>
                            </form>
                          )}
                          {/* Render replies to replies (second level only, same indentation) */}
                          {reply.replies && reply.replies.length > 0 && (
                            reply.replies.map((subReply, subIdx) => {
                              console.log('Reply to reply author:', subReply?.author, 'Full subReply:', subReply);
                              return (
                                <div key={subReply._id || subIdx} className="flex gap-2 items-start">
                                  <img src={getAvatar(subReply.author)} alt={getDisplayName(subReply.author)} className="w-7 h-7 rounded-full border" />
                                  <div className="flex flex-col flex-1">
                                    <span className="font-semibold text-black dark:text-white">
                                      {getDisplayName(subReply.author)}
                                      <span className="text-xs text-gray-400 font-normal ml-2">{formatRelativeTime(subReply.createdAt)}</span>
                                    </span>
                                    <span className="text-gray-800 dark:text-gray-200">
                                      {/* Always show @username for replies to replies */}
                                      {reply.author && <span className="text-blue-500 font-semibold mr-1">@{getDisplayName(reply.author)}</span>}
                                      {subReply.text.replace(new RegExp(`^@${getDisplayName(reply.author)}\s*`), '')}
                                    </span>
                                    <div className="flex items-center gap-4 mt-1">
                                      <button
                                        className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-pink-500 transition bg-transparent border-none p-0"
                                        onClick={() => handleLikeReply(comment._id, subReply._id, subReply.likes?.includes(user?._id))}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill={subReply.likes?.includes(user?._id) ? '#c42152' : 'none'} stroke={subReply.likes?.includes(user?._id) ? '#c42152' : 'currentColor'} strokeWidth="2">
                                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                        <span className="text-xs">{subReply.likes?.length || 0}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-1">
                      {shownReplies < totalReplies && (
                        <button className="text-xs text-blue-500 hover:underline w-fit" onClick={() => handleShowMoreReplies(comment._id, totalReplies)}>
                          Show more replies
                        </button>
                      )}
                      <button className="text-xs text-gray-500 hover:underline w-fit" onClick={() => handleHideReplies(comment._id)}>
                        Hide replies
                      </button>
                    </div>
                  </React.Fragment>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  }

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-[#222] rounded-lg shadow p-4 mt-4">
      <h3 className="text-lg font-bold mb-3 text-black dark:text-white flex items-center gap-2">
        Comments
        <span className="text-base font-normal text-gray-500 dark:text-gray-400">({comments.length})</span>
      </h3>
      <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
        <input type="text" className="flex-1 border rounded px-3 py-2 text-black dark:text-white bg-gray-100 dark:bg-gray-800" placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Post</button>
      </form>
      <div className="flex flex-col gap-4">
        {comments.length === 0 ? (
          <span className="text-gray-500">No comments yet.</span>
        ) : (
          renderComments(comments)
        )}
      </div>
    </div>
  );
}
