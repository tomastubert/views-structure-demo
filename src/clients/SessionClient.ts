// Used by the app shell (not by a single view), so it lives in the global clients/ folder.
import type { Session } from 'app/types/user'
import { Client } from './Client'

export abstract class SessionClient extends Client {
  static async getSession(): Promise<Session> {
    const { data } = await Client.get<Session>('/api/v1/session')
    return data
  }
}
