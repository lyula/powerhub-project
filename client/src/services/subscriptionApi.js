// Real API service for PowerHub subscription management
// Handles all subscription-related API calls to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

// Subscription API functions
export const fetchUserSubscriptions = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/channel/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the data to match the expected format
    return data.subscriptions.map(channel => ({
      id: channel._id,
      name: channel.name,
      description: channel.description,
      avatar: channel.avatar,
      subscriberCount: channel.subscriberCount,
      isSubscribed: true, // Always true for user subscriptions
      notificationsEnabled: true, // Default value, can be enhanced later
      category: 'General', // Default category, can be enhanced later
      subscribedAt: channel.subscribedAt || new Date().toISOString(),
      owner: channel.owner,
      dateJoined: channel.dateJoined
    }));
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }
};

export const fetchChannelSubscribers = async (channelId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/channel/${channelId}/subscribers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscribers: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the data to match the expected format
    return {
      channelName: data.channelName,
      subscriberCount: data.subscriberCount,
      subscribers: data.subscribers.map(subscriber => ({
        id: subscriber._id,
        username: subscriber.username,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        name: `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim() || subscriber.username,
        email: subscriber.email,
        avatar: subscriber.avatar || subscriber.profilePicture,
        profilePicture: subscriber.profilePicture || subscriber.avatar,
        subscribedAt: subscriber.subscribedAt,
        joinedAt: subscriber.subscribedAt, // Alias for compatibility
        notificationsEnabled: true // Default value
      }))
    };
  } catch (error) {
    console.error('Error fetching channel subscribers:', error);
    throw error;
  }
};

export const toggleSubscription = async (channelId, subscribe) => {
  try {
    const token = getAuthToken();
    const endpoint = subscribe ? 'subscribe' : 'unsubscribe';
    const response = await fetch(`${API_BASE_URL}/channel/${channelId}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to ${endpoint}: ${response.statusText}`);
    }

    const updatedChannel = await response.json();
    return { 
      success: true, 
      channelId, 
      subscribed: subscribe,
      channel: updatedChannel
    };
  } catch (error) {
    console.error(`Error ${subscribe ? 'subscribing to' : 'unsubscribing from'} channel:`, error);
    throw error;
  }
};

export const updateNotificationSettings = async (channelId, enabled) => {
  // This endpoint doesn't exist yet, but we'll simulate it for now
  console.log(`Notification settings for channel ${channelId} set to ${enabled}`);
  return { 
    success: true, 
    channelId, 
    notificationsEnabled: enabled 
  };
};
