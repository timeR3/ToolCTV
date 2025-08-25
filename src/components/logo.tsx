import { Box } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-headline text-lg font-semibold tracking-tight text-sidebar-foreground">
      <Box className="size-6 text-primary" />
      <span className="group-data-[state=collapsed]:hidden">Toolbox Pro</span>
    </div>
  );
}
