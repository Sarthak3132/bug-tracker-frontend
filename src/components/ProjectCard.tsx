import React from 'react';

interface Project {
  _id: string;
  name: string;
  description: string;
  members: Array<{ userId: string; role: string }>;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  onClick: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      onClick={() => onClick(project._id)}
      className="card p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {project.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {project.description || 'No description provided'}
          </p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-semibold ml-4">
          {project.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{project.members?.length || 0} members</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary-600">
          <span>→</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;