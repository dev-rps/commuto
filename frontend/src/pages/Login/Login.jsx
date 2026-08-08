import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Mail, Lock, User, Building2 } from 'lucide-react';
import { login as apiLogin, signup as apiSignup, getOrganizations } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { FieldError } from '../../components';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});
  const [orgs, setOrgs] = useState([]);
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (mode === 'signup' && form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (mode === 'signup' && !/\d/.test(form.password)) e.password = 'Password must contain at least 1 digit';
    else if (mode === 'signup' && !/[^a-zA-Z0-9]/.test(form.password)) e.password = 'Password must contain at least 1 special character';
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
      navigate('/dashboard');
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
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
            <Navigation className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold">RideSync</span>
        </div>
        <div className="relative z-10 text-white max-w-md">
          <h2 className="text-3xl font-bold leading-tight mb-4">Carpool smarter across your enterprise</h2>
          <p className="text-primary-100 text-base leading-relaxed">Share rides with colleagues, track trips in real time, and reduce commuting costs with powerful analytics for your organization.</p>
        </div>
        <div className="relative z-10 flex gap-8 text-white">
          <div><p className="text-3xl font-bold">30%</p><p className="text-sm text-primary-100">Avg cost savings</p></div>
          <div><p className="text-3xl font-bold">12k+</p><p className="text-sm text-primary-100">Trips shared</p></div>
          <div><p className="text-3xl font-bold">4.8</p><p className="text-sm text-primary-100">User rating</p></div>
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-neutral-900">RideSync</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="text-sm text-neutral-500 mb-8">{mode === 'login' ? 'Sign in to your RideSync account' : "Join your organization's carpool network"}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" className={`input pl-10 ${errors.name ? 'input-error' : ''}`} />
                </div>
                <FieldError error={errors.name} />
              </div>
            )}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
              </div>
              <FieldError error={errors.email} />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className={`input pl-10 ${errors.password ? 'input-error' : ''}`} />
              </div>
              <FieldError error={errors.password} />
            </div>
            {mode === 'signup' && (
              <>
                <div>
                  <label className="label">Role</label>
                  <div className="flex gap-3">
                    {['EMPLOYEE', 'COMPANY_ADMIN'].map((r) => (
                      <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                        className={`flex-1 px-4 py-2.5 rounded-md border text-sm font-medium transition-colors ${form.role === r ? 'border-primary bg-primary-50 text-primary-700' : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'}`}>
                        {r === 'EMPLOYEE' ? 'Employee' : 'Company Admin'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Organization</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <select name="organizationId" value={form.organizationId} onChange={handleChange} className={`input pl-10 ${errors.organizationId ? 'input-error' : ''}`}>
                      <option value="">Select your organization</option>
                      {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                  <FieldError error={errors.organizationId} />
                </div>
              </>
            )}
            {formError && <div className="rounded-md bg-error/10 px-4 py-3 text-sm text-error font-medium">{formError}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="text-primary font-semibold hover:underline">{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
          </p>
          {mode === 'login' && (
            <div className="mt-6 rounded-md bg-neutral-100 px-4 py-3 text-xs text-neutral-500">
              <p className="font-medium text-neutral-600 mb-1">Demo accounts (mock mode):</p>
              <p>Employee: any email with password</p>
              <p>Admin: use an email containing "admin"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
