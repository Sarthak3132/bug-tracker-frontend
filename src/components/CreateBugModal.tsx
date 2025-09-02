import React, { useState } from 'react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { MESSAGES } from '../utils/notifications';

interface CreateBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bugData: {
    title: string;
    description: string;
    priority: string;
    assignedTo?: string;
  }) => void;
  isLoading: boolean;
  projectMembers: Array<{ _id: string; userId: { _id: string; name: string; email: string }; role: string }>;
}

const CreateBugModal: React.FC<CreateBugModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  projectMembers
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      assignedTo: formData.assignedTo || undefined
    });
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full mx-4 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Create New Bug</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">🔄 Unassigned (Assign Later)</option>
              {projectMembers.map((member) => (
                <option key={member._id} value={member.userId._id}>
                  👤 {member.userId.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner message={MESSAGES.BUG.CREATING} />
              ) : (
                'Create Bug'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBugModal;