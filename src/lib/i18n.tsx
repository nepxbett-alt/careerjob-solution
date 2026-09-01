import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'en' | 'ne';

const dict = {
  en: {
    nav_home: 'Home',
    nav_jobs: 'Jobs',
    nav_business: 'For businesses',
    nav_how: 'How it works',
    nav_contact: 'Contact',
    nav_login: 'Log in',
    hero_title: 'Find your next opportunity',
    hero_sub: 'Browse verified jobs in Pokhara. Apply in about one minute — no account required.',
    search_placeholder: 'Job title or skill…',
    search_btn: 'Search',
    browse_jobs: 'Browse jobs',
    create_cv: 'Create your CV',
    hire_talent: 'Hire talent',
    trust_agency: 'Agency-reviewed applications',
    featured: 'Featured',
    featured_title: 'Open roles in Pokhara',
    see_all: 'See all',
    open_roles: 'Open roles',
    latest_title: 'Latest jobs in Pokhara',
    latest_sub: 'Verified openings · Apply without an account',
    view_all: 'View all',
    view_all_jobs: 'View all jobs',
    empty_jobs: 'New roles are added regularly. Check back soon or message us on WhatsApp.',
    categories: 'Categories',
    how_title: 'How it works',
    how_seeker: 'For job seekers',
    how_employer: 'For employers',
    cv_title: 'Build a better CV',
    cv_sub: 'Create a clear profile once and apply faster.',
    business_title: 'Need great people?',
    business_sub: 'Tell CareerJob what you are hiring for.',
    submit_req: 'Submit hiring requirement',
    whatsapp_help: 'Need help right now?',
    whatsapp_sub: 'Message CareerJob on WhatsApp — jobs, applications, or hiring.',
    chat_wa: 'Chat on WhatsApp',
  },
  ne: {
    nav_home: 'होम',
    nav_jobs: 'जागिर',
    nav_business: 'व्यवसायका लागि',
    nav_how: 'कसरी काम गर्छ',
    nav_contact: 'सम्पर्क',
    nav_login: 'लग इन',
    hero_title: 'आफ्नो अर्को अवसर खोज्नुहोस्',
    hero_sub: 'पोखराका प्रमाणित जागिर हेर्नुहोस्। करिब एक मिनेटमा आवेदन दिनुहोस् — खाता आवश्यक छैन।',
    search_placeholder: 'जागिरको नाम वा सीप…',
    search_btn: 'खोज्नुहोस्',
    browse_jobs: 'जागिर हेर्नुहोस्',
    create_cv: 'CV बनाउनुहोस्',
    hire_talent: 'कर्मचारी खोज्नुहोस्',
    trust_agency: 'एजेन्सीले जाँच गरेका आवेदन',
    featured: 'विशेष',
    featured_title: 'पोखराका खुला पद',
    see_all: 'सबै हेर्नुहोस्',
    open_roles: 'खुला पद',
    latest_title: 'पोखराका नयाँ जागिर',
    latest_sub: 'प्रमाणित पद · बिना खाता आवेदन',
    view_all: 'सबै हेर्नुहोस्',
    view_all_jobs: 'सबै जागिर',
    empty_jobs: 'नयाँ पद नियमित थपिन्छन्। चाँडै फेरि हेर्नुहोस् वा WhatsApp मा सन्देश पठाउनुहोस्।',
    categories: 'श्रेणीहरू',
    how_title: 'कसरी काम गर्छ',
    how_seeker: 'जागिर खोज्नेका लागि',
    how_employer: 'रोजगारदाताका लागि',
    cv_title: 'राम्रो CV बनाउनुहोस्',
    cv_sub: 'एक पटक प्रोफाइल बनाउनुहोस् र छिटो आवेदन दिनुहोस्।',
    business_title: 'राम्रा कर्मचारी चाहिन्छ?',
    business_sub: 'के खोज्दै हुनुहुन्छ भनेर CareerJob लाई बताउनुहोस्।',
    submit_req: 'भर्ती अनुरोध पठाउनुहोस्',
    whatsapp_help: 'अहिले सहयोग चाहियो?',
    whatsapp_sub: 'CareerJob लाई WhatsApp मा सन्देश पठाउनुहोस्।',
    chat_wa: 'WhatsApp मा कुराकानी',
  },
} as const;

type DictKey = keyof typeof dict.en;

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('cj_lang');
      if (saved === 'ne' || saved === 'en') return saved;
    } catch { /* ignore */ }
    return 'en';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('cj_lang', l);
    } catch { /* ignore */ }
  }, []);

  const t = useCallback((key: DictKey) => dict[lang][key] || dict.en[key], [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      lang: 'en' as Lang,
      setLang: () => {},
      t: (key: DictKey) => dict.en[key],
    };
  }
  return ctx;
}

export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`inline-flex items-center rounded-lg border border-slate-200 bg-white text-xs font-semibold overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1.5 min-h-[36px] transition-colors ${lang === 'en' ? 'bg-[#0066FF] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('ne')}
        className={`px-2.5 py-1.5 min-h-[36px] transition-colors ${lang === 'ne' ? 'bg-[#0066FF] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        aria-pressed={lang === 'ne'}
      >
        नेपाली
      </button>
    </div>
  );
}
