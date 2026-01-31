import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { API } from '../App';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    turf_name: user?.turf_name || '',
    open_time: '06:00',
    close_time: '23:00',
    slot_duration: 60,
    weekday_price: 1000,
    weekend_price: 1500,
    advance_required: 0,
    cancellation_policy: 'No refund',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings/turf`);
      if (response.data && !response.data.message) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await axios.post(`${API}/settings/turf`, settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
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
    <div className="min-h-screen pb-20 md:pb-8" data-testid="settings-page">
      <Header title="Settings" subtitle="Configure turf settings" />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="glassmorphism rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SettingsIcon className="text-primary" size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-heading font-bold uppercase text-white">Turf Configuration</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Turf Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Turf Name</label>
              <input
                type="text"
                data-testid="turf-name-input"
                value={settings.turf_name}
                onChange={(e) => setSettings({ ...settings, turf_name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                required
              />
            </div>

            {/* Operating Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Open Time</label>
                <input
                  type="time"
                  data-testid="open-time-input"
                  value={settings.open_time}
                  onChange={(e) => setSettings({ ...settings, open_time: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Close Time</label>
                <input
                  type="time"
                  data-testid="close-time-input"
                  value={settings.close_time}
                  onChange={(e) => setSettings({ ...settings, close_time: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Slot Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Slot Duration (minutes)</label>
              <select
                data-testid="slot-duration-select"
                value={settings.slot_duration}
                onChange={(e) => setSettings({ ...settings, slot_duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
              >
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Weekday Price (₹)</label>
                <input
                  type="number"
                  data-testid="weekday-price-input"
                  value={settings.weekday_price}
                  onChange={(e) => setSettings({ ...settings, weekday_price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Weekend Price (₹)</label>
                <input
                  type="number"
                  data-testid="weekend-price-input"
                  value={settings.weekend_price}
                  onChange={(e) => setSettings({ ...settings, weekend_price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Advance */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Minimum Advance (₹)</label>
              <input
                type="number"
                data-testid="advance-required-input"
                value={settings.advance_required}
                onChange={(e) => setSettings({ ...settings, advance_required: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                min="0"
              />
            </div>

            {/* Cancellation Policy */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Cancellation Policy</label>
              <textarea
                data-testid="cancellation-policy-input"
                value={settings.cancellation_policy}
                onChange={(e) => setSettings({ ...settings, cancellation_policy: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                rows="3"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              data-testid="save-settings-button"
              disabled={saving}
              className="w-full py-3 px-6 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {saving ? 'SAVING...' : 'SAVE SETTINGS'}
            </button>
          </form>
        </div>

        {/* Notification Settings Link */}
        <div className="glassmorphism rounded-xl p-6 mt-6">
          <h3 className="text-lg font-heading font-bold uppercase text-white mb-3">Notification Settings</h3>
          <p className="text-sm text-slate-400 mb-4">
            Configure Email, SMS & WhatsApp notifications for booking confirmations
          </p>
          <button
            onClick={() => navigate('/notifications')}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-wider rounded-lg transition-colors text-sm"
          >
            Configure Notifications →
          </button>
        </div>
      </div>

      <MobileNav role={user?.role} />
    </div>
  );
}