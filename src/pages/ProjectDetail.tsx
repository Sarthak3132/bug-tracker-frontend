import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import Button from '../components/Button';
import EditProjectModal from '../components/EditProjectModal';
import { projectAPI } from '../services/api';

interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: { _id: string; name: string; email: string };
  members: Array<{ _id: string; userId: { _id: string; name: string; email: string }; role: string }>;
  createdAt: string;
  updatedAt: string;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const currentUserMember = project?.members.find(m => m.userId._id === user?._id);
  const isAdmin = currentUserMember?.role === 'admin';
  
  // Debug logging
  console.log('Current user ID:', user?._id);
  console.log('Project members:', project?.members);
  console.log('Current user member:', currentUserMember);
  console.log('Is admin:', isAdmin);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setBreadcrumbs([
        { label: 'Dashboard', icon: '🏠', onClick: () => navigate('/dashboard') },
        { label: 'Projects', icon: '📁', onClick: () => navigate('/dashboard') },
        { label: project.name, icon: '📋' }
      ]);
      
      // Debug: Check if creator is properly set as admin
      console.log('Project creator ID:', project.createdBy._id);
      console.log('Current user ID:', user?._id);
    }
  }, [project, setBreadcrumbs, navigate, user]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjectById(projectId!);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (projectData: { name: string; description: string }) => {
    try {
      setIsEditing(true);
      console.log('Editing project with ID:', projectId);
      console.log('Project ID type:', typeof projectId);
      console.log('Project ID length:', projectId?.length);
      const response = await projectAPI.updateProject(projectId!, projectData);
      setProject(response.data);
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating project:', error);
      console.error('Project ID being sent for edit:', projectId);
      alert(error.response?.data?.message || 'Failed to update project');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      console.log('Deleting project with ID:', projectId);
      console.log('Project ID type:', typeof projectId);
      console.log('Project ID length:', projectId?.length);
      console.log('Project ID characters:', projectId?.split(''));
      await projectAPI.deleteProject(projectId!);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      console.error('Project ID being sent:', projectId);
      alert(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6">
          <Breadcrumb />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">Project Details & Management</p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                  Edit Project
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete Project
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Project Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{project.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <p className="text-gray-900">{project.createdBy.name}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{project.description || 'No description provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Team Members ({project.members.length})</h2>
              {isAdmin && (
                <Button variant="primary" className="text-sm">
                  + Add Member
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {project.members.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.userId?.name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600">{member.userId?.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                    {isAdmin && member.userId._id !== user?._id && (
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
              <p className="text-sm mt-1">Bug tracking features coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditProject}
        isLoading={isEditing}
        initialData={{ name: project.name, description: project.description || '' }}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Project</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleDeleteProject}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;