import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { UserPlus, Users } from 'lucide-react';
import { API } from '../App';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';

export default function StaffManagement() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    temporary_password: '',
    permissions: {
      can_add_booking: true,
      can_take_payment: true,
      can_edit_price: false,
      can_view_reports: false,
    },
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${API}/staff`);
      setStaff(response.data.staff);
    } catch (error) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth/create-user`, {
        ...formData,
        role: 'staff',
      });
      toast.success('Staff created successfully');
      setShowCreateStaff(false);
      setFormData({
        username: '',
        mobile: '',
        temporary_password: '',
        permissions: {
          can_add_booking: true,
          can_take_payment: true,
          can_edit_price: false,
          can_view_reports: false,
        },
      });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create staff');
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
    <div className="min-h-screen pb-20 md:pb-8" data-testid="staff-management-page">
      <Header title="Staff" subtitle="Manage staff & permissions" />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Add Staff Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateStaff(true)}
            data-testid="add-staff-button"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all btn-primary"
          >
            <UserPlus size={20} />
            Add Staff
          </button>
        </div>

        {/* Staff List */}
        <div className="glassmorphism rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-heading font-bold uppercase mb-4 text-white">Staff Members</h2>
          
          {staff.length > 0 ? (
            <div className="space-y-3">
              {staff.map((member, index) => (
                <div
                  key={index}
                  className="bg-slate-900/30 rounded-lg p-4 border border-slate-800"
                  data-testid={`staff-card-${index}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-white text-lg">@{member.username}</p>
                      <p className="text-sm text-slate-400">{member.mobile}</p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase rounded-full">
                      Staff
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Permissions:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        member.permissions?.can_add_booking ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {member.permissions?.can_add_booking ? '✓' : '✗'} Add Booking
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        member.permissions?.can_take_payment ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {member.permissions?.can_take_payment ? '✓' : '✗'} Take Payment
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        member.permissions?.can_edit_price ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {member.permissions?.can_edit_price ? '✓' : '✗'} Edit Price
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        member.permissions?.can_view_reports ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {member.permissions?.can_view_reports ? '✓' : '✗'} View Reports
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-600 mb-3" size={48} />
              <p className="text-slate-400" data-testid="no-staff-message">No staff members added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Staff Modal */}
      {showCreateStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-testid="create-staff-modal">
          <div className="glassmorphism rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-heading font-bold uppercase mb-6 text-primary">Add Staff</h2>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  data-testid="staff-username-input"
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
                  data-testid="staff-mobile-input"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Temporary Password</label>
                <input
                  type="password"
                  data-testid="staff-password-input"
                  value={formData.temporary_password}
                  onChange={(e) => setFormData({ ...formData, temporary_password: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 uppercase tracking-wider">Permissions</label>
                <div className="space-y-2">
                  {Object.entries(formData.permissions).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, [key]: e.target.checked }
                        })}
                        className="w-5 h-5 bg-slate-900/50 border-slate-800 rounded text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-300">
                        {key.replace(/_/g, ' ').replace(/^can /, '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  data-testid="submit-staff-button"
                  className="flex-1 py-2 px-4 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent transition-all"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateStaff(false)}
                  data-testid="cancel-staff-button"
                  className="flex-1 py-2 px-4 bg-slate-800 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileNav role={user?.role} />
    </div>
  );
}