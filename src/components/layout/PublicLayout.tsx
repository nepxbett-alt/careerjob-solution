import { Outlet, Link, useLocation, useMatch } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { WhatsAppButton } from '../WhatsAppButton';
import { BrandLogo } from '../BrandLogo';
import { CONTACT } from '../../lib/config';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/cn';
import { useI18n, LangToggle } from '../../lib/i18n';


function JobAwareFloatingWhatsApp() {
  const match = useMatch('/jobs/:id');
  const [job, setJob] = useState<{ id: string; title?: string | null; location?: string | null; location_detail?: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!match?.params.id) {
      setJob(null);
      return;
    }
    const id = match.params.id;
    // Public safe fields only
    import('../../services/jobService').then(({ getJobById }) => {
      getJobById(id)
        .then((j) => {
          if (!cancelled && j) {
            setJob({
              id: j.id,
              title: j.title,
              location: j.location,
              location_detail: j.location_detail,
            });
          }
        })
        .catch(() => {
          if (!cancelled) setJob({ id });
        });
    });
    return () => {
      cancelled = true;
    };
  }, [match?.params.id]);

  return (
    <WhatsAppButton
      floating
      job={job}
      source={job ? 'floating_job_detail' : 'floating_global'}
    />
  );
}


export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { t } = useI18n();

  const nav = [
    { to: '/jobs', label: 'Jobs' },
    { to: '/#categories', label: 'Categories' },
    { to: '/#areas', label: 'Locations' },
    { to: '/candidate/cv', label: 'CV' },
    { to: '/contact', label: t('nav_contact') },
  ];

  const dashPath =
    profile?.role === 'candidate' ? '/candidate' :
    profile?.role === 'business' ? '/business' :
    profile?.role && ['owner', 'admin', 'recruiter', 'staff', 'accountant', 'viewer'].includes(profile.role)
      ? '/admin' : '/candidate';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="cj-container h-14 flex items-center justify-between gap-3">
          <BrandLogo size="sm" className="min-w-0" />

          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main">
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

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <LangToggle className="hidden sm:inline-flex mr-1" />
            <a
              href={`tel:${CONTACT.primaryPhone}`}
              className="p-2.5 rounded-lg text-slate-600 hover:text-[#0066FF] hover:bg-slate-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Call CareerJob"
            >
              <Phone className="w-5 h-5" />
            </a>
            {user ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link to={dashPath} className="text-sm font-semibold text-[#0066FF] px-2.5 py-2 rounded-lg hover:bg-[#E8F1FF]">
                  Dashboard
                </Link>
                <button type="button" onClick={() => signOut()} className="text-sm text-slate-500 hover:text-slate-800 px-2 py-2">
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex text-sm font-semibold text-[#0066FF] px-3 py-2 rounded-lg hover:bg-[#E8F1FF]"
              >
                {t('nav_login')}
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
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-2 space-y-0.5" role="dialog">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block py-3 px-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 min-h-[44px]"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={dashPath} onClick={() => setOpen(false)} className="block py-3 px-2 text-sm font-semibold text-[#0066FF]">
                  Dashboard
                </Link>
                <button type="button" onClick={() => { signOut(); setOpen(false); }} className="block w-full text-left py-3 px-2 text-sm text-slate-500">
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block py-3 px-2 text-sm font-semibold text-[#0066FF]">
                {t('nav_login')}
              </Link>
            )}
            <div className="py-3 px-2">
              <LangToggle />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#E8ECF1] bg-[#F7F9FC]">
        <div className="cj-container py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div>
            <BrandLogo size="sm" className="mb-3" />
            <p className="text-[#3D4A5C] leading-relaxed text-[0.9rem]">
              Find jobs. Build your career.
            </p>
            <p className="text-xs text-[#6B7789] mt-3">{CONTACT.address}</p>
            <p className="text-xs text-[#6B7789]">Phone: {CONTACT.phones.join(' / ')}</p>
          </div>
          <div>
            <div className="font-semibold text-[#0B1220] mb-2">Jobseekers</div>
            <div className="space-y-1.5 text-[#3D4A5C]">
              <Link to="/jobs" className="block hover:text-[#0066FF]">Find Jobs</Link>
              <Link to="/register" className="block hover:text-[#0066FF]">Create Profile</Link>
              <Link to="/candidate/cv" className="block hover:text-[#0066FF]">Create CV</Link>
              <Link to="/candidate/applications" className="block hover:text-[#0066FF]">My Applications</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-[#0B1220] mb-2">Employers</div>
            <div className="space-y-1.5 text-[#3D4A5C]">
              <Link to="/contact" className="block hover:text-[#0066FF]">Contact CareerJob to hire</Link>
              <Link to="/about" className="block hover:text-[#0066FF]">About our agency</Link>
              <a href={`https://wa.me/${CONTACT.whatsapp}`} className="block hover:text-[#0066FF]" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>
          <div>
            <div className="font-semibold text-[#0B1220] mb-2">Company</div>
            <div className="space-y-1.5 text-[#3D4A5C]">
              <Link to="/about" className="block hover:text-[#0066FF]">About CareerJob</Link>
              <Link to="/contact" className="block hover:text-[#0066FF]">Contact</Link>
              <Link to="/how-it-works" className="block hover:text-[#0066FF]">How it works</Link>
              <Link to="/privacy" className="block hover:text-[#0066FF]">Privacy</Link>
              <Link to="/terms" className="block hover:text-[#0066FF]">Terms</Link>
            </div>
          </div>
        </div>
        <div className="cj-container pb-8 pt-2 border-t border-[#E8ECF1] text-center text-xs text-[#6B7789]">
          © {new Date().getFullYear()} CareerJob Solution · Pokhara, Nepal
        </div>
      </footer>

      <JobAwareFloatingWhatsApp />
    </div>
  );
}
