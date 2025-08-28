import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SubscribeButton({ channel }) {
  const { user, token } = useAuth();
  const [subscribing, setSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [localChannel, setLocalChannel] = useState(channel);

  useEffect(() => {
    setLocalChannel(channel);
  }, [channel]);

  useEffect(() => {
    if (!localChannel || !user) return;
    setIsSubscribed(localChannel.subscribers && localChannel.subscribers.some(sub => {
      const subId = typeof sub.user === 'object' && sub.user._id ? sub.user._id : sub.user;
      return subId?.toString() === user._id;
    }));
  }, [localChannel, user]);

  const fetchChannel = async () => {
    if (!localChannel || !token) return;
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/channel/${localChannel._id}`);
    if (response.ok) {
      const updated = await response.json();
      setLocalChannel(updated);
      setIsSubscribed(updated.subscribers && updated.subscribers.some(sub => sub.user?.toString() === user._id));
    }
  };

  const handleSubscribe = async () => {
    if (!user || !token) return;
    setSubscribing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const endpoint = isSubscribed ? `/channel/${localChannel._id}/unsubscribe` : `/channel/${localChannel._id}/subscribe`;
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await fetchChannel();
      }
    } catch (err) {
      // Optionally show error
    }
    setSubscribing(false);
  };

  if (!localChannel || !user) return null;
  return (
    <button
      className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-semibold transition ${isSubscribed ? 'bg-gray-400 text-white' : 'bg-[#c42152] text-white hover:bg-[#0bb6bc]'}`}
      onClick={handleSubscribe}
      disabled={subscribing}
    >
      {subscribing ? (isSubscribed ? 'Unsubscribing...' : 'Subscribing...') : (isSubscribed ? 'Subscribed' : 'Subscribe')}
    </button>
  );
}
