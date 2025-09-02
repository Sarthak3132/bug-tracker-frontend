import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { MESSAGES } from '../utils/notifications';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: { name: string; description: string }) => void;
  isLoading: boolean;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full mx-4 p-4 sm:p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Project</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <Input
            id="name"
            name="name"
            type="text"
            label="Project Name"
            placeholder="Enter project name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <div className="mb-4">
            <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Enter project description"
              value={formData.description}
              onChange={handleChange}
              className="input-field text-sm sm:text-base py-2 sm:py-3 resize-none"
            />
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
                <LoadingSpinner message={MESSAGES.PROJECT.CREATING} />
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;