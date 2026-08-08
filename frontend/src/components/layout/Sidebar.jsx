import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Car, Calendar, MapPin, Wallet, ChartBar as BarChart3, Settings, Factory as History, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const employeeNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rides/find', icon: Search, label: 'Find a Ride' },
  { to: '/rides/offer', icon: Navigation, label: 'Offer a Ride' },
  { to: '/trips', icon: Calendar, label: 'My Trips' },
  { to: '/vehicles', icon: Car, label: 'My Vehicle' },
  { to: '/wallet', icon: Wallet, label: 'Payment & Wallet' },
  { to: '/rides/history', icon: History, label: 'Ride History' },
  { to: '/places', icon: MapPin, label: 'Saved Places' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rides/find', icon: Search, label: 'Find a Ride' },
  { to: '/rides/offer', icon: Navigation, label: 'Offer a Ride' },
  { to: '/trips', icon: Calendar, label: 'My Trips' },
  { to: '/vehicles', icon: Car, label: 'My Vehicle' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/wallet', icon: Wallet, label: 'Payment & Wallet' },
  { to: '/rides/history', icon: History, label: 'Ride History' },
  { to: '/places', icon: MapPin, label: 'Saved Places' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const nav = user?.role === 'COMPANY_ADMIN' ? adminNav : employeeNav;

  return (
    <>
      {open && <div className="fixed inset-0 bg-neutral-900/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-neutral-200 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Navigation className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 leading-none">RideSync</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Enterprise Carpooling</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium mb-0.5 transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}>
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-neutral-200">
          <div className="flex items-center gap-3 px-3">
            <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
              {user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.role === 'COMPANY_ADMIN' ? 'Admin' : 'Employee'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
