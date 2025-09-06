import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MobileHeader from '../components/MobileHeader';
import { AcademicCapIcon } from '../components/icons';
import Sidebar from '../components/Sidebar';
import BottomTabs from '../components/BottomTabs';

const CreatePost = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
  // Removed title state
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [link, setLink] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // Helper to upload image to Cloudinary (matches profile picture logic)
  const uploadToCloudinary = async (file) => {
    const CLOUDINARY_NAME = import.meta.env.VITE_CLOUDINARY_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
    const CLOUDINARY_IMAGE_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    const cloudRes = await fetch(CLOUDINARY_IMAGE_URL, {
      method: 'POST',
      body: formData
    });
    const cloudData = await cloudRes.json();
    if (!cloudRes.ok || !cloudData.secure_url) throw new Error(cloudData.error?.message || 'Cloudinary upload failed');
    return cloudData.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Upload images to Cloudinary
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await Promise.all(images.map(uploadToCloudinary));
      }
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      // Create post (send only URLs to backend, with Authorization header)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          content,
          images: imageUrls,
          link,
          privacy,
          specialization,
        }),
      });
      if (!res.ok) throw new Error('Failed to create post');
      setMessage('Post created successfully!');
      setMessageType('success');
      setContent('');
      setImages([]);
      setLink('');
      setPrivacy('public');
      setSpecialization('');
    } catch (err) {
      setMessage('Error: ' + err.message);
      setMessageType('error');
    }
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none' }}>
      {/* Mobile header for Create Post page */}
      <MobileHeader icon={<AcademicCapIcon />} label="Create Post" />
      {/* Desktop header remains unchanged */}
      <div className="hidden md:block">
        <Header onToggleSidebar={handleToggleSidebar} />
      </div>
      <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <Sidebar collapsed={!sidebarOpen} />
        <main className="flex-1 flex flex-col items-center justify-start w-full px-2 md:px-0 pt-8" style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="w-full max-w-3xl mx-auto">
            {/* Removed duplicate Upload Video button */}
            {/* Mobile only: Switch to Upload Video replaces title */}
            <div className="md:hidden w-full flex justify-start pt-12 mb-8">
              <button
                type="button"
                className="px-4 py-2 bg-[#0bb6bc] text-white rounded-lg font-semibold shadow hover:bg-[#0a9ba0] transition"
                onClick={() => navigate('/upload')}
              >
                Upload Video
              </button>
            </div>
            {/* Desktop only: Show title */}
            <h2 className="hidden md:block text-2xl md:text-3xl font-bold mb-8 text-[#c42152] dark:text-[#c42152] text-left pl-8">Create Post</h2>
            {message && <div className="mb-4 text-green-600 dark:text-green-400 w-full max-w-2xl">{message}</div>}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Title field removed. Only description, images, and link remain. */}
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Link (optional)</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c42152] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  required
                >
                  <option value="public">Public</option>
                  <option value="specialization">Specialization Only</option>
                </select>
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c42152] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  rows={4}
                  required
                  placeholder="Whats on your mind?"
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c42152] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  placeholder="Enter specialization group"
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Images</label>
                {/* Preview selected images */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {images.map((img, idx) => {
                      const url = typeof img === 'string' ? img : URL.createObjectURL(img);
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <img
                            src={url}
                            alt={img.name || `Selected ${idx+1}`}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-700 mb-1"
                            style={{ minWidth: '6rem', minHeight: '6rem' }}
                          />
                          <span className="px-3 py-1 rounded-full bg-[#c42152] text-white text-xs font-medium">
                            {img.name || `Image ${idx+1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  required
                />
              </div>
              {/* Message above the button */}
              {message && (
                <div
                  className={`md:col-span-2 mb-4 w-full text-center px-4 py-2 rounded-lg font-semibold ${
                    messageType === 'success'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}
                  style={{ marginBottom: '1rem' }}
                >
                  {message}
                </div>
              )}
              <div className="md:col-span-2 flex flex-col">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#c42152] text-white rounded-lg hover:bg-[#0bb6bc] transition-colors font-semibold text-lg mt-2"
                >
                  {loading ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <div className="md:hidden">
        <BottomTabs />
      </div>
    </div>
  );
};

export default CreatePost;
