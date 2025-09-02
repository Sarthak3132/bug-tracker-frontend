export const MESSAGES = {
  // Project Messages
  PROJECT: {
    CREATING: 'Creating project...',
    CREATED: 'Project created successfully',
    CREATE_FAILED: 'Failed to create project',
    UPDATING: 'Updating project...',
    UPDATED: 'Project updated successfully',
    UPDATE_FAILED: 'Failed to update project',
    DELETING: 'Deleting project...',
    DELETED: 'Project deleted successfully',
    DELETE_FAILED: 'Failed to delete project',
    ADDING_MEMBER: 'Adding member...',
    MEMBER_ADDED: 'Member added successfully',
    ADD_MEMBER_FAILED: 'Failed to add member',
    REMOVING_MEMBER: 'Removing member...',
    MEMBER_REMOVED: 'Member removed successfully',
    REMOVE_MEMBER_FAILED: 'Failed to remove member'
  },
  
  // Bug Messages
  BUG: {
    CREATING: 'Creating bug report...',
    CREATED: 'Bug report created successfully',
    CREATE_FAILED: 'Failed to create bug report',
    UPDATING: 'Updating bug...',
    UPDATED: 'Bug updated successfully',
    UPDATE_FAILED: 'Failed to update bug',
    DELETING: 'Deleting bug...',
    DELETED: 'Bug deleted successfully',
    DELETE_FAILED: 'Failed to delete bug',
    ASSIGNING: 'Assigning bug...',
    ASSIGNED: 'Bug assigned successfully',
    ASSIGN_FAILED: 'Failed to assign bug',
    COMMENTING: 'Adding comment...',
    COMMENTED: 'Comment added successfully',
    COMMENT_FAILED: 'Failed to add comment'
  },
  
  // General Messages
  GENERAL: {
    LOADING: 'Loading...',
    SAVING: 'Saving...',
    SUCCESS: 'Operation completed successfully',
    ERROR: 'Something went wrong. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action'
  }
};

export type NotificationType = 'success' | 'error' | 'loading' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}