import type { Metadata, Viewport } from 'next';
import './App.css';
import './content-pages.css';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import FloatingButtons from '../components/landing/FloatingButtons';
import JsonLd from '../components/seo/JsonLd';
import { organizationJsonLd, webSiteJsonLd } from '../lib/jsonld';
import { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION, OG_IMAGE } from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | JD8 홈페이지 제작',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ['홈페이지 제작', '웹사이트 제작', '랜딩페이지', '반응형 웹', '저렴한 홈페이지', '소상공인 홈페이지', 'JD8'],
  authors: [{ name: 'JD8 에이전시' }],
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ko_KR',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    images: [OG_IMAGE],
  },
  verification: {
    google: 'JyLUKf4DE-twbixJUybfWGZUKQkyyh6NCZevQ_DXIHg',
    other: {
      'naver-site-verification': 'e95832867ecbbf1c7626564095e30135bbfc5aa2',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        <Header />
        {children}
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}
