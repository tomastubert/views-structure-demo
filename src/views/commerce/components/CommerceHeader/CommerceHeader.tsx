// Used by the layout, so it appears in BOTH screens -> it lives at the view root, not in a screen.
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'
import { useCommerceStore } from '../../store/useCommerceStore'

export default function CommerceHeader() {
  const selectedName = useCommerceStore((state) =>
    state.selectedCollectionId ? state.collections[state.selectedCollectionId]?.name : undefined,
  )

  return (
    <Breadcrumbs aria-label="Commerce breadcrumb" sx={{ mb: 2 }}>
      <Link component={RouterLink} underline="hover" color="inherit" to="/commerce/collections">
        Collections
      </Link>
      {selectedName && (
        <Typography color="text.primary" aria-current="page">
          {selectedName}
        </Typography>
      )}
    </Breadcrumbs>
  )
}
