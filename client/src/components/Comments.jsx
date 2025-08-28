import React, { useState } from "react";

const dummyComments = [
  {
    id: 1,
    author: "Jane Doe",
    authorProfile: "https://randomuser.me/api/portraits/women/1.jpg",
    text: "Great video! Learned a lot.",
    posted: "2 hours ago",
    likes: 2,
    dislikes: 0,
    replies: [
      {
        id: 11,
        author: "Alex Kim",
        authorProfile: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Glad you enjoyed it!",
        posted: "1 hour ago",
      },
    ],
  },
  {
    id: 2,
    author: "John Smith",
    authorProfile: "https://randomuser.me/api/portraits/men/2.jpg",
    text: "Thanks for sharing!",
    posted: "1 hour ago",
    likes: 1,
    dislikes: 1,
    replies: [],
  },
];

export default function Comments({ comments = dummyComments, onCountChange }) {
  const [commentText, setCommentText] = useState("");
  const [allComments, setAllComments] = useState(comments);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const updated = [
      ...allComments,
      {
        id: Date.now(),
        author: "You",
        authorProfile: "https://randomuser.me/api/portraits/lego/1.jpg",
        text: commentText,
        posted: "Just now",
        likes: 0,
        dislikes: 0,
        replies: [],
      },
    ];
    setAllComments(updated);
    setCommentText("");
    if (onCountChange) onCountChange(updated.length);
  };

  const handleLike = (id) => {
    setAllComments(comments => comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
  };
  const handleDislike = (id) => {
    setAllComments(comments => comments.map(c => c.id === id ? { ...c, dislikes: c.dislikes + 1 } : c));
  };
  const handleReply = (id) => {
    setReplyingTo(id);
    setReplyText("");
  };
  const handleAddReply = (e, id) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setAllComments(comments => comments.map(c =>
      c.id === id
        ? {
            ...c,
            replies: [
              ...c.replies,
              {
                id: Date.now(),
                author: "You",
                authorProfile: "https://randomuser.me/api/portraits/lego/2.jpg",
                text: replyText,
                posted: "Just now",
              },
            ],
          }
        : c
    ));
    setReplyText("");
    setReplyingTo(null);
  };

  React.useEffect(() => {
    if (onCountChange) onCountChange(allComments.length);
  }, [allComments, onCountChange]);

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-[#222] rounded-lg shadow p-4 mt-4">
      <h3 className="text-lg font-bold mb-3 text-black dark:text-white flex items-center gap-2">
        Comments
        <span className="text-base font-normal text-gray-500 dark:text-gray-400">({allComments.length})</span>
      </h3>
      <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 text-black dark:text-white bg-gray-100 dark:bg-gray-800"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Post
        </button>
      </form>
      <div className="flex flex-col gap-4">
        {allComments.length === 0 ? (
          <span className="text-gray-500">No comments yet.</span>
        ) : (
          allComments.map((c) => (
            <div key={c.id} className="flex gap-3 items-start">
              <img src={c.authorProfile} alt={c.author} className="w-8 h-8 rounded-full border" />
              <div className="flex flex-col flex-1">
                <span className="font-semibold text-black dark:text-white">{c.author}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{c.posted}</span>
                <span className="text-gray-800 dark:text-gray-200 mb-2">{c.text}</span>
                <div className="flex items-center gap-6 mb-1">
                  <button
                    className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-pink-500 transition bg-transparent border-none p-0"
                    onClick={() => handleLike(c.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill={c.likes > 0 ? '#c42152' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-xs">{c.likes}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-gray-400 transition bg-transparent border-none p-0"
                    onClick={() => handleDislike(c.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill={c.dislikes > 0 ? '#888' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M22 10.5c0-.83-.67-1.5-1.5-1.5h-6.36l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v8c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-6.5h2c.83 0 1.5-.67 1.5-1.5zM5 10v8c0 .55.45 1 1 1s1-.45 1-1v-8c0-.55-.45-1-1-1s-1 .45-1 1z" />
                    </svg>
                    <span className="text-xs">{c.dislikes}</span>
                  </button>
                  <button
                    className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-blue-500 transition bg-transparent border-none p-0"
                    onClick={() => handleReply(c.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                    <span className="text-xs">Reply ({c.replies.length})</span>
                  </button>
                </div>
                {replyingTo === c.id && (
                  <form onSubmit={(e) => handleAddReply(e, c.id)} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded px-2 py-1 text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Reply
                    </button>
                  </form>
                )}
                {/* Replies */}
                {c.replies.length > 0 && (
                  <div className="ml-8 mt-2 flex flex-col gap-2">
                    {c.replies.map(r => (
                      <div key={r.id} className="flex gap-2 items-start">
                        <img src={r.authorProfile} alt={r.author} className="w-7 h-7 rounded-full border" />
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-black dark:text-white">{r.author}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{r.posted}</span>
                          <span className="text-gray-800 dark:text-gray-200">{r.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
