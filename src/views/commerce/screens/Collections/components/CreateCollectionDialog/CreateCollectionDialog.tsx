// Only used by the Collections screen. It calls the store action; it never calls the API.
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { type FormEvent, useState } from 'react'
import { useCommerceStore } from '../../../../store/useCommerceStore'

interface CreateCollectionDialogProps {
  open: boolean
  onClose: () => void
}

export default function CreateCollectionDialog({ open, onClose }: CreateCollectionDialogProps) {
  const createCollection = useCommerceStore((state) => state.createCollection)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    const created = await createCollection({ name, description })
    setSaving(false)
    if (created) {
      setName('')
      setDescription('')
      onClose()
    }
  }

  return (
    // A real <form> so Enter submits and the browser validates `required`.
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      component="form"
      onSubmit={submit}
    >
      <DialogTitle>New collection</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          multiline
          minRows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving || !name.trim()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
