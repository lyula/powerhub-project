import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import BottomTabs from '../components/BottomTabs';

const UploadVideo = () => {
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/filters`);
        setCategoriesList(res.data.map(f => f.name));
      } catch (err) {
        setCategoriesList([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchFilters();
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // Simulate upload
    setTimeout(() => {
      setLoading(false);
      setMessage('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none' }}>
      <Header onToggleSidebar={handleToggleSidebar} />
      <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <Sidebar collapsed={!sidebarOpen} />
        <main className="flex-1 flex flex-col items-center justify-start w-full px-2 md:px-0 pt-8" style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="w-full max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#0bb6bc] dark:text-[#0bb6bc] text-left pl-8">Upload Video</h2>
            {message && <div className="mb-4 text-green-600 dark:text-green-400 w-full max-w-2xl">{message}</div>}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg mt-2"
                  required
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? 'Loading...' : 'Select Category'}</option>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  rows={4}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Privacy</label>
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
              <div className="flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  disabled={privacy !== 'specialization'}
                />
              </div>
              <div className="md:col-span-2 flex flex-col">
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-lg"
                  required
                />
              </div>
              <div className="md:col-span-2 flex flex-col">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#0bb6bc] text-white rounded-lg hover:bg-[#0a9ba0] transition-colors font-semibold text-lg mt-2"
                >
                  {loading ? 'Uploading...' : 'Upload Video'}
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

export default UploadVideo;
