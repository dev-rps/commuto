import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, Car, Calendar, MapPin, Wallet, MessageSquare,
  BarChart3, Settings, History, Navigation, LogOut, ChevronRight, Building2, Code,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUnread } from '../../context/UnreadContext';
import { formatINR } from '../../lib/utils';

const superAdminNav = [
  { to: '/superadmin',     icon: Code,            label: 'Developer & Users Control' },
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Commuter View' },
  { to: '/rides/find',     icon: Search,          label: 'Find a Ride' },
  { to: '/rides/offer',    icon: Navigation,      label: 'Offer a Ride' },
  { to: '/chat/ride-004',  icon: MessageSquare,   label: 'Chat', isChat: true },
  { to: '/reports',        icon: BarChart3,       label: 'System Analytics' },
  { to: '/settings',       icon: Settings,        label: 'System Settings' },
];

const adminNav = [
  { to: '/admin-dashboard',icon: Building2,       label: 'Company Admin Panel' },
  { to: '/reports',        icon: BarChart3,       label: 'Fleet & Fuel Analytics' },
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Commuter View' },
  { to: '/rides/find',     icon: Search,          label: 'Find a Ride' },
  { to: '/rides/offer',    icon: Navigation,      label: 'Offer a Ride' },
  { to: '/trips',          icon: Calendar,        label: 'My Trips' },
  { to: '/chat/ride-004',  icon: MessageSquare,   label: 'Chat', isChat: true },
  { to: '/vehicles',       icon: Car,             label: 'My Vehicle' },
  { to: '/wallet',         icon: Wallet,          label: 'Wallet' },
  { to: '/places',         icon: MapPin,          label: 'Saved Places' },
  { to: '/settings',       icon: Settings,        label: 'Settings' },
];

const employeeNav = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Commuter Dashboard' },
  { to: '/rides/find',     icon: Search,          label: 'Find a Ride' },
  { to: '/rides/offer',    icon: Navigation,      label: 'Offer a Ride' },
  { to: '/trips',          icon: Calendar,        label: 'My Trips' },
  { to: '/chat/ride-004',  icon: MessageSquare,   label: 'Chat', isChat: true },
  { to: '/vehicles',       icon: Car,             label: 'My Vehicle' },
  { to: '/wallet',         icon: Wallet,          label: 'Wallet' },
  { to: '/rides/history',  icon: History,         label: 'Ride History' },
  { to: '/places',         icon: MapPin,          label: 'Saved Places' },
  { to: '/settings',       icon: Settings,        label: 'Settings' },
];

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { unreadCount, resetUnread } = useUnread();
  const navigate = useNavigate();
  const nav = user?.role === 'SUPER_ADMIN' ? superAdminNav : user?.role === 'COMPANY_ADMIN' ? adminNav : employeeNav;
  const initials = user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
          bg-white border-r border-neutral-200/80
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: open ? 'var(--shadow-xl)' : 'none' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-neutral-200/80 shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--gradient-primary)', boxShadow: '0 2px 8px rgb(37 99 235 / 0.35)' }}
          >
            <Navigation className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 leading-none tracking-tight">Commuto</h1>
            <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">Enterprise Carpooling</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (item.isChat) resetUnread();
                  onClose?.();
                }}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-primary bg-primary-50'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-600'}`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.isChat && unreadCount > 0 && (
                      <span className="flex items-center justify-center bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                    {isActive && !item.isChat && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User profile + logout */}
        <div className="px-3 py-3 border-t border-neutral-200/80 space-y-1 shrink-0">
          {/* Wallet balance chip */}
          {user?.walletBalance != null && (
            <div
              className="flex items-center justify-between px-3 py-2 rounded-lg mb-1 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'var(--gradient-accent)', boxShadow: '0 2px 8px rgb(16 185 129 / 0.25)' }}
              onClick={() => { navigate('/wallet'); onClose?.(); }}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-white/80" />
                <span className="text-xs font-medium text-white/90">Wallet</span>
              </div>
              <span className="text-sm font-bold text-white">{formatINR(user?.walletBalance || 0)}</span>
            </div>
          )}

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 cursor-pointer" onClick={() => { navigate('/settings'); onClose?.(); }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900 truncate leading-none">{user?.name}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">
                {user?.role === 'SUPER_ADMIN' ? 'Developer' : user?.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'Employee'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-error/5 hover:text-error transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
