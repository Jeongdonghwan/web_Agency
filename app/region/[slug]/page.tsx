import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllRegions, getRegionByUrlSlug, regionPath, regionEncodedPath } from '../../../lib/regions';
import {
  getAllDongs,
  getDongByUrlSlug,
  getDongsByRegionSlug,
  buildDongContent,
  dongPath,
  dongEncodedPath,
} from '../../../lib/dongs';
import { getIndustryBySlug, industryPath } from '../../../lib/industries';
import { getAllServices, servicePath } from '../../../lib/services';
import { markdownToHtml } from '../../../lib/markdown';
import JsonLd from '../../../components/seo/JsonLd';
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd } from '../../../lib/jsonld';

export const dynamicParams = false;

// 시/구 단위(md) 50개 + 서울 동 단위(데이터) 217개를 같은 라우트에서 생성
export function generateStaticParams() {
  return [
    ...getAllRegions().map((d) => ({ slug: d.urlSlug })),
    ...getAllDongs().map((d) => ({ slug: d.urlSlug })),
  ];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = getRegionByUrlSlug(params.slug);
  if (doc) {
    return {
      title: { absolute: doc.title },
      description: doc.description,
      keywords: doc.keywords,
      alternates: { canonical: regionEncodedPath(doc) },
      openGraph: { title: doc.title, description: doc.description, url: regionEncodedPath(doc) },
      twitter: { title: doc.title, description: doc.description },
    };
  }
  const dong = getDongByUrlSlug(params.slug);
  if (!dong) return {};
  const c = buildDongContent(dong);
  return {
    title: { absolute: c.title },
    description: c.description,
    keywords: [`${dong.dong} 홈페이지제작`, `${dong.dong} 홈페이지 제작`, `${dong.gu} 홈페이지제작`, `${dong.dong} 웹사이트 제작`],
    alternates: { canonical: dongEncodedPath(dong) },
    openGraph: { title: c.title, description: c.description, url: dongEncodedPath(dong) },
    twitter: { title: c.title, description: c.description },
  };
}

export default async function RegionPage({ params }: { params: { slug: string } }) {
  const doc = getRegionByUrlSlug(params.slug);
  if (doc) return <RegionMdPage doc={doc} />;
  const dong = getDongByUrlSlug(params.slug);
  if (!dong) notFound();
  return <DongPage dong={dong} />;
}

/* ===== 시/구 단위 페이지 (기존 md 기반) ===== */
async function RegionMdPage({ doc }: { doc: any }) {
  const html = await markdownToHtml(doc.content);
  const relatedRegions = doc.relatedRegions
    .map((s: string) => getAllRegions().find((d) => d.slug === s))
    .filter(Boolean);
  const relatedIndustries = doc.relatedIndustries
    .map((s: string) => getIndustryBySlug(s))
    .filter(Boolean);
  const relatedServices = doc.relatedServices
    .map((s: string) => getAllServices().find((d) => d.slug === s))
    .filter(Boolean);
  const dongs = getDongsByRegionSlug(doc.slug); // 서울 구 페이지면 관할 동 목록
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
            {doc.painPoints.map((p: string, i: number) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="content-section">
          <h2>{doc.name} 홈페이지 제작에서 JD8이 챙기는 것</h2>
          <div className="feature-grid">
            {doc.features.map((f: any, i: number) => (
              <div className="feature-card" key={i}>
                <h3>{f.name}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {dongs.length > 0 && (
          <section className="content-section">
            <h2>{dongs[0].gu} 동별 홈페이지제작 안내</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: 16 }}>
              동 단위 상권에 맞춘 안내 페이지입니다. 우리 동네를 선택해보세요.
            </p>
            <div className="industry-grid">
              {dongs.map((d) => (
                <Link key={d.urlSlug} href={dongPath(d)}>
                  {d.dong}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="content-section">
          <h2>{doc.name} 홈페이지 제작 자주 묻는 질문</h2>
          <div className="static-faq">
            {doc.faq.map((f: any, i: number) => (
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
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="ghost">카톡 문의</a>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ===== 동 단위 페이지 (데이터 조합 기반) ===== */
function DongPage({ dong }: { dong: any }) {
  const c = buildDongContent(dong);
  const guRegion = getAllRegions().find((r) => r.slug === dong.guRegionSlug);
  const industries = dong.industries
    .map((s: string) => getIndustryBySlug(s))
    .filter(Boolean);
  const path = dongEncodedPath(dong);

  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '지역별 홈페이지 제작', path: '/region/' },
              ...(guRegion ? [{ name: `${guRegion.name} 홈페이지 제작`, path: regionEncodedPath(guRegion) }] : []),
              { name: `${dong.dong} 홈페이지제작`, path },
            ]),
            faqPageJsonLd(c.faq),
            serviceJsonLd({
              name: `${dong.dong} 홈페이지제작`,
              description: c.description,
              path,
              area: { name: dong.dong, containedIn: dong.containedIn },
            }),
          ]}
        />

        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href="/region/">지역별 홈페이지 제작</Link>
          <span className="sep">›</span>
          {guRegion && (
            <>
              <Link href={regionPath(guRegion)}>{guRegion.name}</Link>
              <span className="sep">›</span>
            </>
          )}
          <span>{dong.dong}</span>
        </nav>

        <header className="page-header">
          <span className="page-eyebrow">{dong.regionLabel}</span>
          <h1>{dong.dong} 홈페이지제작</h1>
          <p className="page-lead">{c.description}</p>
        </header>

        {c.paragraphs.map((p, i) => (
          <section className="content-section" key={i}>
            <h2>{p.heading}</h2>
            <p style={{ lineHeight: 1.85, color: 'var(--text)' }}>{p.body}</p>
          </section>
        ))}

        {industries.length > 0 && (
          <section className="content-section">
            <h2>{dong.dong}에서 많이 찾는 업종별 안내</h2>
            <div className="related-grid">
              {industries.map((ind: any) => (
                <Link key={ind.slug} href={industryPath(ind)}>
                  {ind.name} 홈페이지 제작
                  <span>{ind.categoryName}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="content-section">
          <h2>{dong.dong} 홈페이지제작 자주 묻는 질문</h2>
          <div className="static-faq">
            {c.faq.map((f, i) => (
              <div className="qa" key={i}>
                <h3>Q. {f.q}</h3>
                <p>A. {f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="content-section">
          <h2>{dong.gu} 인근 지역 홈페이지제작</h2>
          <div className="industry-grid">
            {guRegion && <Link href={regionPath(guRegion)}>{dong.gu} 전체</Link>}
            {dong.siblings.map((s: any) => (
              <Link key={s.urlSlug} href={`/region/${s.urlSlug}/`}>
                {s.dong}
              </Link>
            ))}
          </div>
        </section>

        <div className="cta-banner">
          <h2>{dong.dong} 홈페이지, 이번 주에 시작하세요</h2>
          <p>상담부터 완성까지 비대면 진행, 평균 7일. 견적 확인은 무료입니다.</p>
          <div className="cta-actions">
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="primary">카톡으로 무료 상담</a>
            <a href="tel:1566-3046" className="ghost">전화 상담 1566-3046</a>
          </div>
        </div>
      </div>
    </main>
  );
}
