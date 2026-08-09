import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { completeProfile } from '../../lib/api';

export default function ProfileCreation() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return toast.warning('Enter a valid phone number');
    setLoading(true);
    try {
      const updatedUser = await completeProfile({ phone });
      setUser(updatedUser);
      toast.success('Profile completed successfully!');
      
      const dest = updatedUser?.role === 'SUPER_ADMIN' 
        ? '/superadmin' 
        : updatedUser?.role === 'COMPANY_ADMIN' 
        ? '/admin-dashboard' 
        : '/dashboard';
        
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 relative overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Complete Your Profile</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Please provide your phone number so drivers and passengers can contact you during a ride.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neutral-900">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="input pl-10"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40">
            {loading ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
