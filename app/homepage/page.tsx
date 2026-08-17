import type { Metadata } from 'next';
import Link from 'next/link';
import { getActiveCategories, getIndustriesByCategory, getAllIndustries } from '../../lib/industries';
import JsonLd from '../../components/seo/JsonLd';
import { breadcrumbJsonLd } from '../../lib/jsonld';

export const metadata: Metadata = {
  title: '업종별 홈페이지 제작 - 우리 업종에 딱 맞는 홈페이지',
  description:
    '카페, 병원, 학원, 법률사무소부터 제조업까지 — 200여 개 업종별 홈페이지 제작 가이드. 업종 특성에 맞는 필수 기능과 디자인, 제작 비용까지 JD8이 안내해드립니다.',
  alternates: { canonical: '/homepage/' },
  openGraph: {
    title: '업종별 홈페이지 제작 | JD8',
    description: '200여 개 업종별 홈페이지 제작 가이드 — 우리 업종에 필요한 기능과 디자인을 확인하세요.',
    url: '/homepage/',
  },
};

export default function IndustryHubPage() {
  const categories = getActiveCategories();
  const total = getAllIndustries().length;

  return (
    <main className="content-page">
      <div className="content-container wide">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: '홈', path: '/' },
            { name: '업종별 홈페이지 제작', path: '/homepage/' },
          ])}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <span>업종별 홈페이지 제작</span>
        </nav>

        <header className="page-header">
          <span className="page-eyebrow">INDUSTRY GUIDE</span>
          <h1>업종별 홈페이지 제작</h1>
          <p className="page-lead">
            홈페이지는 업종마다 담아야 할 내용과 설계가 완전히 다릅니다. 카페는 메뉴와 매장 분위기,
            병원은 진료 안내와 예약, 제조업은 제품 카탈로그와 견적 문의가 핵심이죠.
            JD8은 {total}개 업종의 제작 경험과 연구를 바탕으로 업종별 필수 기능, 디자인 방향,
            자주 묻는 질문을 정리했습니다. 아래에서 해당 업종을 선택해 확인해보세요.
          </p>
        </header>

        {categories.map((cat) => {
          const industries = getIndustriesByCategory(cat.slug);
          return (
            <section className="category-block" key={cat.slug}>
              <h2>
                <Link href={`/homepage/category/${cat.slug}/`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {cat.name}
                </Link>
              </h2>
              <p className="category-desc">{cat.description}</p>
              <div className="industry-grid">
                {industries.map((ind) => (
                  <Link key={ind.slug} href={`/homepage/${ind.slug}/`}>
                    {ind.name}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <div className="cta-banner">
          <h2>내 업종이 목록에 없나요?</h2>
          <p>어떤 업종이든 제작 가능합니다. 무료 상담으로 우리 업종에 맞는 구성을 안내받아 보세요.</p>
          <div className="cta-actions">
            <a href="/#contact" className="primary">무료 상담 신청</a>
            <a href="http://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="ghost">카톡 문의</a>
          </div>
        </div>
      </div>
    </main>
  );
}
