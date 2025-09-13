// import React from 'react';
// import { Users, Bell, BellOff, UserMinus, ExternalLink } from 'lucide-react';

// const ChannelCard = ({ 
//   channel, 
//   onUnsubscribe, 
//   onNotificationToggle, 
//   showSubscriptionActions = false 
// }) => {
//   const {
//     id,
//     name,
//     description,
//     profileImage,
//     subscriberCount,
//     category,
//     isVerified,
//     notificationsEnabled,
//     subscribedAt
//   } = channel;

//   const formatSubscriberCount = (count) => {
//     if (count >= 1000000) {
//       return `${(count / 1000000).toFixed(1)}M`;
//     } else if (count >= 1000) {
//       return `${(count / 1000).toFixed(1)}K`;
//     }
//     return count.toString();
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group">
//       {/* Channel Header */}
//       <div className="p-4 md:p-6">
//         <div className="flex items-start gap-4">
//           <div className="relative">
//             <img
//               src={profileImage}
//               alt={`${name} profile`}
//               className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
//             />
//             {isVerified && (
//               <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
//                 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                 </svg>
//               </div>
//             )}
//           </div>
          
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-1">
//               <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm md:text-base">{name}</h3>
//               {isVerified && (
//                 <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                   Verified
//                 </span>
//               )}
//             </div>
//             <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{description}</p>
//             <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
//               <div className="flex items-center gap-1">
//                 <Users className="w-3 h-3" />
//                 <span>{formatSubscriberCount(subscriberCount)} subscribers</span>
//               </div>
//               <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{category}</span>
//             </div>
//           </div>
//         </div>

//         {/* Subscription Info */}
//         {subscribedAt && (
//           <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               Subscribed on {formatDate(subscribedAt)}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Action Buttons */}
//       {showSubscriptionActions && (
//         <div className="px-4 md:px-6 pb-4 md:pb-6 flex gap-2">
//           <button
//             onClick={() => onNotificationToggle(id, notificationsEnabled)}
//             className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-colors ${
//               notificationsEnabled
//                 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
//                 : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
//             }`}
//           >
//             {notificationsEnabled ? (
//               <>
//                 <Bell className="w-4 h-4" />
//                 <span className="hidden sm:inline">Notifications On</span>
//               </>
//             ) : (
//               <>
//                 <BellOff className="w-4 h-4" />
//                 <span className="hidden sm:inline">Notifications Off</span>
//               </>
//             )}
//           </button>
          
//           <button
//             onClick={() => onUnsubscribe(id)}
//             className="flex items-center justify-center gap-2 py-2 px-2 md:px-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs md:text-sm font-medium hover:bg-red-100 transition-colors"
//           >
//             <UserMinus className="w-4 h-4" />
//             <span className="hidden sm:inline">Unsubscribe</span>
//           </button>
          
//           <button className="flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
//             <ExternalLink className="w-4 h-4" />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChannelCard;


import React from 'react';
import { Users, Bell, BellOff, UserMinus, ExternalLink, CheckCircle, Play, Heart } from 'lucide-react';

const ChannelCard = ({ 
  channel, 
  onUnsubscribe, 
  onNotificationToggle, 
  showSubscriptionActions = false 
}) => {
  const {
    id,
    name,
    description,
    profileImage,
    subscriberCount,
    category,
    isVerified,
    notificationsEnabled,
    subscribedAt
  } = channel;

  const formatSubscriberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-gray-900/50 transition-all duration-500 group hover:-translate-y-2 backdrop-blur-sm">
      {/* Channel Header */}
      <div className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={profileImage}
              alt={`${name} profile`}
              className="w-16 h-16 rounded-full object-cover border-3 border-gradient-to-r from-indigo-200 to-purple-200 shadow-lg group-hover:shadow-xl transition-all duration-300"
            />
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm md:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{name}</h3>
              {isVerified && (
                <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full font-semibold shadow-sm">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">{description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-500" />
                <span className="font-semibold">{formatSubscriberCount(subscriberCount)} subscribers</span>
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium shadow-sm">{category}</span>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        {subscribedAt && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" />
              Subscribed on {formatDate(subscribedAt)}
            </p>
            <div className="flex items-center gap-1">
              <Play className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-semibold">Active</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showSubscriptionActions && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 flex gap-3">
          <button
            onClick={() => onNotificationToggle(id, notificationsEnabled)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 md:px-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md ${
              notificationsEnabled
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-200 hover:from-yellow-100 hover:to-amber-100 shadow-yellow-100'
                : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500'
            }`}
          >
            {notificationsEnabled ? (
              <>
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications On</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications Off</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => onUnsubscribe(id)}
            className="flex items-center justify-center gap-2 py-3 px-2 md:px-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200 rounded-xl text-xs md:text-sm font-semibold hover:from-red-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md shadow-red-100"
          >
            <UserMinus className="w-4 h-4" />
            <span className="hidden sm:inline">Unsubscribe</span>
          </button>
          
          <button className="flex items-center justify-center p-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChannelCard;