export type Role = "User" | "Admin" | "Superadmin";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  assignedTools: number[]; // Array of tool IDs
}

export interface Tool {
  id: number;
  name: string;
  description: string;
  url: string;
  icon: string; // lucide-react icon name
  iconUrl?: string; // URL for a custom icon image
  enabled: boolean;
  category: string;
  created_by_user_id: number;
  createdByUser?: string; // Name of the user who created the tool
}

export interface LogEntry {
  id: number;
  timestamp: Date;
  adminName: string;
  action: string;
  details: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  icon: string; // lucide-react icon name
  iconUrl?: string; // URL for a custom icon image
}

export interface Permission {
  id: number;
  name: string;
  description: string;
}
