import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { UnreadProvider } from './context/UnreadContext';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components';

const Splash          = lazy(() => import('./pages/Splash/Splash'));
const Login           = lazy(() => import('./pages/Login/Login'));
const Dashboard       = lazy(() => import('./pages/Dashboard/Dashboard'));
const FindRide        = lazy(() => import('./pages/FindRide/FindRide'));
const RouteConfirmation = lazy(() => import('./pages/RouteConfirmation/RouteConfirmation'));
const AvailableRides  = lazy(() => import('./pages/AvailableRides/AvailableRides'));
const OfferRide       = lazy(() => import('./pages/OfferRide/OfferRide'));
const MyVehicle       = lazy(() => import('./pages/MyVehicle/MyVehicle'));
const MyTrips         = lazy(() => import('./pages/MyTrips/MyTrips'));
const LiveTracking    = lazy(() => import('./pages/LiveTracking/LiveTracking'));
const Chat            = lazy(() => import('./pages/Chat/Chat'));
const PaymentWallet   = lazy(() => import('./pages/PaymentWallet/PaymentWallet'));
const RideHistory     = lazy(() => import('./pages/RideHistory/RideHistory'));
const Reports         = lazy(() => import('./pages/Reports/Reports'));
const Settings        = lazy(() => import('./pages/Settings/Settings'));
const SavedPlaces     = lazy(() => import('./pages/SavedPlaces/SavedPlaces'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/SuperAdminDashboard'));
const CompanyAdminDashboard = lazy(() => import('./pages/CompanyAdmin/CompanyAdminDashboard'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-neutral-50">
      <Spinner />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;

  const homeDestination = user?.role === 'SUPER_ADMIN' 
    ? '/superadmin' 
    : user?.role === 'COMPANY_ADMIN' 
    ? '/admin-dashboard' 
    : '/dashboard';

  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<PageLoader />}><Splash /></Suspense>} />
      <Route path="/login" element={user ? <Navigate to={homeDestination} replace /> : <Suspense fallback={<PageLoader />}><Login /></Suspense>} />
      <Route
        element={
          <ProtectedRoute>
            <SocketProvider>
              <UnreadProvider>
                <AppShell />
              </UnreadProvider>
            </SocketProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/superadmin"      element={<Suspense fallback={<PageLoader />}><SuperAdminDashboard /></Suspense>} />
        <Route path="/admin-dashboard" element={<Suspense fallback={<PageLoader />}><CompanyAdminDashboard /></Suspense>} />
        <Route path="/dashboard"      element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/rides/find"     element={<Suspense fallback={<PageLoader />}><FindRide /></Suspense>} />
        <Route path="/rides/confirm"  element={<Suspense fallback={<PageLoader />}><RouteConfirmation /></Suspense>} />
        <Route path="/rides/available" element={<Suspense fallback={<PageLoader />}><AvailableRides /></Suspense>} />
        <Route path="/rides/offer"    element={<Suspense fallback={<PageLoader />}><OfferRide /></Suspense>} />
        <Route path="/vehicles"       element={<Suspense fallback={<PageLoader />}><MyVehicle /></Suspense>} />
        <Route path="/trips"          element={<Suspense fallback={<PageLoader />}><MyTrips /></Suspense>} />
        <Route path="/tracking/:rideId" element={<Suspense fallback={<PageLoader />}><LiveTracking /></Suspense>} />
        <Route path="/chat/:rideId"   element={<Suspense fallback={<PageLoader />}><Chat /></Suspense>} />
        <Route path="/wallet"         element={<Suspense fallback={<PageLoader />}><PaymentWallet /></Suspense>} />
        <Route path="/rides/history"  element={<Suspense fallback={<PageLoader />}><RideHistory /></Suspense>} />
        <Route path="/reports"        element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
        <Route path="/settings"       element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
        <Route path="/places"         element={<Suspense fallback={<PageLoader />}><SavedPlaces /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
