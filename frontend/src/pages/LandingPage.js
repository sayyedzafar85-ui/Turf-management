import { useNavigate } from 'react-router-dom';
import { Shield, Building2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" data-testid="landing-page">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-2xl bg-primary/10 mb-6">
            <div className="text-6xl font-heading font-black text-primary">
              TURF
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-tight text-white mb-4">
            Management System
          </h1>
          <p className="text-slate-400 text-lg">Choose your portal to continue</p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Super Admin Portal */}
          <button
            onClick={() => navigate('/super-admin-login')}
            data-testid="super-admin-portal-button"
            className="glassmorphism rounded-xl p-8 hover:border-destructive/50 transition-all card-hover group text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-destructive/10 rounded-2xl mb-4 group-hover:bg-destructive/20 transition-colors">
                <Shield className="text-destructive" size={48} />
              </div>
              <h2 className="text-2xl font-heading font-bold uppercase text-white mb-2">
                Super Admin
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Platform management & multi-turf administration
              </p>
              <div className="space-y-2 text-xs text-slate-500">
                <p>✓ Create & manage turf admins</p>
                <p>✓ View all turfs & analytics</p>
                <p>✓ Platform-wide reports</p>
              </div>
              <div className="mt-6 px-6 py-2 bg-destructive/20 text-destructive font-bold uppercase text-sm rounded-lg">
                Restricted Access
              </div>
            </div>
          </button>

          {/* Turf Admin Portal */}
          <button
            onClick={() => navigate('/login')}
            data-testid="turf-admin-portal-button"
            className="glassmorphism rounded-xl p-8 hover:border-primary/50 transition-all card-hover group text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary/10 rounded-2xl mb-4 group-hover:bg-primary/20 transition-colors">
                <Building2 className="text-primary" size={48} />
              </div>
              <h2 className="text-2xl font-heading font-bold uppercase text-white mb-2">
                Turf Admin
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Manage your turf bookings & operations
              </p>
              <div className="space-y-2 text-xs text-slate-500">
                <p>✓ Booking & slot management</p>
                <p>✓ Payment tracking</p>
                <p>✓ Customer records</p>
                <p>✓ Staff management</p>
              </div>
              <div className="mt-6 px-6 py-2 bg-primary/20 text-primary font-bold uppercase text-sm rounded-lg">
                Turf Management
              </div>
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="glassmorphism rounded-lg p-4 inline-block">
            <p className="text-xs text-slate-400">
              Need access? Contact your administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
