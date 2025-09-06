const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Track page visits
export const trackPageVisit = async (page) => {
  try {
    await fetch(`${API_BASE_URL}/analytics/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        page,
        type: 'page_visit',
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.log('Analytics tracking failed:', error);
  }
};

// Track button clicks
export const trackButtonClick = async (buttonName, location) => {
  try {
    await fetch(`${API_BASE_URL}/analytics/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        button: buttonName,
        location,
        type: 'button_click',
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.log('Analytics tracking failed:', error);
  }
};

// Track video watch time
export const trackVideoWatch = async (videoId, watchTime) => {
  try {
    console.log('=== FRONTEND VIDEO TRACKING ===');
    console.log('Video ID:', videoId);
    console.log('Watch Time:', watchTime);
    console.log('API URL:', `${API_BASE_URL}/analytics/track-video`);
    
    const response = await fetch(`${API_BASE_URL}/analytics/track-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        videoId,
        watchTime,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    console.log('Video tracking response:', result);
  } catch (error) {
    console.log('Video tracking failed:', error);
  }
};

// Track form submissions
export const trackFormSubmission = async (formName, success) => {
  try {
    await fetch(`${API_BASE_URL}/analytics/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        form: formName,
        success,
        type: 'form_submission',
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.log('Analytics tracking failed:', error);
  }
};
