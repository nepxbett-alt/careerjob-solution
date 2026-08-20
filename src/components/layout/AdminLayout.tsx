import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Briefcase, FileText, Building2,
  Calendar, Award, Wallet, Settings, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/cn';
import { BrandLogo } from '../BrandLogo';

const items = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/walk-in', label: 'Walk-in', icon: UserPlus },
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
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-2.5 text-sm min-h-[44px]',
              isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/50'
            )
          }
        >
          <item.icon className="w-4 h-4 shrink-0" aria-hidden />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col bg-slate-900 text-white shrink-0">
        <div className="h-14 flex items-center px-3 border-b border-slate-700 gap-2">
          <BrandLogo to="/admin" size="sm" showWordmark={false} className="brightness-0 invert" />
          <span className="font-semibold tracking-tight text-sm">Admin</span>
        </div>
        {nav}
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
          <div className="text-slate-300 truncate">{profile?.full_name || profile?.email}</div>
          <div className="capitalize mt-0.5">{profile?.role}</div>
          <button type="button" onClick={() => signOut()} className="mt-2 text-slate-300 hover:text-white">
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="md:hidden p-2 -ml-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-semibold text-slate-800 md:hidden">Admin</span>
          </div>
          <span className="text-sm text-slate-500 capitalize">{profile?.role}</span>
        </header>

        {open && (
          <div className="md:hidden fixed inset-0 z-30 bg-slate-900/50" onClick={() => setOpen(false)}>
            <div
              className="w-64 max-w-[80vw] h-full bg-slate-900 text-white flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-14 flex items-center px-3 border-b border-slate-700 gap-2">
                <img src="/logo.png" alt="" className="h-8 w-8 object-contain brightness-0 invert" />
                <span className="font-semibold text-sm">Admin</span>
              </div>
              {nav}
              <button type="button" onClick={() => signOut()} className="p-4 text-left text-sm text-slate-300 border-t border-slate-700">
                Log out
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
