import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import Motion from '../components/Motion';
import JsonLd from '../components/JsonLd';
import { organizationJsonLd, webSiteJsonLd } from '../lib/jsonld';
import { SITE, SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION, COMPANY, LANDING, INDEXABLE, ogMeta } from '../lib/site';
import { INDUSTRY_HUB, GUIDE_HUB } from '../lib/content';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  robots: { index: INDEXABLE, follow: INDEXABLE },
  alternates: LANDING ? { canonical: '/' } : { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
  icons: { icon: '/favicon.svg' },
  ...ogMeta(DEFAULT_TITLE, DEFAULT_DESCRIPTION, '/'),
};

export const viewport: Viewport = { themeColor: '#ffffff', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={SITE.theme || undefined}>
      <body>
        {!LANDING && <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />}
        <header className="hd">
          <div className="wrap hd-in">
            {SITE.key === 'fortune' ? (
              <Link href="/" className="logo logo-f" aria-label="포춘마케팅">
                <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                  <path d="M15 15C15 9 11.5 5 8 5S3 8.5 5 11.5 11 15 15 15Z" fill="currentColor" />
                  <path d="M15 15c6 0 10-3.5 10-7s-3.5-5-6.5-3S15 11 15 15Z" fill="currentColor" opacity=".72" />
                  <path d="M15 15c0 6 3.5 10 7 10s5-3.5 3-6.5S19 15 15 15Z" fill="currentColor" />
                  <path d="M15 15c-6 0-10 3.5-10 7s3.5 5 6.5 3S15 19 15 15Z" fill="currentColor" opacity=".72" />
                </svg>
                <span>포춘<i>마케팅</i></span>
              </Link>
            ) : (
              <Link href="/" className="logo">
                <b>{SITE.logoMark}</b> {SITE.logoText}
              </Link>
            )}
            <nav className="nav" aria-label="주 메뉴">
              <Link href="/#why">왜 필요한가</Link>
              <Link href="/#cases">사례</Link>
              {LANDING ? (
                <Link href="/#faq">자주 묻는 질문</Link>
              ) : (
                <>
                  <a href="/제작/">홈페이지 제작</a>
                  <Link href={INDUSTRY_HUB}>업종별</Link>
                  <Link href={GUIDE_HUB}>가이드</Link>
                  <a href="https://jd8.co.kr/#portfolio" target="_blank" rel="noopener noreferrer">제작 레퍼런스</a>
                </>
              )}
              <a className="tel" href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="ft">
          <div className="wrap ft-in">
            {LANDING ? (
              <div>
                <p><b>{COMPANY.legalName}</b></p>
                <p>전화 {COMPANY.phone}</p>
                <p>© {SITE_NAME}</p>
              </div>
            ) : (
              <>
                <div>
                  <p>
                    <b>{COMPANY.legalName}</b> · 대표 {COMPANY.ceo} · 사업자등록번호 {COMPANY.bizNumber}
                  </p>
                  <p>{COMPANY.address} · 전화 {COMPANY.phone}</p>
                  <p>© JD8. {SITE_NAME}</p>
                </div>
                <div>
                  <Link href="/about/">JD8 소개</Link>
                  <a href="https://jd8.co.kr/">홈페이지 제작 jd8.co.kr</a>
                  <a href="https://ad.jd8.co.kr/">마케팅 대행 ad.jd8.co.kr</a>
                </div>
              </>
            )}
          </div>
        </footer>
        <div className="sticky">
          <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a>
          <a href={COMPANY.kakao} target="_blank" rel="noopener noreferrer">카톡 문의</a>
        </div>
        <div className="float" aria-label="빠른 문의">
          <a className="float-kakao" href={COMPANY.kakao} target="_blank" rel="noopener noreferrer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.8-.8 2.9-.9 3.3 0 .3.1.4.4.3.4-.1 3-2 4-2.7.6.1 1.2.1 1.8.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" /></svg>
            <span>카톡 문의</span>
          </a>
          <a className="float-tel" href={`tel:${COMPANY.phone}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
            <span>{COMPANY.phone}</span>
          </a>
        </div>
        {/* 운영 대시보드용: 전화·문자·카톡 링크 클릭을 같은 사이트 /_t 로 기록 (종류와 경로만, 외부 전송 없음) */}
        <script dangerouslySetInnerHTML={{ __html: "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'',k=h.indexOf('tel:')===0?'tel':h.indexOf('sms:')===0?'sms':/kakao/.test(h)?'kakao':'';if(k&&navigator.sendBeacon)navigator.sendBeacon('/_t?e='+k+'&p='+encodeURIComponent(location.pathname))},true)" }} />
        <Motion />
      </body>
    </html>
  );
}
