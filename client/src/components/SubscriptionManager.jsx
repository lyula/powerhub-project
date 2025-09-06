import React, { useState } from 'react';
import { Users, UserCheck, Bell, Settings } from 'lucide-react';
import SubscriptionsList from './SubscriptionsList';
import SubscribersList from './SubscribersList';

const SubscriptionManager = () => {
    const [ activeTab, setActiveTab ] = useState('subscriptions');

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

    return(
        <div className='min-h-screen bg-gradient-to-br from-slate-50 t0-blue-50'>
            <header className='bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div  className='flex items-center justify-between h-16'>
                    <div className='w-10 h-10 bg-gradient-to-r from-indigo-600 t0-purple-600 rounded-xl flex items-center justify-center'>
                        <Bell className='w-6 h-6 text-white'/>
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-gray-900'>Subscribers</h1>
                        <p className='text-sm text-gray-600'>Manage your Subscriptions</p>
                    </div>
                </div>
                <button className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'>
                    <Settings className='w-5 h-5'/>
                </button>
            </div>

            </header>

            <nav className='bg-white border-b border-gray-200'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex space-x-8'>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return(
                                <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id 
                                    ? 'border-indigo-500 text-indigo-600 '
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}>
                                    <Icon className='w-5 h-5'/>
                                    {tab.label}

                                </button>
                            );
                        })}

                    </div>
                </div>

            </nav>

            <main className='flex-1'>
                 {ActiveComponent && <ActiveComponent />}
            </main>
        </div>
    );
};

export default SubscriptionManager;