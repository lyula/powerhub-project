import React from 'react';

const MaintenancePage = ({ message, estimatedResumeTime }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
          <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          System Maintenance
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message || 'We are currently performing system maintenance to improve your experience.'}
        </p>
        
        {estimatedResumeTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm text-blue-800">
              Estimated completion time: {new Date(estimatedResumeTime).toLocaleString()}
            </p>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          <p>We apologize for the inconvenience.</p>
          <p>Please check back later.</p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Check Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
