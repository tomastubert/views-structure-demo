// App shell: loads the session first, then renders the router.
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import AppRouter from 'app/AppRouter'
import EmptyState from 'app/components/EmptyState/EmptyState'
import FlashContainer from 'app/components/FlashContainer/FlashContainer'
import { useAppSetup } from 'app/zustand/useAppSetup'

export default function App() {
  const { status, retry } = useAppSetup()

  if (status === 'error') {
    return (
      <EmptyState
        title="We could not load your session"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => retry()}
      />
    )
  }

  if (status !== 'success') {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <AppRouter />
      <FlashContainer />
    </>
  )
}
