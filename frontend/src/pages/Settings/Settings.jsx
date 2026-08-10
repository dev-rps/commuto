import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, ChevronRight, Moon, Info, LogOut, Navigation, Car, MapPin, Wallet, History, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SosModal from '../../components/SosModal';

function SettingsRow({ icon: Icon, title, description, action, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-slate-800/60 transition-colors group ${danger ? 'hover:bg-error/5 dark:hover:bg-error/10' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-error/10 text-error' : 'bg-neutral-100 dark:bg-slate-800 group-hover:bg-neutral-200 dark:group-hover:bg-slate-700 text-neutral-500 dark:text-slate-400'} transition-colors`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? 'text-error' : 'text-neutral-900 dark:text-slate-100'}`}>{title}</p>
        {description && <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      {action || <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-slate-600 shrink-0 group-hover:text-neutral-500 dark:group-hover:text-slate-400 transition-colors" />}
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      className="relative cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(e);
      }}
    >
      <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-neutral-200 dark:bg-slate-700'}`} />
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const toast            = useToast();
  const [showSosModal, setShowSosModal] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    rideAlerts: true,
    chatNotifs: true,
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      toast.success(next ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️');
      return next;
    });
  };

  const togglePref = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const initials = user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          title: 'Profile Information',
          description: user?.email,
          onClick: () => toast.info('Profile details are updated automatically by your organization'),
        },
      ],
    },
    {
      title: 'Navigation Shortcuts',
      items: [
        {
          icon: Navigation,
          title: 'My Trips',
          description: 'View your offered rides and upcoming trips',
          onClick: () => navigate('/trips'),
        },
        {
          icon: Car,
          title: 'My Vehicles',
          description: 'Manage your registered vehicles',
          onClick: () => navigate('/vehicles'),
        },
        {
          icon: Wallet,
          title: 'Payment & Wallet',
          description: 'Manage your Commuto wallet and payment methods',
          onClick: () => navigate('/wallet'),
        },
        {
          icon: History,
          title: 'Ride History',
          description: 'View your past completed trips',
          onClick: () => navigate('/rides/history'),
        },
        {
          icon: MapPin,
          title: 'Saved Places',
          description: 'Manage your frequent locations',
          onClick: () => navigate('/places'),
        },
        {
          icon: MessageCircle,
          title: 'Help & Support',
          description: 'Get help with your account or rides',
          onClick: () => navigate('/help'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          title: 'Email Notifications',
          description: 'Receive booking confirmations via email',
          action: <Toggle checked={prefs.emailNotifs} onChange={() => togglePref('emailNotifs')} />,
          onClick: () => togglePref('emailNotifs'),
        },
        {
          icon: Navigation,
          title: 'Ride Alerts',
          description: 'Get notified when your ride status changes',
          action: <Toggle checked={prefs.rideAlerts} onChange={() => togglePref('rideAlerts')} />,
          onClick: () => togglePref('rideAlerts'),
        },
        {
          icon: Bell,
          title: 'Chat Messages',
          description: 'In-app notifications for new messages',
          action: <Toggle checked={prefs.chatNotifs} onChange={() => togglePref('chatNotifs')} />,
          onClick: () => togglePref('chatNotifs'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: Moon,
          title: 'Dark Mode',
          description: darkMode ? 'Dark theme active' : 'Light theme active',
          action: <Toggle checked={darkMode} onChange={toggleDarkMode} />,
          onClick: toggleDarkMode,
        },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        {
          icon: Shield,
          title: 'Emergency Trusted Contacts',
          description: 'Manage contacts who receive instant SOS alerts during rides',
          onClick: () => setShowSosModal(true),
        },
      ],
    },

    {
      title: 'About',
      items: [
        {
          icon: Info,
          title: 'About Commuto',
          description: 'Version 1.0.0 — Enterprise Carpooling Platform',
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-slate-100">Settings</h1>
        <p className="section-desc">Manage your account and preferences</p>
      </div>

      {/* Profile hero card */}
      <div className="card p-6 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
          style={{ background: 'var(--gradient-primary)', boxShadow: '0 4px 16px rgb(37 99 235 / 0.3)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-slate-100 truncate">{user?.name}</h2>
          <p className="text-sm text-neutral-500 dark:text-slate-400 truncate">{user?.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="badge text-white text-[10px] font-bold"
              style={{ background: user?.role === 'COMPANY_ADMIN' ? 'var(--gradient-warm)' : 'var(--gradient-primary)' }}
            >
              {user?.role === 'COMPANY_ADMIN' ? '🏢 Admin' : '👤 Employee'}
            </span>
            {user?.organization?.name && (
              <span className="badge bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-300 text-[10px]">
                {user.organization.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Settings sections */}
      {sections.map((section) => (
        <div key={section.title} className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 dark:border-slate-800 bg-neutral-50/50 dark:bg-slate-900/50">
            <h3 className="text-xs font-bold text-neutral-400 dark:text-slate-500 uppercase tracking-wider">{section.title}</h3>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-slate-800">
            {section.items.map((item) => (
              <SettingsRow key={item.title} {...item} />
            ))}
          </div>
        </div>
      ))}

      {/* Danger zone */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-100 dark:border-slate-800 bg-neutral-50/50 dark:bg-slate-900/50">
          <h3 className="text-xs font-bold text-neutral-400 dark:text-slate-500 uppercase tracking-wider">Account</h3>
        </div>
        <SettingsRow
          icon={LogOut}
          title="Sign Out"
          description="Sign out of your Commuto account"
          onClick={handleLogout}
          danger
        />
      </div>

      {/* Emergency Contacts Modal */}
      {showSosModal && (
        <SosModal onClose={() => setShowSosModal(false)} />
      )}
    </div>
  );
}
