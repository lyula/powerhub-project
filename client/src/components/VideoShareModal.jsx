import React, { useState } from 'react';

const SOCIALS = [
  {
    name: 'WhatsApp',
    url: (link) => `https://wa.me/?text=${encodeURIComponent(link)}`,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-green-500 dark:text-green-400">
        <circle cx="16" cy="16" r="16" fill="currentColor" />
        <g>
          <path d="M22.1 9.9C20.3 8.1 18.2 7.2 16 7.2c-4.8 0-8.8 3.9-8.8 8.8 0 1.6.4 3.1 1.2 4.5l-1.3 4.7 4.8-1.3c1.3.7 2.7 1.1 4.1 1.1h.1c4.8 0 8.8-3.9 8.8-8.8 0-2.2-.9-4.3-2.7-6.1zm-6.1 13.2h-.1c-1.3 0-2.6-.4-3.7-1l-.3-.2-2.8.8.8-2.7-.2-.3c-.7-1.1-1.1-2.4-1.1-3.7 0-3.9 3.2-7.1 7.1-7.1 1.9 0 3.6.7 4.9 2 1.3 1.3 2 3.1 2 4.9 0 3.9-3.2 7.1-7.1 7.1zm4-5.4c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.2-.6.7-.7.8-.1.1-.2.2-.4.1-.2-.1-.8-.3-1.5-1-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.3.1-.1.1-.2.2-.3.1-.1.1-.2.2-.3.1-.1.1-.2.2-.3.1-.1.1-.2.1-.3 0-.1 0-.2 0-.3 0-.1-.1-.2-.2-.3-.1-.1-.6-1.5-.8-2.1-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2 0 1.3 1 2.6 1.2 2.8.2.2 2 3.2 4.9 3.2.7 0 1.4-.3 1.7-.6.4-.3.7-.8.8-1.1.1-.3.1-.6.1-.7 0-.1-.2-.2-.4-.3z" fill="#fff" />
        </g>
      </svg>
    ),
  },
  {
    name: 'Twitter',
    url: (link) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}`,
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none" className="text-sky-500 dark:text-sky-400">
        <circle cx="16" cy="16" r="16" fill="currentColor" />
        <path d="M25 11.5c-.6.3-1.2.5-1.9.6.7-.4 1.2-1 1.5-1.7-.7.4-1.4.7-2.2.9-.7-.7-1.7-1.1-2.7-1.1-2.1 0-3.7 2-3.2 4 .1.1.1.2.2.3-3-.2-5.7-1.6-7.5-3.8-.3.5-.5 1-.5 1.6 0 1.1.6 2.1 1.5 2.7-.6 0-1.1-.2-1.6-.4v.1c0 1.5 1.1 2.7 2.5 3-.3.1-.7.2-1 .2-.2 0-.5 0-.7-.1.5 1.3 1.7 2.2 3.2 2.2-1.2.9-2.7 1.4-4.2 1.4-.3 0-.6 0-.9-.1 1.5 1 3.2 1.6 5.1 1.6 6.1 0 9.5-5.1 9.5-9.5v-.4c.7-.5 1.2-1.1 1.6-1.7z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: (link) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none" className="text-blue-700 dark:text-blue-400">
        <circle cx="16" cy="16" r="16" fill="currentColor" />
        <path d="M18.7 25v-7h2.3l.3-2.6h-2.6v-1.6c0-.8.2-1.2 1.2-1.2h1.4V10c-.2 0-.9-.1-1.7-.1-2.1 0-3 1.2-3 3.2v1.8H13v2.6h2.1V25h3.6z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    url: (link) => `https://t.me/share/url?url=${encodeURIComponent(link)}`,
    icon: (
      <svg viewBox="0 0 32 32" width="32" height="32" fill="none" className="text-blue-400 dark:text-blue-300">
        <circle cx="16" cy="16" r="16" fill="currentColor" />
        <path d="M24.5 8.5l-16 6.2c-1.1.4-1.1 1.1-.2 1.4l4.1 1.3 1.6 5.1c.2.6.6.7 1.1.4l2.6-2.1 4.2 3.1c.5.4 1 .2 1.2-.4l2.6-11.2c.2-.7-.2-1.1-.8-.8zM13.7 20.2l-.9-3.1 7.1-6.4-6.2 9.5z" fill="#fff" />
      </svg>
    ),
  },
];


export default function VideoShareModal({ open, onClose, videoUrl, onShare }) {
  const [copied, setCopied] = useState(false);
  // Extract videoId from videoUrl (assumes /watch/:id)
  // Robust videoId extraction (handles trailing slashes, query params)
  let videoId = '';
  if (videoUrl) {
    const match = videoUrl.match(/\/watch\/(\w+)/);
    if (match && match[1]) videoId = match[1];
  }

  const incrementShare = async () => {
    if (!videoId) {
      console.error('No videoId found for share increment');
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      // Ensure /api/ is present if needed
  const endpoint = apiUrl.endsWith('/') ? `${apiUrl}videos/${videoId}/share` : `${apiUrl}/videos/${videoId}/share`;
      const res = await fetch(endpoint, { method: 'POST' });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Share count API error:', errText);
      }
    } catch (err) {
      console.error('Share count increment failed:', err);
    }
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    await incrementShare();
    if (onShare) onShare();
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSocialShare = async (url) => {
    await incrementShare();
    if (onShare) onShare();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-70">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-200 dark:border-gray-800">
        <button className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-red-500 text-2xl" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-center text-[#0bb6bc] dark:text-[#fc3a57]">Share Video</h2>
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
            <input
              type="text"
              value={videoUrl}
              readOnly
              className="w-full bg-transparent text-gray-700 dark:text-gray-200 px-1 py-1 border-none outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-600 dark:hover:bg-blue-700 text-sm"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="flex justify-between gap-2 mt-2">
          {SOCIALS.map(social => (
            <button
              key={social.name}
              onClick={() => handleSocialShare(social.url(videoUrl))}
              className="flex flex-col items-center gap-1 text-xs font-medium group w-1/4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="mx-auto">{social.icon}</span>
              <span className="text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{social.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
