
import { Link } from 'react-router-dom';
import { HomeIcon, FireIcon, AcademicCapIcon, VideoCameraIcon, UserIcon, BookmarkIcon, HeartIcon, PlayCircleIcon, ClockIcon, SubscriptionsIcon } from './icons';

const items = [
  { label: 'Home', icon: <HomeIcon />, path: '/home' },
  { label: 'Trending', icon: <FireIcon /> },
  { label: 'Specializations', icon: <AcademicCapIcon /> },
  { label: 'My Videos', icon: <VideoCameraIcon /> },
  { label: 'Subscriptions', icon: <SubscriptionsIcon /> },
  { label: 'Saved Videos', icon: <BookmarkIcon /> },
  { label: 'Liked Videos', icon: <HeartIcon /> },
  { label: 'Course Videos', icon: <PlayCircleIcon /> },
  { label: 'Watch History', icon: <ClockIcon /> },
  { label: 'Profile', icon: <UserIcon />, path: '/profile' },
];

export default function Sidebar({ collapsed }) {
  return (
    <aside className={`hidden md:flex flex-col min-h-screen bg-gray-100 dark:bg-[#111111] border-r border-gray-200 dark:border-gray-900 py-6 ${collapsed ? 'w-20 px-2' : 'w-64 px-4'}`}>
  {/* Removed PowerHub name from sidebar */}
      <nav className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-48px)]">
        {items.map((item) => (
          item.path ? (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="w-6 h-6">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ) : (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900 transition ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="w-6 h-6">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        ))}
      </nav>
    </aside>
  );
}
