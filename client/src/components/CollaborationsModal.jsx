import React, { useState } from 'react';
import { FaGithub } from 'react-icons/fa';

const CollaborationsModal = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { name: 'AI & Machine Learning', icon: '🤖', description: 'Python, TensorFlow, PyTorch projects', color: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' },
    { name: 'Mobile App Development', icon: '📱', description: 'Dart, Flutter, React Native', color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' },
    { name: 'MERN Stack', icon: '⚛️', description: 'MongoDB, Express, React, Node.js', color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700' },
    { name: 'Python Development', icon: '🐍', description: 'Django, Flask, FastAPI projects', color: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' },
    { name: 'Web Development', icon: '🌐', description: 'HTML, CSS, JavaScript, PHP', color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' },
    { name: 'DevOps & Cloud', icon: '☁️', description: 'Docker, Kubernetes, AWS, Azure', color: 'bg-cyan-100 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700' },
    { name: 'Data Science', icon: '📊', description: 'Pandas, NumPy, Jupyter, R', color: 'bg-pink-100 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700' },
    { name: 'Blockchain', icon: '⛓️', description: 'Solidity, Web3, Smart Contracts', color: 'bg-indigo-100 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' },
    { name: 'Game Development', icon: '🎮', description: 'Unity, Unreal Engine, C#', color: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700' },
    { name: 'Cybersecurity', icon: '🔒', description: 'Penetration Testing, Ethical Hacking', color: 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[2147483646] bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#222] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            {selectedCategory ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">No Projects Available</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  It looks like there are no projects currently available for <span className="font-semibold">{selectedCategory}</span>.
                  <br /> Please check back later for updates.
                </p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 bg-[#0bb6bc] text-white rounded-md hover:bg-[#0a9ea3] transition"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FaGithub size={24} className="text-[#24292e] dark:text-white" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">GitHub Collaborations</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6">
                  <button
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition text-left"
                    onClick={() => console.log('Add a new collaboration project')}
                  >
                    Add a Collaboration Project
                  </button>
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">How it works:</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Browse projects by technology stack</li>
                    <li>• Connect with project owners via their social links</li>
                    <li>• Request to join ongoing projects</li>
                    <li>• Share your skills and portfolio</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      className={`p-4 rounded-lg border-2 ${category.color} hover:scale-105 transition-transform text-left group`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#0bb6bc] transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CollaborationsModal;
