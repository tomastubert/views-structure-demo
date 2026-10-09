// What each role can do. This is the "user rules" definition of the demo.
import type { Permission, Role, User } from 'app/types/user'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  viewer: ['collection:read', 'book:read'],
  editor: ['collection:read', 'book:read', 'book:edit'],
  manager: ['collection:read', 'book:read', 'book:edit', 'collection:create', 'collection:delete'],
}

export const buildUser = (overrides: Partial<User> = {}): User => {
  const role = overrides.role ?? 'viewer'
  return {
    id: 'user-viewer',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    role,
    permissions: ROLE_PERMISSIONS[role],
    featureFlags: { exportCsv: role === 'manager' },
    ...overrides,
  }
}
