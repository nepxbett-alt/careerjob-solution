import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, FileText, Building2, Calendar, Award, Wallet, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const items = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/candidates', label: 'Candidates', icon: Users },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/applications', label: 'Applications', icon: FileText },
  { to: '/admin/businesses', label: 'Businesses', icon: Building2 },
  { to: '/admin/interviews', label: 'Interviews', icon: Calendar },
  { to: '/admin/placements', label: 'Placements', icon: Award },
  { to: '/admin/accounting', label: 'Accounting', icon: Wallet },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="hidden md:flex w-56 flex-col bg-slate-900 text-white">
        <div className="h-14 flex items-center px-4 font-bold border-b border-slate-700">CareerJob Admin</div>
        <nav className="flex-1 py-4 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/50'}`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
          {profile?.full_name || profile?.email}<br />
          <button onClick={() => signOut()} className="mt-1 text-slate-300 hover:text-white">Logout</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b flex items-center justify-between px-4 md:px-6">
          <span className="font-semibold text-gray-800 md:hidden">CareerJob Admin</span>
          <span className="text-sm text-gray-500 capitalize">{profile?.role}</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
