import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import MobileHeader from '../components/MobileHeader';
import { AcademicCapIcon } from '../components/icons';
import { EditMediaIcon, EditAvatarIcon } from '../components/ModernEditIcons';
import Sidebar from '../components/Sidebar';
import StudentUtility from '../components/StudentUtility';
import BottomTabs from '../components/BottomTabs';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function ChannelSetup({ onChannelCreated }) {
  // Get user from context
  const { user, token, setChannel, uploadProfilePicture } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let avatarUrl = "";
      let bannerUrl = "";
      // Upload avatar to Cloudinary if selected
      if (avatarFile) {
        const avatarRes = await uploadProfilePicture(avatarFile);
        if (avatarRes?.url) avatarUrl = avatarRes.url;
        else throw new Error(avatarRes?.error || "Avatar upload failed");
      }
      // Upload banner to Cloudinary if selected
      if (bannerFile) {
        const bannerRes = await uploadProfilePicture(bannerFile);
        if (bannerRes?.url) bannerUrl = bannerRes.url;
        else throw new Error(bannerRes?.error || "Banner upload failed");
      }
      // Send only URLs to backend
      const apiUrl = import.meta.env.VITE_API_URL;
      const payload = {
        name: channelName,
        description,
        username: user?.username || "",
        avatar: avatarUrl,
        banner: bannerUrl
      };
      const response = await fetch(`${apiUrl}/channel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });
      let data = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('Failed to parse JSON:', jsonErr);
      }
      if (!response.ok) {
        console.error('Channel creation failed:', {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        setLoading(false);
        setError(data?.error || data?.message || `Failed to create channel: ${response.statusText}`);
        return;
      }
      setLoading(false);
      if (onChannelCreated) onChannelCreated(data);
      if (setChannel) setChannel(data); // update channel in context
      navigate("/upload");
    } catch (err) {
      setLoading(false);
      setError("Failed to create channel. Try again.");
      console.error('Channel creation error:', err);
    }
  };

  // File input refs
  const avatarInputRef = React.useRef();
  const bannerInputRef = React.useRef();

  // Handle avatar file selection
  // Remove file input handlers (now using widget)
  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };
  // Handle banner file selection
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBanner(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}>
      {/* Mobile header for Channel Setup page */}
      <MobileHeader icon={<AcademicCapIcon />} label="Channel Setup" />
      {/* Desktop header remains unchanged */}
      <div className="hidden md:block">
        <HeaderFixed onToggleSidebar={handleToggleSidebar} />
      </div>
      <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 44px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <SidebarFixed sidebarOpen={sidebarOpen} />
        {!sidebarOpen && (
          <div className="md:ml-20">
            <StudentUtility />
          </div>
        )}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="flex-1 flex flex-col items-stretch px-0 md:px-8 py-0">
            {/* Banner section */}
            <div className="w-full h-36 md:h-48 lg:h-56 relative bg-black mb-0 mt-16">
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400 text-xl relative">
                {banner ? (
                  <img src={banner} alt="Channel Banner" className="w-full h-full object-cover" style={{ objectPosition: 'center' }} />
                ) : (
                  <span>Banner Preview</span>
                )}
                {/* Always show banner edit icon, overlayed in top-right */}
                <button
                  type="button"
                  className="absolute top-4 right-4 bg-white dark:bg-[#222] rounded-full p-2 shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  onClick={() => bannerInputRef.current.click()}
                  aria-label="Edit Banner"
                  style={{ zIndex: 2 }}
                >
                  {/* Modern edit icon for banner */}
                  <EditMediaIcon />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={bannerInputRef}
                  style={{ display: 'none' }}
                  onChange={handleBannerChange}
                />
              </div>
              <div className="absolute left-8 bottom-[-48px] flex items-end">
                <div className="relative">
                  <div className="relative">
                    {avatar ? (
                      <img src={avatar} alt="Channel Avatar" className="w-28 h-28 rounded-full border-4 border-white dark:border-[#222] shadow-lg object-cover" />
                    ) : (
                      <div className="w-28 h-28 rounded-full border-4 border-white dark:border-[#222] shadow-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-2xl">Avatar</div>
                    )}
                    {/* Avatar edit icon always visible */}
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 bg-white dark:bg-[#222] rounded-full p-2 shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      onClick={() => avatarInputRef.current.click()}
                      aria-label="Edit Avatar"
                      style={{ zIndex: 2 }}
                    >
                      {/* Modern edit icon for avatar */}
                      <EditAvatarIcon />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={avatarInputRef}
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Editable fields section */}
            <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center px-8 pt-12 pb-4 w-full max-w-xl mx-auto">
              <label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 self-start">Channel Name</label>
              <input
                type="text"
                className="border-2 border-[#0bb6bc] rounded-lg px-4 py-3 text-black dark:text-white bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] mb-4 w-full"
                placeholder="Channel Name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                required
              />
              <label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 self-start">Username</label>
              <input
                type="text"
                className="border-2 border-[#c42152] rounded-lg px-4 py-3 text-black dark:text-white bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#c42152] mb-4 w-full cursor-not-allowed"
                placeholder="Username"
                value={user?.username || ''}
                readOnly
              />
              <label className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 self-start">Channel Description</label>
              <textarea
                className="border-2 border-[#0bb6bc] rounded-lg px-4 py-3 text-black dark:text-white bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] mb-4 w-full"
                placeholder="Channel Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <button
                type="submit"
                style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, position: 'relative' }}
                className="text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition mt-2 text-lg w-full flex items-center justify-center"
                disabled={loading}
              >
                {loading && (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                )}
                {loading ? "Creating..." : "Create Channel"}
              </button>
              {error && <span className="text-red-500 text-sm mt-2">{error}</span>}
            </form>
          </div>
        </div>
        <BottomTabs />
      </div>
    </div>
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
