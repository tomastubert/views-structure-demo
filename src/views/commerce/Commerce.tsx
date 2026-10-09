// The view. It declares its own inner routes (AppRouter only knows the "/commerce/*" entry).
//   /commerce/collections                -> screens/Collections
//   /commerce/collections/:collectionId  -> screens/Books   (sibling of Collections, not its child)

import PageLayout from 'app/components/PageLayout/PageLayout'
import { Navigate, Outlet, Route, Routes } from 'react-router'
import CommerceHeader from './components/CommerceHeader/CommerceHeader'
import Books from './screens/Books/Books'
import Collections from './screens/Collections/Collections'

function CommerceLayout() {
  return (
    <PageLayout>
      <CommerceHeader />
      <Outlet />
    </PageLayout>
  )
}

export default function Commerce() {
  return (
    <Routes>
      <Route element={<CommerceLayout />}>
        <Route path="collections" element={<Collections />} />
        <Route path="collections/:collectionId" element={<Books />} />
        <Route path="*" element={<Navigate replace to="/commerce/collections" />} />
      </Route>
    </Routes>
  )
}
