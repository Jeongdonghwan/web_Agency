import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ogMeta } from '../../../lib/site';
import {
  getOpenTsvc,
  getTsvc,
  buildTsvcContent,
  tsvcPath,
  tsvcEncodedPath,
  tsvcSidoPath,
  tsvcTitle,
  openTajiSlug,
  tajiPath,
  webdocPath,
  webdocOg,
  industryTitle,
  TSVC_HUB,
  DISCLAIMER,
} from '../../../lib/webdoc';
import Paras from '../../../components/webdoc/Paras';
import PageCalculator from '../../../components/webdoc/PageCalculator';
import TopPromo from '../../../components/blog/TopPromo';
import { KwH1, KwSummary } from '../../../components/seo/Kw';
import JsonLd from '../../../components/seo/JsonLd';
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd, itemListJsonLd } from '../../../lib/jsonld';

export const dynamicParams = false;

export function generateStaticParams() {
  return getOpenTsvc().map((p) => ({ slug: p.tajiSlug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getTsvc(params.slug);
  if (!p) return {};
  const c = buildTsvcContent(p);
  const path = tsvcEncodedPath(p.tajiSlug);
  return {
    title: { absolute: c.title },
    description: c.meta,
    keywords: c.keywords,
    alternates: { canonical: path },
    ...ogMeta(c.title, c.meta, path, {}, webdocOg(`${p.name}-홍보`)),
  };
}

const KAKAO = 'https://pf.kakao.com/_Izxnxgn/chat';

// 시도별·업종군별 묶음은 한 번만 만든다 (페이지마다 전체를 훑지 않게)
let byName: Map<string, ReturnType<typeof getOpenTsvc>> | null = null;
let bySido: Map<string, ReturnType<typeof getOpenTsvc>> | null = null;
function index() {
  if (byName && bySido) return { byName, bySido };
  byName = new Map();
  bySido = new Map();
  for (const o of getOpenTsvc()) {
    (byName.get(o.name) || byName.set(o.name, []).get(o.name)!).push(o);
    const k = `${o.sido.name}|${o.group}`;
    (bySido.get(k) || bySido.set(k, []).get(k)!).push(o);
  }
  return { byName, bySido };
}

export default function TsvcPage({ params }: { params: { slug: string } }) {
  const p = getTsvc(params.slug);
  if (!p) notFound();
  const c = buildTsvcContent(p);
  const path = tsvcEncodedPath(p.tajiSlug);
  const ix = index();
  const otherSido = (ix.byName.get(p.name) || []).filter((o) => o.sido.name !== p.sido.name);
  const sameSido = (ix.bySido.get(`${p.sido.name}|${p.group}`) || []).filter((o) => o.name !== p.name).slice(0, 8);
  const t = tsvcTitle(p);
  const promo = openTajiSlug(p.tajiSlug);
  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '타지역서비스', path: TSVC_HUB },
              { name: `${p.sido.name} 타지역서비스`, path: tsvcSidoPath(p.sido.name) },
              { name: t, path },
            ]),
            faqPageJsonLd(c.faq),
            serviceJsonLd({ name: t, description: c.description, path }),
            itemListJsonLd(`${p.sido.name} ${p.group} 타지역서비스`, sameSido.map((o) => ({ name: tsvcTitle(o), url: tsvcPath(o.tajiSlug), image: webdocOg(`${o.name}-홍보`) }))),
          ]}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href={TSVC_HUB}>타지역서비스</Link>
          <span className="sep">›</span>
          <Link href={tsvcSidoPath(p.sido.name)}>{p.sido.name}</Link>
          <span className="sep">›</span>
          <span>{t}</span>
        </nav>
        <header className="page-header">
          <span className="page-eyebrow">
            {p.sido.full} · {p.group} · 타지역서비스
          </span>
          <KwH1 kw={c.kw} sub={c.h1sub} />
          <Paras text={c.description} per={1} className="page-lead" />
        </header>
        <TopPromo />
        <KwSummary kw={c.kw} items={c.summary} />

        <section className="content-section">
          <h2>{c.whatH2}</h2>
          {c.what.map((x) => (
            <Paras key={x} text={x} />
          ))}
        </section>

        <section className="content-section">
          <h2>{c.cmpH2}</h2>
          <table className="wd-table wd-table-plain">
            <thead>
              <tr>
                <th>구분</th>
                <th>지도에 올리는 방식</th>
                <th>JD8 웹문서 방식</th>
              </tr>
            </thead>
            <tbody>
              {c.cmp.map(([a, b, d]) => (
                <tr key={a}>
                  <td>{a}</td>
                  <td>{b}</td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paras text={c.cmpNote} />
        </section>

        <section className="content-section wd-taji-cta">
          <h2>{c.ctaH2}</h2>
          <p className="wd-p">{c.ctaText}</p>
          <div className="cta-actions">
            <a href={KAKAO} target="_blank" rel="noopener noreferrer" className="wd-btn-kakao">
              카톡으로 바로 문의
            </a>
            <a href="tel:1566-3046" className="wd-btn-ghost">
              전화 1566-3046
            </a>
          </div>
        </section>

        <section className="content-section">
          <h2>{c.tableH2}</h2>
          <table className="wd-table">
            <thead>
              <tr>
                <th>{p.sido.unit}</th>
                <th>검색어 예시</th>
                <th>만들 페이지</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map(([a, q, u]) => (
                <tr key={a}>
                  <td>{a}</td>
                  <td>{q}</td>
                  <td>{u}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="wd-p">{c.areasText}</p>
          <PageCalculator regions={c.calc.regions} services={c.calc.services} label={c.calc.label} title={c.calc.title} firstLabel={c.calc.firstLabel} firstUnit="곳" />
        </section>

        <section className="content-section">
          <h2>{c.svcH2}</h2>
          <table className="wd-table wd-table-plain">
            <thead>
              <tr>
                <th>서비스</th>
                <th>찾는 상황</th>
                <th>검색어 예시</th>
              </tr>
            </thead>
            <tbody>
              {c.svcRows.map(([a, b, q]) => (
                <tr key={a}>
                  <td>{a}</td>
                  <td>{b}</td>
                  <td>{q}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="content-section">
          <h2>{c.effectH2}</h2>
          {c.effect.map((x) => (
            <Paras key={x} text={x} />
          ))}
          <p className="wd-p">
            고객사 실제 노출 화면은 <Link href={webdocPath('웹문서-대량제작')}>웹문서 대량제작 사례</Link>에서 볼 수 있습니다.
          </p>
        </section>

        <section className="content-section">
          <h2>{c.stepH2}</h2>
          <ol className="wd-steps">
            {c.steps.map(([h, x]) => (
              <li key={h}>
                <strong>{h}</strong> {x}
              </li>
            ))}
          </ol>
        </section>

        <section className="content-section">
          <h2>{t} 자주 묻는 질문</h2>
          <div className="static-faq">
            {c.faq.map((f) => (
              <div className="qa" key={f.q}>
                <h3>Q. {f.q}</h3>
                <p>A. {f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="content-section">
          <h2>{p.name} 다른 지역 타지역서비스</h2>
          <p className="wd-p">
            {p.sido.name} 밖에서도 일하신다면 시·도별 안내를 보세요.{' '}
            {promo && (
              <>
                지역 검색에서 놓치는 문의에 대해서는 <Link href={tajiPath(promo)}>{p.sido.name} {p.name} 타지역 홍보</Link>에, 업종 전체 안내는{' '}
              </>
            )}
            {!promo && <>업종 전체 안내는 </>}
            <Link href={webdocPath(`${p.name}-홍보`)}>{industryTitle(p.name, p.group)}</Link>에 있습니다.
          </p>
          <div className="industry-grid">
            {otherSido.map((o) => (
              <Link key={o.tajiSlug} href={tsvcPath(o.tajiSlug)}>
                {o.sido.name}
              </Link>
            ))}
          </div>
        </section>

        {sameSido.length > 0 && (
          <section className="content-section">
            <h2>
              {p.sido.name} {p.group} 타지역서비스
            </h2>
            <div className="related-grid">
              {sameSido.map((o) => (
                <Link key={o.tajiSlug} href={tsvcPath(o.tajiSlug)}>
                  {tsvcTitle(o)}
                  <span>{o.group}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="cta-banner">
          <h2>{c.ctaH2}</h2>
          <p>{c.ctaText}</p>
          <div className="cta-actions">
            <a href={KAKAO} target="_blank" rel="noopener noreferrer" className="primary">
              카톡으로 바로 문의
            </a>
            <a href="tel:1566-3046" className="ghost">
              전화 상담 1566-3046
            </a>
          </div>
          <p className="wd-disclaimer">{DISCLAIMER}</p>
        </div>
      </div>
    </main>
  );
}
