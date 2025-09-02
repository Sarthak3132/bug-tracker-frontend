import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import { bugAPI, projectAPI } from '../services/api';
import { Bug } from '../types/bug.types';

const MyBugs: React.FC = () => {
  const { user } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', icon: '🏠', onClick: () => window.location.href = '/dashboard' },
      { label: 'My Bugs', icon: '🐛' }
    ]);
    fetchMyBugs();
  }, [setBreadcrumbs, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMyBugs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const projectsResponse = await projectAPI.getAllProjects();
      const projects = projectsResponse.data;
      
      const bugPromises = projects.map((project: any) =>
        bugAPI.getBugs({
          project: project._id,
          assignedTo: user._id
        }).catch(() => ({ data: { bugs: [] } }))
      );
      
      const bugResponses = await Promise.all(bugPromises);
      const allBugs = bugResponses.flatMap(response => response.data.bugs || []);
      
      const sortedBugs = allBugs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setBugs(sortedBugs);
    } catch (error) {
      console.error('Error fetching my bugs:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6">
          <Breadcrumb />
          <div className="mt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Bugs</h1>
            <p className="text-gray-600 mt-1">All bugs assigned to you</p>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6">
          <div className="card p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : bugs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🐛</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs assigned</h3>
                <p>You don't have any bugs assigned to you at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {bugs.length} bug{bugs.length !== 1 ? 's' : ''} assigned to you
                  </h2>
                </div>
                
                {bugs.map((bug) => (
                  <div key={bug._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{bug.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                            {bug.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                            {bug.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          Project: {typeof bug.project === 'object' ? bug.project.name : 'Unknown Project'}
                        </p>
                        <p className="text-gray-600 text-sm mb-2">{bug.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Reported by {bug.reportedBy?.name}</span>
                          <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBugs;