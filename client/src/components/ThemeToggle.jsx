

import React from 'react';

const ThemeToggle = ({ isDark }) => {
  return (
    <>
      {isDark ? (
        // Moon icon (dark mode)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="#fff"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0112 21.75c-5.385 0-9.75-4.365-9.75-9.75 0-4.508 3.072-8.286 7.25-9.418a.75.75 0 01.902.92A7.501 7.501 0 0016.5 16.5a7.48 7.48 0 004.348-1.348.75.75 0 01.904.9z"
          />
        </svg>
      ) : (
        // Sun icon (light mode)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="#222"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1.5m0 15V21m8.485-8.485h-1.5m-15 0H3m15.364-6.364l-1.06 1.06m-12.02 12.02l-1.06 1.06m0-12.02l1.06 1.06m12.02 12.02l1.06 1.06M12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z"
          />
        </svg>
      )}
    </>
  );
};

export default ThemeToggle;
