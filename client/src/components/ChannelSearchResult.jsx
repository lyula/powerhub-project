import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import SubscribeButton from './SubscribeButton';

const ChannelSearchResult = ({ channel }) => {
  return (
    <div className="flex-shrink-0 flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors max-w-xs lg:ml-0">
      <Link 
        to={`/channel/${channel._id || channel.author}`}
        className="flex items-center flex-1 cursor-pointer"
      >
        {/* Profile Picture */}
        <img 
          src={channel.avatar || '/default-avatar.png'} 
          alt={`${channel.name} profile`}
          className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-300 dark:border-gray-600"
        />
        
        {/* Channel Info */}
        <div className="flex flex-col">
          <h3
            className="text-base font-semibold text-gray-800 dark:text-white truncate"
            style={{ maxWidth: '100%' }}
          >
            {channel.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {channel.subscriberCount !== undefined 
              ? `${channel.subscriberCount.toLocaleString()} subscriber${channel.subscriberCount !== 1 ? 's' : ''}` 
              : 'Channel'
            }
          </p>
        </div>
      </Link>
      
      {/* Subscribe Button */}
      <div className="ml-3">
        <SubscribeButton channel={channel} />
      </div>
    </div>
  );
};

ChannelSearchResult.propTypes = {
  channel: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    subscriberCount: PropTypes.number,
    similarity: PropTypes.number,
  }).isRequired,
};

export default ChannelSearchResult;
