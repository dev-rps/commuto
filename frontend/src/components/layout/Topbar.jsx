import { useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut, Settings, User, CheckCircle2, Car, Wallet, MessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Booking Confirmed',
      message: 'Your ride to Howrah Station has been accepted by Rahul S.',
      time: '10m ago',
      read: false,
      icon: Car,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      id: 2,
      title: 'Wallet Top Up',
      message: '₹250 added to your Commuto wallet successfully.',
      time: '1h ago',
      read: false,
      icon: Wallet,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      id: 3,
      title: 'New Message',
      message: 'Driver: "I am waiting near the main gate."',
      time: '2h ago',
      read: true,
      icon: MessageSquare,
      iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?';

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-neutral-200/70 dark:border-slate-800 flex items-center justify-between px-3.5 sm:px-6 shrink-0 sticky top-0 z-20 transition-colors">
      {/* Left: menu + page title */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-neutral-100/80 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-700 dark:text-slate-200 active:scale-95 transition-all shadow-xs"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-slate-100 leading-none tracking-tight">{title}</h2>
          </div>
          {user?.organization?.name && (
            <p className="text-[11px] text-neutral-400 dark:text-slate-500 mt-0.5 font-medium leading-none hidden sm:block">
              {user.organization.name}
            </p>
          )}
        </div>
      </div>

      {/* Right: notifications + avatar dropdown */}
      <div className="flex items-center gap-2">
        {/* Notification bell & dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-xl bg-neutral-100/80 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-600 dark:text-slate-300 hover:text-neutral-900 dark:hover:text-slate-100 active:scale-95 transition-all shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-scale-in">
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-slate-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-400 dark:text-slate-500">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n))}
                      className={`p-3.5 flex gap-3 hover:bg-neutral-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        !item.read ? 'bg-blue-50/30 dark:bg-slate-800/40' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-neutral-900 dark:text-slate-200">{item.title}</p>
                          <span className="text-[10px] text-neutral-400 dark:text-slate-500">{item.time}</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-slate-400 mt-0.5 leading-snug">{item.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-neutral-100/60 dark:bg-slate-800/60 hover:bg-neutral-100 dark:hover:bg-slate-800 active:scale-95 transition-all border border-neutral-200/60 dark:border-slate-800"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-neutral-700 dark:text-slate-200 max-w-28 truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl border border-neutral-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-scale-in">
              {/* User info */}
              <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-neutral-900 dark:text-slate-100 truncate">{user?.name}</p>
                <p className="text-xs text-neutral-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
                <span className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {user?.role === 'SUPER_ADMIN' ? '💻 Platform Developer' : user?.role === 'COMPANY_ADMIN' ? '🏢 Company Admin' : '👤 Employee'}
                </span>
              </div>
              <button
                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4 text-neutral-400" />
                Profile & Settings
              </button>
              <button
                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-neutral-400" />
                Preferences
              </button>
              <div className="border-t border-neutral-100 dark:border-slate-800 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
