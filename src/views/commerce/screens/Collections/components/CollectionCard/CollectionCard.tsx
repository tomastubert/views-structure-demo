// Only used by the Collections screen -> lives inside it.
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import type { Collection } from '../../../../types/collection'

interface CollectionCardProps {
  collection: Collection
  canDelete: boolean
  onOpen: (collection: Collection) => void
  onDelete: (collection: Collection) => void
}

export default function CollectionCard({
  collection,
  canDelete,
  onOpen,
  onDelete,
}: CollectionCardProps) {
  const { name, description, status, bookCount } = collection

  return (
    <Card variant="outlined" data-testid={`collection-card-${collection.id}`}>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Typography color="text.secondary" sx={{ minHeight: 48 }}>
          {description}
        </Typography>
        <Chip
          size="small"
          sx={{ mt: 1 }}
          color={status === 'syncing' ? 'warning' : 'success'}
          label={status === 'syncing' ? 'Syncing…' : `${bookCount} books`}
        />
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button onClick={() => onOpen(collection)}>Open</Button>
        {canDelete && (
          <IconButton aria-label={`Delete ${name}`} onClick={() => onDelete(collection)}>
            <DeleteOutline />
          </IconButton>
        )}
      </CardActions>
    </Card>
  )
}
