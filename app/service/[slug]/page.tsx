import type { Metadata } from 'next';
import { ogMeta } from '../../../lib/site';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllServices, getServiceByUrlSlug, servicePath, serviceEncodedPath } from '../../../lib/services';
import { getIndustryBySlug, getPopularIndustries, industryPath } from '../../../lib/industries';
import { KwH1, KwSummary, ServiceLinks } from '../../../components/seo/Kw';
import { markdownToHtml } from '../../../lib/markdown';
import JsonLd from '../../../components/seo/JsonLd';
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd } from '../../../lib/jsonld';
import TopPromo from '../../../components/blog/TopPromo';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllServices().map((d) => ({ slug: d.urlSlug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getServiceByUrlSlug(params.slug);
  if (!doc) return {};
  return {
    title: { absolute: doc.title },
    description: doc.meta,
    keywords: doc.keywords,
    alternates: { canonical: serviceEncodedPath(doc) },
    ...ogMeta(doc.title, doc.meta, serviceEncodedPath(doc)),
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const doc = getServiceByUrlSlug(params.slug);
  if (!doc) notFound();

  const html = await markdownToHtml(doc.content);
  const relatedServices = doc.relatedServices
    .map((s) => getAllServices().find((d) => d.slug === s))
    .filter(Boolean);
  const relatedIndustries = doc.relatedIndustries
    .map((s) => getIndustryBySlug(s))
    .filter(Boolean);
  const path = serviceEncodedPath(doc);
  const popular = getPopularIndustries(12).filter((i) => !doc.relatedIndustries.includes(i.slug)).slice(0, 8);

  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '제작 서비스', path: '/service/' },
              { name: doc.name, path },
            ]),
            faqPageJsonLd(doc.faq),
            serviceJsonLd({ name: doc.name, description: doc.description, path }),
          ]}
        />

        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href="/service/">제작 서비스</Link>
          <span className="sep">›</span>
          <span>{doc.name}</span>
        </nav>

        <header className="page-header">
          <span className="page-eyebrow">SERVICE</span>
          <KwH1 kw={doc.kw} sub={doc.h1sub} />
          <p className="page-lead">{doc.description}</p>
        </header>
        <TopPromo />
        <KwSummary kw={doc.kw} items={doc.summary} />

        <section className="content-section">
          <h2>{doc.kw}: 이런 상황이라면 필요합니다</h2>
          <ul className="point-list">
            {doc.painPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="content-section">
          <h2>{doc.kw} — 포함되는 구성</h2>
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
          <h2>{doc.kw} 자주 묻는 질문</h2>
          <div className="static-faq">
            {doc.faq.map((f, i) => (
              <div className="qa" key={i}>
                <h3>Q. {f.q}</h3>
                <p>A. {f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {(relatedServices.length > 0 || relatedIndustries.length > 0) && (
          <section className="content-section">
            <h2>함께 보면 좋은 페이지</h2>
            <div className="related-grid">
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

        <ServiceLinks except={doc.slug} />
        <section className="content-section">
          <h2>업종별 홈페이지 제작 안내</h2>
          <div className="industry-grid">
            {popular.map((r) => (
              <Link key={r.slug} href={industryPath(r)}>
                {r.name}
              </Link>
            ))}
          </div>
        </section>

        <div className="cta-banner">
          <h2>{doc.kw}, 견적부터 확인해보세요</h2>
          <p>JD8이 목적에 맞는 구성을 제안하고 평균 7일 안에 완성해드립니다.</p>
          <div className="cta-actions">
            <a href="/#contact" className="primary">무료 상담 신청</a>
            <a href="tel:1566-3046" className="ghost">전화 상담 1566-3046</a>
            <a href="https://pf.kakao.com/_Izxnxgn/chat" target="_blank" rel="noopener noreferrer" className="ghost">카톡 문의</a>
          </div>
        </div>
      </div>
    </main>
  );
}
