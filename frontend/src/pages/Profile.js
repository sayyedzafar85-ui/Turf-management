import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Lock, Camera, Save } from 'lucide-react';
import { API } from '../App';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    profile_photo: user?.profile_photo || ''
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`);
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to load profile');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.put(`${API}/profile`, profileData);
      toast.success('Profile updated successfully!');
      
      // Update user in auth context
      const currentToken = localStorage.getItem('token');
      const updatedUser = { ...user, ...response.data };
      login(currentToken, updatedUser);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/auth/change-password`, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      toast.success('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setShowPasswordChange(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profile_photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8" data-testid="profile-page">
      <Header title="Profile" subtitle="Manage your account" />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {/* Profile Photo */}
        <div className="glassmorphism rounded-xl p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                {profileData.profile_photo ? (
                  <img src={profileData.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-500" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-accent transition-colors">
                <Camera size={16} className="text-black" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  data-testid="photo-upload"
                />
              </label>
            </div>
            <h2 className="text-xl font-heading font-bold text-white mt-4">{profileData.username}</h2>
            <p className="text-sm text-slate-400">{user?.role === 'admin' ? 'Turf Admin' : 'Staff Member'}</p>
            {user?.turf_name && (
              <p className="text-xs text-primary mt-1">{user.turf_name}</p>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="glassmorphism rounded-xl p-6 mb-6">
          <h3 className="text-lg font-heading font-bold uppercase text-white mb-4">Profile Information</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                <User size={16} />
                Username
              </label>
              <input
                type="text"
                data-testid="username-input"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                data-testid="email-input"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Phone size={16} />
                Mobile Number
              </label>
              <input
                type="tel"
                data-testid="mobile-input"
                value={profileData.mobile}
                onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={16} />
                Address
              </label>
              <textarea
                data-testid="address-input"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                rows="3"
                placeholder="Enter your address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="save-profile-button"
              className="w-full py-3 px-6 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'SAVING...' : 'SAVE PROFILE'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glassmorphism rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-bold uppercase text-white flex items-center gap-2">
              <Lock size={20} />
              Change Password
            </h3>
            {!showPasswordChange && (
              <button
                onClick={() => setShowPasswordChange(true)}
                data-testid="show-password-change-button"
                className="text-sm text-primary hover:text-accent transition-colors"
              >
                Update
              </button>
            )}
          </div>

          {showPasswordChange && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <input
                  type="password"
                  data-testid="old-password-input"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  data-testid="new-password-input"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  data-testid="confirm-password-input"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                  minLength="6"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="change-password-button"
                  className="flex-1 py-2 px-4 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent transition-all disabled:opacity-50"
                >
                  {loading ? 'CHANGING...' : 'CHANGE PASSWORD'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                  }}
                  data-testid="cancel-password-button"
                  className="flex-1 py-2 px-4 bg-slate-800 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-slate-700 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}

          {!showPasswordChange && (
            <p className="text-sm text-slate-400">Keep your account secure by using a strong password</p>
          )}
        </div>
      </div>

      <MobileNav role={user?.role} />
    </div>
  );
}