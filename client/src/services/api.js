// Mock data service using Cloudinary for profile images

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/demo/image/upload';

// Generate mock profile images using Cloudinary's sample images
const generateProfileImage = (seed) => {
  const images = [
    'woman',
    'man',
    'face_1',
    'face_2',
    'face_3',
    'face_4',
    'face_5',
    'face_6'
  ];
  const randomImage = images[seed % images.length];
  return `${CLOUDINARY_BASE_URL}/w_100,h_100,c_fill,g_face,r_max/${randomImage}.jpg`;
};

// Mock subscription data
const generateMockSubscriptions = () => {
  const channels = [
    {
      id: 1,
      name: 'Tech Insights',
      description: 'Latest technology trends and insights for developers and tech enthusiasts.',
      category: 'Technology',
      subscriberCount: 125000,
      isVerified: true,
      notificationsEnabled: true,
      subscribedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Creative Design Studio',
      description: 'Inspiring design tutorials, tips, and creative workflows for designers.',
      category: 'Design',
      subscriberCount: 89000,
      isVerified: true,
      notificationsEnabled: false,
      subscribedAt: '2024-02-20T14:15:00Z'
    },
    {
      id: 3,
      name: 'Fitness Journey',
      description: 'Your daily dose of fitness motivation, workouts, and healthy living tips.',
      category: 'Health',
      subscriberCount: 67000,
      isVerified: false,
      notificationsEnabled: true,
      subscribedAt: '2024-03-10T09:45:00Z'
    },
    {
      id: 4,
      name: 'Cooking Masterclass',
      description: 'Learn to cook amazing dishes with step-by-step tutorials and recipes.',
      category: 'Food',
      subscriberCount: 234000,
      isVerified: true,
      notificationsEnabled: true,
      subscribedAt: '2024-01-05T16:20:00Z'
    },
    {
      id: 5,
      name: 'Travel Adventures',
      description: 'Explore the world through stunning travel vlogs and destination guides.',
      category: 'Travel',
      subscriberCount: 156000,
      isVerified: true,
      notificationsEnabled: false,
      subscribedAt: '2024-02-28T11:10:00Z'
    },
    {
      id: 6,
      name: 'Music Production Hub',
      description: 'Beat making tutorials, music theory, and production techniques.',
      category: 'Music',
      subscriberCount: 78000,
      isVerified: false,
      notificationsEnabled: true,
      subscribedAt: '2024-03-15T13:30:00Z'
    },
    {
      id: 7,
      name: 'Business Growth',
      description: 'Entrepreneurship tips, business strategies, and startup success stories.',
      category: 'Business',
      subscriberCount: 198000,
      isVerified: true,
      notificationsEnabled: true,
      subscribedAt: '2024-01-22T08:45:00Z'
    },
    {
      id: 8,
      name: 'Gaming Central',
      description: 'Latest game reviews, gameplay walkthroughs, and gaming news.',
      category: 'Gaming',
      subscriberCount: 445000,
      isVerified: true,
      notificationsEnabled: false,
      subscribedAt: '2024-02-12T19:20:00Z'
    }
  ];

  return channels.map((channel, index) => ({
    ...channel,
    profileImage: generateProfileImage(index + 10)
  }));
};

