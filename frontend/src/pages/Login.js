import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Lock, User } from 'lucide-react';
import { API } from '../App';

export default function Login() {
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
      login(access_token, user);
      
      toast.success('Login successful!');
      
      if (user.role === 'super_admin') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" data-testid="login-page">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl bg-primary/10 mb-4">
            <div className="text-5xl font-heading font-black text-primary">
              TURF
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-tight text-white mb-2">
            Management System
          </h1>
          <p className="text-slate-400 text-sm">Sign in to manage your turf bookings</p>
        </div>

        {/* Login Form */}
        <div className="glassmorphism rounded-xl p-6 md:p-8">
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
                  data-testid="username-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none input-focus"
                  placeholder="Enter username"
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
                  data-testid="password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none input-focus"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              data-testid="login-button"
              disabled={loading}
              className="w-full py-3 px-6 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-400 text-center">
              Default credentials: <br />
              <span className="text-primary font-medium">superadmin / Admin@123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}