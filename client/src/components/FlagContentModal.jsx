import React, { useState } from 'react';
import { MdClose, MdFlag } from 'react-icons/md';

const FlagContentModal = ({ isOpen, onClose, contentType, contentId, contentTitle }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam or Misleading' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'harassment', label: 'Harassment or Bullying' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !description) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/flagged-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
          description
        })
      });

      if (response.ok) {
        alert('Content flagged successfully. Our team will review it.');
        setReason('');
        setDescription('');
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to flag content');
      }
    } catch (error) {
      console.error('Error flagging content:', error);
      alert('Error flagging content');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MdFlag className="text-red-500" size={20} />
            <h2 className="text-lg font-semibold">Flag Content</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content: {contentTitle}
            </label>
            <p className="text-sm text-gray-500">
              Type: {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for flagging *
            </label>
            <div className="space-y-2">
              {reasons.map((reasonOption) => (
                <label key={reasonOption.value} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption.value}
                    checked={reason === reasonOption.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{reasonOption.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional details *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specific details about why you're flagging this content..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || !description || submitting}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Flagging...' : 'Flag Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlagContentModal;
