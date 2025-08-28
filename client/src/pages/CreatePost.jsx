import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomTabs from '../components/BottomTabs';

const CreatePost = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [link, setLink] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // Simulate upload
    setTimeout(() => {
      setLoading(false);
      setMessage('Post created successfully!');
      setTitle('');
      setDescription('');
  setImages([]);
  setLink('');
  setPrivacy('public');
  setSpecialization('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none' }}>
      <Header onToggleSidebar={handleToggleSidebar} />
      <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <Sidebar collapsed={!sidebarOpen} />
        <main className="flex-1 flex flex-col items-center justify-start w-full px-2 md:px-0 pt-8" style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="w-full max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#c42152] dark:text-[#c42152] text-left pl-8">Create Post</h2>
            {message && <div className="mb-4 text-green-600 dark:text-green-400 w-full max-w-2xl">{message}</div>}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c42152] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  required
                />
              </div>
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
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c42152] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  rows={4}
                  required
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
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  required
                />
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {images.map((img, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-[#c42152] text-white text-xs font-medium">
                        {img.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
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
