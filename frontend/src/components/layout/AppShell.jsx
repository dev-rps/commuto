import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import {
  LayoutDashboard, Search, Navigation, Calendar, Wallet, Settings,
} from 'lucide-react';

const pageTitles = {
  '/dashboard':      'Dashboard',
  '/rides/find':     'Find a Ride',
  '/rides/offer':    'Offer a Ride',
  '/rides/confirm':  'Route Confirmation',
  '/rides/available':'Available Rides',
  '/trips':          'My Trips',
  '/vehicles':       'My Vehicle',
  '/wallet':         'Payment & Wallet',
  '/rides/history':  'Ride History',
  '/reports':        'Reports & Analytics',
  '/settings':       'Settings',
  '/places':         'Saved Places',
};

const mobileNav = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home' },
  { to: '/rides/find',  icon: Search,          label: 'Find' },
  { to: '/rides/offer', icon: Navigation,      label: 'Offer' },
  { to: '/trips',       icon: Calendar,        label: 'Trips' },
  { to: '/wallet',      icon: Wallet,          label: 'Wallet' },
];

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const title = pageTitles[location.pathname]
    || (location.pathname.startsWith('/tracking') ? 'Live Tracking'
    : location.pathname.startsWith('/chat') ? 'Chat' : 'Commuto');

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      {/* Desktop sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5 animate-fade-up">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-neutral-200 z-30 safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-2">
            {mobileNav.map((item) => {
              const isActive = location.pathname === item.to
                || (item.to !== '/dashboard' && location.pathname.startsWith(item.to.replace('/find','').replace('/offer','')));
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 ${
                    isActive
                      ? 'text-primary'
                      : 'text-neutral-400'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-50' : ''}`}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                  </div>
                  <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
