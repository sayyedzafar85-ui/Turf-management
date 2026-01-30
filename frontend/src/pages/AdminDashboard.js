import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar, DollarSign, Clock, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { API } from '../App';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchDashboardData = async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    }
    try {
      const response = await axios.get(`${API}/dashboard/admin`);
      setStats(response.data);
      if (manual) {
        toast.success('Dashboard refreshed!');
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
      if (manual) {
        setRefreshing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8" data-testid="admin-dashboard">
      <Header title={user?.turf_name || 'Dashboard'} subtitle="Today's Overview" />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            data-testid="refresh-dashboard-button"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="glassmorphism rounded-xl p-4 md:p-6 card-hover" data-testid="today-bookings-card">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                <Calendar className="text-primary" size={20} />
              </div>
            </div>
            <p className="text-2xl md:text-4xl font-heading font-bold text-white">{stats?.today_bookings_count ?? 0}</p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Today's Bookings</p>
          </div>

          <div className="glassmorphism rounded-xl p-4 md:p-6 card-hover" data-testid="today-income-card">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-1.5 md:p-2 bg-accent/10 rounded-lg">
                <DollarSign className="text-accent" size={20} />
              </div>
            </div>
            <p className="text-2xl md:text-4xl font-heading font-bold text-white">₹{(stats?.today_income ?? 0).toLocaleString()}</p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Today's Income</p>
          </div>

          <div className="glassmorphism rounded-xl p-4 md:p-6 card-hover" data-testid="available-slots-card">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-1.5 md:p-2 bg-secondary/10 rounded-lg">
                <Clock className="text-secondary" size={20} />
              </div>
            </div>
            <p className="text-2xl md:text-4xl font-heading font-bold text-white">{stats?.available_slots_today ?? 0}</p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Available Slots</p>
          </div>

          <div className="glassmorphism rounded-xl p-4 md:p-6 card-hover" data-testid="pending-payments-card">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-1.5 md:p-2 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="text-yellow-400" size={20} />
              </div>
            </div>
            <p className="text-2xl md:text-4xl font-heading font-bold text-white">{stats?.pending_payments_count ?? 0}</p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Pending Payments</p>
          </div>
        </div>

        {/* Pending Amount Alert */}
        {stats?.pending_amount > 0 && (
          <div className="glassmorphism rounded-xl p-4 mb-6 border-l-4 border-yellow-400" data-testid="pending-amount-alert">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-400 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-white">Pending Payments</p>
                <p className="text-sm text-slate-300">
                  Total pending amount: <span className="text-yellow-400 font-bold">₹{stats?.pending_amount?.toLocaleString()}</span>
                </p>
                <button
                  onClick={() => navigate('/payments')}
                  className="text-xs text-primary hover:text-accent mt-1 underline"
                  data-testid="view-pending-button"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          <button
            onClick={() => navigate('/bookings')}
            data-testid="new-booking-button"
            className="glassmorphism rounded-xl p-4 md:p-6 hover:border-primary/50 transition-colors text-left card-hover"
          >
            <Calendar className="text-primary mb-2" size={24} />
            <p className="font-heading font-bold text-white uppercase text-sm md:text-base">New Booking</p>
            <p className="text-xs text-slate-400 mt-1">Book a slot</p>
          </button>

          <button
            onClick={() => navigate('/payments')}
            data-testid="payments-button"
            className="glassmorphism rounded-xl p-4 md:p-6 hover:border-primary/50 transition-colors text-left card-hover"
          >
            <DollarSign className="text-accent mb-2" size={24} />
            <p className="font-heading font-bold text-white uppercase text-sm md:text-base">Payments</p>
            <p className="text-xs text-slate-400 mt-1">Manage payments</p>
          </button>

          <button
            onClick={() => navigate('/customers')}
            data-testid="customers-button"
            className="glassmorphism rounded-xl p-4 md:p-6 hover:border-primary/50 transition-colors text-left card-hover"
          >
            <TrendingUp className="text-secondary mb-2" size={24} />
            <p className="font-heading font-bold text-white uppercase text-sm md:text-base">Customers</p>
            <p className="text-xs text-slate-400 mt-1">View records</p>
          </button>
        </div>

        {/* Recent Bookings */}
        <div className="glassmorphism rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-heading font-bold uppercase mb-4 text-white">Recent Bookings</h2>
          {stats?.recent_bookings?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_bookings.map((booking, index) => (
                <div
                  key={index}
                  className="bg-slate-900/30 rounded-lg p-3 md:p-4 border border-slate-800"
                  data-testid={`recent-booking-${index}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm md:text-base">{booking.customer_name}</p>
                      <p className="text-xs md:text-sm text-slate-400">{booking.customer_mobile}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {booking.date} at {booking.slot_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-white text-sm md:text-base">₹{booking.total_amount}</p>
                      {booking.balance_pending > 0 && (
                        <p className="text-xs text-yellow-400 mt-1">Pending: ₹{booking.balance_pending}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8" data-testid="no-bookings-message">No bookings yet today</p>
          )}
        </div>
      </div>

      <MobileNav role={user?.role} />
    </div>
  );
}