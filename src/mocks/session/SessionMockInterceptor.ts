import type { Server } from 'miragejs'
import { getRequestUser, withDevBehaviour } from '../helpers'

// GET /api/v1/session -> who is calling. Never fails on purpose: the app cannot start without it.
export const registerSessionMocks = (server: Server) => {
  server.get(
    '/session',
    withDevBehaviour(
      (request) => ({
        user: getRequestUser(request),
        workspace: { id: 'ws_1', name: 'Maple Books' },
      }),
      { canFail: false },
    ),
  )
}
