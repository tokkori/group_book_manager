import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/LoginPage'
import UserRegisterPage from '@/pages/UserRegisterPage'
import BookListPage from '@/pages/BookListPage'
import BookDetailPage from '@/pages/BookDetailPage'
import BookFormPage from '@/pages/BookFormPage'
import LoanListPage from '@/pages/LoanListPage'
import CategoryPage from '@/pages/CategoryPage'
import ImportPage from '@/pages/ImportPage'
import LocationPage from '@/pages/LocationPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth()
  if (isLoading) return <div className="flex items-center justify-center h-64">読み込み中...</div>
  if (!currentUser) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth()
  if (isLoading) return null
  if (currentUser) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><UserRegisterPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><BookListPage /></PrivateRoute>} />
      <Route path="/books/new" element={<PrivateRoute><BookFormPage mode="create" /></PrivateRoute>} />
      <Route path="/books/:id" element={<PrivateRoute><BookDetailPage /></PrivateRoute>} />
      <Route path="/books/:id/edit" element={<PrivateRoute><BookFormPage mode="edit" /></PrivateRoute>} />
      <Route path="/loans" element={<PrivateRoute><LoanListPage /></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
      <Route path="/locations" element={<PrivateRoute><LocationPage /></PrivateRoute>} />
      <Route path="/import" element={<PrivateRoute><ImportPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
