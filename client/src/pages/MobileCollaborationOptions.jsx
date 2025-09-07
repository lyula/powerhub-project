import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobileCollaborationOptions = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'AI & Machine Learning', icon: '🤖', description: 'Python, TensorFlow, PyTorch projects' },
    { name: 'Mobile App Development', icon: '📱', description: 'Dart, Flutter, React Native' },
    { name: 'MERN Stack', icon: '⚛️', description: 'MongoDB, Express, React, Node.js' },
    { name: 'Python Development', icon: '🐍', description: 'Django, Flask, FastAPI projects' },
    { name: 'Web Development', icon: '🌐', description: 'HTML, CSS, JavaScript, PHP' },
    { name: 'DevOps & Cloud', icon: '☁️', description: 'Docker, Kubernetes, AWS, Azure' },
    { name: 'Data Science', icon: '📊', description: 'Pandas, NumPy, Jupyter, R' },
    { name: 'Blockchain', icon: '⛓️', description: 'Solidity, Web3, Smart Contracts' },
    { name: 'Game Development', icon: '🎮', description: 'Unity, Unreal Engine, C#' },
    { name: 'Cybersecurity', icon: '🔒', description: 'Penetration Testing, Ethical Hacking' },
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/mobile-collaborations/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="p-4 bg-white dark:bg-gray-800 shadow-md flex items-center gap-4">
        <button onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-800 dark:text-gray-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Collaboration Options</h1>
      </header>
      <main className="p-4 grid grid-cols-1 gap-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default MobileCollaborationOptions;
