// Route tree. One route per view, each loaded lazily with the route's `lazy` property,
// so a view's code is only downloaded when the user visits it. Each view owns its inner routes.
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Layout from 'app/components/Layout/Layout'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router'

const Loading = () => (
  <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <CircularProgress aria-label="Loading" />
  </Stack>
)

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    HydrateFallback: Loading,
    children: [
      { index: true, element: <Navigate replace to="/home" /> },
      {
        path: 'home',
        lazy: () => import('app/views/home/Home').then((module) => ({ Component: module.default })),
      },
      {
        path: 'commerce/*',
        lazy: () =>
          import('app/views/commerce/Commerce').then((module) => ({ Component: module.default })),
      },
      { path: '*', element: <Navigate replace to="/home" /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
