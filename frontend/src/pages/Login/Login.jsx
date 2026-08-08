import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { login as apiLogin, signup as apiSignup, getOrganizations } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { FieldError } from '../../components';

const STATS = [
  { value: '30%', label: 'Avg. cost savings' },
  { value: '12k+', label: 'Trips shared' },
  { value: '4.8★', label: 'User rating' },
];

const FEATURES = [
  'Real-time ride matching with colleagues',
  'Live GPS tracking & ETA',
  'Secure in-app payments & wallet',
  'Detailed fleet analytics for admins',
];

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
    /[A-Z]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-error', 'bg-warning', 'bg-yellow-400', 'bg-accent'];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-neutral-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score >= 3 ? 'text-accent-600' : score >= 2 ? 'text-warning' : 'text-error'}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});
  const [orgs, setOrgs] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE', organizationId: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const e = {};
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (mode === 'signup' && form.password.length < 8) e.password = 'At least 8 characters';
    else if (mode === 'signup' && !/\d/.test(form.password)) e.password = 'Include at least 1 digit';
    else if (mode === 'signup' && !/[^a-zA-Z0-9]/.test(form.password)) e.password = 'Include 1 special character';
    if (mode === 'signup' && !form.organizationId) e.organizationId = 'Please select your organization';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await apiLogin(form.email, form.password)
        : await apiSignup({ name: form.name, email: form.email, password: form.password, role: form.role, organizationId: form.organizationId });
      login(result.user, result.accessToken);
      const dest = result.user?.role === 'SUPER_ADMIN' ? '/superadmin' : result.user?.role === 'COMPANY_ADMIN' ? '/admin-dashboard' : '/dashboard';
      navigate(dest);
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const switchMode = (newMode) => {
    setMode(newMode); setErrors({}); setFormError('');
    if (newMode === 'signup' && orgs.length === 0) getOrganizations().then(setOrgs).catch(() => {});
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left hero panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/3 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <path d="M8 24 C8 20 12 16 20 16 C28 16 32 20 32 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="6" y="24" width="28" height="10" rx="4" fill="white" fillOpacity="0.9"/>
              <circle cx="12" cy="34" r="3" fill="white"/>
              <circle cx="28" cy="34" r="3" fill="white"/>
              <path d="M20 8 L23 13 L17 13 Z" fill="white" fillOpacity="0.7"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">Commuto</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 text-white space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Carpool smarter<br />across your enterprise
          </h2>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            Share rides with colleagues, track trips in real time, and cut commuting costs with powerful fleet analytics.
          </p>

          {/* Feature checklist */}
          <ul className="space-y-2.5 mt-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-blue-100">
                <CheckCircle className="w-4 h-4 text-accent-300 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats row */}
        <div className="relative z-10 flex gap-8">
          {STATS.map((s) => (
            <div key={s.value}>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-blue-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-neutral-50">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <path d="M8 24 C8 20 12 16 20 16 C28 16 32 20 32 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <rect x="6" y="24" width="28" height="10" rx="4" fill="white" fillOpacity="0.9"/>
                <circle cx="12" cy="34" r="3" fill="white"/>
                <circle cx="28" cy="34" r="3" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-neutral-900">Commuto</span>
          </div>

          {/* Mode toggle pills */}
          <div className="flex bg-neutral-100 rounded-xl p-1 mb-7">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            {mode === 'login' ? 'Welcome back 👋' : 'Get started free'}
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            {mode === 'login' ? 'Sign in to your Commuto account' : "Join your organization's carpool network"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input name="name" type="text" value={form.name} onChange={handleChange}
                    placeholder="John Doe" className={`input pl-10 ${errors.name ? 'input-error' : ''}`} />
                </div>
                <FieldError error={errors.name} />
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@company.com" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
              </div>
              <FieldError error={errors.email} />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  placeholder="••••••••" className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError error={errors.password} />
              {mode === 'signup' && <PasswordStrength password={form.password} />}
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="label">Role</label>
                  <div className="flex gap-2">
                    {['EMPLOYEE', 'COMPANY_ADMIN'].map((r) => (
                      <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                        className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          form.role === r
                            ? 'border-primary bg-primary-50 text-primary'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                        }`}>
                        {r === 'EMPLOYEE' ? '👤 Employee' : '🏢 Admin'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Organization</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <select name="organizationId" value={form.organizationId} onChange={handleChange}
                      className={`input pl-10 ${errors.organizationId ? 'input-error' : ''}`}>
                      <option value="">Select your organization</option>
                      {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                  <FieldError error={errors.organizationId} />
                </div>
              </>
            )}

            {formError && (
              <div className="rounded-xl bg-error/8 border border-error/20 px-4 py-3 text-sm text-error font-medium">
                {formError}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full h-11 text-base mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Please wait...
                </span>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Accounts */}
          {mode === 'login' && (
            <div className="mt-5 rounded-xl bg-neutral-50 border border-neutral-200 p-3.5 text-xs">
              <p className="font-semibold text-neutral-800 mb-2 flex items-center justify-between">
                <span>⚡ Quick Demo Logins (Password: <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-900 font-mono">pass1234</code>)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setForm({ email: 'superadmin@gmail.com', password: 'pass1234' })}
                  className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium transition-colors"
                >
                  💻 Developer / Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'admin@infosys.com', password: 'pass1234' })}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium transition-colors"
                >
                  🏢 Infosys Admin
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'neha@infosys.com', password: 'pass1234' })}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium transition-colors"
                >
                  🚗 Neha (Infosys)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'suraj@tcs.com', password: 'pass1234' })}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium transition-colors"
                >
                  🚗 Suraj (TCS)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'amit@wipro.com', password: 'pass1234' })}
                  className="px-2.5 py-1 rounded-lg bg-cyan-100 hover:bg-cyan-200 text-cyan-800 font-medium transition-colors"
                >
                  🚗 Amit (Wipro)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
