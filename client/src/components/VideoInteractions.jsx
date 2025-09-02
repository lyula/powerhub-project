import React, { useState } from 'react';
import VideoShareModal from './VideoShareModal';
import { MdFavorite, MdFavoriteBorder, MdThumbDown, MdThumbDownOffAlt, MdComment, MdShare } from 'react-icons/md';

const VideoInteractions = ({
  liked, setLiked, likeCount,
  disliked, setDisliked, dislikeCount,
  showComments, setShowComments, commentCount,
  videoUrl,
  shareCount: initialShareCount
}) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCount, setShareCount] = useState(initialShareCount);
  const handleShare = () => setShareCount(count => count + 1);
  return (
    <div className="flex flex-wrap gap-4 w-full justify-start items-center mt-2">
    <button
      className={`flex items-center gap-2 transition bg-transparent border-none p-0 ${liked ? 'text-pink-500' : 'text-gray-700 dark:text-gray-200 hover:text-pink-500'}`}
      style={{ minHeight: 40 }}
      onClick={() => {
        setLiked(l => !l);
      }}
    >
      {liked
        ? <MdFavorite size={28} color="#c42152" />
        : <MdFavoriteBorder size={28} color="currentColor" />}
      <span className="text-sm">Like ({likeCount})</span>
    </button>
    <button
      className={`flex items-center gap-2 text-gray-700 dark:text-gray-200 transition bg-transparent border-none p-0 ${disliked ? 'text-gray-400' : 'hover:text-gray-400'}`}
      style={{ minHeight: 40 }}
      onClick={() => {
        setDisliked(d => !d);
      }}
    >
      {disliked
        ? <MdThumbDown size={28} color="#888" />
        : <MdThumbDownOffAlt size={28} color="#a3a3a3" />}
      <span className="text-sm">Dislike ({Math.max(0, dislikeCount)})</span>
    </button>
    <button
      className={`flex items-center gap-2 transition bg-transparent border-none p-0 ${showComments ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200 hover:text-blue-500'}`}
      style={{ minHeight: 40 }}
      onClick={() => setShowComments((prev) => !prev)}
    >
      <MdComment size={28} color={showComments ? '#2563eb' : 'currentColor'} />
      <span className="text-sm">Comments ({commentCount})</span>
    </button>
    <button
      className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-green-600 transition bg-transparent border-none p-0"
      style={{ minHeight: 40 }}
      onClick={() => setShareOpen(true)}
    >
      <MdShare size={28} color="#0bb6bc" />
      <span className="text-sm">Share ({shareCount})</span>
    </button>
  <VideoShareModal open={shareOpen} onClose={() => setShareOpen(false)} videoUrl={videoUrl || window.location.href} onShare={handleShare} />
  </div>
  );
};

export default VideoInteractions;
