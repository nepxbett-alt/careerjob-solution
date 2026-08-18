import { Outlet, NavLink } from 'react-router-dom';
import { Home, Briefcase, FileText, User, Bookmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function CandidateLayout() {
  const { signOut } = useAuth();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-xs ${isActive ? 'text-[#0066FF]' : 'text-gray-500'}`;

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-12 flex items-center justify-between px-4">
        <span className="font-bold text-[#0066FF]">CareerJob</span>
        <button onClick={() => signOut()} className="text-sm text-gray-500">Logout</button>
      </header>
      <main className="max-w-3xl mx-auto"><Outlet /></main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 safe-bottom z-30">
        <NavLink to="/candidate" end className={linkClass}><Home className="w-5 h-5" />Home</NavLink>
        <NavLink to="/jobs" className={linkClass}><Briefcase className="w-5 h-5" />Jobs</NavLink>
        <NavLink to="/candidate/applications" className={linkClass}><FileText className="w-5 h-5" />Applications</NavLink>
        <NavLink to="/candidate/saved" className={linkClass}><Bookmark className="w-5 h-5" />Saved</NavLink>
        <NavLink to="/candidate/profile" className={linkClass}><User className="w-5 h-5" />Profile</NavLink>
      </nav>
    </div>
  );
}
