export type Role = "User" | "Admin" | "Superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  assignedTools: string[]; // Array of tool IDs
}

export interface Tool {
  id:string;
  name: string;
  description: string;
  url: string;
  icon: string; // lucide-react icon name
  iconUrl?: string; // URL for a custom icon image
  enabled: boolean;
  category: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  adminName: string;
  action: string;
  details: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}
