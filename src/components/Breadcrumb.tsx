import React from 'react';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';

const Breadcrumb: React.FC = () => {
  const { breadcrumbs: items, removeBreadcrumb } = useBreadcrumb();
  
  const handleBreadcrumbClick = (index: number, item: any) => {
    if (item.onClick) {
      item.onClick();
    }
    // Remove breadcrumbs after the clicked one
    removeBreadcrumb(index);
  };
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-600 mb-4 overflow-hidden">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <span className="mx-1 text-gray-400 flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
          
          {(item.href || item.onClick || index < items.length - 1) ? (
            <button
              onClick={() => handleBreadcrumbClick(index, item)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 group min-w-0"
            >
              {item.icon && <span className="text-sm sm:text-base flex-shrink-0">{item.icon}</span>}
              <span className={`${index === items.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600 hover:text-gray-900'
              } transition-colors duration-200 truncate text-xs sm:text-sm`}>
                {item.label}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 min-w-0">
              {item.icon && <span className="text-sm sm:text-base flex-shrink-0">{item.icon}</span>}
              <span className={`${index === items.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600'
              } truncate text-xs sm:text-sm`}>
                {item.label}
              </span>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;