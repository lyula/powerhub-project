// SubscriptionManager.jsx
// This component provides a user interface for managing subscriptions and subscribers.
// It features a header with branding, navigation tabs, and dynamic content areas for subscriptions and subscribers.
// The design includes gradients, shadows, and responsive elements for an engaging user experience.
// The component uses React state to manage the active tab and conditionally renders the appropriate content.
// The SubscriptionsList and SubscribersList components are assumed to handle displaying lists of subscriptions and subscribers, respectively.
// The lucide-react library is used for icons, and Tailwind CSS classes are applied for styling.
// The Settings button is included for future configuration options.
// The Bell icon in the header is decorative and can be enhanced with notification functionality later.
// The component is structured to allow easy expansion, such as adding more tabs or features in the future.

import React, { useState } from 'react';
import { Users, UserCheck, Bell, Settings, Sparkles, TrendingUp } from 'lucide-react';
import SubscriptionsList from './SubscriptionsList';
import SubscribersList from './SubscribersList';

const SubscriptionManager = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">SubManager Pro</h1>
                <p className="text-sm text-gray-600 font-medium">Your premium subscription hub</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Growing</span>
              </div>
              <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 bg-gray-50 rounded-2xl p-2 inline-flex my-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
        {ActiveComponent && <ActiveComponent />}
      </main>
    </div>
  );
};

export default SubscriptionManager;