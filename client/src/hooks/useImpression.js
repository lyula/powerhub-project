import { useEffect, useRef } from "react";
import axios from "axios";

export function useImpression({ videoId, source, userId, sessionId }) {
  const ref = useRef();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let hasSent = false;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasSent) {
          hasSent = true;
          axios.post(`${API_URL}/analytics/impression`, {
            videoId,
            source,
            userId,
            sessionId,
          });
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [videoId, source, userId, sessionId, API_URL]);

  return ref;
}
