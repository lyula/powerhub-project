import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import MobileHeader from '../components/MobileHeader';
import { UserIcon } from '../components/icons';
import Sidebar from '../components/Sidebar';
import StudentUtility from '../components/StudentUtility';
import BottomTabs from '../components/BottomTabs';

const Profile = () => {
  const { user, updateProfile, changePassword, uploadProfilePicture, channel } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [avatarMessage, setAvatarMessage] = useState('');
  // Handle avatar click to upload profile picture
  const handleAvatarClick = () => {
    document.getElementById('profile-picture-input').click();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const result = await uploadProfilePicture(file);
    if (result.success) {
      setAvatarMessage('Profile picture updated successfully!');
      setTimeout(() => setAvatarMessage(''), 3000);
    } else {
      setUploadError(result.error || 'Failed to upload profile picture');
    }
    setUploading(false);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const securityRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    github: '',
    whatsapp: '',
    linkedin: '',
    instagram: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        github: user.github || '',
        whatsapp: user.whatsapp || '',
        linkedin: user.linkedin || '',
        instagram: user.instagram || ''
      });
    }
  }, [user]);

  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      github: user.github || '',
      whatsapp: user.whatsapp || '',
      linkedin: user.linkedin || '',
      instagram: user.instagram || ''
    });
    setMessage({ type: '', text: '' });
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
  };

  const openSecuritySection = () => {
    setIsChangingPassword(true);
    // Scroll to the security section smoothly
    setTimeout(() => {
      if (securityRef.current) {
        securityRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0bb6bc] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none' }}>
      {/* Mobile header for Profile page */}
      <MobileHeader icon={<UserIcon />} label="Profile" />
      {/* Desktop header remains unchanged */}
      <div className="hidden md:block">
      <HeaderFixed onToggleSidebar={handleToggleSidebar} />
      </div>
      <div className="flex flex-row w-full" style={{ height: '100vh', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <SidebarFixed sidebarOpen={sidebarOpen} />
        {!sidebarOpen && (
          <div className="md:ml-20">
            <StudentUtility />
          </div>
        )}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full pt-12 overflow-y-auto`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="p-4 md:p-8 pb-20 md:pb-8">
            <h2 className="hidden md:block text-2xl font-bold mb-6 text-[#0bb6bc] dark:text-[#0bb6bc] mt-8 pl-12">My Profile</h2>
            
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 pt-6 md:pt-6 mt-10 md:mt-0">
                <div className="flex items-center space-x-6">
                  <div className="relative w-24 h-24 flex flex-col items-center">
                    <input
                      id="profile-picture-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleProfilePictureChange}
                      disabled={uploading}
                    />
                    <div
                      className="w-24 h-24 bg-gradient-to-br from-[#0bb6bc] to-[#0a9ba0] rounded-full flex items-center justify-center shadow-lg cursor-pointer overflow-hidden border-4 border-white dark:border-gray-800"
                      onClick={handleAvatarClick}
                      title="Click to change profile picture"
                      style={{ position: 'relative' }}
                    >
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-white">
                          {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </span>
                      )}
                      {/* Edit icon overlay at bottom center */}
                      <span
                        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                        style={{ zIndex: 3 }}
                      >
                        {/* Modern camera icon, strawberry red, centered in avatar */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="#FC5A8D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                          <circle cx="12" cy="13" r="3" />
                          <path d="M5 7h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
                        </svg>
                      </span>
                      {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full">
                          <span className="text-white text-lg">Uploading...</span>
                        </div>
                      )}
                    </div>
                    {/* Success message below avatar, outside avatar container */}
                    {avatarMessage && (
                      <div className="mt-3 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded shadow text-sm whitespace-nowrap z-10">
                        {avatarMessage}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      @{user.username}
                      <span className="mx-1">·</span>
                      <button
                        type="button"
                        className="text-[#0bb6bc] hover:underline"
                        onClick={() => {
                          if (channel && channel._id) {
                            navigate(`/channel/${channel._id}`);
                          } else {
                            navigate('/channel-setup');
                          }
                        }}
                      >
                        View channel
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">{user.email}</p>
                    {uploadError && (
                      <div className="text-red-500 text-sm mt-2">{uploadError}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Details</h3>
                </div>

                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileForm.firstName}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileForm.lastName}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={profileForm.username}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={user.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                      />
                    </div>
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Github
                       </label>
                       <input
                         type="text"
                         name="github"
                         value={profileForm.github}
                         onChange={handleProfileChange}
                         placeholder="username or github.com/username"
                         className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Whatsapp
                       </label>
                       <input
                         type="tel"
                         name="whatsapp"
                         value={profileForm.whatsapp}
                         onChange={handleProfileChange}
                         placeholder="+1234567890"
                         className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         LinkedIn
                       </label>
                       <input
                         type="text"
                         name="linkedin"
                         value={profileForm.linkedin}
                         onChange={handleProfileChange}
                         placeholder="username or linkedin.com/in/username"
                         className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Instagram
                       </label>
                       <input
                         type="text"
                         name="instagram"
                         value={profileForm.instagram}
                        onChange={handleProfileChange}
                         placeholder="username or instagram.com/username"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-[#0bb6bc] text-white rounded-lg hover:bg-[#0a9ba0] transition-colors disabled:opacity-50 shadow-md font-medium"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={user.firstName || ''}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={user.lastName || ''}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={user.username || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                      />
                    </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Github
                       </label>
                       <input
                         type="text"
                         value={user.github || ''}
                         disabled
                         className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Whatsapp
                       </label>
                       <input
                         type="tel"
                         value={user.whatsapp || ''}
                         disabled
                         className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         LinkedIn
                       </label>
                       <input
                         type="text"
                         value={user.linkedin || ''}
                         disabled
                         className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Instagram
                       </label>
                       <input
                         type="text"
                         value={user.instagram || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user.role || 'User'}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                      />
                    </div>
                  </form>
                )}

                {!isEditing && (
                  <div className="flex items-center justify-between mt-8">
                    <button
                      type="button"
                      onClick={openSecuritySection}
                      className="px-5 py-2 rounded-full border border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2"
                    >
                      <span className="inline-block w-4 h-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-2"
                    >
                      <span className="inline-block w-4 h-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                      </span>
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {isChangingPassword && (
              <div ref={securityRef} className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h3>
                </div>

                {isChangingPassword && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-[#0bb6bc] text-white rounded-lg hover:bg-[#0a9ba0] transition-colors disabled:opacity-50 shadow-md font-medium"
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelPasswordChange}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
};

function HeaderFixed({ onToggleSidebar }) {
  return (
    <div className="fixed top-0 left-0 w-full z-40">
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

export default Profile;
