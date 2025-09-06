// import React, { useState } from 'react';
// import Header from '../components/Header';
// import Sidebar from '../components/Sidebar';

// export default function Subscriptions() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const handleToggleSidebar = () => setSidebarOpen((open) => !open);
//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}>
//       <div className="fixed top-0 left-0 w-full z-40" style={{ height: '56px' }}>
//         <Header onToggleSidebar={handleToggleSidebar} />
//       </div>
//       <div className="flex flex-row w-full pt-14" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
//         <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent md:block`}>
//           <Sidebar collapsed={!sidebarOpen} />
//         </div>
//         <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
//           <div className="p-2 md:p-4">
//             <h2 className="text-lg md:text-xl font-bold mb-2 text-[#0bb6bc] dark:text-[#0bb6bc]">Subscriptions</h2>
//             <div className="mt-4 md:mt-6">
//               <div className="flex flex-col items-center justify-center h-96">
//                 <h1 className="text-3xl font-bold text-black dark:text-white">Subscriptions (Placeholder)</h1>
//                 <p className="mt-2 text-gray-500 dark:text-gray-400">This is a template for the Subscriptions page.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Users, UserCheck, Bell, Settings, Search, Filter } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SubscriptionsList from '../components/SubscriptionsList';
import SubscribersList from '../components/SubscribersList';

export default function Subscriptions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('subscriptions');
  
  const handleToggleSidebar = () => setSidebarOpen((open) => !open);

  const tabs = [
    {
      id: 'subscriptions',
      label: 'My Subscriptions',
      icon: Users,
      component: SubscriptionsList
    },
    {
      id: 'subscribers',
      label: 'My Subscribers',
      icon: UserCheck,
      component: SubscribersList
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111111] w-full" style={{ overflowX: 'hidden', scrollbarWidth: 'none', maxWidth: '100vw' }}>
      <div className="fixed top-0 left-0 w-full z-40" style={{ height: '56px' }}>
        <Header onToggleSidebar={handleToggleSidebar} />
      </div>
      <div className="flex flex-row w-full pt-14" style={{ height: 'calc(100vh - 56px)', maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <div className={`fixed top-14 left-0 h-[calc(100vh-56px)] ${sidebarOpen ? 'w-64' : 'w-20'} z-30 bg-transparent md:block`}>
          <Sidebar collapsed={!sidebarOpen} />
        </div>
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} w-full`} style={{ maxWidth: '100vw', overflowX: 'hidden', scrollbarWidth: 'none' }}>
          
          {/* Page Header */}
          <div className="p-2 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0bb6bc] to-[#0bb6bc]/80 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-[#0bb6bc] dark:text-[#0bb6bc]">
                    Subscription Manager
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your subscriptions and subscribers
                  </p>
                </div>
              </div>
              
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-[#0bb6bc] shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#111111] dark:to-[#1a1a1a]">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  );
}