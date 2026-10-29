import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ogMeta } from '../../../lib/site';
import {
  getOpenWebdocPages,
  getOpenCore,
  getOpenIndustries,
  getWebdocPage,
  buildIndustryContent,
  webdocPath,
  webdocEncodedPath,
  webdocOg,
  pageName,
  WEBDOC_HUB,
  type CoreDoc,
  type IndustryDoc,
  type WebdocPage,
} from '../../../lib/webdoc';
import { markdownToHtml } from '../../../lib/markdown';
import { getAllIndustries, industryPath } from '../../../lib/industries';
import JsonLd from '../../../components/seo/JsonLd';
import PageCalculator from '../../../components/webdoc/PageCalculator';
import SerpMock from '../../../components/webdoc/SerpMock';
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd, itemListJsonLd } from '../../../lib/jsonld';

export const dynamicParams = false;

export function generateStaticParams() {
  return getOpenWebdocPages().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getWebdocPage(params.slug);
  if (!p) return {};
  const m = p.kind === 'core' ? p : buildIndustryContent(p);
  const path = webdocEncodedPath(p.slug);
  return {
    title: { absolute: m.title },
    description: m.description,
    keywords: m.keywords,
    alternates: { canonical: path },
    ...ogMeta(m.title, m.description, path, {}, webdocOg(p.slug)),
  };
}

const card = (p: WebdocPage) => ({ name: pageName(p), url: webdocPath(p.slug), image: webdocOg(p.slug) });

export default async function WebdocPage({ params }: { params: { slug: string } }) {
  const p = getWebdocPage(params.slug);
  if (!p) notFound();
  return p.kind === 'core' ? <CorePage doc={p as CoreDoc & WebdocPage} /> : <IndustryPage ind={p as IndustryDoc & WebdocPage} />;
}

function Crumbs({ name }: { name: string }) {
  return (
    <nav className="breadcrumb" aria-label="브레드크럼">
      <Link href="/">홈</Link>
      <span className="sep">›</span>
      <Link href={WEBDOC_HUB}>웹문서 대량제작</Link>
      <span className="sep">›</span>
      <span>{name}</span>
    </nav>
  );
}

function Summary({ items }: { items: string[] }) {
  return (
    <aside className="wd-summary" aria-label="핵심 요약">
      <strong>핵심 요약</strong>
      <ul>
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </aside>
  );
}

