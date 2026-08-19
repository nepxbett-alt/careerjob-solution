import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, unknown> | null;
  noIndex?: boolean;
};

export function Seo({ title, description, canonical, jsonLd, noIndex }: SeoProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }
    setMeta('og:title', title, true);
    setMeta('twitter:title', title);
    setMeta('og:type', 'website', true);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    const scriptId = 'cj-jsonld';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    if (jsonLd) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = scriptId;
      s.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(s);
    }

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [title, description, canonical, jsonLd, noIndex]);

  return null;
}
