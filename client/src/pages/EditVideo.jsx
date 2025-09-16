import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { MdCloudUpload, MdImage, MdSave, MdArrowBack } from 'react-icons/md';

export default function EditVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  
  const categories = [
    'Education', 'Technology', 'Entertainment', 'Music', 'Gaming', 
    'Sports', 'Travel', 'Food', 'Fashion', 'Lifestyle', 'Other'
  ];

  const handleToggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/videos/${videoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Check if user owns this video
          if (data.channel?.owner !== user._id) {
            toast.error('You are not authorized to edit this video.');
            navigate('/home');
            return;
          }
          
          setVideo(data);
          setTitle(data.title || '');
          setDescription(data.description || '');
          setCategory(data.category || '');
          setThumbnailPreview(data.thumbnailUrl || '');
        } else {
          toast.error('Video not found or you are not authorized to edit it.');
          navigate('/home');
        }
      } catch (error) {
        console.error('Error fetching video:', error);
        toast.error('Error loading video.');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    if (videoId && token) {
      fetchVideo();
    }
  }, [videoId, token, user._id, navigate]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.warning('Please provide a title for your video.');
      return;
    }

    setSaving(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const formData = new FormData();
      
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const response = await fetch(`${apiUrl}/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Video updated successfully!');
        navigate(`/watch/${videoId}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update video.');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Error updating video.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0bb6bc]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111]">
      <div className="fixed top-0 left-0 w-full z-40 h-14">
        <Header onToggleSidebar={handleToggleSidebar} />
      </div>
      
      <div className="flex w-full pt-14">
        <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent hidden md:block`}>
          <Sidebar collapsed={!sidebarOpen} />
        </div>
        
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} w-full`}>
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <MdArrowBack size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Video</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter video title"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Describe your video"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thumbnail
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <MdImage size={48} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload new thumbnail
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 16:9 aspect ratio, max 2MB
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-6">
                {/* Video Preview */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preview</h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    {/* Thumbnail Preview */}
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                      {thumbnailPreview && (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Title Preview */}
                    <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {title || 'Video Title'}
                    </h4>
                    
                    {/* Description Preview */}
                    {description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {description}
                      </p>
                    )}
                    
                    {/* Category Badge */}
                    {category && (
                      <span className="inline-block mt-2 px-2 py-1 bg-[#0bb6bc] text-white text-xs rounded-full">
                        {category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !title.trim()}
                    className="flex-1 px-4 py-2 bg-[#0bb6bc] text-white rounded-lg hover:bg-[#099ca3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <MdSave size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
