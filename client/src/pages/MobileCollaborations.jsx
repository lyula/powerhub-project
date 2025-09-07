import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const MobileCollaborationDetails = () => {
  const navigate = useNavigate();
  const { categoryName = 'Unknown Category' } = useParams();

  const noProjectsMessage = 'No open collaboration projects available at the moment. Please check back later.';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="p-4 bg-white dark:bg-gray-800 shadow-md flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-800 dark:text-gray-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">{categoryName.replace(/-/g, ' ')}</h1>
      </header>
      <main className="p-4 flex flex-col items-center justify-center">
        <p className="text-center text-gray-600 dark:text-gray-400">{noProjectsMessage}</p>
      </main>
    </div>
  );
};

export default MobileCollaborationDetails;
