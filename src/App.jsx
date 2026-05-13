import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import GameHome from './pages/GameHome'
import GamePlay from './pages/GamePlay'
import GameResults from './pages/GameResults'
import ParentDashboard from './pages/ParentDashboard'

const Spinner = () => (
  <div className="flex items-center justify-center h-screen bg-[#0d0d0d] text-[#FF5F1F] font-['Barlow_Condensed'] text-2xl tracking-widest">
    LOADING…
  </div>
)

function RoleGuard({ role: requiredRole, children }) {
  const { user, role, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user || !role) return <Navigate to="/login" replace />
  if (role !== requiredRole) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { user, role, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user || !role) return <Navigate to="/login" replace />
  if (role === 'parent') return <Navigate to="/dashboard" replace />
  return <Navigate to="/game" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/game" element={<RoleGuard role="kid"><GameHome /></RoleGuard>} />
          <Route path="/game/play" element={<RoleGuard role="kid"><GamePlay /></RoleGuard>} />
          <Route path="/game/results" element={<RoleGuard role="kid"><GameResults /></RoleGuard>} />
          <Route path="/dashboard" element={<RoleGuard role="parent"><ParentDashboard /></RoleGuard>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
