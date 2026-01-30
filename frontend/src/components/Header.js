import { LogOut } from 'lucide-react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-slate-950/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-3xl font-heading font-bold uppercase tracking-tight text-primary">
            {title}
          </h1>
          {subtitle && <p className="text-xs md:text-sm text-slate-400">{subtitle}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          data-testid="header-logout-button"
        >
          <LogOut size={18} />
          <span className="hidden md:inline text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}