// Mock subscribers data
const generateMockSubscribers = () => {
  const subscribers = [
    {
      id: 1,
      username: 'alex_dev',
      email: 'alex@example.com',
      subscribedAt: '2024-03-20T10:30:00Z',
      location: 'San Francisco, CA',
      isActive: true
    },
    {
      id: 2,
      username: 'sarah_designer',
      email: 'sarah@example.com',
      subscribedAt: '2024-03-18T14:15:00Z',
      location: 'New York, NY',
      isActive: true
    },
    {
      id: 3,
      username: 'mike_creator',
      email: 'mike@example.com',
      subscribedAt: '2024-03-15T09:45:00Z',
      location: 'Los Angeles, CA',
      isActive: false
    },
    {
      id: 4,
      username: 'emma_writer',
      email: 'emma@example.com',
      subscribedAt: '2024-03-12T16:20:00Z',
      location: 'Austin, TX',
      isActive: true
    },
    {
      id: 5,
      username: 'david_photographer',
      email: 'david@example.com',
      subscribedAt: '2024-03-10T11:10:00Z',
      location: 'Seattle, WA',
      isActive: true
    },
    {
      id: 6,
      username: 'lisa_marketer',
      email: 'lisa@example.com',
      subscribedAt: '2024-03-08T13:30:00Z',
      location: 'Chicago, IL',
      isActive: false
    },
    {
      id: 7,
      username: 'james_entrepreneur',
      email: 'james@example.com',
      subscribedAt: '2024-03-05T08:45:00Z',
      location: 'Miami, FL',
      isActive: true
    },
    {
      id: 8,
      username: 'anna_student',
      email: 'anna@example.com',
      subscribedAt: '2024-03-02T19:20:00Z',
      location: 'Boston, MA',
      isActive: true
    },
    {
      id: 9,
      username: 'chris_gamer',
      email: 'chris@example.com',
      subscribedAt: '2024-02-28T15:10:00Z',
      location: 'Portland, OR',
      isActive: true
    },
    {
      id: 10,
      username: 'rachel_fitness',
      email: 'rachel@example.com',
      subscribedAt: '2024-02-25T12:40:00Z',
      location: 'Denver, CO',
      isActive: false
    },
    {
      id: 11,
      username: 'tom_chef',
      email: 'tom@example.com',
      subscribedAt: '2024-02-22T17:55:00Z',
      location: 'Nashville, TN',
      isActive: true
    },
    {
      id: 12,
      username: 'sophia_artist',
      email: 'sophia@example.com',
      subscribedAt: '2024-02-18T14:25:00Z',
      location: 'Phoenix, AZ',
      isActive: true
    }
  ];

  return subscribers.map((subscriber, index) => ({
    ...subscriber,
    profileImage: generateProfileImage(index + 20)
  }));
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API functions
export const fetchUserSubscriptions = async () => {
  await delay(800); // Simulate network delay
  
  // Simulate occasional errors for testing
  if (Math.random() < 0.1) {
    throw new Error('Network error occurred');
  }
  
  return generateMockSubscriptions();
};

export const fetchChannelSubscribers = async () => {
  await delay(600); // Simulate network delay
  
  // Simulate occasional errors for testing
  if (Math.random() < 0.1) {
    throw new Error('Failed to fetch subscribers');
  }
  
  const subscribers = generateMockSubscribers();
  
  // Calculate stats
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const thisMonthSubscribers = subscribers.filter(
    sub => new Date(sub.subscribedAt) >= thisMonth
  ).length;
  
  const lastMonthSubscribers = subscribers.filter(
    sub => new Date(sub.subscribedAt) >= lastMonth && new Date(sub.subscribedAt) < thisMonth
  ).length;
  
  const growthRate = lastMonthSubscribers > 0 
    ? Math.round(((thisMonthSubscribers - lastMonthSubscribers) / lastMonthSubscribers) * 100)
    : 100;
  
  return {
    subscribers,
    stats: {
      total: subscribers.length,
      thisMonth: thisMonthSubscribers,
      growthRate: Math.max(0, growthRate)
    }
  };
};

export const toggleSubscription = async (channelId, subscribe) => {
  await delay(300);
  
  // Simulate API call success/failure
  if (Math.random() < 0.05) {
    throw new Error('Failed to update subscription');
  }
  
  return { success: true, channelId, subscribed: subscribe };
};

export const updateNotificationSettings = async (channelId, enabled) => {
  await delay(200);
  
  if (Math.random() < 0.05) {
    throw new Error('Failed to update notification settings');
  }
  
  return { success: true, channelId, notificationsEnabled: enabled };
};