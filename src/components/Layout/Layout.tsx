// Shell for every view: sidebar + toolbar + the active view (<Outlet />).
import Box from '@mui/material/Box'
import DevToolbar from 'app/components/DevToolbar/DevToolbar'
import ErrorBoundary from 'app/components/ErrorBoundary/ErrorBoundary'
import Sidebar from 'app/components/Sidebar/Sidebar'
import { Outlet } from 'react-router'

export default function Layout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <DevToolbar />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>
    </Box>
  )
}
