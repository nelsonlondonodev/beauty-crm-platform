import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';

// ── Lazy Loaded Pages ───────────────────────────────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const ClientProfile = lazy(() => import('./pages/ClientProfile'));
const Staff = lazy(() => import('./pages/Staff'));
const Billing = lazy(() => import('./pages/Billing'));
const Bonuses = lazy(() => import('./pages/Bonuses'));
const Login = lazy(() => import('./pages/Login'));
const Invoices = lazy(() => import('./pages/Invoices'));
const StaffSales = lazy(() => import('./pages/StaffSales'));

// ── Shared Loading Component ────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <TenantProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
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
                          path="/staff/:id/sales"
                          element={
                            <ProtectedRoute allowedRoles={['owner', 'admin']}>
                              <StaffSales />
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
                        <Route
                          path="/invoices"
                          element={
                            <ProtectedRoute allowedRoles={['owner', 'admin']}>
                              <Invoices />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </Suspense>
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
