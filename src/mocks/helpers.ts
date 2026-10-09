// Helpers shared by every view's interceptor.

import type { Permission, User } from 'app/types/user'
import { getDevSettings } from 'app/utils/devSettings'
import { Response } from 'miragejs'
import type { Request } from 'miragejs'
import { demoUsers } from './session/users'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const jsonResponse = (status: number, body?: object) =>
  new Response(status, body ? { 'Content-Type': 'application/json' } : {}, body)

export const errorResponse = (status: number, message: string) => jsonResponse(status, { message })

// Header names can arrive in any case depending on the fetch implementation.
export const getRequestUser = (request: Request): User => {
  const header = Object.entries(request.requestHeaders).find(
    ([name]) => name.toLowerCase() === 'x-demo-user',
  )
  return demoUsers[header?.[1] ?? ''] ?? demoUsers['user-viewer']
}

// Returns the 403 to send back, or null when the user is allowed. Named after what it returns:
//   const forbidden = forbiddenResponse(request, 'book:edit')
//   if (forbidden) return forbidden
export const forbiddenResponse = (request: Request, permission: Permission) =>
  getRequestUser(request).permissions.includes(permission)
    ? null
    : errorResponse(403, `Your role cannot do this (${permission} is required).`)

export const parseBody = <T>(request: Request): T => JSON.parse(request.requestBody || '{}')

// Wraps a route handler with the DevToolbar behaviour: latency and simulated server errors.
export const withDevBehaviour =
  (handler: (request: Request) => unknown, { canFail = true } = {}) =>
  async (_schema: unknown, request: Request) => {
    const { slowNetwork, simulateErrors } = getDevSettings()
    await sleep(slowNetwork ? 1800 : 120 + Math.random() * 180)
    if (canFail && simulateErrors) {
      return errorResponse(500, 'Simulated server error. Turn off "Simulate errors" to continue.')
    }
    return handler(request)
  }
