// Renders the toasts held by the global flash slice.
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import useStore from 'app/zustand/useStore'
import { useShallow } from 'zustand/shallow'

export default function FlashContainer() {
  const { flashes, removeFlash } = useStore(
    useShallow((state) => ({ flashes: state.flashes, removeFlash: state.removeFlash })),
  )

  return (
    <Stack
      spacing={1}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'snackbar',
      }}
    >
      {Object.values(flashes).map(({ key, title, message, type }) => (
        <Snackbar
          key={key}
          open
          autoHideDuration={4000}
          // Without this, MUI fires onClose with reason "clickaway" on ANY click in the page,
          // so a toast would disappear as soon as the user clicks anywhere.
          onClose={(_event, reason) => reason !== 'clickaway' && removeFlash(key)}
          sx={{ position: 'static', transform: 'none' }}
        >
          <Alert
            severity={type === 'negative' ? 'error' : type === 'positive' ? 'success' : 'info'}
            onClose={() => removeFlash(key)}
          >
            {title && <AlertTitle>{title}</AlertTitle>}
            {message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  )
}
