import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <button
            onClick={handleGoBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Terms and Conditions
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome to our platform. By using our services, you agree to the following terms and conditions:
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
            1. User Responsibilities
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Users are expected to use the platform responsibly and adhere to all applicable laws and regulations.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
            2. Prohibited Activities
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The following activities are prohibited:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            <li>Harassment or abuse of other users</li>
            <li>Posting illegal or harmful content</li>
            <li>Unauthorized access to the platform</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
            3. Content Ownership
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Users retain ownership of their content but grant the platform a license to use it as necessary to provide services.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
            4. Changes to Terms
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
            5. Contact Us
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            If you have any questions about these terms, please contact us at support@plp-powerhub.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
