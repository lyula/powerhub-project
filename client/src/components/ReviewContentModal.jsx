import React, { useState } from 'react';
import { MdClose, MdGavel } from 'react-icons/md';

const ReviewContentModal = ({ isOpen, onClose, content, onReview }) => {
  const [status, setStatus] = useState('reviewed');
  const [action, setAction] = useState('none');
  const [notes, setNotes] = useState('');
  const [banDuration, setBanDuration] = useState('7_days');
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = [
    { value: 'reviewed', label: 'Reviewed (No Action)' },
    { value: 'resolved', label: 'Resolved (Action Taken)' },
    { value: 'dismissed', label: 'Dismissed (Invalid Report)' }
  ];

  const actionOptions = [
    { value: 'none', label: 'No Action Required' },
    { value: 'warn', label: 'Warn User' },
    { value: 'remove', label: 'Remove Content' },
    { value: 'ban_user', label: 'Ban User' },
    { value: 'other', label: 'Other Action' }
  ];

  const banDurationOptions = [
    { value: '1_day', label: '1 Day' },
    { value: '3_days', label: '3 Days' },
    { value: '7_days', label: '7 Days (Default)' },
    { value: '14_days', label: '14 Days' },
    { value: '30_days', label: '30 Days' },
    { value: 'permanent', label: 'Permanent Ban' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert('Please provide review notes');
      return;
    }

    setSubmitting(true);
    try {
      await onReview(content._id, status, action, notes, banDuration);
      setStatus('reviewed');
      setAction('none');
      setNotes('');
      setBanDuration('7_days');
      onClose();
    } catch (error) {
      console.error('Error reviewing content:', error);
      alert('Error reviewing content');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <div className="flex items-center gap-2">
            <MdGavel className="text-blue-500" size={18} />
            <h2 className="text-base sm:text-lg font-semibold">Review Flagged Content</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="p-3 sm:p-4">
          {/* Content Details */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
            <h3 className="font-semibold mb-3 text-sm sm:text-base">Flagged Content Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="font-medium">Type:</span> {content.contentType}
              </div>
              <div>
                <span className="font-medium">Reason:</span> {content.reason}
              </div>
              <div>
                <span className="font-medium">Reported by:</span> {content.reportedBy?.username || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(content.createdAt).toLocaleDateString()}
              </div>
              <div className="sm:col-span-2">
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-gray-700 text-xs sm:text-sm">{content.description}</p>
              </div>
              {content.flagCount && (
                <div>
                  <span className="font-medium">Total Flags:</span> {content.flagCount}
                </div>
              )}
              {content.priority && (
                <div className="sm:col-span-2">
                  <span className="font-medium">Priority:</span> 
                  <span className={`ml-1 px-2 py-1 text-xs rounded ${
                    content.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    content.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    content.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {content.priority}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Review Decision *
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mr-2 w-3 h-3 sm:w-4 sm:h-4"
                    />
                    <span className="text-xs sm:text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Action to Take *
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {actionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ban Duration Selection - Only show when banning user */}
            {action === 'ban_user' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <label className="block text-xs sm:text-sm font-medium text-red-700 mb-2">
                  Ban Duration *
                </label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  {banDurationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-red-600 mt-1">
                  {banDuration === 'permanent' 
                    ? '⚠️ Permanent bans cannot be automatically lifted'
                    : 'Temporary bans will be automatically lifted when they expire'
                  }
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Review Notes *
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain your decision and any actions taken..."
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!notes.trim() || submitting}
                className="w-full sm:flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Reviewing...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewContentModal;
