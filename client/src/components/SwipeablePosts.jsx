import React from 'react';
import { FaRegHeart, FaHeart, FaRegThumbsDown, FaRegCommentDots, FaShare } from 'react-icons/fa';

// Sample dummy posts with images, links, and counts
const posts = [
  {
    id: 1,
    username: 'powerhub_admin',
    profile: 'https://randomuser.me/api/portraits/men/32.jpg',
    content: 'Check out our new features and updates.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    link: 'https://powerhub.com/features',
    likes: 1200,
    dislikes: 45,
    comments: 320,
    shares: 80,
  },
  {
    id: 2,
    username: 'community_manager',
    profile: 'https://randomuser.me/api/portraits/women/44.jpg',
    content: 'Join our upcoming webinar for exclusive tips.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    link: 'https://powerhub.com/webinar',
    likes: 5400,
    dislikes: 12,
    comments: 2100,
    shares: 300,
  },
  {
    id: 3,
    username: 'jane_doe',
    profile: 'https://randomuser.me/api/portraits/women/65.jpg',
    content: 'Read how Jane improved her workflow with PowerHub.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    link: 'https://powerhub.com/stories/jane',
    likes: 980,
    dislikes: 5,
    comments: 120,
    shares: 40,
  },
  {
    id: 4,
    username: 'dev_team',
    profile: 'https://randomuser.me/api/portraits/men/56.jpg',
    content: 'Explore our documentation and start building today.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
    link: 'https://powerhub.com/docs',
    likes: 22000,
    dislikes: 100,
    comments: 8000,
    shares: 1200,
  },
  {
    id: 5,
    username: 'tips_bot',
    profile: 'https://randomuser.me/api/portraits/men/76.jpg',
    content: 'Discover quick tips to boost your productivity and get the most out of PowerHub. Stay tuned for weekly updates!',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    link: 'https://powerhub.com/tips',
    likes: 350,
    dislikes: 2,
    comments: 60,
    shares: 10,
  },
];

// ExpandablePostCard component for truncation and expand on tap
function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + 'm';
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return n;
}

const ExpandablePostCard = ({ post }) => {
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(post.likes);

  const handleLike = () => {
    setLiked(l => !l);
    setLikeCount(count => liked ? count - 1 : count + 1);
  };

  return (
    <div
      className="min-w-[370px] max-w-[400px] h-[260px] bg-white dark:bg-[#222] rounded-lg shadow-sm flex-shrink-0 border border-gray-200 dark:border-gray-700 flex flex-col justify-between font-sans"
      style={{ fontFamily: 'Roboto, Arial, sans-serif' }}
    >
      <div className="flex flex-row items-start px-4 pt-3 pb-2 gap-3 flex-1 relative">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <img src={post.profile} alt={post.username} className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-700" />
            <span className="text-[18px] font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">{post.username}</span>
          </div>
          <span
            className="text-[16px] text-gray-800 dark:text-gray-200 mb-1 leading-snug line-clamp-5"
            style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}
            title={post.content}
          >
            {post.content}
          </span>
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0bb6bc] dark:text-[#0bb6bc] font-medium underline hover:text-[#099ca1] text-[15px] mt-1"
            >
              Learn more
            </a>
          )}
        </div>
        {post.image && (
          <div className="flex flex-col justify-center items-center h-full">
            <img
              src={post.image}
              alt={post.title}
              className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ minWidth: '8rem', minHeight: '8rem' }}
            />
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <button
            className={`flex items-center gap-1 ${liked ? 'text-pink-500' : 'text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc]'}`}
            onClick={handleLike}
          >
            {liked ? <FaHeart className="text-[20px]" /> : <FaRegHeart className="text-[20px]" />}
            <span className="text-xs font-medium">{formatCount(likeCount)}</span>
          </button>
          <button className="text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc] flex items-center gap-1">
            <FaRegThumbsDown className="text-[20px]" />
            <span className="text-xs font-medium">{formatCount(post.dislikes)}</span>
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <button className="text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc] flex items-center gap-1">
            <FaRegCommentDots className="text-[20px]" />
            <span className="text-xs font-medium">{formatCount(post.comments)}</span>
          </button>
          <button className="text-gray-600 dark:text-gray-400 hover:text-[#0bb6bc] flex items-center gap-1">
            <FaShare className="text-[20px]" />
            <span className="text-xs font-medium">{formatCount(post.shares)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SwipeablePosts = () => {
  return (
  <section className="w-full mt-2 mb-8">
      <h2 className="text-[1.25rem] font-medium font-sans mb-4 text-[#0bb6bc] dark:text-[#0bb6bc]">PowerHub Community posts</h2>
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {posts.map(post => (
          <ExpandablePostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default SwipeablePosts;