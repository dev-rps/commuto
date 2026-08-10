import { useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?';

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 bg-white/85 backdrop-blur-xl border-b border-neutral-200/70 flex items-center justify-between px-3.5 sm:px-6 shrink-0 sticky top-0 z-20 transition-all">
      {/* Left: menu + page title */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-neutral-100/80 hover:bg-neutral-200 text-neutral-700 active:scale-95 transition-all shadow-xs"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 leading-none tracking-tight">{title}</h2>
            <span className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>
          {user?.organization?.name && (
            <p className="text-[11px] text-neutral-400 mt-0.5 font-medium leading-none hidden sm:block">
              {user.organization.name}
            </p>
          )}
        </div>
      </div>

      {/* Right: notifications + avatar dropdown */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-xl bg-neutral-100/80 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 active:scale-95 transition-all shadow-xs"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white" />
          </span>
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-neutral-100/60 hover:bg-neutral-100 active:scale-95 transition-all border border-neutral-200/60"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-neutral-700 max-w-28 truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-neutral-200 shadow-xl py-1.5 z-50 animate-scale-in">
              {/* User info */}
              <div className="px-4 py-2.5 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
                <p className="text-xs text-neutral-500 truncate mt-0.5">{user?.email}</p>
                <span className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                  {user?.role === 'SUPER_ADMIN' ? '💻 Platform Developer' : user?.role === 'COMPANY_ADMIN' ? '🏢 Company Admin' : '👤 Employee'}
                </span>
              </div>
              <button
                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <User className="w-4 h-4 text-neutral-400" />
                Profile & Settings
              </button>
              <button
                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-neutral-400" />
                Preferences
              </button>
              <div className="border-t border-neutral-100 mt-1 pt-1">
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
