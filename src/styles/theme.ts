import { createTheme } from '@mui/material/styles'

// Small, self-contained theme. Components should reference theme values instead of hardcoding styles.
export const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: '#2f6f5e' },
    secondary: { main: '#c2703d' },
    background: { default: '#f7f6f2' },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
})
