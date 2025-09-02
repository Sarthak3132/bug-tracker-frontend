import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import Button from '../components/Button';
import EditProjectModal from '../components/EditProjectModal';
import AddMemberModal from '../components/AddMemberModal';
import CreateBugModal from '../components/CreateBugModal';
import { projectAPI, bugAPI } from '../services/api';
import { Bug, BugFilters } from '../types/bug.types';

interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: { _id: string; name: string; email: string };
  members: Array<{ _id: string; userId: { _id: string; name: string; email: string; avatar?: string }; role: string }>;
  createdAt: string;
  updatedAt: string;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bugs' | 'activity'>('bugs');
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [bugsLoading, setBugsLoading] = useState(false);
  const [totalBugCount, setTotalBugCount] = useState(0);
  const [bugFilters, setBugFilters] = useState<BugFilters>({});
  const [isCreateBugModalOpen, setIsCreateBugModalOpen] = useState(false);
  const [isCreatingBug, setIsCreatingBug] = useState(false);
  // const [showScrollTop, setShowScrollTop] = useState(false);

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
      fetchBugs();
    }
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Scroll position restoration
  useEffect(() => {
    console.log('ProjectDetail useEffect running, container:', scrollContainerRef.current);
    
    const setupScrollListener = () => {
      const savedScrollPosition = sessionStorage.getItem(`scroll-${location.pathname}`);
      if (savedScrollPosition && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = parseInt(savedScrollPosition);
      }

      const handleScroll = () => {
        if (scrollContainerRef.current) {
          const scrollTop = scrollContainerRef.current.scrollTop;
          sessionStorage.setItem(`scroll-${location.pathname}`, scrollTop.toString());
        }
      };

      const container = scrollContainerRef.current;
      if (container) {
        console.log('ProjectDetail: Adding scroll listener to container');
        container.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();
        return () => {
          console.log('ProjectDetail: Removing scroll listener');
          container.removeEventListener('scroll', handleScroll);
        };
      } else {
        console.log('ProjectDetail: No container found');
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(setupScrollListener, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const handleAddMember = async (memberData: { userEmail: string; role: string }) => {
    try {
      setIsAddingMember(true);
      await projectAPI.addMember(projectId!, memberData);
      await fetchProject(); // Refresh project data
      setIsAddMemberModalOpen(false);
    } catch (error: any) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setIsRemovingMember(memberId);
      await projectAPI.removeMember(projectId!, memberId);
      await fetchProject(); // Refresh project data
    } catch (error: any) {
      console.error('Error removing member:', error);
      alert(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setIsRemovingMember(null);
    }
  };

  const fetchBugs = async () => {
    try {
      setBugsLoading(true);
      console.log('Fetching bugs for project:', projectId);
      const response = await bugAPI.getBugs({ ...bugFilters, project: projectId! });
      console.log('Bug response:', response.data);
      setBugs(response.data.bugs || []);
      setTotalBugCount(response.data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching bugs:', error);
      setBugs([]);
      setTotalBugCount(0);
    } finally {
      setBugsLoading(false);
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

  const handleCreateBug = async (bugData: {
    title: string;
    description: string;
    priority: string;
    assignedTo?: string;
  }) => {
    try {
      setIsCreatingBug(true);
      await bugAPI.createBug({
        ...bugData,
        project: projectId!,
        reportedBy: user!._id
      });
      await fetchBugs();
      setIsCreateBugModalOpen(false);
    } catch (error: any) {
      console.error('Error creating bug:', error);
      alert(error.response?.data?.message || 'Failed to create bug');
    } finally {
      setIsCreatingBug(false);
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
    <>
      <div className="h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex overflow-hidden">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div 
        ref={scrollContainerRef}
        className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed 
            ? 'md:ml-16' 
            : 'md:ml-60 lg:ml-64'
        }`}
      >
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md"
        >
          ☰
        </button>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6">
          <div>
            <Breadcrumb />
            
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{project.name}</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Project Details & Management</p>
              </div>
              {isAdmin && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-sm sm:text-base"
                  >
                    Edit Project
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-red-600 border-red-300 hover:bg-red-50 text-sm sm:text-base"
                  >
                    Delete Project
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
          {/* Project Info */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Project Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          <div className="card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Team Members ({project.members.length})</h2>
              {isAdmin && (
                <Button 
                  variant="primary" 
                  className="text-sm w-full sm:w-auto"
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  + Add Member
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {project.members.map((member) => (
                <div key={member._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {member.userId?.avatar ? (
                      <img
                        src={`http://localhost:5000/${member.userId.avatar}`}
                        alt={member.userId.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${member.userId?.avatar ? 'hidden' : ''}`}>
                      {member.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{member.userId?.name || 'Unknown User'}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{member.userId?.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                    {isAdmin && member.userId._id !== user?._id && (
                      <button 
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={isRemovingMember === member._id}
                        className="text-red-600 hover:text-red-800 text-xs sm:text-sm disabled:opacity-50 px-2 py-1"
                      >
                        {isRemovingMember === member._id ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('bugs')}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'bugs'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bugs ({totalBugCount})
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'activity'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Activity
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === 'bugs' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Project Bugs</h2>
                    <Button 
                      variant="primary" 
                      onClick={() => setIsCreateBugModalOpen(true)}
                      className="text-sm sm:text-base w-full sm:w-auto"
                    >
                      + Create Bug
                    </Button>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <select
                      value={bugFilters.status || ''}
                      onChange={(e) => setBugFilters({ ...bugFilters, status: e.target.value || undefined })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm w-full"
                    >
                      <option value="">All Status</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={bugFilters.priority || ''}
                      onChange={(e) => setBugFilters({ ...bugFilters, priority: e.target.value || undefined })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm w-full"
                    >
                      <option value="">All Priority</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select
                      value={bugFilters.assignedTo || ''}
                      onChange={(e) => setBugFilters({ ...bugFilters, assignedTo: e.target.value || undefined })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm w-full"
                    >
                      <option value="">All Assignees</option>
                      {project?.members.map((member) => (
                        <option key={member._id} value={member.userId._id}>
                          {member.userId.name}
                        </option>
                      ))}
                    </select>
                    <Button 
                      variant="secondary" 
                      onClick={fetchBugs}
                      className="text-xs sm:text-sm w-full"
                    >
                      Apply Filters
                    </Button>
                  </div>

                  {/* Bugs List */}
                  {bugsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : bugs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No bugs found</p>
                      <p className="text-sm mt-1">Create your first bug report</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bugs.map((bug) => (
                        <div key={bug._id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate flex-1 min-w-0">{bug.title}</h3>
                                <div className="flex gap-1 flex-shrink-0">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                                    {bug.priority}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                                    {bug.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{bug.description}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                                <span className="truncate">By {bug.reportedBy?.name}</span>
                                {bug.assignedTo ? (
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                                    <span className="truncate">Assigned to {bug.assignedTo.name}</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-orange-600">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                                    <span>Unassigned</span>
                                  </span>
                                )}
                                <span className="hidden sm:inline">{new Date(bug.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:flex-col sm:gap-1">
                              {!bug.assignedTo && (
                                <Button 
                                  variant="primary" 
                                  className="text-xs px-2 py-1 flex-1 sm:flex-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    bugAPI.assignBug(projectId!, bug._id, user!._id)
                                      .then(() => fetchBugs())
                                      .catch(err => console.error('Quick assign failed:', err));
                                  }}
                                >
                                  👤 Assign
                                </Button>
                              )}
                              <Button 
                                variant="secondary" 
                                className="text-xs px-2 py-1 flex-1 sm:flex-none"
                                onClick={() => navigate(`/projects/${projectId}/bugs/${bug._id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  {bugs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No activity yet</p>
                      <p className="text-sm mt-1">Activity will appear when bugs are created or updated</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bugs
                        .flatMap(bug => [
                          // Bug creation activity
                          {
                            id: `created-${bug._id}`,
                            type: 'created',
                            bug: bug,
                            user: bug.reportedBy,
                            timestamp: bug.createdAt,
                            message: `created bug "${bug.title}"`
                          },
                          // History activities
                          ...bug.history.map(entry => ({
                            id: `${bug._id}-${entry.changedAt}`,
                            type: 'updated',
                            bug: bug,
                            user: entry.changedBy,
                            timestamp: entry.changedAt,
                            field: entry.field,
                            oldValue: entry.oldValue,
                            newValue: entry.newValue,
                            comment: entry.comment,
                            message: `changed ${entry.field} from "${entry.oldValue}" to "${entry.newValue}"${entry.comment ? ` - ${entry.comment}` : ''}`
                          }))
                        ])
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .slice(0, 10)
                        .map((activity) => (
                          <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium">{activity.user?.name || 'Unknown User'}</span>
                                  {' '}{activity.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(activity.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <div className="ml-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  activity.type === 'created' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {activity.type === 'created' ? 'Created' : 'Updated'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
        isLoading={isAddingMember}
      />

      {/* Create Bug Modal */}
      <CreateBugModal
        isOpen={isCreateBugModalOpen}
        onClose={() => setIsCreateBugModalOpen(false)}
        onSubmit={handleCreateBug}
        isLoading={isCreatingBug}
        projectMembers={project?.members || []}
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

      {/* Scroll to Top Button - Global */}
      <button
        onClick={scrollToTop}
        className="group fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 backdrop-blur-sm border border-white/20"
        style={{ zIndex: 9999 }}
        title="Scroll to top"
      >
        <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
};

export default ProjectDetail;