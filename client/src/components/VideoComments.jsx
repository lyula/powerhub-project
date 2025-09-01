import React, { useState, useEffect } from "react";

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

export default function VideoComments({ videoId, user, channel, onCountChange }) {
  // Replace with API fetch for comments for the video
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    // TODO: Fetch comments for the video from backend
    // setComments(fetchedComments);
  }, [videoId]);

  const getDisplayName = (author, channel) => {
    if (channel && channel.name) return channel.name;
    return author;
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: user?.name || "You",
      authorProfile: user?.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
      channel: channel || null,
      text: commentText,
      posted: "Just now",
      replies: [],
    };
    setComments([...comments, newComment]);
    setCommentText("");
    if (onCountChange) onCountChange(comments.length + 1);
  };

  const handleReply = (id) => {
    setReplyingTo(id);
    setReplyText("");
  };

  const handleAddReply = (e, id) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setComments((prevComments) => {
      const addReplyRecursive = (commentsList) =>
        commentsList.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: Date.now(),
                  author: user?.name || "You",
                  authorProfile: user?.avatar || "https://randomuser.me/api/portraits/lego/2.jpg",
                  channel: channel || null,
                  text: replyText,
                  posted: "Just now",
                  replies: [],
                },
              ],
            };
          } else if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: addReplyRecursive(c.replies),
            };
          }
          return c;
        });
      return addReplyRecursive(prevComments);
    });
    setReplyText("");
    setReplyingTo(null);
  };

  useEffect(() => {
    if (onCountChange) onCountChange(comments.length);
  }, [comments, onCountChange]);

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
          renderComments(comments, handleReply, replyingTo, replyText, setReplyText, handleAddReply, getDisplayName)
        )}
      </div>
    </div>
  );
}
