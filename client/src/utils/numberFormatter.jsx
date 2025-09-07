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
    const thousands = number / 1000;
    // Use floor instead of round to be more conservative
    if (thousands % 1 === 0) {
      return thousands + 'K';
    } else {
      // Use floor to be more conservative (2.656 becomes 2.6K instead of 2.7K)
      const floored = Math.floor(thousands * 10) / 10;
      return floored + 'K';
    }
  }
  return number.toString();
};

// Utility function to format session duration in hours and minutes
export const formatSessionDuration = (minutes) => {
  if (minutes === null || minutes === undefined || isNaN(minutes) || minutes === 0) return '0m';
  
  const totalMinutes = Math.round(minutes);
  
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
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

// Component for displaying session duration with hover tooltip
export const FormattedSessionDuration = ({ value, className = "", showTooltip = true }) => {
  const [showTooltipState, setShowTooltipState] = useState(false);
  
  if (!showTooltip) {
    return <span className={className}>{formatSessionDuration(value)}</span>;
  }
  
  return (
    <div className="relative inline-block">
      <span 
        className={`${className} cursor-help`}
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        {formatSessionDuration(value)}
      </span>
      {showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
          {value ? `${Math.round(value)} minutes` : '0 minutes'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};
