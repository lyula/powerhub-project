import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch channels matching the search term with 95% similarity.
 * @param {string} searchTerm - The search term entered by the user.
 * @returns {Array} - List of matching channels.
 */
export const useChannelSearch = (searchTerm) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setChannels([]);
      return;
    }

    const fetchChannels = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/channel/search?query=${searchTerm}`);
        if (response.ok) {
          const data = await response.json();
          setChannels(data);
        } else {
          console.error('Failed to fetch channels:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [searchTerm]);

  return { channels, loading };
};
