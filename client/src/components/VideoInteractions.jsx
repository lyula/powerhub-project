import React, { useState } from "react";
import VideoOptionsModal from "./videoOptionsModal";
import VideoShareModal from "./VideoShareModal";
import FlagContentModal from "./FlagContentModal";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdThumbDown,
  MdThumbDownOffAlt,
  MdComment,
  MdShare,
} from "react-icons/md";
import { trackButtonClick } from "../utils/analytics";

const VideoInteractions = ({
  liked,
  setLiked,
  likeCount,
  disliked,
  setDisliked,
  dislikeCount,
  showComments,
  setShowComments,
  commentCount,
  videoUrl,
  shareCount: initialShareCount,
  handleLike,
  handleDislike,
  videoId,
  videoTitle,
  isSaved,
  handleSave,
}) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [shareCount, setShareCount] = useState(initialShareCount);
  const handleShare = () => setShareCount((count) => count + 1);

  const onLike =
    typeof handleLike === "function"
      ? handleLike
      : () => {
          trackButtonClick("video-like", "watch-page");
          if (liked) {
            setLiked(false);
          } else {
            setLiked(true);
          }
          if (disliked) {
            setDisliked(false);
          }
        };

  const onDislike =
    typeof handleDislike === "function"
      ? handleDislike
      : () => {
          trackButtonClick("video-dislike", "watch-page");
          if (disliked) {
            setDisliked(false);
          } else {
            setDisliked(true);
          }
          if (liked) {
            setLiked(false);
          }
        };

  const onSave =
    typeof handleSave === "function"
      ? handleSave
      : () => {
          trackButtonClick("video-save", "watch-page");
        };

  const iconColor = "dark:text-gray-400 text-black";
  const textColor = "dark:text-gray-200 text-black";

  return (
    <div
      className="flex flex-wrap gap-4 w-full justify-start items-center mt-2"
      style={{ position: "relative" }}
    >
      <button
        className={`flex items-center gap-2 transition bg-transparent border-none p-0 ${
          liked
            ? "text-pink-500"
            : `${iconColor} hover:text-pink-500`
        }`}
        style={{ minHeight: 40 }}
        onClick={onLike}
      >
        {liked ? (
          <MdFavorite size={28} color="#c42152" />
        ) : (
          <MdFavoriteBorder size={28} />
        )}
        <span className={`text-sm ${textColor}`}>Like ({likeCount})</span>
      </button>
      <button
        className={`flex items-center gap-2 ${iconColor} transition bg-transparent border-none p-0 hover:text-gray-400`}
        style={{ minHeight: 40 }}
        onClick={onDislike}
      >
        {disliked ? (
          <MdThumbDown size={28} />
        ) : (
          <MdThumbDownOffAlt size={28} />
        )}
        <span className={`text-sm ${textColor}`}>Dislike ({Math.max(0, dislikeCount)})</span>
      </button>
      <button
        className={`flex items-center gap-2 ${iconColor} transition bg-transparent border-none p-0 hover:text-blue-500`}
        style={{ minHeight: 40 }}
        onClick={() => {
          trackButtonClick("video-comments", "watch-page");
          setShowComments((prev) => !prev);
        }}
      >
        <MdComment size={28} />
        <span className={`text-sm ${textColor}`}>Comments ({commentCount})</span>
      </button>
      <button
        className={`flex items-center gap-2 ${iconColor} hover:text-green-600 transition bg-transparent border-none p-0`}
        style={{ minHeight: 40 }}
        onClick={() => {
          trackButtonClick("video-share", "watch-page");
          setShareOpen(true);
        }}
      >
        <MdShare size={28} />
        <span className={`text-sm ${textColor}`}>Share ({shareCount})</span>
      </button>
      <button
        className={`flex items-center justify-center ${iconColor} bg-transparent border-none p-0`}
        style={{ minHeight: 40, position: "relative", zIndex: 10, width: 40, height: 40 }}
        onClick={() => setActionsOpen(true)}
        id="video-actions-trigger"
        aria-label="More actions"
      >
        <span className="inline-flex flex-col items-center justify-center w-6 h-6">
          <span className="w-1.5 h-1.5 rounded-full my-0.5 transition-colors bg-current"></span>
          <span className="w-1.5 h-1.5 rounded-full my-0.5 transition-colors bg-current"></span>
          <span className="w-1.5 h-1.5 rounded-full my-0.5 transition-colors bg-current"></span>
        </span>
      </button>
      
      <VideoShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        videoUrl={videoUrl}
        onShare={handleShare}
      />
      
      <VideoOptionsModal
        isOpen={actionsOpen}
        onClose={() => setActionsOpen(false)}
        onSave={onSave}
        onFlag={() => setFlagOpen(true)}
        onAddToQueue={() => alert("Added to queue!")}
        onAddToPlaylist={() => alert("Added to playlist!")}
        isSaved={isSaved}
      />
      
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
