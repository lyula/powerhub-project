import React from 'react';
import ProgressBar from './ProgressBar';
import Header from './Header';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';

const WatchPageSkeleton = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-[#181818]">
      <ProgressBar loading={true} />
      
      {/* Desktop Header */}
      <div className="hidden md:block w-full fixed top-0 left-0 z-40">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>
      
      {/* Mobile Header */}
      <div className="block md:hidden w-full fixed top-0 left-0 z-40">
        <MobileHeader />
      </div>

      {/* Main Content */}
      <div className="flex flex-row w-full pt-14" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden' }}>
        {/* Sidebar - Desktop */}
        <div className="hidden md:block">
          <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent`}>
            <Sidebar collapsed={!sidebarOpen} />
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} p-4 md:p-6 overflow-y-auto`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Video Section */}
              <div className="flex-1">
                {/* Video Player Skeleton */}
                <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse mb-4" />
                {/* Video Title Skeleton */}
                <div className="mb-4 text-left">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-4/5" />
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-3/5" />
                </div>

                {/* Channel Info and Actions Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-start mb-4 gap-4">
                  {/* Channel Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-24" />
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-16" />
                    </div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse w-20 ml-4" />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse w-16" />
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse w-16" />
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse w-16" />
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse w-16" />
                  </div>
                </div>

                {/* Description Skeleton */}
                <div className="mb-6 text-left">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-full" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-5/6" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-4/6" />
                </div>

                {/* Comments Section Skeleton */}
                <div className="space-y-4 text-left">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-32 mb-4" />
                  
                  {/* Comment Items */}
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-24" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-full" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Sidebar */}
              <div className="w-full lg:w-80 xl:w-96 text-left">
                <div className="space-y-4">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="w-40 h-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse flex-shrink-0" />
                      
                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-full" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-4/5" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-1 w-20" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPageSkeleton;
