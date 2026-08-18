import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';
import { WhatsAppButton } from '../WhatsAppButton';
import { CONTACT, BRAND } from '../../lib/config';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/cn';

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const nav = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/for-businesses', label: 'For businesses' },
    { to: '/how-it-works', label: 'How it works' },
    { to: '/contact', label: 'Contact' },
  ];

  const dashPath =
    profile?.role === 'candidate' ? '/candidate' :
    profile?.role === 'business' ? '/business' :
    '/admin';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80">
        <div className="cj-container h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-slate-900 tracking-tight shrink-0">
            <span className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-sm font-bold shadow-sm">
              C
            </span>
            <span className="hidden sm:inline text-[0.95rem]">{BRAND.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.to
                    ? 'text-[#0066FF] bg-[#E8F1FF]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={`tel:${CONTACT.primaryPhone}`}
              className="p-2.5 rounded-lg text-slate-600 hover:text-[#0066FF] hover:bg-slate-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Call CareerJob"
            >
              <Phone className="w-5 h-5" />
            </a>
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to={dashPath} className="text-sm font-medium text-[#0066FF] px-2 py-1.5 hover:underline">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-sm text-slate-500 hover:text-slate-800 px-2 py-1.5"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex text-sm font-medium text-[#0066FF] px-3 py-2 rounded-lg hover:bg-[#E8F1FF]"
              >
                Log in
              </Link>
            )}
            <button
              type="button"
              className="md:hidden p-2.5 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-0.5" role="dialog" aria-label="Mobile menu">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block py-3 px-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={dashPath} onClick={() => setOpen(false)} className="block py-3 px-2 text-sm font-medium text-[#0066FF]">
                  Dashboard
                </Link>
                <button type="button" onClick={() => { signOut(); setOpen(false); }} className="block w-full text-left py-3 px-2 text-sm text-slate-500">
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block py-3 px-2 text-sm font-medium text-[#0066FF]">
                Log in / Register
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="cj-container py-10 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold text-slate-900 mb-2">{BRAND.name}</div>
            <p className="text-slate-600 leading-relaxed">{BRAND.tagline}</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-2">Contact</div>
            <p className="text-slate-600">{CONTACT.address}</p>
            <p className="text-slate-600 mt-1">Phone: {CONTACT.phones.join(' / ')}</p>
            <p className="text-slate-600">Email: {CONTACT.email}</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-2">Links</div>
            <div className="space-y-1.5">
              <Link to="/jobs" className="block text-slate-600 hover:text-[#0066FF]">Jobs</Link>
              <Link to="/for-businesses" className="block text-slate-600 hover:text-[#0066FF]">Hire staff</Link>
              <Link to="/privacy" className="block text-slate-600 hover:text-[#0066FF]">Privacy</Link>
              <Link to="/terms" className="block text-slate-600 hover:text-[#0066FF]">Terms</Link>
            </div>
          </div>
        </div>
        <div className="cj-container pb-8 pt-2 border-t border-slate-200/80 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CareerJob Solution · Pokhara, Nepal
        </div>
      </footer>

      <WhatsAppButton floating />
    </div>
  );
}
