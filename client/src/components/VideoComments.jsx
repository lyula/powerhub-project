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
  const [replyingTo, setReplyingTo] = useState(null);
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

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyText("");
  };

  const handleAddReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId, text: replyText })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setReplyText("");
        setReplyingTo(null);
        if (onCountChange) onCountChange((data.comments || []).length);
      }
    } catch (err) {}
  };

  const handleLikeComment = async (commentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/comment/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentId })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        if (onCountChange) onCountChange((data.comments || []).length);
      }
    } catch (err) {}
  };

  // Helper to recursively render comments and replies with like/reply
  function renderComments(commentsList) {
    return commentsList.map((comment) => (
      <div key={comment._id} className="flex gap-3 items-start">
        <img src={getAvatar(comment.author)} alt={getDisplayName(comment.author)} className="w-8 h-8 rounded-full border" />
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-black dark:text-white">{getDisplayName(comment.author)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{new Date(comment.createdAt).toLocaleString()}</span>
          <span className="text-gray-800 dark:text-gray-200 mb-2">{comment.text}</span>
          <div className="flex items-center gap-6 mb-1">
            <button className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-pink-500 transition bg-transparent border-none p-0" onClick={() => handleLikeComment(comment._id)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill={comment.likes?.length > 0 ? '#c42152' : 'none'} stroke="currentColor" strokeWidth="2">
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
          {replyingTo === comment._id && (
            <form onSubmit={(e) => handleAddReply(e, comment._id)} className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
              <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">Reply</button>
            </form>
          )}
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-2 flex flex-col gap-2">
              {comment.replies.map((reply) => (
                <div key={reply._id} className="flex gap-2 items-start">
                  <img src={getAvatar(reply.author)} alt={getDisplayName(reply.author)} className="w-7 h-7 rounded-full border" />
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-black dark:text-white">{getDisplayName(reply.author)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{new Date(reply.createdAt).toLocaleString()}</span>
                    <span className="text-gray-800 dark:text-gray-200">{reply.text}</span>
                    <button className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-pink-500 transition bg-transparent border-none p-0 mt-1" onClick={() => handleLikeComment(reply._id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill={reply.likes?.length > 0 ? '#c42152' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="text-xs">{reply.likes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ));
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
