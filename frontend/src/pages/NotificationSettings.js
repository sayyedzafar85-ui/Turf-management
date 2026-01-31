import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, Send, AlertCircle } from 'lucide-react';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [notificationConfig, setNotificationConfig] = useState({
    email_enabled: false,
    sms_enabled: false,
    whatsapp_enabled: false,
  });

  return (
    <div className="min-h-screen pb-20 md:pb-8" data-testid="notification-settings-page">
      <Header title="Notifications" subtitle="Configure notification services" />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Info Banner */}
        <div className="glassmorphism rounded-xl p-6 mb-6 border-l-4 border-primary">
          <div className="flex items-start gap-3">
            <Bell className="text-primary mt-1" size={24} />
            <div>
              <h2 className="font-heading font-bold text-white text-lg mb-2">Automatic Booking Confirmations</h2>
              <p className="text-slate-300 text-sm mb-3">
                Customers receive instant booking confirmation via Email, SMS & WhatsApp when you create a booking.
              </p>
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Confirmation includes:</p>
                <ul className="text-xs text-slate-400 space-y-1 ml-4">
                  <li>✓ Turf name, date & time</li>
                  <li>✓ Payment details (total, advance, pending)</li>
                  <li>✓ Booking confirmation message</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="glassmorphism rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Mail className="text-accent" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-heading font-bold text-white">Email Notifications</h3>
              <p className="text-xs text-slate-400">via Resend API</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              notificationConfig.email_enabled 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-slate-800 text-slate-500'
            }`}>
              {notificationConfig.email_enabled ? 'ACTIVE' : 'INACTIVE'}
            </div>
          </div>

          <div className="bg-slate-900/30 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-bold text-white mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-slate-400 space-y-2 ml-4 list-decimal">
              <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent underline">resend.com</a></li>
              <li>Get your API key from Dashboard → API Keys</li>
              <li>Add to backend <code className="bg-slate-800 px-2 py-1 rounded text-xs">.env</code> file:
                <pre className="bg-slate-800 p-2 rounded mt-2 text-xs overflow-x-auto">
RESEND_API_KEY=re_your_api_key_here
SENDER_EMAIL=onboarding@resend.dev
                </pre>
              </li>
              <li>Restart backend: <code className="bg-slate-800 px-2 py-1 rounded text-xs">sudo supervisorctl restart backend</code></li>
            </ol>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle size={14} />
            <span>Email will be sent to customer's email address (if provided during booking)</span>
          </div>
        </div>

        {/* SMS Configuration */}
        <div className="glassmorphism rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <MessageSquare className="text-secondary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-heading font-bold text-white">SMS Notifications</h3>
              <p className="text-xs text-slate-400">via Twilio</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              notificationConfig.sms_enabled 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-slate-800 text-slate-500'
            }`}>
              {notificationConfig.sms_enabled ? 'ACTIVE' : 'INACTIVE'}
            </div>
          </div>

          <div className="bg-slate-900/30 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-bold text-white mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-slate-400 space-y-2 ml-4 list-decimal">
              <li>Sign up at <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent underline">twilio.com</a></li>
              <li>Get a phone number from Twilio Console</li>
              <li>Get your Account SID and Auth Token</li>
              <li>Add to backend <code className="bg-slate-800 px-2 py-1 rounded text-xs">.env</code> file:
                <pre className="bg-slate-800 p-2 rounded mt-2 text-xs overflow-x-auto">
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
                </pre>
              </li>
              <li>Restart backend: <code className="bg-slate-800 px-2 py-1 rounded text-xs">sudo supervisorctl restart backend</code></li>
            </ol>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle size={14} />
            <span>SMS will be sent to customer's mobile number automatically</span>
          </div>
        </div>

        {/* WhatsApp Configuration */}
        <div className="glassmorphism rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Send className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-heading font-bold text-white">WhatsApp Notifications</h3>
              <p className="text-xs text-slate-400">via Twilio WhatsApp API or Baileys</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              notificationConfig.whatsapp_enabled 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-slate-800 text-slate-500'
            }`}>
              {notificationConfig.whatsapp_enabled ? 'ACTIVE' : 'COMING SOON'}
            </div>
          </div>

          <div className="bg-slate-900/30 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-bold text-white mb-2">Setup Options:</h4>
            
            <div className="mb-4">
              <h5 className="text-sm font-bold text-primary mb-2">Option 1: Twilio WhatsApp (Easiest)</h5>
              <ol className="text-sm text-slate-400 space-y-2 ml-4 list-decimal">
                <li>Use Twilio WhatsApp Business API</li>
                <li>Requires business verification</li>
                <li>Paid service with reliable delivery</li>
              </ol>
            </div>

            <div>
              <h5 className="text-sm font-bold text-primary mb-2">Option 2: Baileys (Advanced)</h5>
              <ol className="text-sm text-slate-400 space-y-2 ml-4 list-decimal">
                <li>Free WhatsApp Web API</li>
                <li>Requires separate Node.js service</li>
                <li>Scan QR code to connect WhatsApp account</li>
                <li>More setup required but no cost</li>
              </ol>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-yellow-400 mt-0.5" size={16} />
              <p className="text-xs text-yellow-400">
                WhatsApp integration requires additional setup. Contact support or follow the integration playbook for detailed instructions.
              </p>
            </div>
          </div>
        </div>

        {/* Test Notification */}
        <div className="glassmorphism rounded-xl p-6 mt-6">
          <h3 className="text-lg font-heading font-bold text-white mb-4">Test Notifications</h3>
          <p className="text-sm text-slate-400 mb-4">
            Create a test booking to verify notifications are working correctly. Check customer's email/SMS/WhatsApp.
          </p>
          <button
            onClick={() => toast.info('Create a booking to test notifications!')}
            className="px-6 py-2 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent transition-colors text-sm"
          >
            Create Test Booking
          </button>
        </div>
      </div>

      <MobileNav role={user?.role} />
    </div>
  );
}
