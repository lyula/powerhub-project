import React from 'react';
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <div
      className="bg-white dark:bg-[#181818] rounded-lg shadow-md overflow-hidden flex flex-col min-w-0 w-full border border-gray-200 dark:border-gray-700"
      style={{ maxWidth: '100%', minWidth: 0, fontSize: '1.05em', padding: '0.5em', marginBottom: '0.75em' }}
    >
      <div className="p-3 flex items-start gap-3">
        <Link to={`/channel/${encodeURIComponent(post.author)}`}>
          <img src={post.profile} alt={post.author} className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-700 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" style={{ width: '48px', height: '48px', objectFit: 'cover', aspectRatio: '1/1', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px' }} />
        </Link>
        <div className="flex flex-col min-w-0" style={{ flex: 1, minWidth: 0 }}>
          <h3 className="font-bold text-base text-black dark:text-white mb-1 truncate" title={post.title} style={{ maxWidth: '100%' }}>{post.title}</h3>
          <Link to={`/channel/${encodeURIComponent(post.author)}`} className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 hover:underline">
            {post.author}
          </Link>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"> • {post.posted}</span>
          <span className="text-xs text-[#c42152] font-semibold">{post.specialization}</span>
        </div>
      </div>
      {post.images && post.images.length > 0 && (
        <div className="w-full flex items-center justify-center bg-gray-100 dark:bg-[#222]" style={{ minHeight: '160px', maxHeight: '260px', overflow: 'hidden' }}>
          <img src={post.images[0]} alt={post.title} className="object-cover w-full h-full" style={{ maxHeight: '260px', borderRadius: '0' }} />
        </div>
      )}
      <div className="p-4 pt-3 text-gray-900 dark:text-gray-100 text-base">
        {post.description}
      </div>
    </div>
  );
}
