// Generic page wrapper used by every view.
import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

export default function PageLayout({ children }: { children: ReactNode }) {
  return <Box sx={{ maxWidth: 1100, width: '100%', mx: 'auto', px: 3, py: 3 }}>{children}</Box>
}
