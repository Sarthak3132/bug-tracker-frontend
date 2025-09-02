import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

  const { setBreadcrumbs } = useBreadcrumb();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768); // Collapsed only on mobile, open on tablet+
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Set breadcrumbs for dashboard
    setBreadcrumbs([
      { label: 'Dashboard', icon: '🏠' },
      { label: 'Projects', icon: '📁' }
    ]);
    fetchProjects();
  }, [setBreadcrumbs]);

  // Scroll position restoration
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(`scroll-${location.pathname}`);
    if (savedScrollPosition && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = parseInt(savedScrollPosition);
    }

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        const scrollHeight = scrollContainerRef.current.scrollHeight;
        const clientHeight = scrollContainerRef.current.clientHeight;
        const quarterPage = Math.max((scrollHeight - clientHeight) / 4, 50);
        sessionStorage.setItem(`scroll-${location.pathname}`, scrollTop.toString());
        setShowScrollTop(scrollTop > quarterPage);
        // console.log('Scroll:', { scrollTop, quarterPage, show: scrollTop > quarterPage });
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      // Initial check
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [location.pathname]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    <>
      <div className="h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex relative overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        {/* Main Content */}
        <div 
          ref={scrollContainerRef}
          className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${
            sidebarCollapsed 
              ? 'md:ml-16' 
              : 'md:ml-60 lg:ml-64'
          }`}
        >
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md"
        >
          ☰
        </button>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6">
          <div>
            {/* Breadcrumb */}
            <Breadcrumb />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Projects</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and track your projects</p>
              </div>
              <Button 
                variant="primary" 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                + Create Project
              </Button>
            </div>
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
          <div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
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
                <div className="space-y-3 sm:space-y-4">
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
      </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
          isLoading={isCreating}
        />
      </div>

      {/* Scroll to Top Button - Global */}
      {showScrollTop && (
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
      )}
    </>
  );
};

export default Dashboard;