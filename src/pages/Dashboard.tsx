import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import { useNotification } from '../contexts/NotificationContext';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import MyBugsWidget from '../components/MyBugsWidget';
import Breadcrumb from '../components/Breadcrumb';
import Button from '../components/Button';
import { projectAPI } from '../services/api';
import { MESSAGES } from '../utils/notifications';

interface Project {
  _id: string;
  name: string;
  description: string;
  members: Array<{ userId: string; role: string }>;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Set breadcrumbs for dashboard
    setBreadcrumbs([
      { label: 'Dashboard', icon: '🏠' },
      { label: 'Projects', icon: '📁' }
    ]);
    fetchProjects();
  }, [setBreadcrumbs]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAllProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: { name: string; description: string }) => {
    try {
      setIsCreating(true);
      const response = await projectAPI.createProject(projectData);
      setProjects(prev => [response.data, ...prev]);
      setIsCreateModalOpen(false);
      showSuccess(MESSAGES.PROJECT.CREATED);
    } catch (error: any) {
      console.error('Error creating project:', error);
      showError(error.response?.data?.message || MESSAGES.PROJECT.CREATE_FAILED);
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6">
          {/* Breadcrumb */}
          <Breadcrumb />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">Manage and track your projects</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto"
            >
              + Create Project
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field max-w-md"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Projects Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Projects ({filteredProjects.length})</h2>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="card p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📁</span>
                  </div>
                  <p className="text-sm text-gray-500">No projects found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProjects.slice(0, 4).map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      onClick={handleProjectClick}
                    />
                  ))}
                  {filteredProjects.length > 4 && (
                    <div className="text-center">
                      <button className="text-sm text-primary-600 hover:text-primary-700">
                        View all {filteredProjects.length} projects →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* My Bugs Widget */}
            <MyBugsWidget />
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        isLoading={isCreating}
      />
    </div>
  );
};

export default Dashboard;