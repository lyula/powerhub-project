import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useRouteLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate network delay for demo; replace with real loading logic if needed
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [location]);

  return loading;
}
