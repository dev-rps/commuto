import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const pageTitles = {
  '/dashboard': 'Dashboard', '/rides/find': 'Find a Ride', '/rides/offer': 'Offer a Ride',
  '/rides/confirm': 'Route Confirmation', '/rides/available': 'Available Rides',
  '/trips': 'My Trips', '/vehicles': 'My Vehicle', '/wallet': 'Payment & Wallet',
  '/rides/history': 'Ride History', '/reports': 'Reports & Analytics',
  '/settings': 'Settings', '/places': 'Saved Places',
};

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || (location.pathname.startsWith('/tracking') ? 'Live Tracking' : location.pathname.startsWith('/chat') ? 'Chat' : 'RideSync');

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
