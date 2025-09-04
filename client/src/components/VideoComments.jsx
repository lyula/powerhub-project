import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import ProfilePictureZoomModal from './ProfilePictureZoomModal';
import ThreeDotsMenu from './ThreeDotsMenu'; // Added missing import
import EditPortal from './EditPortal';

const Comments = ({ videoId, channel }) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, replyId }
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editReplyId, setEditReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [editReplyParentId, setEditReplyParentId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({}); // { [commentId]: number }
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Helper to format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'just now';
    const posted = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - posted) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mth ago`;
    return `${Math.floor(diff / 31536000)}yr ago`;
  };

  // Helper to get display name
  const getDisplayName = (author, channel) => {
    return author?.username || author?.firstName || channel?.name || 'Unknown';
  };

  // Helper to get avatar
  const getAvatar = (author) => {
    return author?.profilePicture || author?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg';
  };

  // Helper to get total comment count (including replies)
  const getTotalCommentCount = (commentsList) => {
    return commentsList.reduce((count, comment) => {
      return count + 1 + (comment.replies ? comment.replies.reduce((replyCount, reply) => {
        return replyCount + 1 + (reply.replies ? reply.replies.length : 0);
      }, 0) : 0);
    }, 0);
  };

  // Handle adding a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !token) return;
    const optimisticComment = {
      _id: `temp_${Date.now()}`,
      text: commentText,
      author: { _id: user._id, username: user.username, profilePicture: user.profilePicture },
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
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
        const data = await res.json();
        setComments((prev) => [data, ...prev.filter(c => c._id !== optimisticComment._id)]);
      } else {
        setComments((prev) => prev.filter(c => c._id !== optimisticComment._id));
      }
    } catch (err) {
      setComments((prev) => prev.filter(c => c._id !== optimisticComment._id));
    }
  };

  // Handle replying to a comment or reply
  const handleReply = (commentId, replyId = null) => {
    setReplyingTo({ commentId, replyId });
    setReplyText('');
  };

  // Handle adding a reply
  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !token || !replyingTo) return;
    const { commentId, replyId } = replyingTo;
    const optimisticReply = {
      _id: `temp_${Date.now()}`,
      text: replyId ? `@${getDisplayName(comments.find(c => c._id === commentId)?.replies?.find(r => r._id === replyId)?.author)} ${replyText}` : replyText,
      author: { _id: user._id, username: user.username, profilePicture: user.profilePicture },
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };
    setComments((prev) => prev.map(comment => {
      if (comment._id === commentId) {
        if (replyId) {
          return {
            ...comment,
            replies: comment.replies.map(r => {
              if (r._id === replyId) {
                return { ...r, replies: [...(r.replies || []), optimisticReply] };
              }
              return r;
            })
          };
        } else {
          return { ...comment, replies: [...(comment.replies || []), optimisticReply] };
        }
      }
      return comment;
    }));
    setReplyText('');
    setReplyingTo(null);
    try {
      const url = replyId
        ? `${API_BASE_URL}/videos/${videoId}/comment/reply/reply`
        : `${API_BASE_URL}/videos/${videoId}/comment/reply`;
      const body = replyId ? { commentId, text: replyText, parentReplyId: replyId } : { commentId, text: replyText };
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
            if (replyId) {
              return {
                ...comment,
                replies: comment.replies.map(r => {
                  if (r._id === replyId) {
                    return { ...r, replies: [...(r.replies.filter(r => !r._id.startsWith('temp_')) || []), data] };
                  }
                  return r;
                })
              };
            } else {
              return { ...comment, replies: [...(comment.replies.filter(r => !r._id.startsWith('temp_')) || []), data] };
            }
          }
          return comment;
        }));
      } else {
        setComments((prev) => prev.map(comment => {
          if (comment._id === commentId) {
            if (replyId) {
              return {
                ...comment,
                replies: comment.replies.map(r => {
                  if (r._id === replyId) {
                    return { ...r, replies: (r.replies || []).filter(r => !r._id.startsWith('temp_')) };
                  }
                  return r;
                })
              };
            } else {
              return { ...comment, replies: (comment.replies || []).filter(r => !r._id.startsWith('temp_')) };
            }
          }
          return comment;
        }));
      }
    } catch (err) {
      setComments((prev) => prev.map(comment => {
        if (comment._id === commentId) {
          if (replyId) {
            return {
              ...comment,
              replies: comment.replies.map(r => {
                if (r._id === replyId) {
                  return { ...r, replies: (r.replies || []).filter(r => !r._id.startsWith('temp_')) };
                }
                return r;
              })
            };
          } else {
            return { ...comment, replies: (comment.replies || []).filter(r => !r._id.startsWith('temp_')) };
          }
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
        return { ...comment, text: editCommentText };
      }
      return comment;
    }));
    setEditCommentId(null);
    try {
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId, text: editCommentText })
      });
      if (res.ok) {
        const updatedComment = await res.json();
        setComments((prev) => prev.map(comment => comment._id === commentId ? { ...comment, text: updatedComment.text } : comment));
      } else {
        setComments(prevComments);
      }
    } catch (err) {
      setComments(prevComments);
    }
  };

  // Handle editing a reply
  const handleEditReplySubmit = async (e, commentId, replyId, parentReplyId = null) => {
    e.preventDefault();
    if (!editReplyText.trim() || !user || !token) return;
    const prevComments = comments;
    setComments((prev) => prev.map(comment => {
      if (comment._id === commentId) {
        if (parentReplyId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply._id === parentReplyId) {
                return {
                  ...reply,
                  replies: reply.replies.map(subReply => {
                    if (subReply._id === replyId) {
                      return { ...subReply, text: editReplyText };
                    }
                    return subReply;
                  })
                };
              }
              return reply;
            })
          };
        } else {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply._id === replyId) {
                return { ...reply, text: editReplyText };
              }
              return reply;
            })
          };
        }
      }
      return comment;
    }));
    setEditReplyId(null);
    setEditReplyText('');
    setEditReplyParentId(null);
    try {
      const url = `${API_BASE_URL}/videos/${videoId}/comment/reply`;
      const body = parentReplyId ? { commentId, replyId, text: editReplyText, parentReplyId } : { commentId, replyId, text: editReplyText };
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const updatedReply = await res.json();
        setComments((prev) => prev.map(comment => {
          if (comment._id === commentId) {
            if (parentReplyId) {
              return {
                ...comment,
                replies: comment.replies.map(reply => {
                  if (reply._id === parentReplyId) {
                    return {
                      ...reply,
                      replies: reply.replies.map(subReply => subReply._id === replyId ? { ...subReply, text: updatedReply.text } : subReply)
                    };
                  }
                  return reply;
                })
              };
            } else {
              return {
                ...comment,
                replies: comment.replies.map(reply => reply._id === replyId ? { ...reply, text: updatedReply.text } : reply)
              };
            }
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
      if (!res.ok) {
        setComments(prevComments);
      }
    } catch (err) {
      setComments(prevComments);
    }
  };

  // Handle deleting a reply
  const handleDeleteReply = async (commentId, replyId, parentReplyId = null) => {
    const prevComments = comments;
    setComments((prev) => prev.map(comment => {
      if (comment._id === commentId) {
        if (parentReplyId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply._id === parentReplyId) {
                return { ...reply, replies: reply.replies.filter(subReply => subReply._id !== replyId) };
              }
              return reply;
            })
          };
        } else {
          return { ...comment, replies: comment.replies.filter(reply => reply._id !== replyId) };
        }
      }
      return comment;
    }));
    try {
      const url = parentReplyId
        ? `${API_BASE_URL}/videos/${videoId}/comment/reply/reply`
        : `${API_BASE_URL}/videos/${videoId}/comment/reply`;
      const body = parentReplyId ? { commentId, replyId, parentReplyId } : { commentId, replyId };
      const res = await fetch(url, {
        method: 'DELETE',
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
  const handleLikeReply = async (commentId, replyId, liked, parentReplyId = null) => {
    if (!user || !token) return;
    const updateReplyLikes = (replies) => {
      return replies.map(reply => {
        if (parentReplyId && reply._id === parentReplyId && reply.replies) {
          return {
            ...reply,
            replies: reply.replies.map(subReply => {
              if (subReply._id === replyId) {
                let likesArr = Array.isArray(subReply.likes) ? subReply.likes : [];
                let newLikes = liked
                  ? likesArr.filter(id => id !== user._id)
                  : [...new Set([...likesArr, user._id])];
                return { ...subReply, likes: newLikes };
              }
              return subReply;
            })
          };
        } else if (!parentReplyId && reply._id === replyId) {
          let likesArr = Array.isArray(reply.likes) ? reply.likes : [];
          let newLikes = liked
            ? likesArr.filter(id => id !== user._id)
            : [...new Set([...likesArr, user._id])];
          return { ...reply, likes: newLikes };
        } else if (reply.replies && reply.replies.length > 0) {
          return { ...reply, replies: updateReplyLikes(reply.replies) };
        }
        return reply;
      });
    };
    setComments((prev) => prev.map(comment => {
      if (comment._id === commentId) {
        return { ...comment, replies: updateReplyLikes(comment.replies || []) };
      }
      return comment;
    }));
    try {
      const endpoint = liked ? 'unlike' : 'like';
      const url = `${API_BASE_URL}/videos/${videoId}/comment/reply/${endpoint}`;
      const body = parentReplyId ? { commentId, replyId, parentReplyId } : { commentId, replyId };
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
        const updateReplyLikesFromBackend = (replies) => {
          return replies.map(reply => {
            if (parentReplyId && reply._id === parentReplyId && reply.replies) {
              return {
                ...reply,
                replies: reply.replies.map(subReply => {
                  if (subReply._id === replyId) {
                    return { ...subReply, likes: Array.isArray(data.likes) ? data.likes : [] };
                  }
                  return subReply;
                })
              };
            } else if (!parentReplyId && reply._id === replyId) {
              return { ...reply, likes: Array.isArray(data.likes) ? data.likes : [] };
            } else if (reply.replies && reply.replies.length > 0) {
              return { ...reply, replies: updateReplyLikesFromBackend(reply.replies) };
            }
            return reply;
          });
        };
        setComments((prev) => prev.map(comment => {
          if (comment._id === commentId) {
            return { ...comment, replies: updateReplyLikesFromBackend(comment.replies || []) };
          }
          return comment;
        }));
      }
    } catch (err) {}
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
    if (authorId) {
      try {
        const res = await fetch(`${API_BASE_URL}/channel/by-owner/${authorId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            hasChannel = true;
          }
        }
      } catch (err) {}
    }
    setModalData({
      profilePicture: author.profilePicture || author.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
      channelName: author.username || author.firstName || 'Unknown',
      socialLinks: author.socialLinks || channel?.socialLinks || {},
      authorId,
      hasChannel
    });
    setModalOpen(true);
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
                  className="flex-1 border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Save</button>
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
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6-6m0 0l6 6" />
                  </svg>
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
      {/* Delete confirmation popup (outside comment map loop) */}
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
            </div>
            {replyingTo && replyingTo.commentId === comment._id && !replyingTo.replyId && (
              <form onSubmit={handleAddReply} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Reply</button>
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
                            {editReplyId === reply._id && !editReplyParentId ? (
                              <form onSubmit={(e) => handleEditReplySubmit(e, comment._id, reply._id)} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  className="flex-1 border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                                  value={editReplyText}
                                  onChange={(e) => setEditReplyText(e.target.value)}
                                  autoFocus
                                />
                                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Save</button>
                                <button type="button" className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 transition" onClick={() => setEditReplyId(null)}>Cancel</button>
                              </form>
                            ) : (
                              <span className="text-gray-800 dark:text-gray-200">{reply.text}</span>
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6-6m0 0l6 6" />
                                </svg>
                                <span className="text-xs">Reply</span>
                              </button>
                              {isReplyAuthor && (
                                <div className="flex gap-2 ml-auto">
                                  <button
                                    className="text-xs text-blue-500 hover:underline"
                                    onClick={() => { setEditReplyId(reply._id); setEditReplyText(reply.text); setEditReplyParentId(null); }}
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
      {/* Delete reply confirmation popup (outside reply map loop) */}
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
                            {reply.replies && reply.replies.length > 0 && (
                              <div className="mt-2 flex flex-col gap-2">
                                {reply.replies.map((subReply) => {
                                  const isSubReplyAuthor = user?._id === subReply.author?._id;
                                  return (
                                    <div key={subReply._id} className="flex gap-2 items-start">
                                      <img
                                        src={getAvatar(subReply.author)}
                                        alt={getDisplayName(subReply.author)}
                                        className="w-7 h-7 rounded-full border cursor-pointer"
                                        onClick={() => handleProfilePictureClick(subReply.author)}
                                      />
                                      <div className="flex flex-col flex-1">
                                        <span className="font-semibold text-black dark:text-white">
                                          {getDisplayName(subReply.author)}
                                          {subReply.editedAt && (
                                            <span className="text-xs text-gray-500 font-normal ml-2">Edited</span>
                                          )}
                                          <span className="text-xs text-gray-400 font-normal ml-2">{formatRelativeTime(subReply.createdAt)}</span>
                                        </span>
                                        {editReplyId === subReply._id && editReplyParentId === reply._id ? (
                                          <EditPortal isOpen={editReplyId === subReply._id && editReplyParentId === reply._id} onClose={() => setEditReplyId(null)}>
                                            <form onSubmit={(e) => handleEditReplySubmit(e, comment._id, subReply._id, reply._id)} className="flex flex-col gap-2">
                                              <input
                                                type="text"
                                                className="border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                                                value={editReplyText}
                                                onChange={(e) => setEditReplyText(e.target.value)}
                                              />
                                              <div className="flex gap-2 justify-end">
                                                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Save</button>
                                                <button type="button" className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 transition" onClick={() => setEditReplyId(null)}>Cancel</button>
                                              </div>
                                            </form>
                                          </EditPortal>
                                        ) : (
                                          <span className="text-gray-800 dark:text-gray-200">
                                            {reply.author && <span className="text-blue-500 font-semibold mr-1">@{getDisplayName(reply.author)}</span>}
                                            {subReply.text.replace(new RegExp(`^@${getDisplayName(reply.author)}\\s*`), '')}
                                          </span>
                                        )}
                                        <div className="flex items-center gap-4 mt-1">
                                          <button
                                            className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-pink-500 transition bg-transparent border-none p-0"
                                            onClick={() => handleLikeReply(comment._id, subReply._id, subReply.likes?.includes(user?._id), reply._id)}
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill={subReply.likes?.includes(user?._id) ? '#c42152' : 'none'} stroke={subReply.likes?.includes(user?._id) ? '#c42152' : 'currentColor'} strokeWidth="2">
                                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                            <span className="text-xs">{subReply.likes?.length || 0}</span>
                                          </button>
                                          {isSubReplyAuthor && (
                                            {/* Removed ThreeDotsMenu from subReplies as requested */}
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
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

  // Fetch comments on mount
  useEffect(() => {
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
  }, [videoId, API_BASE_URL]);

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
      <div className="w-full max-w-3xl bg-white dark:bg-[#222] rounded-lg shadow p-4 mt-4">
        <h3 className="text-lg font-bold mb-3 text-black dark:text-white flex items-center gap-2">
          Comments
          <span className="text-base font-normal text-gray-500 dark:text-gray-400">({getTotalCommentCount(comments)})</span>
        </h3>
        <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2 text-black dark:text-white bg-gray-100 dark:bg-gray-800"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
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
    </>
  );
};

export default Comments;