import { SITE_URL, SITE_NAME, COMPANY, OG_IMAGE } from './site';

// JSON-LD 빌더 모음 — 서버 컴포넌트에서만 사용

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: COMPANY.legalName,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}${OG_IMAGE}`,
  telephone: COMPANY.phone,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'KR',
    addressRegion: '경기도',
    addressLocality: '용인시',
    streetAddress: '기흥구 금화로 3, 제이20호',
  },
});

export const webSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: 'ko',
  publisher: { '@id': `${SITE_URL}/#organization` },
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

export const faqPageJsonLd = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const serviceJsonLd = (opts: { name: string; description: string; path: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: opts.name,
  description: opts.description,
  url: `${SITE_URL}${opts.path}`,
  areaServed: { '@type': 'Country', name: '대한민국' },
  provider: { '@id': `${SITE_URL}/#organization` },
});

export const articleJsonLd = (opts: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: opts.title,
  description: opts.description,
  mainEntityOfPage: `${SITE_URL}${opts.path}`,
  image: `${SITE_URL}${opts.image || OG_IMAGE}`,
  datePublished: opts.datePublished,
  dateModified: opts.dateModified,
  inLanguage: 'ko',
  author: { '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
});
