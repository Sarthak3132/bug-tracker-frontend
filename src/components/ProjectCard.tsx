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
      className="card p-4 sm:p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 truncate">
            {project.name}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
            {project.description || 'No description provided'}
          </p>
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-semibold ml-3 sm:ml-4 flex-shrink-0">
          {project.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 gap-2 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{project.members?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span className="hidden sm:inline">Updated </span>
            <span>{formatDate(project.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary-600 self-end sm:self-auto">
          <span>→</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;