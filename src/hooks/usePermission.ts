import type { Permission } from 'app/types/user'
import useStore from 'app/zustand/useStore'

// True when the current user has the permission. Permissions are strings decided by the server.
export const usePermission = (permission: Permission) =>
  useStore((state) => state.user?.permissions.includes(permission) ?? false)
