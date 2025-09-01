export interface Tour {
  id: string;
  name: string;
  type: 'station' | 'workshop' | 'tunnel';
  coordinates: {
    x: number;
    y: number;
  };
  equipment: string[];
  status: 'active' | 'maintenance' | 'offline';
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionReport {
  id: string;
  sessionDate: Date;
  siteId: string;
  siteName: string;
  participants: {
    expert: string;
    technician: string;
  };
  summary: string;
  annotatedImage?: string;
  duration: number; // in minutes
}

export interface DrawingTool {
  type: 'pen' | 'circle' | 'arrow';
  color: string;
  thickness: number;
}

export interface Annotation {
  id: string;
  type: DrawingTool['type'];
  points: { x: number; y: number }[];
  color: string;
  thickness: number;
}

export type PageType = 'dashboard' | 'live-session' | 'reports' | 'settings';