import React, { useState } from 'react';

const MAX_LENGTH = 300;

export default function DescriptionWithReadMore({ description }) {
  const [expanded, setExpanded] = useState(false);
  if (!description) return null;
  const isLong = description.length > MAX_LENGTH;
  const displayText = expanded || !isLong ? description : description.slice(0, MAX_LENGTH) + '...';
  return (
    <div className="text-gray-700 dark:text-gray-200 text-base mb-4 pl-8">
      {displayText}
      {isLong && (
        <button
          className="ml-2 text-[#0bb6bc] hover:underline text-sm font-semibold bg-transparent border-none p-0 cursor-pointer"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
