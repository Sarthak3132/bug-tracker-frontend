export interface Bug {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'pending';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  project: string | { _id: string; name: string; };
  history: BugHistoryEntry[];
  comments: BugComment[];
  createdAt: string;
  updatedAt: string;
}

export interface BugHistoryEntry {
  _id: string;
  status?: string;
  field: string;
  changedBy: {
    _id: string;
    name: string;
    email: string;
  };
  changedAt: string;
  oldValue: any;
  newValue: any;
  comment?: string;
}

export interface BugComment {
  _id: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  createdAt: string;
}

export interface BugFilters {
  project?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  sortBy?: 'createdAt' | 'priority' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
  searchText?: string;
}