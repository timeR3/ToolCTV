
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { switchUserRole } from "@/lib/auth"
import type { User, Role } from "@/types"
import { useRouter } from "next/navigation"

interface RoleSwitcherProps {
  currentUser: User
}

export function RoleSwitcher({ currentUser }: RoleSwitcherProps) {
  const router = useRouter()

  const handleRoleChange = async (newRole: Role) => {
    await switchUserRole(newRole)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Simulate Role:</span>
      <Select onValueChange={handleRoleChange} defaultValue={currentUser.role}>
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="Superadmin">Superadmin</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="User">User</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
