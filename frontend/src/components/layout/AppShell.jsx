import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
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
  const { user, setUser } = useAuth();
  const { socket, events } = useSocket();
  const toast = useToast();

  useEffect(() => {
    if (!socket || !user) return;

    const userEvent = events.notificationNew(user.id);

    const handleNotification = (data) => {
      console.log('[AppShell] Global socket notification:', data);

      // Show toast if title/body exists
      if (data.title && data.body) {
        toast.success(`${data.title}: ${data.body}`);
      }

      // Live update wallet balance in AuthContext
      if (data.walletBalance !== undefined) {
        setUser((prev) => {
          if (!prev) return prev;
          return { ...prev, walletBalance: Number(data.walletBalance) };
        });
      }

      // Dispatch window event so other pages refresh live
      window.dispatchEvent(new CustomEvent('commuto:update', { detail: data }));
    };

    socket.on(userEvent, handleNotification);

    return () => {
      socket.off(userEvent, handleNotification);
    };
  }, [socket, user, events, setUser, toast]);

  const title = pageTitles[location.pathname]
    || (location.pathname.startsWith('/tracking') ? 'Live Tracking'
    : location.pathname.startsWith('/chat') ? 'Chat' : 'Commuto');

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 dark:bg-slate-950 transition-colors">
      {/* Desktop sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 overflow-y-auto pb-28 lg:pb-6">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 animate-fade-up">
            <Outlet />
          </div>
        </main>

        {/* Mobile floating bottom navigation */}
        <nav 
          className="lg:hidden fixed bottom-3 inset-x-3.5 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/80 dark:border-slate-800 rounded-2xl p-1.5 transition-all"
          style={{ boxShadow: 'var(--shadow-float)' }}
        >
          <div className="flex items-center justify-around relative">
            {mobileNav.map((item) => {
              const isActive = location.pathname === item.to
                || (item.to !== '/dashboard' && location.pathname.startsWith(item.to.replace('/find','').replace('/offer','')));
              
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 min-w-[60px] ${
                    isActive
                      ? 'text-primary dark:text-blue-400 font-bold'
                      : 'text-neutral-500 dark:text-slate-400 hover:text-neutral-800 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  {/* Active highlight background pill */}
                  {isActive && (
                    <span 
                      className="absolute inset-0 bg-primary-50/90 dark:bg-blue-950/80 rounded-xl border border-primary-200/50 dark:border-blue-800/50 shadow-xs -z-0 animate-scale-in" 
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-primary dark:text-blue-400' : 'text-neutral-400 dark:text-slate-500'}`} />
                    <span className="text-[10px] tracking-tight leading-none mt-0.5">{item.label}</span>
                  </div>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary dark:bg-blue-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
