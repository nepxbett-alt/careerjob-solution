import { Outlet, NavLink } from 'react-router-dom';
import { Home, FilePlus, List, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BrandLogo } from '../BrandLogo';
import { cn } from '../../lib/cn';

export default function BusinessLayout() {
  const { signOut } = useAuth();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium min-w-[64px] min-h-[48px] px-1 rounded-lg transition-colors',
      isActive ? 'text-[#0066FF]' : 'text-slate-500 hover:text-slate-800'
    );

  return (
    <div className="min-h-screen pb-[calc(3.75rem+env(safe-area-inset-bottom))] bg-slate-50">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-12 flex items-center justify-between px-3 gap-2">
        <BrandLogo to="/business" size="sm" showWordmark={false} />
        <span className="text-sm font-semibold text-slate-800 truncate flex-1">Business</span>
        <button type="button" onClick={() => signOut()} className="text-sm text-slate-500 hover:text-slate-800 py-2 px-2 min-h-[44px]">
          Log out
        </button>
      </header>
      <main className="max-w-3xl mx-auto w-full">
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center safe-bottom z-30 h-[3.75rem]"
        aria-label="Business navigation"
      >
        <NavLink to="/business" end className={linkClass}><Home className="w-5 h-5" aria-hidden />Home</NavLink>
        <NavLink to="/business/request" className={linkClass}><FilePlus className="w-5 h-5" aria-hidden />Request</NavLink>
        <NavLink to="/business/requests" className={linkClass}><List className="w-5 h-5" aria-hidden />Requests</NavLink>
        <NavLink to="/business/profile" className={linkClass}><User className="w-5 h-5" aria-hidden />Profile</NavLink>
      </nav>
    </div>
  );
}
