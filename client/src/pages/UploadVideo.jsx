import React, { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BottomTabs from '../components/BottomTabs';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Cloudinary config from environment variables
const CLOUDINARY_NAME = import.meta.env.VITE_CLOUDINARY_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/video/upload`;
const CLOUDINARY_IMAGE_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;

const UploadVideo = () => {
  const { channel } = useAuth();
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

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
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      // Extract duration using hidden video element
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const dur = Math.round(tempVideo.duration);
        setVideoDuration(dur);
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoPreview(null);
      setVideoDuration(null);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnailFile(file);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
      setShowCrop(true);
    } else {
      setThumbnailPreview(null);
      setShowCrop(false);
    }
  };

  const handleCrop = async () => {
    if (!thumbnailPreview || !croppedAreaPixels) return;
    const croppedImg = await getCroppedImg(thumbnailPreview, croppedAreaPixels);
    setThumbnailPreview(croppedImg);
    setShowCrop(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setUploadProgress(0);
    try {
      // 1. Upload video to Cloudinary
      let videoUrl = '';
      if (videoFile) {
        const videoData = new FormData();
        videoData.append('file', videoFile);
        videoData.append('upload_preset', UPLOAD_PRESET);
        const videoRes = await axios.post(CLOUDINARY_URL, videoData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          }
        });
        videoUrl = videoRes.data.secure_url;
      }
      // 2. Upload thumbnail to Cloudinary
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const thumbData = new FormData();
        thumbData.append('file', thumbnailFile);
        thumbData.append('upload_preset', UPLOAD_PRESET);
        const thumbRes = await axios.post(CLOUDINARY_IMAGE_URL, thumbData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          }
        });
        thumbnailUrl = thumbRes.data.secure_url;
      }
      // 3. Send only URLs and metadata to backend
      const payload = {
        title,
        description,
        tags,
        category,
        privacy,
        specialization,
        channelId: channel && channel._id,
        duration: videoDuration,
        videoUrl,
        thumbnailUrl
      };
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/videos/upload`, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      setLoading(false);
      setMessage('Video uploaded successfully!');
      setTimeout(() => setMessage(''), 5000);
      setTitle('');
      setDescription('');
      setTags('');
      setCategory('');
      setSpecialization('');
      setVideoFile(null);
      setVideoPreview(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setUploadProgress(0);
    } catch (err) {
      console.error('Video upload error:', err);
      setLoading(false);
      setMessage(err?.response?.data?.error || 'Video upload failed.');
      setUploadProgress(0);
    }
  };

  return (
  <div className="h-screen bg-white dark:bg-[#222] w-full flex flex-col overflow-hidden text-[#222] dark:text-[#eee]" style={{ scrollbarWidth: 'none' }}>
      <Header onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="flex flex-row w-full flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <Sidebar collapsed={!sidebarOpen} />
  <main className="flex-1 flex flex-col items-center justify-start w-full px-2 md:px-0 pt-8 overflow-hidden text-[#222] dark:text-[#eee]" style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="w-full max-w-4xl mx-auto p-8 md:p-12 flex flex-col gap-8 overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 56px)', scrollbarWidth: 'none' }}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#0bb6bc] dark:text-[#0bb6bc] text-left">Upload Video</h2>
            {/* Removed duplicate progress bar and message. Only show above upload button. */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Video Preview & Picker */}
                <div className="flex-1 flex flex-col gap-4 items-center justify-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    style={{ display: 'none' }}
                    id="video-upload-input"
                  />
                  <div
                    className="w-full flex justify-center items-center mt-2 cursor-pointer"
                    style={{ aspectRatio: '16/9', maxWidth: '400px', minHeight: '225px', background: '#eee', borderRadius: '16px', border: '2px solid #0bb6bc', position: 'relative' }}
                    onClick={() => document.getElementById('video-upload-input').click()}
                  >
                    {!videoPreview && (
                      <span className="absolute inset-0 flex items-center justify-center text-[#c42152] font-bold text-lg">Click to select Video</span>
                    )}
                    {videoPreview && (
                      <video src={videoPreview} controls style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                    )}
                  </div>
                </div>
                {/* Thumbnail Preview & Picker */}
                <div className="flex-1 flex flex-col gap-4 items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    style={{ display: 'none' }}
                    id="thumbnail-upload-input"
                  />
                  <div
                    className="w-full flex justify-center items-center mt-2 cursor-pointer"
                    style={{ aspectRatio: '16/9', maxWidth: '400px', minHeight: '225px', background: '#eee', borderRadius: '16px', border: '2px solid #c42152', position: 'relative' }}
                    onClick={() => document.getElementById('thumbnail-upload-input').click()}
                  >
                    {!thumbnailPreview && (
                      <span className="absolute inset-0 flex items-center justify-center text-[#0bb6bc] font-bold text-lg">Click to select Thumbnail</span>
                    )}
                    {thumbnailPreview && !showCrop && (
                      <img src={thumbnailPreview} alt="Thumbnail Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                    )}
                    {thumbnailPreview && showCrop && (
                      <div style={{ position: 'relative', width: '100%', height: 225 }}>
                        <Cropper
                          image={thumbnailPreview}
                          crop={crop}
                          zoom={zoom}
                          aspect={16 / 9}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                        />
                        <button type="button" className="mt-2 px-4 py-2 bg-[#c42152] text-white rounded-xl font-bold" onClick={handleCrop}>Crop & Use</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <label className="font-semibold text-base text-[#222] dark:text-[#eee]">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="px-4 py-3 border-2 border-[#0bb6bc] rounded-xl bg-white dark:bg-[#222] text-lg text-[#222] dark:text-[#eee]" required />
                </div>
                <div className="flex flex-col gap-4">
                  <label className="font-semibold text-base text-[#222] dark:text-[#eee]">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="px-4 py-3 border-2 border-[#c42152] rounded-xl bg-white dark:bg-[#222] text-lg resize-none text-[#222] dark:text-[#eee]" rows={4} required />
                </div>
                <div className="flex flex-col gap-4">
                  <label className="font-semibold text-base text-[#222] dark:text-[#eee]">Tags (comma separated)</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="px-4 py-3 border-2 border-[#0bb6bc] rounded-xl bg-white dark:bg-[#222] text-lg text-[#222] dark:text-[#eee]" />
                </div>
                <div className="flex flex-col gap-4">
                  <label className="font-semibold text-base text-[#222] dark:text-[#eee]">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-3 border-2 border-[#c42152] rounded-xl bg-white dark:bg-[#222] text-lg text-[#222] dark:text-[#eee]" required>
                    <option value="" disabled>{categoriesLoading ? 'Loading...' : 'Select Category'}</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-4">
                  <label className="font-semibold text-base text-[#222] dark:text-[#eee]">Specialization</label>
                  <input type="text" value={specialization} onChange={e => setSpecialization(e.target.value)} className="px-4 py-3 border-2 border-[#0bb6bc] rounded-xl bg-white dark:bg-[#222] text-lg text-[#222] dark:text-[#eee]" />
                </div>
                <div className="flex flex-col gap-4">
                  <label className="font-semibold text-base text-[#222] dark:text-[#eee]">Privacy</label>
                  <select value={privacy} onChange={e => setPrivacy(e.target.value)} className="px-4 py-3 border-2 border-[#c42152] rounded-xl bg-white dark:bg-[#222] text-lg text-[#222] dark:text-[#eee]">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              {/* Progress bar, spinner, and message above the upload button */}
              {(loading || message) && (
                <div className="w-full max-w-2xl mb-4 flex flex-col items-center">
                  {loading && (
                    <>
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-[#0bb6bc] transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-right text-sm w-full text-[#0bb6bc]">{uploadProgress}%</div>
                      <div className="flex justify-center items-center mt-2">
                        <svg className="animate-spin h-6 w-6 text-[#0bb6bc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="ml-2 text-[#0bb6bc] font-semibold">Uploading...</span>
                      </div>
                    </>
                  )}
                  {message && (
                    <div className="mt-2 text-green-600 dark:text-green-400 w-full max-w-2xl font-semibold text-lg text-center">{message}</div>
                  )}
                </div>
              )}
              <button type="submit" className="mt-8 px-6 py-3 bg-[#0bb6bc] text-white rounded-xl font-bold text-lg" disabled={loading}>{loading ? 'Uploading...' : 'Upload Video'}</button>
            </form>
          </div>
          <BottomTabs />
        </main>
      </div>
    </div>
  );
};

export default UploadVideo;