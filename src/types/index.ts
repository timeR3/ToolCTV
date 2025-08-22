export type Role = "User" | "Admin" | "Superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

export interface Tool {
  id:string;
  name: string;
  description: string;
  url: string;
  icon: string; // lucide-react icon name
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
}
