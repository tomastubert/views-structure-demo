// User rules. The server decides what each user can do; the client only reads these fields.
export type Role = 'viewer' | 'editor' | 'manager'

export type Permission =
  | 'collection:read'
  | 'collection:create'
  | 'collection:delete'
  | 'book:read'
  | 'book:edit'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  permissions: Permission[]
  /** Flat map of flag name -> enabled. Example: { exportCsv: true } */
  featureFlags: Record<string, boolean>
}

export interface Workspace {
  id: string
  name: string
}

export interface Session {
  user: User
  workspace: Workspace
}
