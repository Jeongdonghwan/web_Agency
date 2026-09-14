import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllRegions, regionPath } from '../../lib/regions';
import JsonLd from '../../components/seo/JsonLd';
import { breadcrumbJsonLd } from '../../lib/jsonld';

export const metadata: Metadata = {
  title: '지역별 홈페이지 제작 - 서울·경기·전국 주요 도시',
  description:
    '서울 전 지역과 경기 주요 도시, 광역시까지 — 지역별 홈페이지 제작 안내. 상담부터 완성까지 비대면으로 진행되어 전국 어디서든 평균 7일 안에 받아보실 수 있습니다.',
  alternates: { canonical: '/region/' },
  openGraph: {
    title: '지역별 홈페이지 제작 | JD8',
    description: '서울·경기·전국 주요 도시 홈페이지 제작 안내.',
    url: '/region/',
  },
};

// 표시 그룹: slug 접두로 구분하지 않고 name 기준 정렬된 전체 목록을 시·도 그룹으로 묶는다
const GROUPS: { label: string; match: (slug: string) => boolean }[] = [
  { label: '서울', match: (s) => s.startsWith('seoul-') },
  { label: '경기·인천', match: (s) => s.startsWith('gg-') },
  { label: '전국 주요 도시', match: (s) => s.startsWith('city-') },
];

export default function RegionHubPage() {
  const regions = getAllRegions();

  return (
    <main className="content-page">
      <div className="content-container wide">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: '홈', path: '/' },
            { name: '지역별 홈페이지 제작', path: '/region/' },
          ])}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <span>지역별 홈페이지 제작</span>
        </nav>

        <header className="page-header">
          <span className="page-eyebrow">REGIONS</span>
          <h1>지역별 홈페이지 제작</h1>
          <p className="page-lead">
            JD8은 상담·시안·검수·전달까지 전 과정을 비대면으로 진행해 전국 어디서든 같은 품질로
            제작해드립니다. 지역 상권과 업종 분포에 맞는 구성이 다르기에, 지역별 가이드를 준비했습니다.
          </p>
        </header>

        {GROUPS.map((g) => {
          const list = regions.filter((r) => g.match(r.slug));
          if (list.length === 0) return null;
          return (
            <section className="category-block" key={g.label}>
              <h2>{g.label}</h2>
              <div className="industry-grid">
                {list.map((r) => (
                  <Link key={r.slug} href={regionPath(r)}>
                    {r.name}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <div className="cta-banner">
          <h2>우리 지역이 없어도 걱정 마세요</h2>
          <p>전국 어디든 제작 가능합니다. 부담 없이 문의해주세요.</p>
          <div className="cta-actions">
            <a href="/#contact" className="primary">무료 상담 신청</a>
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="ghost">카톡 문의</a>
          </div>
        </div>
      </div>
    </main>
  );
}
