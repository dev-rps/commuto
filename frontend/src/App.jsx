import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { UnreadProvider } from './context/UnreadContext';
import { AppShell } from './components/layout/AppShell';
import { InteractiveColdStartLoader } from './components/InteractiveColdStartLoader';

const Splash          = lazy(() => import('./pages/Splash/Splash'));
const Login           = lazy(() => import('./pages/Login/Login'));
const ProfileCreation = lazy(() => import('./pages/Auth/ProfileCreation'));
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
const HelpSupport     = lazy(() => import('./pages/HelpSupport/HelpSupport'));
const SavedPlaces     = lazy(() => import('./pages/SavedPlaces/SavedPlaces'));
const Leaderboard       = lazy(() => import('./pages/Leaderboard/Leaderboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/SuperAdminDashboard'));
const CompanyAdminDashboard = lazy(() => import('./pages/CompanyAdmin/CompanyAdminDashboard'));

function PageLoader() {
  return <InteractiveColdStartLoader />;
}

function PageContentFallback() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 py-2 animate-fade-in">
      <div className="space-y-1.5 mb-6">
        <div className="h-7 w-48 bg-neutral-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-4 w-64 bg-neutral-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
      </div>
      <div className="card p-6 space-y-4 border border-neutral-200/80 dark:border-slate-800">
        <div className="h-28 bg-neutral-100 dark:bg-slate-800/80 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 bg-neutral-100 dark:bg-slate-800/80 rounded-xl animate-pulse" />
          <div className="h-12 bg-neutral-100 dark:bg-slate-800/80 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.phone && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }
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
      <Route path="/complete-profile" element={user && !user.phone ? <Suspense fallback={<PageLoader />}><ProfileCreation /></Suspense> : <Navigate to={homeDestination} replace />} />
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
        <Route path="/superadmin"      element={<Suspense fallback={<PageContentFallback />}><SuperAdminDashboard /></Suspense>} />
        <Route path="/admin-dashboard" element={<Suspense fallback={<PageContentFallback />}><CompanyAdminDashboard /></Suspense>} />
        <Route path="/dashboard"      element={<Suspense fallback={<PageContentFallback />}><Dashboard /></Suspense>} />
        <Route path="/rides/find"     element={<Suspense fallback={<PageContentFallback />}><FindRide /></Suspense>} />
        <Route path="/rides/confirm"  element={<Suspense fallback={<PageContentFallback />}><RouteConfirmation /></Suspense>} />
        <Route path="/rides/available" element={<Suspense fallback={<PageContentFallback />}><AvailableRides /></Suspense>} />
        <Route path="/rides/offer"    element={<Suspense fallback={<PageContentFallback />}><OfferRide /></Suspense>} />
        <Route path="/vehicles"       element={<Suspense fallback={<PageContentFallback />}><MyVehicle /></Suspense>} />
        <Route path="/trips"          element={<Suspense fallback={<PageContentFallback />}><MyTrips /></Suspense>} />
        <Route path="/tracking/:rideId" element={<Suspense fallback={<PageContentFallback />}><LiveTracking /></Suspense>} />
        <Route path="/chat/:rideId"   element={<Suspense fallback={<PageContentFallback />}><Chat /></Suspense>} />
        <Route path="/wallet"         element={<Suspense fallback={<PageContentFallback />}><PaymentWallet /></Suspense>} />
        <Route path="/rides/history"  element={<Suspense fallback={<PageContentFallback />}><RideHistory /></Suspense>} />
        <Route path="/reports"        element={<Suspense fallback={<PageContentFallback />}><Reports /></Suspense>} />
        <Route path="/leaderboard"    element={<Suspense fallback={<PageContentFallback />}><Leaderboard /></Suspense>} />
        <Route path="/settings"       element={<Suspense fallback={<PageContentFallback />}><Settings /></Suspense>} />
        <Route path="/help"           element={<Suspense fallback={<PageContentFallback />}><HelpSupport /></Suspense>} />
        <Route path="/places"         element={<Suspense fallback={<PageContentFallback />}><SavedPlaces /></Suspense>} />
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
