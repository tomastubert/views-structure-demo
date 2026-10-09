import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

// Shared by empty lists and error screens (with an optional action, e.g. "Retry").
export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center', py: 8, textAlign: 'center' }}>
      <Typography component="h2" variant="h6">
        {title}
      </Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  )
}
