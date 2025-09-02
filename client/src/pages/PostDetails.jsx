import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StudentUtility from '../components/StudentUtility';
import BottomTabs from '../components/BottomTabs';
import { useParams } from 'react-router-dom';
import { timeAgo } from '../utils/timeAgo';

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}`);
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        setPost(data.post || data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchPost();
  }, [postId]);

  // Sidebar expand/collapse logic
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <React.Fragment>
      <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}>
        <HeaderFixed onToggleSidebar={handleToggleSidebar} />
        <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 44px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <SidebarFixed sidebarOpen={sidebarOpen} />
          {!sidebarOpen && (
            <div className="md:ml-20">
              <StudentUtility />
            </div>
          )}
          <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
            <main className="flex-1 p-4 md:p-8 pb-0 overflow-y-auto w-full" style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none', marginTop: '3.5rem' }}>
              {/* ...existing code... */}
              {loading ? (
                <div className="text-gray-500 dark:text-gray-400 px-4 py-6">Loading post...</div>
              ) : error ? (
                <div className="text-red-500 px-4 py-6">{error}</div>
              ) : post ? (
                <div className="bg-white dark:bg-[#181818] rounded-lg shadow-md overflow-hidden flex flex-col min-w-0 w-full border border-gray-200 dark:border-gray-700" style={{ maxWidth: '100%', minWidth: 0, fontSize: '1.05em', padding: '0.5em', marginBottom: '0.75em' }}>
                  <div className="p-3 flex items-start gap-3">
                    <img src={post.author?.profilePicture || post.author?.avatar || post.author?.profile || '/default-avatar.png'} alt={post.author?.username || 'User'} className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0" style={{ width: '48px', height: '48px', objectFit: 'cover', aspectRatio: '1/1', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px' }} />
                    <div className="flex flex-col min-w-0" style={{ flex: 1, minWidth: 0 }}>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{post.author?.username || 'Unknown'}</span>
                      {post.createdAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{timeAgo(post.createdAt)}</span>
                      )}
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"> • {post.posted}</span>
                      <span className="text-xs text-[#c42152] font-semibold">{post.specialization}</span>
                    </div>
                  </div>
                  {post.images && post.images.length > 0 && (
                    <div className="w-full flex items-center justify-center bg-gray-100 dark:bg-[#222]" style={{ minHeight: '160px', maxHeight: '260px', overflow: 'hidden' }}>
                      <img src={post.images[0]} alt={post.content} className="object-cover w-full h-full cursor-pointer" style={{ maxHeight: '260px', borderRadius: '0' }} onClick={() => window.open(post.images[0], '_blank')} />
                    </div>
                  )}
                  <div className="p-4 pt-3 text-gray-900 dark:text-gray-100 text-base">
                    {post.content}
                    {post.link && (
                      <div className="mt-2">
                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-[#0bb6bc] underline">View Link</a>
                      </div>
                    )}
                  </div>
                  {/* Comments section */}
                  <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-3 text-black dark:text-white">Comments</h3>
                    {Array.isArray(post.comments) && post.comments.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {post.comments.map((comment, idx) => (
                          <div key={comment._id || idx} className="bg-gray-50 dark:bg-[#222] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-1">
                              <img src={comment.author?.profilePicture || comment.author?.avatar || '/default-avatar.png'} alt={comment.author?.username || 'User'} className="w-7 h-7 rounded-full object-cover border border-gray-300 dark:border-gray-700" />
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{comment.author?.username || 'Unknown'}</span>
                            </div>
                            <span className="text-gray-800 dark:text-gray-200 text-sm">{comment.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">No comments yet.</div>
                    )}
                  </div>
                </div>
              ) : null}
            </main>
          </div>
        </div>
        <BottomTabs />
      </div>
    </React.Fragment>
  );
}

function HeaderFixed({ onToggleSidebar }) {
  return (
    <div className="fixed top-0 left-0 w-full z-40" style={{ height: '44px' }}>
      <Header onToggleSidebar={onToggleSidebar} />
    </div>
  );
}

function SidebarFixed({ sidebarOpen }) {
  return (
    <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent md:block`}>
      <Sidebar collapsed={!sidebarOpen} />
    </div>
  );
}

export default PostDetails;

// Helper to format relative time (e.g., '2 hours ago')
function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000); // seconds
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}
