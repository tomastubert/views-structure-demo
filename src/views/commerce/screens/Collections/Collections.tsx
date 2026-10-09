// Screen: /commerce/collections
// Reads from the view store and calls store actions. It never talks to the API directly.
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import EmptyState from 'app/components/EmptyState/EmptyState'
import WithPermission from 'app/components/WithPermission/WithPermission'
import { usePermission } from 'app/hooks/usePermission'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useShallow } from 'zustand/shallow'
import { useCommerceStore } from '../../store/useCommerceStore'
import type { Collection } from '../../types/collection'
import CollectionCard from './components/CollectionCard/CollectionCard'
import CreateCollectionDialog from './components/CreateCollectionDialog/CreateCollectionDialog'
import { useCollectionsPolling } from './hooks/useCollectionsPolling'

export default function Collections() {
  const navigate = useNavigate()
  const { collections, loading, error, fetchCollections, deleteCollection } = useCommerceStore(
    useShallow((state) => ({
      collections: state.collections,
      loading: state.loadingCollections,
      error: state.collectionsError,
      fetchCollections: state.fetchCollections,
      deleteCollection: state.deleteCollection,
    })),
  )
  const canDelete = usePermission('collection:delete')
  const [createOpen, setCreateOpen] = useState(false)
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null)
  const list = useMemo(() => Object.values(collections), [collections])

  useCollectionsPolling()

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const confirmDelete = async () => {
    if (collectionToDelete) await deleteCollection(collectionToDelete.id)
    setCollectionToDelete(null)
  }

  const renderBody = () => {
    if (loading && list.length === 0) {
      return (
        <Stack sx={{ alignItems: 'center', py: 8 }}>
          <CircularProgress aria-label="Loading collections" />
        </Stack>
      )
    }
    if (error && list.length === 0) {
      return (
        <EmptyState
          title="We could not load the collections"
          description={error}
          actionLabel="Retry"
          onAction={() => fetchCollections()}
        />
      )
    }
    if (list.length === 0) {
      return (
        <EmptyState
          title="No collections yet"
          description="Collections group the books you sell."
        />
      )
    }
    return (
      <Grid container spacing={2}>
        {list.map((collection) => (
          <Grid key={collection.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <CollectionCard
              collection={collection}
              canDelete={canDelete}
              onOpen={({ id }) => navigate(id)}
              onDelete={setCollectionToDelete}
            />
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography component="h1" variant="h4">
          Collections
        </Typography>
        <WithPermission permission="collection:create">
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            New collection
          </Button>
        </WithPermission>
      </Stack>

      {renderBody()}

      <CreateCollectionDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <Dialog open={collectionToDelete !== null} onClose={() => setCollectionToDelete(null)}>
        <DialogTitle>Delete collection?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{collectionToDelete?.name}" and its books will be removed. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollectionToDelete(null)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
