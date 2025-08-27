import React from 'react';

const Profile = () => {
  // Dummy user data for demonstration
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    role: 'Student',
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-6">
        <img
          src={user.avatar}
          alt="Profile"
          className="w-24 h-24 rounded-full border-2 border-gray-300"
        />
        <div>
          <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {user.role}
          </span>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Profile Details</h3>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Change password</li>
          <li>Edit profile info</li>
          <li>View activity</li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
