import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';
import { WhatsAppButton } from '../WhatsAppButton';
import { CONTACT, BRAND } from '../../lib/config';
import { useAuth } from '../../contexts/AuthContext';

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const nav = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/for-businesses', label: 'For Businesses' },
    { to: '/how-it-works', label: 'How it Works' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
            <span className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-sm font-bold">C</span>
            <span className="hidden sm:inline">{BRAND.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium ${location.pathname === item.to ? 'text-[#0066FF]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={`tel:${CONTACT.primaryPhone}`} className="p-2 text-gray-600 hover:text-[#0066FF]" aria-label="Call">
              <Phone className="w-5 h-5" />
            </a>
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to={
                    profile?.role === 'candidate' ? '/candidate' :
                    profile?.role === 'business' ? '/business' :
                    '/admin'
                  }
                  className="text-sm font-medium text-[#0066FF]"
                >
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-800">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-[#0066FF] hover:underline">
                Login
              </Link>
            )}
            <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block py-2 text-sm font-medium text-gray-700"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/candidate" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-[#0066FF]">Dashboard</Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="block py-2 text-sm text-gray-500">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-[#0066FF]">Login / Register</Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-bold text-gray-900 mb-2">{BRAND.name}</div>
            <p className="text-gray-600">{BRAND.tagline}</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Contact</div>
            <p className="text-gray-600">{CONTACT.address}</p>
            <p className="text-gray-600 mt-1">Phone: {CONTACT.phones.join(' / ')}</p>
            <p className="text-gray-600">Email: {CONTACT.email}</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Quick links</div>
            <div className="space-y-1">
              <Link to="/jobs" className="block text-gray-600 hover:text-[#0066FF]">Jobs</Link>
              <Link to="/for-businesses" className="block text-gray-600 hover:text-[#0066FF]">Hire Staff</Link>
              <Link to="/privacy" className="block text-gray-600 hover:text-[#0066FF]">Privacy</Link>
              <Link to="/terms" className="block text-gray-600 hover:text-[#0066FF]">Terms</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} CareerJob Solution · Pokhara, Nepal
        </div>
      </footer>

      <WhatsAppButton floating />
    </div>
  );
}
