import type { LucideProps } from "lucide-react";
import {
  Wrench,
  ShieldCheck,
  GitBranch,
  FileClock,
  LayoutDashboard,
  User,
  Settings,
  Shapes,
  Users,
  UserCheck,
} from "lucide-react";

export const Icons = {
  Wrench,
  ShieldCheck,
  GitBranch,
  FileClock,
  LayoutDashboard,
  User,
  Settings,
  Shapes,
  Users,
  UserCheck,
};

type IconName = keyof typeof Icons;

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const IconComponent = Icons[name as IconName];

  if (!IconComponent) {
    // Fallback Icon
    return <Wrench {...props} />;
  }

  return <IconComponent {...props} />;
};
