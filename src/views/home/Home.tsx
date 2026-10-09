// A second, tiny view. It only shows that views are independent: it imports nothing from commerce.
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import PageLayout from 'app/components/PageLayout/PageLayout'
import useStore from 'app/zustand/useStore'
import { Link } from 'react-router'

export default function Home() {
  const name = useStore((state) => state.user?.name)

  return (
    <PageLayout>
      <Typography component="h1" variant="h4" gutterBottom>
        Welcome{name ? `, ${name}` : ''}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This is a demo of the views/screens folder structure. All data is mocked and fictional.
      </Typography>
      <Button variant="contained" component={Link} to="/commerce">
        Open Commerce
      </Button>
    </PageLayout>
  )
}
