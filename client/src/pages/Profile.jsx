import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StudentUtility from '../components/StudentUtility';
import BottomTabs from '../components/BottomTabs';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
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
        email: user.email || ''
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
      email: user.email || ''
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
      <HeaderFixed onToggleSidebar={handleToggleSidebar} />
      <div className="flex flex-row w-full" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <SidebarFixed sidebarOpen={sidebarOpen} />
        {!sidebarOpen && (
          <div className="md:ml-20">
            <StudentUtility />
          </div>
        )}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-0'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-[#0bb6bc] dark:text-[#0bb6bc] mt-8 pl-12">My Profile</h2>
            
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
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#0bb6bc] to-[#0a9ba0] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#0bb6bc] to-[#0a9ba0] text-white rounded-full text-sm font-medium shadow-md">
                      {user.role || 'User'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Details</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-[#0bb6bc] text-white rounded-lg hover:bg-[#0a9ba0] transition-colors shadow-md font-medium"
                    >
                      Edit Profile
                    </button>
                  )}
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
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                        required
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
              </div>

              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h3>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md font-medium"
                    >
                      Change Password
                    </button>
                  )}
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
