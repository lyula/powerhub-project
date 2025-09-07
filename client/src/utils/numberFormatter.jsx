import { useState } from 'react';

// Utility function to format large numbers with abbreviations
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const number = parseInt(num);
  
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(number % 1000000000 === 0 ? 0 : 1) + 'B';
  }
  if (number >= 1000000) {
    return (number / 1000000).toFixed(number % 1000000 === 0 ? 0 : 1) + 'M';
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(number % 1000 === 0 ? 0 : 1) + 'K';
  }
  return number.toString();
};

// Component for displaying formatted numbers with hover tooltip
export const FormattedNumber = ({ value, className = "", showTooltip = true }) => {
  const [showTooltipState, setShowTooltipState] = useState(false);
  
  if (!showTooltip) {
    return <span className={className}>{formatNumber(value)}</span>;
  }
  
  return (
    <div className="relative inline-block">
      <span 
        className={`${className} cursor-help`}
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        {formatNumber(value)}
      </span>
      {showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
          {value?.toLocaleString() || '0'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};
