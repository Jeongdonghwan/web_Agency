import type { Metadata, Viewport } from 'next';
import './App.css';
import './content-pages.css';
import './landing.css';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import FloatingButtons from '../components/landing/FloatingButtons';
import ScrollProgress from '../components/landing/ScrollProgress';
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
  alternates: { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
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
        <ScrollProgress />
        <Header />
        {children}
        <Footer />
        <FloatingButtons />
        {/* 운영 대시보드용: 전화·문자·카톡 링크 클릭을 같은 사이트 /_t 로 기록 (종류와 경로만, 외부 전송 없음) */}
        <script dangerouslySetInnerHTML={{ __html: "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'',k=h.indexOf('tel:')===0?'tel':h.indexOf('sms:')===0?'sms':/kakao/.test(h)?'kakao':'';if(k&&navigator.sendBeacon)navigator.sendBeacon('/_t?e='+k+'&p='+encodeURIComponent(location.pathname))},true)" }} />
      </body>
    </html>
  );
}
