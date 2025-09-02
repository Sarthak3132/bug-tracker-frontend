import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import { useNotification } from '../contexts/NotificationContext';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import Button from '../components/Button';
import { bugAPI, projectAPI } from '../services/api';
import { Bug } from '../types/bug.types';
import { MESSAGES } from '../utils/notifications';

const BugDetail: React.FC = () => {
  const { projectId, bugId } = useParams<{ projectId: string; bugId: string }>();
  const navigate = useNavigate();
  // const { user } = useAuth(); // Commented out as not used
  const { setBreadcrumbs } = useBreadcrumb();
  const { showSuccess, showError } = useNotification();
  
  const [bug, setBug] = useState<Bug | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ priority: '', status: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [assignmentSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && bugId) {
      fetchBug();
      fetchProjectMembers();
    }
  }, [projectId, bugId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (bug) {
      setBreadcrumbs([
        { label: 'Dashboard', icon: '🏠', onClick: () => navigate('/dashboard') },
        { label: 'Projects', icon: '📁', onClick: () => navigate('/dashboard') },
        { 
          label: typeof bug.project === 'object' ? bug.project.name : 'Project', 
          icon: '📋', 
          onClick: () => navigate(`/projects/${projectId}`) 
        },
        { label: bug.title, icon: '🐛' }
      ]);
      setEditData({ priority: bug.priority, status: bug.status });
    }
  }, [bug, setBreadcrumbs, navigate, projectId]);

  const fetchBug = async () => {
    try {
      setLoading(true);
      const response = await bugAPI.getBugById(projectId!, bugId!);
      setBug(response.data);
    } catch (error) {
      console.error('Error fetching bug:', error);
      navigate(`/projects/${projectId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsAddingComment(true);
      await bugAPI.addComment(projectId!, bugId!, newComment);
      setNewComment('');
      await fetchBug();
      showSuccess(MESSAGES.BUG.COMMENTED);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      showError(error.response?.data?.message || MESSAGES.BUG.COMMENT_FAILED);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleUpdateBug = async () => {
    try {
      setIsUpdating(true);
      const updateData: any = { ...editData };
      if (editData.status !== bug?.status && statusComment.trim()) {
        updateData.statusComment = statusComment;
      }
      await bugAPI.updateBug(projectId!, bugId!, updateData);
      setIsEditing(false);
      setStatusComment('');
      await fetchBug();
    } catch (error) {
      console.error('Error updating bug:', error);
      alert('Failed to update bug');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBug = async () => {
    try {
      setIsDeleting(true);
      await bugAPI.deleteBug(projectId!, bugId!);
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error deleting bug:', error);
      alert('Failed to delete bug');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const response = await projectAPI.getProjectById(projectId!);
      setProjectMembers(response.data.members || []);
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  };

  const handleAssignBug = async (assignedTo: string) => {
    try {
      setIsAssigning(true);
      const member = projectMembers.find(m => m.userId._id === assignedTo);
      await bugAPI.assignBug(projectId!, bugId!, assignedTo);
      await fetchBug();
      showSuccess(`Bug successfully assigned to ${member?.userId.name}!`);
      setShowAssignModal(false);
    } catch (error: any) {
      console.error('Error assigning bug:', error);
      showError(error.response?.data?.message || MESSAGES.BUG.ASSIGN_FAILED);
    } finally {
      setIsAssigning(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'tester': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bug not found</h2>
            <Button onClick={() => navigate(`/projects/${projectId}`)}>Back to Project</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6">
          <Breadcrumb />
          <div className="flex items-start justify-between mt-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{bug.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(bug.priority)}`}>
                  {bug.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bug.status)}`}>
                  {bug.status}
                </span>
              </div>
              <p className="text-gray-600">
                Project: {typeof bug.project === 'object' ? bug.project.name : 'Unknown Project'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              {!bug.assignedTo ? (
                <Button 
                  variant="primary" 
                  onClick={() => setShowAssignModal(true)}
                >
                  👤 Assign Bug
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  onClick={() => setShowAssignModal(true)}
                >
                  🔄 Reassign
                </Button>
              )}
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Success Message */}
          {assignmentSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <p className="text-green-800 font-medium">{assignmentSuccess}</p>
              </div>
            </div>
          )}

          {/* Bug Details */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bug Details</h2>
            {isEditing ? (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={editData.priority}
                      onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
                {editData.status !== bug?.status && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Change Comment (Optional)</label>
                    <textarea
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      placeholder="Explain why you're changing the status..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpdateBug}
                    disabled={isUpdating}
                    variant="primary"
                  >
                    {isUpdating ? 'Updating...' : 'Update Bug'}
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                  {bug.priority}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                  {bug.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                <p className="text-gray-900">{bug.reportedBy?.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <div className="flex items-center gap-2">
                  {bug.assignedTo ? (
                    <>
                      <span className="text-gray-900">{bug.assignedTo.name}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ✓ Assigned
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-500">Unassigned</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        ⚠ Needs Assignment
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 whitespace-pre-wrap">{bug.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">{new Date(bug.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900">{new Date(bug.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">History</h2>
            {bug.history.length === 0 ? (
              <p className="text-gray-500">No history available</p>
            ) : (
              <div className="space-y-3">
                {bug.history.map((entry, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{entry.changedBy?.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.changedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Changed {entry.field} from "{entry.oldValue}" to "{entry.newValue}"
                      {entry.comment && ` - ${entry.comment}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
            
            {/* Add Comment */}
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="mt-2">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                  variant="primary"
                  className="text-sm"
                >
                  {isAddingComment ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {bug.comments.length === 0 ? (
              <p className="text-gray-500">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {bug.comments.map((comment, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{comment.author?.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Bug</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{bug.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleDeleteBug}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Bug'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Bug Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {bug.assignedTo ? 'Reassign Bug' : 'Assign Bug'}
            </h3>
            <p className="text-gray-600 mb-4">
              {bug.assignedTo 
                ? `Currently assigned to ${bug.assignedTo.name}. Choose a new assignee:`
                : 'Choose a team member to assign this bug to:'
              }
            </p>
            <div className="space-y-3 mb-6">
              {projectMembers.map((member) => {
                const isCurrentlyAssigned = member.userId._id === bug.assignedTo?._id;
                return (
                  <button
                    key={member._id}
                    onClick={() => handleAssignBug(member.userId._id)}
                    disabled={isAssigning || isCurrentlyAssigned}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      isCurrentlyAssigned
                        ? 'bg-blue-50 border-blue-300 text-blue-700 cursor-not-allowed'
                        : 'hover:bg-gray-50 hover:border-primary-300 border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          isCurrentlyAssigned ? 'bg-blue-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}>
                          {member.userId.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-medium ${
                            isCurrentlyAssigned ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {member.userId.name}
                            {isCurrentlyAssigned && ' (Currently Assigned)'}
                          </p>
                          <p className={`text-sm ${
                            isCurrentlyAssigned ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {member.userId.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                        {isCurrentlyAssigned && (
                          <span className="text-blue-500 text-lg">✓</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={() => setShowAssignModal(false)}
                disabled={isAssigning}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugDetail;