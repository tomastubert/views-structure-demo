import type { User } from 'app/types/user'
import { buildUser } from './__fixtures__/buildUser'

// Ids match DEMO_USERS in utils/devSettings.ts (the DevToolbar options).
export const demoUsers: Record<string, User> = {
  'user-viewer': buildUser({
    id: 'user-viewer',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    role: 'viewer',
  }),
  'user-editor': buildUser({
    id: 'user-editor',
    name: 'Sam Okafor',
    email: 'sam@example.com',
    role: 'editor',
  }),
  'user-manager': buildUser({
    id: 'user-manager',
    name: 'Robin Hale',
    email: 'robin@example.com',
    role: 'manager',
  }),
}
