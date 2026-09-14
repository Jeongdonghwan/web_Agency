import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllServices, servicePath } from '../../lib/services';
import JsonLd from '../../components/seo/JsonLd';
import { breadcrumbJsonLd } from '../../lib/jsonld';

export const metadata: Metadata = {
  title: '제작 서비스 안내 - 랜딩페이지부터 쇼핑몰까지',
  description:
    '랜딩페이지 제작, 회사소개 홈페이지, 쇼핑몰, 홈페이지 리뉴얼까지 — 목적별 제작 서비스의 구성과 비용을 안내합니다. JD8은 모든 서비스를 30만원부터, 평균 7일 안에 제작합니다.',
  alternates: { canonical: '/service/' },
  openGraph: {
    title: '제작 서비스 안내 | JD8',
    description: '랜딩페이지, 회사소개, 쇼핑몰, 리뉴얼 — 목적별 제작 서비스 안내.',
    url: '/service/',
  },
};

export default function ServiceHubPage() {
  const services = getAllServices();

  return (
    <main className="content-page">
      <div className="content-container wide">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: '홈', path: '/' },
            { name: '제작 서비스', path: '/service/' },
          ])}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <span>제작 서비스</span>
        </nav>

        <header className="page-header">
          <span className="page-eyebrow">SERVICES</span>
          <h1>목적별 제작 서비스</h1>
          <p className="page-lead">
            같은 홈페이지라도 목적에 따라 설계가 다릅니다. 광고를 돌릴 랜딩페이지, 회사의 얼굴이 될
            공식 홈페이지, 판매가 목적인 쇼핑몰 — 필요한 서비스를 선택해 구성과 비용을 확인해보세요.
          </p>
        </header>

        <div className="post-list">
          {services.map((s) => (
            <Link key={s.slug} href={servicePath(s)} className="post-card">
              <h2>{s.name}</h2>
              <p>{s.description}</p>
            </Link>
          ))}
        </div>

        <div className="cta-banner">
          <h2>어떤 유형이 맞는지 모르겠다면</h2>
          <p>목적만 말씀해주세요. 상담에서 가장 합리적인 구성을 제안해드립니다.</p>
          <div className="cta-actions">
            <a href="/#contact" className="primary">무료 상담 신청</a>
            <a href="http://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="ghost">카톡 문의</a>
          </div>
        </div>
      </div>
    </main>
  );
}
