import React, { useState } from 'react';
import VideoShareModal from './VideoShareModal';
import FlagContentModal from './FlagContentModal';
import { MdFavorite, MdFavoriteBorder, MdThumbDown, MdThumbDownOffAlt, MdComment, MdShare, MdFlag } from 'react-icons/md';
import { trackButtonClick } from '../utils/analytics';

const VideoInteractions = ({
  liked, setLiked, likeCount,
  disliked, setDisliked, dislikeCount,
  showComments, setShowComments, commentCount,
  videoUrl,
  shareCount: initialShareCount,
  handleLike,
  handleDislike,
  videoId,
  videoTitle
}) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [shareCount, setShareCount] = useState(initialShareCount);
  const handleShare = () => setShareCount(count => count + 1);

  // Use handlers from props if provided
  const onLike = typeof handleLike === 'function' ? handleLike : () => {
    trackButtonClick('video-like', 'watch-page');
    if(liked){
      setLiked(false);
    }else{
      setLiked(true);
    }
    if(disliked){
      setDisliked(false);
    }
  };

  const onDislike = typeof handleDislike === 'function' ? handleDislike : () => {
    trackButtonClick('video-dislike', 'watch-page');
    if(disliked){
      setDisliked(false);
    }else{
      setDisliked(true);
    }
    if(liked){
      setLiked(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 w-full justify-start items-center mt-2">
    <button
      className={`flex items-center gap-2 transition bg-transparent border-none p-0 ${liked ? 'text-pink-500' : 'text-gray-700 dark:text-gray-200 hover:text-pink-500'}`}
      style={{ minHeight: 40 }}
  onClick={onLike}
    >
      {liked
        ? <MdFavorite size={28} color="#c42152" />
        : <MdFavoriteBorder size={28} color="currentColor" />}
      <span className="text-sm">Like ({likeCount})</span>
    </button>
    <button
      className={`flex items-center gap-2 text-gray-700 dark:text-gray-200 transition bg-transparent border-none p-0 ${disliked ? 'text-gray-400' : 'hover:text-gray-400'}`}
      style={{ minHeight: 40 }}
  onClick={onDislike}
    >
      {disliked
        ? <MdThumbDown size={28} color="#888" />
        : <MdThumbDownOffAlt size={28} color="#a3a3a3" />}
      <span className="text-sm">Dislike ({Math.max(0, dislikeCount)})</span>
    </button>
    <button
      className={`flex items-center gap-2 transition bg-transparent border-none p-0 ${showComments ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200 hover:text-blue-500'}`}
      style={{ minHeight: 40 }}
      onClick={() => {
        trackButtonClick('video-comments', 'watch-page');
        setShowComments((prev) => !prev);
      }}
    >
      <MdComment size={28} color={showComments ? '#2563eb' : 'currentColor'} />
      <span className="text-sm">Comments ({commentCount})</span>
    </button>
    <button
      className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-green-600 transition bg-transparent border-none p-0"
      style={{ minHeight: 40 }}
      onClick={() => {
        trackButtonClick('video-share', 'watch-page');
        setShareOpen(true);
      }}
    >
      <MdShare size={28} color="#0bb6bc" />
      <span className="text-sm">Share ({shareCount})</span>
    </button>
    <button
      className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-red-600 transition bg-transparent border-none p-0"
      style={{ minHeight: 40 }}
      onClick={() => {
        trackButtonClick('video-flag', 'watch-page');
        setFlagOpen(true);
      }}
    >
      <MdFlag size={28} color="#dc2626" />
      <span className="text-sm">Flag</span>
    </button>
  <VideoShareModal open={shareOpen} onClose={() => setShareOpen(false)} videoUrl={videoUrl || window.location.href} onShare={handleShare} />
  <FlagContentModal 
    isOpen={flagOpen} 
    onClose={() => setFlagOpen(false)} 
    contentType="video" 
    contentId={videoId} 
    contentTitle={videoTitle} 
  />
  </div>
  );
};

export default VideoInteractions;
