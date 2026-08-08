import { useNavigate } from 'react-router-dom';
import { Calendar, Car, Wallet, Factory as History, MapPin, LifeBuoy, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const links = [
    { icon: Calendar, label: 'My Trips', desc: 'View booked and offered trips', to: '/trips' },
    { icon: Car, label: 'My Vehicle', desc: 'Manage your registered vehicles', to: '/vehicles' },
    { icon: Wallet, label: 'Payment Methods', desc: 'Wallet balance and payment options', to: '/wallet' },
    { icon: History, label: 'Ride History', desc: 'Past completed and cancelled rides', to: '/rides/history' },
    { icon: MapPin, label: 'Saved Places', desc: 'Manage your favorite locations', to: '/places' },
    { icon: LifeBuoy, label: 'Help & Support', desc: 'Get help with your account', to: '/help' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary text-white text-lg font-semibold flex items-center justify-center">
            {user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-semibold text-neutral-900">{user?.name}</p>
            <p className="text-sm text-neutral-500">{user?.email}</p>
            <span className={`badge mt-1 ${user?.role === 'COMPANY_ADMIN' ? 'bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-600'}`}>
              {user?.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'Employee'}
            </span>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {links.map((link, i) => (
          <button key={link.to} onClick={() => navigate(link.to)}
            className={`w-full flex items-center gap-4 p-4 text-left hover:bg-neutral-50 transition-colors ${i !== links.length - 1 ? 'border-b border-neutral-100' : ''}`}>
            <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
              <link.icon className="w-5 h-5 text-neutral-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900">{link.label}</p>
              <p className="text-xs text-neutral-500">{link.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
