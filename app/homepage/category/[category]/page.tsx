import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActiveCategories, getCategory, getIndustriesByCategory } from '../../../../lib/industries';
import JsonLd from '../../../../components/seo/JsonLd';
import { breadcrumbJsonLd } from '../../../../lib/jsonld';

export const dynamicParams = false;

export function generateStaticParams() {
  return getActiveCategories().map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const cat = getCategory(params.category);
  if (!cat) return {};
  return {
    title: `${cat.name} 홈페이지 제작 - 업종별 가이드`,
    description: `${cat.name} 업종 홈페이지 제작 가이드. ${cat.description}`,
    alternates: { canonical: `/homepage/category/${cat.slug}/` },
    openGraph: {
      title: `${cat.name} 홈페이지 제작 | JD8`,
      description: cat.description,
      url: `/homepage/category/${cat.slug}/`,
    },
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = getCategory(params.category);
  if (!cat) notFound();
  const industries = getIndustriesByCategory(cat.slug);

  return (
    <main className="content-page">
      <div className="content-container wide">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: '홈', path: '/' },
            { name: '업종별 홈페이지 제작', path: '/homepage/' },
            { name: cat.name, path: `/homepage/category/${cat.slug}/` },
          ])}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href="/homepage/">업종별 홈페이지 제작</Link>
          <span className="sep">›</span>
          <span>{cat.name}</span>
        </nav>

        <header className="page-header">
          <span className="page-eyebrow">{cat.name}</span>
          <h1>{cat.name} 홈페이지 제작</h1>
          <p className="page-lead">{cat.description}</p>
        </header>

        <section className="category-block">
          <h2>업종을 선택하세요</h2>
          <p className="category-desc">
            {cat.name} 분야 {industries.length}개 업종의 홈페이지 제작 가이드를 제공합니다.
            업종별로 필수 기능, 디자인 포인트, 제작 사례와 FAQ를 확인할 수 있습니다.
          </p>
          <div className="industry-grid">
            {industries.map((ind) => (
              <Link key={ind.slug} href={`/homepage/${ind.slug}/`}>
                {ind.name}
              </Link>
            ))}
          </div>
        </section>

        <div className="cta-banner">
          <h2>{cat.name} 홈페이지, 얼마나 걸릴까요?</h2>
          <p>평균 7일, 합리적인 가격으로 제작해드립니다. 부담 없이 견적부터 확인해보세요.</p>
          <div className="cta-actions">
            <a href="/#contact" className="primary">무료 상담 신청</a>
            <a href="http://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="ghost">카톡 문의</a>
          </div>
        </div>
      </div>
    </main>
  );
}