function Faq({ title, faq }: { title: string; faq: { q: string; a: string }[] }) {
  return (
    <section className="content-section">
      <h2>{title}</h2>
      <div className="static-faq">
        {faq.map((f) => (
          <div className="qa" key={f.q}>
            <h3>Q. {f.q}</h3>
            <p>A. {f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Cta({ title, text }: { title: string; text?: string }) {
  return (
    <div className="cta-banner">
      <h2>{title}</h2>
      <p>{text || '영업 지역과 서비스만 알려주시면 페이지 구성안을 먼저 보여드립니다. 전 과정 비대면.'}</p>
      <div className="cta-actions">
        <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="primary">카톡으로 구성안 받기</a>
        <a href="tel:1566-3046" className="ghost">전화 상담 1566-3046</a>
      </div>
    </div>
  );
}

function RelatedGrid({ title, pages }: { title: string; pages: WebdocPage[] }) {
  if (!pages.length) return null;
  return (
    <section className="content-section">
      <h2>{title}</h2>
      <div className="related-grid">
        {pages.map((r) => (
          <Link key={r.slug} href={webdocPath(r.slug)}>
            {pageName(r)}
            <span>{r.kind === 'core' ? '웹문서 제작' : r.group}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ===== 핵심 페이지 (content/webdoc/*.md) ===== */
async function CorePage({ doc }: { doc: CoreDoc & WebdocPage }) {
  const html = await markdownToHtml(doc.content);
  const core = getOpenCore();
  const related = doc.related.map((s) => core.find((c) => c.slug === s)).filter(Boolean) as WebdocPage[];
  const industries = getOpenIndustries().slice(0, 12);
  const path = webdocEncodedPath(doc.slug);
  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '웹문서 대량제작', path: WEBDOC_HUB },
              { name: doc.name, path },
            ]),
            faqPageJsonLd(doc.faq),
            serviceJsonLd({ name: doc.name, description: doc.description, path }),
            itemListJsonLd(`${doc.name} 관련 페이지`, [...related, ...industries].map(card)),
          ]}
        />
        <Crumbs name={doc.name} />
        <header className="page-header">
          <span className="page-eyebrow">웹문서 대량제작</span>
          <h1>{doc.name}</h1>
          <p className="page-lead">{doc.description}</p>
        </header>
        <Summary items={doc.summary} />

        {doc.painPoints.length > 0 && (
          <section className="content-section">
            <h2>이런 사장님께 필요합니다</h2>
            <ul className="point-list">
              {doc.painPoints.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        )}

        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        <PageCalculator />
        <Faq title={`${doc.name} 자주 묻는 질문`} faq={doc.faq} />
        <RelatedGrid title="함께 보면 좋은 안내" pages={related} />
        <RelatedGrid title="업종별 웹문서 제작 안내" pages={industries} />
        <Cta title={`${doc.name}, 구성안부터 받아보세요`} />
      </div>
    </main>
  );
}

/* ===== 업종 페이지 (조합) ===== */
function IndustryPage({ ind }: { ind: IndustryDoc & WebdocPage }) {
  const c = buildIndustryContent(ind);
  const open = getOpenIndustries();
  const siblings = open.filter((o) => o.group === ind.group && o.slug !== ind.slug).slice(0, 8);
  const others = open.filter((o) => o.group !== ind.group).sort((a, b) => (a.slug + ind.slug > b.slug + ind.slug ? 1 : -1)).slice(0, 4);
  const core = getOpenCore();
  const path = webdocEncodedPath(ind.slug);
  const query = c.examples[0];
  const homepageGuide = getAllIndustries().find((h) => h.name === ind.name || h.name === `${ind.name}업체`);

  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '웹문서 대량제작', path: WEBDOC_HUB },
              { name: c.label, path },
            ]),
            faqPageJsonLd(c.faq),
            serviceJsonLd({ name: `${ind.name} 웹문서 제작`, description: c.description, path }),
            itemListJsonLd(`${ind.group} 업종 웹문서 제작`, [...siblings, ...others].map(card)),
          ]}
        />
        <Crumbs name={c.label} />
        <header className="page-header">
          <span className="page-eyebrow">{ind.group}</span>
          <h1>{c.h1}</h1>
          <p className="page-lead">{c.description}</p>
        </header>
        <Summary items={c.summary} />

        <section className="content-section">
          <h2>{c.whyH2}</h2>
          {c.why.map((t) => (
            <p key={t} className="wd-p">{t}</p>
          ))}
          {homepageGuide && (
            <p className="wd-p">
              홈페이지가 아직 없다면 <Link href={industryPath(homepageGuide)}>{homepageGuide.name} 홈페이지 제작 안내</Link>부터 보셔도 좋습니다. 웹문서 페이지는 홈페이지와 같은 사이트 안에 붙여 운영합니다.
            </p>
          )}
        </section>

        <section className="content-section">
          <h2>{c.howH2}</h2>
          <p className="wd-p">{c.how}</p>
          <table className="wd-table">
            <thead>
              <tr>
                <th>검색어 예시</th>
                <th>페이지 주소 예시</th>
              </tr>
            </thead>
            <tbody>
              {c.examples.map((k) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>/{k.replace(/\s+/g, '-')}/</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PageCalculator regions={c.regions.length} services={ind.services.length} label={`${ind.name} 서비스`} title={c.calcTitle} />
        </section>

        <section className="content-section">
          <h2>{c.serpH2}</h2>
          <p className="wd-p">{c.serpText}</p>
          <SerpMock query={query} items={c.examples.slice(1, 3)} desc={c.serpDesc} />
        </section>

        <section className="content-section">
          <h2>{c.inclH2}</h2>
          <div className="feature-grid">
            {c.features.map((f) => (
              <div className="feature-card" key={f.h}>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </div>
            ))}
          </div>
        </section>

        {ind.regulated && (
          <section className="content-section">
            <h2>{ind.name} 페이지에서 지켜야 할 표시 기준</h2>
            <p className="wd-note">
              {ind.regulated.replace(/다$/, '다.')} 규제 업종은 문구 하나가 문제가 될 수 있어, 과장 표현을 빼고 필수 표기 항목을 사장님이 주신 정보 그대로 넣습니다.
            </p>
          </section>
        )}

        <section className="content-section">
          <h2>{c.stepH2}</h2>
          <ol className="wd-steps">
            {c.steps.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </section>

        <Faq title={`${ind.name} 웹문서 자주 묻는 질문`} faq={c.faq} />
        <RelatedGrid title={`${ind.group} 다른 업종`} pages={siblings} />
        <RelatedGrid title="웹문서 제작 안내" pages={core.slice(0, 4)} />
        <Cta title={`${ind.name} 웹문서, 구성안부터 받아보세요`} text={c.ctaText} />
      </div>
    </main>
  );
}
