import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllRegions, getRegionByUrlSlug, regionPath, regionEncodedPath } from '../../../lib/regions';
import { getIndustryBySlug, industryPath } from '../../../lib/industries';
import { getAllServices, servicePath } from '../../../lib/services';
import { markdownToHtml } from '../../../lib/markdown';
import JsonLd from '../../../components/seo/JsonLd';
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd } from '../../../lib/jsonld';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllRegions().map((d) => ({ slug: d.urlSlug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getRegionByUrlSlug(params.slug);
  if (!doc) return {};
  return {
    title: { absolute: doc.title },
    description: doc.description,
    keywords: doc.keywords,
    alternates: { canonical: regionEncodedPath(doc) },
    openGraph: { title: doc.title, description: doc.description, url: regionEncodedPath(doc) },
    twitter: { title: doc.title, description: doc.description },
  };
}

export default async function RegionPage({ params }: { params: { slug: string } }) {
  const doc = getRegionByUrlSlug(params.slug);
  if (!doc) notFound();

  const html = await markdownToHtml(doc.content);
  const relatedRegions = doc.relatedRegions
    .map((s) => getAllRegions().find((d) => d.slug === s))
    .filter(Boolean);
  const relatedIndustries = doc.relatedIndustries
    .map((s) => getIndustryBySlug(s))
    .filter(Boolean);
  const relatedServices = doc.relatedServices
    .map((s) => getAllServices().find((d) => d.slug === s))
    .filter(Boolean);
  const path = regionEncodedPath(doc);

  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '지역별 홈페이지 제작', path: '/region/' },
              { name: `${doc.name} 홈페이지 제작`, path },
            ]),
            faqPageJsonLd(doc.faq),
            serviceJsonLd({
              name: `${doc.name} 홈페이지 제작`,
              description: doc.description,
              path,
            }),
          ]}
        />

        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href="/region/">지역별 홈페이지 제작</Link>
          <span className="sep">›</span>
          <span>{doc.name}</span>
        </nav>

        <header className="page-header">
          <span className="page-eyebrow">{doc.name}</span>
          <h1>{doc.name} 홈페이지 제작</h1>
          <p className="page-lead">{doc.description}</p>
        </header>

        <section className="content-section">
          <h2>{doc.name} 사장님들이 자주 겪는 고민</h2>
          <ul className="point-list">
            {doc.painPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="content-section">
          <h2>{doc.name} 홈페이지 제작에서 JD8이 챙기는 것</h2>
          <div className="feature-grid">
            {doc.features.map((f, i) => (
              <div className="feature-card" key={i}>
                <h3>{f.name}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <section className="content-section">
          <h2>{doc.name} 홈페이지 제작 자주 묻는 질문</h2>
          <div className="static-faq">
            {doc.faq.map((f, i) => (
              <div className="qa" key={i}>
                <h3>Q. {f.q}</h3>
                <p>A. {f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {(relatedRegions.length > 0 || relatedIndustries.length > 0 || relatedServices.length > 0) && (
          <section className="content-section">
            <h2>함께 보면 좋은 페이지</h2>
            <div className="related-grid">
              {relatedRegions.map((r: any) => (
                <Link key={r.slug} href={regionPath(r)}>
                  {r.name} 홈페이지 제작
                  <span>지역</span>
                </Link>
              ))}
              {relatedServices.map((s: any) => (
                <Link key={s.slug} href={servicePath(s)}>
                  {s.name}
                  <span>제작 서비스</span>
                </Link>
              ))}
              {relatedIndustries.map((r: any) => (
                <Link key={r.slug} href={industryPath(r)}>
                  {r.name} 홈페이지 제작
                  <span>{r.categoryName}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="cta-banner">
          <h2>{doc.name}에서 홈페이지가 필요하신가요?</h2>
          <p>상담부터 완성까지 전 과정 비대면으로 진행 가능합니다. 평균 7일, 30만원부터.</p>
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
