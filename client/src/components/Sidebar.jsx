
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, FireIcon, AcademicCapIcon, VideoCameraIcon, UserIcon, BookmarkIcon, HeartIcon, PlayCircleIcon, ClockIcon, SubscriptionsIcon, NotificationBellIcon } from './icons';

const items = [
  { label: 'Home', icon: <HomeIcon />, path: '/home' },
  { label: 'Trending', icon: <FireIcon />, path: '/home' },
  { label: 'My Channel', icon: <VideoCameraIcon />, isChannel: true },
  { label: 'Subscriptions', icon: <SubscriptionsIcon />, path: '/subscriptions' },
  { label: 'Saved Videos', icon: <BookmarkIcon />, path: '/saved-videos' },
  { label: 'Liked Videos', icon: <HeartIcon />, path: '/liked-videos' },
  { label: 'Course Videos', icon: <PlayCircleIcon />, path: '/course-videos' },
  { label: 'Watch History', icon: <ClockIcon />, path: '/watch-history' },
  { label: 'Notifications', icon: <NotificationBellIcon />, path: '/notifications' },
  { label: 'Profile', icon: <UserIcon />, path: '/profile' },
];

export default function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const { channel } = useAuth();
  return (
    <aside className={`hidden md:flex flex-col min-h-screen bg-gray-100 dark:bg-[#111111] border-r border-gray-200 dark:border-gray-900 py-6 ${collapsed ? 'w-20 px-2' : 'w-64 px-4'}`}>
      <nav className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-48px)]">
        {items.map((item) => {
          if (item.isChannel) {
            return (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition ${collapsed ? 'justify-center' : ''}`}
                onClick={() => {
                  if (channel && channel._id) {
                    navigate(`/channel/${channel._id}`);
                  } else {
                    navigate('/channel-setup');
                  }
                }}
              >
                <span className="w-6 h-6">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          }
          if (item.path) {
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="w-6 h-6">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          }
          return (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="w-6 h-6">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
