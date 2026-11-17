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

export const serviceJsonLd = (opts: {
  name: string;
  description: string;
  path: string;
  area?: { name: string; containedIn: string }; // 지역 서비스: Place + 상위 행정구역
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: opts.name,
  description: opts.description,
  url: `${SITE_URL}${opts.path}`,
  areaServed: opts.area
    ? {
        '@type': 'Place',
        name: opts.area.name,
        containedInPlace: { '@type': 'AdministrativeArea', name: opts.area.containedIn },
      }
    : { '@type': 'Country', name: '대한민국' },
  provider: { '@id': `${SITE_URL}/#organization` },
});

// 캐러셀 후보. image는 실제 콘텐츠 썸네일일 때만 — 로고/기본 이미지를 넣으면 심사 탈락
export const itemListJsonLd = (name: string, items: { name: string; url: string; image?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: items.slice(0, 20).map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
    ...(it.image ? { image: it.image.startsWith('http') ? it.image : `${SITE_URL}${it.image}` } : {}),
  })),
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
