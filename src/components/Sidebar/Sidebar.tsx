import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { NavLink } from 'react-router'

// One entry per view. Adding a view = adding an item here and a route in AppRouter.
const ITEMS = [
  { to: '/home', label: 'Home' },
  { to: '/commerce', label: 'Commerce' },
]

export default function Sidebar() {
  return (
    <Box component="nav" sx={{ width: 220, borderRight: 1, borderColor: 'divider', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Maple Books
      </Typography>
      <List>
        {ITEMS.map(({ to, label }) => (
          <ListItemButton key={to} component={NavLink} to={to}>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}
