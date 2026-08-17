import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllIndustries,
  getIndustryBySlug,
} from '../../../lib/industries';
import { getPostsByIndustry } from '../../../lib/posts';
import { markdownToHtml } from '../../../lib/markdown';
import { getPortfolioById } from '../../../data/portfolios';
import JsonLd from '../../../components/seo/JsonLd';
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd } from '../../../lib/jsonld';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllIndustries().map((i) => ({ slug: i.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const ind = getIndustryBySlug(params.slug);
  if (!ind) return {};
  return {
    title: { absolute: ind.title },
    description: ind.description,
    keywords: ind.keywords,
    alternates: { canonical: `/homepage/${ind.slug}/` },
    openGraph: {
      title: ind.title,
      description: ind.description,
      url: `/homepage/${ind.slug}/`,
    },
    twitter: {
      title: ind.title,
      description: ind.description,
    },
  };
}

export default async function IndustryPage({ params }: { params: { slug: string } }) {
  const ind = getIndustryBySlug(params.slug);
  if (!ind) notFound();

  const html = await markdownToHtml(ind.content);
  const demos = ind.references.map(getPortfolioById).filter(Boolean);
  const related = ind.relatedIndustries
    .map((slug) => getIndustryBySlug(slug))
    .filter(Boolean);
  const posts = [
    ...new Map(
      getPostsByIndustry(ind.slug).map((p) => [p.slug, p])
    ).values(),
  ].slice(0, 4);

  const path = `/homepage/${ind.slug}/`;

  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '업종별 홈페이지 제작', path: '/homepage/' },
              { name: ind.categoryName, path: `/homepage/category/${ind.category}/` },
              { name: `${ind.name} 홈페이지 제작`, path },
            ]),
            faqPageJsonLd(ind.faq),
            serviceJsonLd({
              name: `${ind.name} 홈페이지 제작`,
              description: ind.description,
              path,
            }),
          ]}
        />

        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href="/homepage/">업종별 홈페이지 제작</Link>
          <span className="sep">›</span>
          <Link href={`/homepage/category/${ind.category}/`}>{ind.categoryName}</Link>
          <span className="sep">›</span>
          <span>{ind.name}</span>
        </nav>

        <header className="page-header">
          <span className="page-eyebrow">{ind.categoryName}</span>
          <h1>{ind.name} 홈페이지 제작</h1>
          <p className="page-lead">{ind.description}</p>
        </header>

        <section className="content-section">
          <h2>{ind.name} 사장님들이 겪는 고민</h2>
          <ul className="point-list">
            {ind.painPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="content-section">
          <h2>{ind.name} 홈페이지 필수 기능</h2>
          <div className="feature-grid">
            {ind.features.map((f, i) => (
              <div className="feature-card" key={i}>
                <h3>{f.name}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {ind.designPoints.length > 0 && (
          <section className="content-section">
            <h2>디자인 포인트</h2>
            <ul className="point-list">
              {ind.designPoints.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>
        )}

        {demos.length > 0 && (
          <section className="content-section">
            <h2>{ind.name} 관련 제작 사례</h2>
            <div className="demo-cards">
              {demos.map((demo: any) => (
                <a key={demo.id} href={demo.link} target="_blank" rel="noopener noreferrer" className="demo-card">
                  <img src={demo.image} alt={`${demo.title} - ${ind.name} 홈페이지 제작 사례`} loading="lazy" />
                  <div className="demo-body">
                    <strong>{demo.title}</strong>
                    <p>{demo.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <section className="content-section">
          <h2>{ind.name} 홈페이지 제작 자주 묻는 질문</h2>
          <div className="static-faq">
            {ind.faq.map((f, i) => (
              <div className="qa" key={i}>
                <h3>Q. {f.q}</h3>
                <p>A. {f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {(related.length > 0 || posts.length > 0) && (
          <section className="content-section">
            <h2>함께 보면 좋은 페이지</h2>
            <div className="related-grid">
              {related.map((r: any) => (
                <Link key={r.slug} href={`/homepage/${r.slug}/`}>
                  {r.name} 홈페이지 제작
                  <span>{r.categoryName}</span>
                </Link>
              ))}
              {posts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}/`}>
                  {p.title}
                  <span>블로그</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="cta-banner">
          <h2>{ind.name} 홈페이지, 지금 시작하세요</h2>
          <p>업종 특성을 이해하는 JD8이 평균 7일 안에 완성해드립니다. 견적 확인은 무료입니다.</p>
          <div className="cta-actions">
            <a href="/#contact" className="primary">무료 상담 신청</a>
            <a href="tel:1566-3046" className="ghost">전화 상담 1566-3046</a>
            <a href="http://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="ghost">카톡 문의</a>
          </div>
        </div>
      </div>
    </main>
  );
}
