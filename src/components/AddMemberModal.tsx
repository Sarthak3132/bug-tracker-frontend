import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: { userEmail: string; role: string }) => void;
  isLoading: boolean;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('developer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) return;
    
    onSubmit({
      userEmail: userEmail.trim(),
      role: selectedRole
    });
  };

  const handleClose = () => {
    setUserEmail('');
    setSelectedRole('developer');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Team Member</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="userEmail"
            name="userEmail"
            type="email"
            label="User Email"
            placeholder="Enter user's email address"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field"
              required
            >
              <option value="developer">Developer</option>
              <option value="tester">Tester</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
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
              disabled={isLoading || !userEmail.trim()}
            >
              {isLoading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;