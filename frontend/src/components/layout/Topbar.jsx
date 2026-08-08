import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-md hover:bg-neutral-100 text-neutral-600" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative p-2 rounded-md hover:bg-neutral-100 text-neutral-600" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>
        <div className="hidden sm:block text-sm text-neutral-600">{user?.name}</div>
        <button onClick={handleLogout} className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600" aria-label="Log out">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
