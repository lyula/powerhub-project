import React from 'react';
import { colors } from '../theme/colors';

const MaintenancePage = ({ message, estimatedResumeTime }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6" style={{ backgroundColor: colors.primary + '20' }}>
          <svg className="h-8 w-8" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: colors.primary }}>
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

        <div className="text-sm text-gray-500 mb-6">
          <p>We apologize for the inconvenience.</p>
          <p>Please check back later.</p>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 rounded-md text-white font-medium transition-colors"
            style={{ backgroundColor: colors.secondary }}
          >
            Check Again
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <p>Only IT administrators can access the system during maintenance.</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
