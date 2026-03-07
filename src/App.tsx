import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ClientProfile from './pages/ClientProfile';
import Staff from './pages/Staff';
import Billing from './pages/Billing';
import Bonuses from './pages/Bonuses';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TenantProvider>
          <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute allowedRoles={['owner', 'admin']}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clients"
                      element={
                        <ProtectedRoute
                          allowedRoles={['owner', 'admin', 'staff']}
                        >
                          <Clients />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clients/:id"
                      element={
                        <ProtectedRoute
                          allowedRoles={['owner', 'admin', 'staff']}
                        >
                          <ClientProfile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bonuses"
                      element={
                        <ProtectedRoute
                          allowedRoles={['owner', 'admin', 'staff']}
                        >
                          <Bonuses />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/calendar"
                      element={
                        <ProtectedRoute
                          allowedRoles={['owner', 'admin', 'staff']}
                        >
                          <Calendar />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute allowedRoles={['owner', 'admin']}>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute
                          allowedRoles={['owner', 'admin', 'staff']}
                        >
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/staff"
                      element={
                        <ProtectedRoute allowedRoles={['owner', 'admin']}>
                          <Staff />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/billing"
                      element={
                        <ProtectedRoute
                          allowedRoles={['owner', 'admin', 'staff']}
                        >
                          <Billing />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        </TenantProvider>
      </AuthProvider>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
