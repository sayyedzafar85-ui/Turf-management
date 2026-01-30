import { Home, Calendar, DollarSign, Users, Settings, BarChart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileNav({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = role === 'super_admin'
    ? [
        { path: '/super-admin', icon: Home, label: 'Home' },
      ]
    : [
        { path: '/dashboard', icon: Home, label: 'Home' },
        { path: '/bookings', icon: Calendar, label: 'Book' },
        { path: '/payments', icon: DollarSign, label: 'Pay' },
        { path: '/customers', icon: Users, label: 'Customers' },
      ];

  if (role === 'admin') {
    navItems.push({ path: '/settings', icon: Settings, label: 'Settings' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50" data-testid="mobile-nav">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            data-testid={`nav-${item.label.toLowerCase()}`}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive(item.path) ? 'text-primary' : 'text-slate-400'
            } transition-colors`}
          >
            <item.icon size={22} />
            <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}