// Composes the mock server: one registration function per view (plus the session).
// Real network is never touched for /api/v1 routes; everything else (Vite assets, HMR) passes through.
//
// This file imports from views/ on purpose. Like AppRouter, it is a COMPOSITION ROOT: its job is to
// wire the views together. The rule "do not import from views/" applies to shared code
// (components/, hooks/, utils/, clients/, zustand/), which must stay reusable by any view.

import { registerCommerceMocks } from 'app/views/commerce/interceptor/CommerceMockInterceptor'
import { type Server, createServer } from 'miragejs'
import { registerSessionMocks } from './session/SessionMockInterceptor'

let server: Server | undefined

export const startMockServer = () => {
  if (server) return server

  server = createServer({
    environment: 'development',
    routes() {
      this.timing = 0 // latency is simulated per request in withDevBehaviour
      this.namespace = 'api/v1'
      registerSessionMocks(this)
      registerCommerceMocks(this)

      this.namespace = ''
      this.passthrough()
    },
  })
  return server
}

// Hot reload re-runs main.tsx: shut the old server down so routes are not registered twice.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    server?.shutdown()
    server = undefined
  })
}
