import React from 'react';

// Icons as SVGs
const LikeIcon = ({ liked }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill={liked ? '#c42152' : 'none'} stroke={liked ? '#c42152' : 'currentColor'} strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const DislikeIcon = ({ disliked }) => (
  <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: disliked ? '#e5e7eb' : '#f3f4f6', borderRadius: '6px'}}>
    <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 -960 960 960" width="36px" fill={disliked ? '#888' : '#a3a3a3'} style={{transition: 'fill 0.2s'}}><path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/></svg>
  </span>
);

const CommentIcon = ({ active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : 'currentColor'} width="32" height="32">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={active ? '#2563eb' : 'currentColor'} strokeWidth="2" fill="none" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="12" width="18" height="8" rx="2" />
    <path d="M12 16V4" />
    <path d="M8 8l4-4 4 4" />
  </svg>
);

const VideoInteractions = ({
  liked, setLiked, likeCount,
  disliked, setDisliked, dislikeCount,
  showComments, setShowComments, commentCount
}) => (
  <div className="flex flex-wrap gap-4 w-full justify-start items-center mt-2">
    <button
      className={`flex items-center gap-2 transition bg-transparent border-none p-0 ${liked ? 'text-pink-500' : 'text-gray-700 dark:text-gray-200 hover:text-pink-500'}`}
      style={{ minHeight: 40 }}
      onClick={() => {
        setLiked(l => !l);
      }}
    >
      <LikeIcon liked={liked} />
      <span className="text-sm">Like ({likeCount})</span>
    </button>
    <button
      className={`flex items-center gap-2 text-gray-700 dark:text-gray-200 transition bg-transparent border-none p-0 ${disliked ? 'text-gray-400' : 'hover:text-gray-400'}`}
      style={{ minHeight: 40 }}
      onClick={() => {
        setDisliked(d => !d);
      }}
    >
      <DislikeIcon disliked={disliked} />
      <span className="text-sm">Dislike ({Math.max(0, dislikeCount)})</span>
    </button>
    <button
      className={`flex items-center gap-2 transition bg-transparent border-none p-0 ${showComments ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200 hover:text-blue-500'}`}
      style={{ minHeight: 40 }}
      onClick={() => setShowComments((prev) => !prev)}
    >
      <CommentIcon active={showComments} />
      <span className="text-sm">Comments ({commentCount})</span>
    </button>
    <button
      className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-green-600 transition bg-transparent border-none p-0"
      style={{ minHeight: 40 }}
      onClick={() => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      }}
    >
      <ShareIcon />
      <span className="text-sm">Share</span>
    </button>
  </div>
);

export default VideoInteractions;
