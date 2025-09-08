import React, { useState, useEffect } from 'react';
import { FaGithub, FaWhatsapp, FaLinkedin, FaInstagram, FaLink, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';

const CollaborationsModal = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMyProjects, setShowMyProjects] = useState(false);
  const [myProjects, setMyProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    overview: '',
    tasksForCollaborators: '',
    additionalInfo: '',
    deploymentLink: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: '',
    description: '',
    overview: '',
    deploymentLink: '',
    tasksForCollaborators: '',
    additionalInfo: '',
    contactMethods: {
      github: false,
      whatsapp: false,
      linkedin: false,
      instagram: false
    }
  });

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

  const contactMethodsIcons = {
    github: { icon: FaGithub, label: 'GitHub', color: 'text-gray-700 dark:text-gray-300' },
    whatsapp: { icon: FaWhatsapp, label: 'WhatsApp', color: 'text-green-500' },
    linkedin: { icon: FaLinkedin, label: 'LinkedIn', color: 'text-blue-500' },
    instagram: { icon: FaInstagram, label: 'Instagram', color: 'text-pink-500' }
  };

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactMethodChange = (method) => {
    setProjectForm(prev => ({
      ...prev,
      contactMethods: {
        ...prev.contactMethods,
        [method]: !prev.contactMethods[method]
      }
    }));
  };

  const fetchProjects = async (category = null) => {
    setLoading(true);
    try {
      let url = '/api/collaborations';
      if (category) {
        url += `?category=${encodeURIComponent(category)}`;
      }
      console.log('Fetching projects from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched data:', data);
        // Backend returns { collaborations: [...], totalPages, currentPage, total }
        setProjects(data.collaborations || []);
      } else {
        const errorText = await response.text();
        console.error('Error fetching projects:', response.status, errorText);
        setProjects([]);
      }
    } catch (error) {
      console.error('Network error:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    fetchProjects(categoryName);
  };

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/collaborations/my-projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyProjects(data);
      } else {
        console.error('Error fetching my projects');
        setMyProjects([]);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMyProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackProjects = () => {
    setShowMyProjects(true);
    fetchMyProjects();
  };

  const fetchCategoryCounts = async () => {
    try {
      const response = await fetch('/api/collaborations/category-counts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategoryCounts(data);
      } else {
        console.error('Error fetching category counts');
        setCategoryCounts({});
      }
    } catch (error) {
      console.error('Network error:', error);
      setCategoryCounts({});
    }
  };

  // Fetch category counts when modal opens
  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  // Effect to populate edit form when editing starts
  useEffect(() => {
    if (editingProject) {
      setEditForm({
        title: editingProject.title || '',
        description: editingProject.description || '',
        overview: editingProject.overview || '',
        tasksForCollaborators: editingProject.tasksForCollaborators || '',
        additionalInfo: editingProject.additionalInfo || '',
        deploymentLink: editingProject.deploymentLink || '',
        status: editingProject.status || 'active'
      });
    }
  }, [editingProject]);

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate that at least one contact method is selected
      const hasContactMethod = Object.values(projectForm.contactMethods).some(method => method);
      if (!hasContactMethod) {
        alert('Please select at least one contact method');
        return;
      }

      const response = await fetch('/api/collaborations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(projectForm)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Project created successfully:', data);
        
        // Reset form and close modal
        setShowAddProject(false);
        setProjectForm({
          title: '',
          category: '',
          description: '',
          overview: '',
          deploymentLink: '',
          tasksForCollaborators: '',
          additionalInfo: '',
          contactMethods: {
            github: false,
            whatsapp: false,
            linkedin: false,
            instagram: false
          }
        });
        
        // Refresh projects list if we're viewing a category
        if (selectedCategory) {
          fetchProjects(selectedCategory);
        }
        
        // Refresh category counts to show updated numbers
        fetchCategoryCounts();
        
        // Show success message
        alert('Collaboration project added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error creating project:', errorData);
        alert('Error creating project: ' + (errorData.message || 'Something went wrong'));
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderAddProjectForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Add Collaboration Project</h2>
        <button
          onClick={() => setShowAddProject(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmitProject} className="space-y-4">
        {/* Project Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            name="title"
            value={projectForm.title}
            onChange={handleProjectFormChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter your project title"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={projectForm.category}
            onChange={handleProjectFormChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brief Description *
          </label>
          <textarea
            name="description"
            value={projectForm.description}
            onChange={handleProjectFormChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="Brief description of your project"
          />
        </div>

        {/* Project Overview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Overview *
          </label>
          <textarea
            name="overview"
            value={projectForm.overview}
            onChange={handleProjectFormChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="Detailed overview of the project, its goals, and current state"
          />
        </div>

        {/* Deployment Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Live Deployment Link
            <span className="text-gray-500 text-xs ml-1">(optional)</span>
          </label>
          <div className="relative">
            <FaLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              name="deploymentLink"
              value={projectForm.deploymentLink}
              onChange={handleProjectFormChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://your-project-demo.com"
            />
          </div>
        </div>

        {/* Tasks for Collaborators */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tasks for Collaborators *
          </label>
          <textarea
            name="tasksForCollaborators"
            value={projectForm.tasksForCollaborators}
            onChange={handleProjectFormChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="Describe specific tasks, skills needed, and roles you're looking for collaborators to handle"
          />
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Information
            <span className="text-gray-500 text-xs ml-1">(optional)</span>
          </label>
          <textarea
            name="additionalInfo"
            value={projectForm.additionalInfo}
            onChange={handleProjectFormChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="Any additional info, requirements, or expectations"
          />
        </div>

        {/* Contact Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            How should collaborators contact you? *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(contactMethodsIcons).map(([method, { icon: Icon, label, color }]) => {
              const userHasMethod = user?.[method];
              return (
                <label
                  key={method}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    userHasMethod
                      ? projectForm.contactMethods[method]
                        ? 'border-[#0bb6bc] bg-[#0bb6bc]/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-[#0bb6bc]/50'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={projectForm.contactMethods[method]}
                    onChange={() => handleContactMethodChange(method)}
                    disabled={!userHasMethod}
                    className="sr-only"
                  />
                  <Icon className={`mr-3 ${color}`} size={18} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                  {userHasMethod ? (
                    <span className="ml-auto text-xs text-green-600 dark:text-green-400">Available</span>
                  ) : (
                    <span className="ml-auto text-xs text-gray-400">Not set</span>
                  )}
                </label>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Only contact methods you've added to your profile are available for selection.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowAddProject(false)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#0bb6bc] text-white rounded-md hover:bg-[#0a9ea3] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              'Add Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderMyProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Your Collaboration Projects</h2>
        <button
          onClick={() => {
            setShowMyProjects(false);
            setEditingProject(null);
          }}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0bb6bc]"></div>
        </div>
      ) : myProjects.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {myProjects.map((project) => (
            <div key={project._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{project.category}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Posted {timeAgo(project.createdAt)}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {project.views || 0} views
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {project.interested?.length || 0} interested
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setEditingProject(project)}
                  className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition"
                >
                  Edit
                </button>
                <span className={`text-xs px-2 py-1 rounded ${
                  project.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : project.status === 'paused'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't posted any collaboration projects yet.
          </p>
          <button
            onClick={() => {
              setShowMyProjects(false);
              setShowAddProject(true);
            }}
            className="px-4 py-2 bg-[#0bb6bc] text-white rounded-md hover:bg-[#0a9ea3] transition"
          >
            Post Your First Project
          </button>
        </div>
      )}
    </div>
  );

  const renderEditProject = () => {
    if (!editingProject) return null;

    const handleEditFormChange = (e) => {
      const { name, value } = e.target;
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleUpdateProject = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        
        const response = await fetch(`/api/collaborations/${editingProject._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(editForm)
        });

        if (response.ok) {
          alert('Project updated successfully!');
          setEditingProject(null);
          fetchMyProjects(); // Refresh the list
        } else {
          const errorData = await response.json();
          alert('Error updating project: ' + (errorData.message || 'Something went wrong'));
        }
      } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Edit Project</h2>
          <button
            onClick={() => setEditingProject(null)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleUpdateProject} className="space-y-4">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={editForm.title}
              onChange={handleEditFormChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Project Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={editForm.status}
              onChange={handleEditFormChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditFormChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Overview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Overview *
            </label>
            <textarea
              name="overview"
              value={editForm.overview}
              onChange={handleEditFormChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Tasks for Collaborators */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tasks for Collaborators
            </label>
            <textarea
              name="tasksForCollaborators"
              value={editForm.tasksForCollaborators}
              onChange={handleEditFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Information
            </label>
            <textarea
              name="additionalInfo"
              value={editForm.additionalInfo}
              onChange={handleEditFormChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Deployment Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Link (Optional)
            </label>
            <input
              type="url"
              name="deploymentLink"
              value={editForm.deploymentLink}
              onChange={handleEditFormChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0bb6bc] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://your-project.com"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#0bb6bc] text-white rounded-md hover:bg-[#0a9ea3] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderProjectDetails = () => {
    if (!selectedProject) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Project Details</h2>
          <button
            onClick={() => setSelectedProject(null)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Project Title and Category */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {selectedProject.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#0bb6bc] text-white text-xs px-2 py-1 rounded">
                {selectedProject.category}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Posted {timeAgo(selectedProject.createdAt)}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              By {selectedProject.author?.firstName && selectedProject.author?.lastName 
                ? `${selectedProject.author.firstName} ${selectedProject.author.lastName}` 
                : selectedProject.author?.username || 'Unknown'}
            </div>
          </div>

          {/* Project Description */}
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Description</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedProject.description}
            </p>
          </div>

          {/* Project Overview */}
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Project Overview</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {selectedProject.overview}
            </p>
          </div>

          {/* Tasks for Collaborators */}
          {selectedProject.tasksForCollaborators && (
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">What We Need Help With</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {selectedProject.tasksForCollaborators}
              </p>
            </div>
          )}

          {/* Additional Info */}
          {selectedProject.additionalInfo && (
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Additional Information</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {selectedProject.additionalInfo}
              </p>
            </div>
          )}

          {/* Deployment Link */}
          {selectedProject.deploymentLink && (
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Project Link</h4>
              <a 
                href={selectedProject.deploymentLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#0bb6bc] hover:underline flex items-center gap-2"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
                View Live Project
              </a>
            </div>
          )}

          {/* Contact Methods */}
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">How to Get in Touch</h4>
            <div className="space-y-2">
              {Object.entries(selectedProject.contactMethods || {}).map(([method, enabled]) => {
                if (!enabled) return null;
                const methodInfo = contactMethodsIcons[method];
                if (!methodInfo) return null;
                const IconComponent = methodInfo.icon;
                
                // Get the actual contact info from author
                const contactValue = selectedProject.author?.[method];
                if (!contactValue) return null;
                
                // Create appropriate links based on method
                const getContactLink = (method, value) => {
                  switch (method) {
                    case 'github':
                      return `https://github.com/${value.replace('https://github.com/', '')}`;
                    case 'whatsapp':
                      const phoneNumber = value.replace(/[^\d]/g, '');
                      const authorName = selectedProject.author?.username || 'there';
                      const message = `Hi ${authorName}, I was reaching out to inquire if the "${selectedProject.title}" project still has a slot available. I am interested in joining your team.`;
                      return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    case 'linkedin':
                      return value.startsWith('http') ? value : `https://linkedin.com/in/${value}`;
                    case 'instagram':
                      return `https://instagram.com/${value.replace('@', '')}`;
                    default:
                      return value;
                  }
                };
                
                const link = getContactLink(method, contactValue);
                
                return (
                  <div key={method} className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${methodInfo.color}`} />
                    <div className="flex-1">
                      <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                        {methodInfo.label}:
                      </span>
                      <a 
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-sm text-[#0bb6bc] hover:underline font-medium"
                      >
                        Click to Connect
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => {
              setSelectedProject(null);
              // Stay in the category view instead of going back to main
            }}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Back to {selectedCategory} Projects
          </button>
          <button
            className="flex-1 px-4 py-2 bg-[#0bb6bc] text-white rounded-md hover:bg-[#0a9ea3] transition"
            onClick={() => {
              // TODO: Implement express interest functionality
              alert('Express interest functionality coming soon!');
            }}
          >
            Express Interest
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[2147483646] bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
        <div className={`bg-white dark:bg-[#222] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full ${selectedProject ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
          <div className="p-6">
            {showAddProject ? (
              renderAddProjectForm()
            ) : editingProject ? (
              renderEditProject()
            ) : showMyProjects ? (
              renderMyProjects()
            ) : selectedProject ? (
              renderProjectDetails()
            ) : selectedCategory ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{selectedCategory} Projects</h2>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0bb6bc]"></div>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {projects.map((project) => (
                      <div key={project._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{project.title}</h3>
                            <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                              project.status === 'active' 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : project.status === 'paused'
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {project.status || 'active'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {timeAgo(project.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            By {project.author?.firstName && project.author?.lastName 
                              ? `${project.author.firstName} ${project.author.lastName}` 
                              : project.author?.username || 'Unknown'}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {Object.entries(project.contactMethods || {}).map(([method, enabled]) => {
                              if (!enabled) return null;
                              const methodInfo = contactMethodsIcons[method];
                              if (!methodInfo) return null;
                              const IconComponent = methodInfo.icon;
                              return (
                                <IconComponent 
                                  key={method} 
                                  className={`w-4 h-4 ${methodInfo.color}`} 
                                  title={methodInfo.label}
                                />
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          {project.deploymentLink && (
                            <a 
                              href={project.deploymentLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-[#0bb6bc] hover:underline flex items-center gap-1"
                            >
                              <FaExternalLinkAlt className="w-3 h-3" />
                              View Project
                            </a>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              // Track project view
                              fetch(`/api/collaborations/${project._id}/track-view`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json'
                                }
                              }).catch(error => console.error('Error tracking view:', error));
                            }}
                            className="text-xs bg-[#0bb6bc] text-white px-3 py-1 rounded hover:bg-[#0a9ea3] transition"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No projects available for <span className="font-semibold">{selectedCategory}</span>.
                    </p>
                    <button
                      onClick={() => setShowAddProject(true)}
                      className="px-4 py-2 bg-[#0bb6bc] text-white rounded-md hover:bg-[#0a9ea3] transition"
                    >
                      Add First Project
                    </button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setShowAddProject(true)}
                    className="w-full px-4 py-2 border border-[#0bb6bc] text-[#0bb6bc] rounded-md hover:bg-[#0bb6bc] hover:text-white transition text-center font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Project
                  </button>
                </div>
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

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    onClick={() => setShowAddProject(true)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Project
                  </button>
                  
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                    onClick={handleTrackProjects}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Track Your Projects
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
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#0bb6bc] transition-colors">
                              {category.name}
                            </h3>
                            {categoryCounts[category.name] > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                                {categoryCounts[category.name]}
                              </span>
                            )}
                          </div>
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
