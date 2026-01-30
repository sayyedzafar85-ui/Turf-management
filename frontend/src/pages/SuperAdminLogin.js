import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Lock, User, Shield } from 'lucide-react';
import { API } from '../App';

export default function SuperAdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });

      const { access_token, user } = response.data;
      
      // Only allow super_admin role
      if (user.role !== 'super_admin') {
        toast.error('Access denied. Super admin credentials required.');
        setLoading(false);
        return;
      }
      
      login(access_token, user);
      toast.success('Super Admin login successful!');
      navigate('/super-admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" data-testid="super-admin-login-page">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl bg-destructive/10 mb-4">
            <Shield className="text-destructive" size={48} />
          </div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight text-white mb-2">
            Super Admin Portal
          </h1>
          <p className="text-slate-400 text-sm">Platform Management Access</p>
        </div>

        {/* Login Form */}
        <div className="glassmorphism rounded-xl p-6 md:p-8 border-2 border-destructive/20">
          <div className="mb-6 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
            <p className="text-xs text-destructive font-bold uppercase tracking-wider text-center">
              ⚠️ Restricted Access Area
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  id="username"
                  type="text"
                  data-testid="super-admin-username-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-destructive focus:ring-1 focus:ring-destructive/50 focus:outline-none input-focus"
                  placeholder="Enter super admin username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  id="password"
                  type="password"
                  data-testid="super-admin-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-destructive focus:ring-1 focus:ring-destructive/50 focus:outline-none input-focus"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              data-testid="super-admin-login-button"
              disabled={loading}
              className="w-full py-3 px-6 bg-destructive text-white font-bold uppercase tracking-wider rounded-lg hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'SIGNING IN...' : 'SUPER ADMIN ACCESS'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-xs text-primary hover:text-accent transition-colors">
              Turf Admin Login →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}