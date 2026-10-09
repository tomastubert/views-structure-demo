// ENTRY POINT. Order matters:
// 1. bind the demo user (sent as a header on every request)
// 2. start the mock server, so the first request is already intercepted
// 3. render the app
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import App from 'app/App'
import { Client } from 'app/clients/Client'
import { startMockServer } from 'app/mocks/startMockServer'
import { theme } from 'app/styles/theme'
import { getDevSettings } from 'app/utils/devSettings'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

Client.bindToUser(getDevSettings().userId)
startMockServer()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
