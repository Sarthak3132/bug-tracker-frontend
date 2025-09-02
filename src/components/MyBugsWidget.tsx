import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bugAPI, projectAPI } from '../services/api';
import { Bug } from '../types/bug.types';

const MyBugsWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBugs();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMyBugs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Get user's projects first
      const projectsResponse = await projectAPI.getAllProjects();
      const projects = projectsResponse.data;
      
      // Get bugs assigned to current user from all projects
      const bugPromises = projects.map((project: any) =>
        bugAPI.getBugs({
          project: project._id,
          assignedTo: user._id,
          limit: 3,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }).catch(() => ({ data: { bugs: [] } })) // Handle projects with no bugs
      );
      
      const bugResponses = await Promise.all(bugPromises);
      const allBugs = bugResponses.flatMap(response => response.data.bugs || []);
      
      // Sort by creation date and take top 5
      const sortedBugs = allBugs
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
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

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Recent Bugs</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">My Recent Bugs</h3>
        <span className="text-sm text-gray-500">{bugs.length} assigned</span>
      </div>
      
      {bugs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🐛</span>
          </div>
          <p className="text-sm">No bugs assigned to you</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bugs.map((bug) => (
            <div 
              key={bug._id} 
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => {
                const projectId = typeof bug.project === 'object' ? bug.project._id : bug.project;
                navigate(`/projects/${projectId}`);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{bug.title}</h4>
                  <p className="text-xs text-gray-500 mb-1">
                    {typeof bug.project === 'object' ? bug.project.name : 'Unknown Project'}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">{bug.description}</p>
                </div>
                <div className="flex flex-col gap-1 ml-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                    {bug.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                    {bug.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {bugs.length > 0 && (
            <button 
              onClick={() => navigate('/my-bugs')}
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700 py-2"
            >
              View all my bugs →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBugsWidget;