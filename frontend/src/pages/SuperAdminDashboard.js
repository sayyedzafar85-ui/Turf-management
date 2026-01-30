import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, DollarSign, Calendar, TrendingUp, UserPlus, LogOut } from 'lucide-react';
import { API } from '../App';
import MobileNav from '../components/MobileNav';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    turf_name: '',
    temporary_password: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/super-admin`);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth/create-user`, {
        ...formData,
        role: 'admin',
      });
      toast.success('Admin created successfully');
      setShowCreateAdmin(false);
      setFormData({ username: '', mobile: '', turf_name: '', temporary_password: '' });
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create admin');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8" data-testid="super-admin-dashboard">
      {/* Header */}
      <div className="bg-slate-950/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold uppercase tracking-tight text-primary">
              Super Admin
            </h1>
            <p className="text-sm text-slate-400">Platform Overview</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            data-testid="logout-button"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="glassmorphism rounded-xl p-4 md:p-6 card-hover" data-testid="total-turfs-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="text-primary" size={24} />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white">{stats?.total_turfs || 0}</p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Total Turfs</p>
          </div>

          <div className="glassmorphism rounded-xl p-4 md:p-6 card-hover" data-testid="active-turfs-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="text-accent" size={24} />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white">{stats?.active_turfs || 0}</p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Active</p>
          </div>

          <div className="glassmorphism rounded-xl p-4 md:p-6 card-hover" data-testid="total-bookings-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Calendar className="text-secondary" size={24} />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white">{stats?.total_bookings || 0}</p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Bookings</p>
          </div>

          <div className="glassmorphism rounded-xl p-4 md:p-6 card-hover" data-testid="total-revenue-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <DollarSign className="text-yellow-400" size={24} />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white">₹{stats?.total_revenue?.toLocaleString() || 0}</p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Revenue</p>
          </div>
        </div>

        {/* Create Admin Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateAdmin(true)}
            data-testid="create-admin-button"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all btn-primary"
          >
            <UserPlus size={20} />
            Create New Admin
          </button>
        </div>

        {/* Create Admin Modal */}
        {showCreateAdmin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-testid="create-admin-modal">
            <div className="glassmorphism rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-heading font-bold uppercase mb-6 text-primary">Create Admin</h2>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    data-testid="admin-username-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Mobile</label>
                  <input
                    type="tel"
                    data-testid="admin-mobile-input"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Turf Name</label>
                  <input
                    type="text"
                    data-testid="admin-turf-name-input"
                    value={formData.turf_name}
                    onChange={(e) => setFormData({ ...formData, turf_name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Temporary Password</label>
                  <input
                    type="password"
                    data-testid="admin-password-input"
                    value={formData.temporary_password}
                    onChange={(e) => setFormData({ ...formData, temporary_password: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    data-testid="submit-admin-button"
                    className="flex-1 py-2 px-4 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent transition-all"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateAdmin(false)}
                    data-testid="cancel-admin-button"
                    className="flex-1 py-2 px-4 bg-slate-800 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Turfs List */}
        <div className="glassmorphism rounded-xl p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-heading font-bold uppercase mb-4 text-white">All Turfs</h2>
          <div className="space-y-3">
            {stats?.turfs?.map((turf, index) => (
              <div key={index} className="bg-slate-900/30 rounded-lg p-4 border border-slate-800" data-testid={`turf-card-${index}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white">{turf.turf_name || 'Not Set'}</h3>
                    <p className="text-sm text-slate-400">@{turf.username}</p>
                    <p className="text-xs text-slate-500 mt-1">{turf.mobile}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full">
                      {turf.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileNav role="super_admin" />
    </div>
  );
}