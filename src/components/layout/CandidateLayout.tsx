import { Outlet, NavLink } from 'react-router-dom';
import { Home, Briefcase, FileText, User, Bookmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/cn';

export default function CandidateLayout() {
  const { signOut } = useAuth();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium min-w-[56px] min-h-[48px] px-1 rounded-lg transition-colors',
      isActive ? 'text-[#0066FF]' : 'text-slate-500 hover:text-slate-800'
    );

  return (
    <div className="min-h-screen pb-[calc(3.75rem+env(safe-area-inset-bottom))] bg-slate-50">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 h-12 flex items-center justify-between px-4">
        <span className="font-semibold text-[#0066FF] tracking-tight">CareerJob</span>
        <button type="button" onClick={() => signOut()} className="text-sm text-slate-500 hover:text-slate-800 py-2 px-1">
          Log out
        </button>
      </header>
      <main className="max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around items-center safe-bottom z-30 h-[3.75rem]"
        aria-label="Candidate navigation"
      >
        <NavLink to="/candidate" end className={linkClass}><Home className="w-5 h-5" aria-hidden />Home</NavLink>
        <NavLink to="/jobs" className={linkClass}><Briefcase className="w-5 h-5" aria-hidden />Jobs</NavLink>
        <NavLink to="/candidate/applications" className={linkClass}><FileText className="w-5 h-5" aria-hidden />Apps</NavLink>
        <NavLink to="/candidate/saved" className={linkClass}><Bookmark className="w-5 h-5" aria-hidden />Saved</NavLink>
        <NavLink to="/candidate/profile" className={linkClass}><User className="w-5 h-5" aria-hidden />Profile</NavLink>
      </nav>
    </div>
  );
}
