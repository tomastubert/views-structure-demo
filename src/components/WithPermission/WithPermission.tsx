// Renders children only if the current user has the permission.

import { usePermission } from 'app/hooks/usePermission'
import type { Permission } from 'app/types/user'
import type { ReactNode } from 'react'

interface WithPermissionProps {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

export default function WithPermission({
  permission,
  children,
  fallback = null,
}: WithPermissionProps) {
  return usePermission(permission) ? children : fallback
}
