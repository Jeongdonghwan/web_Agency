import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ogMeta } from '../../../lib/site';
import {
  getOpenTaji,
  getTaji,
  buildTajiContent,
  tajiPath,
  tajiEncodedPath,
  tajiSidoPath,
  tajiTitle,
  openTsvcSlug,
  tsvcPath,
  webdocPath,
  webdocOg,
  industryTitle,
  TAJI_HUB,
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
  return getOpenTaji().map((p) => ({ slug: p.tajiSlug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getTaji(params.slug);
  if (!p) return {};
  const c = buildTajiContent(p);
  const path = tajiEncodedPath(p.tajiSlug);
  return {
    title: { absolute: c.title },
    description: c.meta,
    keywords: c.keywords,
    alternates: { canonical: path },
    ...ogMeta(c.title, c.meta, path, {}, webdocOg(`${p.name}-홍보`)),
  };
}

const KAKAO = 'https://pf.kakao.com/_Izxnxgn/chat';

export default function TajiPage({ params }: { params: { slug: string } }) {
  const p = getTaji(params.slug);
  if (!p) notFound();
  const c = buildTajiContent(p);
  const path = tajiEncodedPath(p.tajiSlug);
  const open = getOpenTaji();
  const otherSido = open.filter((o) => o.name === p.name && o.sido.name !== p.sido.name);
  const sameSido = open.filter((o) => o.sido.name === p.sido.name && o.group === p.group && o.name !== p.name).slice(0, 8);
  const t = tajiTitle(p);
  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '타지역 홍보', path: TAJI_HUB },
              { name: `${p.sido.name} 타지역 홍보`, path: tajiSidoPath(p.sido.name) },
              { name: t, path },
            ]),
            faqPageJsonLd(c.faq),
            serviceJsonLd({ name: t, description: c.description, path }),
            itemListJsonLd(`${p.sido.name} ${p.group} 타지역 홍보`, sameSido.map((o) => ({ name: tajiTitle(o), url: tajiPath(o.tajiSlug), image: webdocOg(`${o.name}-홍보`) }))),
          ]}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href={TAJI_HUB}>타지역 홍보</Link>
          <span className="sep">›</span>
          <Link href={tajiSidoPath(p.sido.name)}>{p.sido.name}</Link>
          <span className="sep">›</span>
          <span>{t}</span>
        </nav>
        <header className="page-header">
          <span className="page-eyebrow">
            {p.sido.full} · {p.group}
          </span>
          <KwH1 kw={c.kw} sub={c.h1sub} />
          <Paras text={c.description} per={1} className="page-lead" />
        </header>
        <TopPromo />
        <KwSummary kw={c.kw} items={c.summary} />

        <section className="content-section">
          <h2>{c.whyH2}</h2>
          {c.why.map((x) => (
            <Paras key={x} text={x} />
          ))}
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
                <th>손님이 찾는 상황</th>
                <th>페이지 예시</th>
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

        <section className="content-section wd-taji-cta">
          <h2>
            {p.sido.name} {p.name} 타지역서비스 알아보셨다면, 바로 문의하세요
          </h2>
          <Paras text={c.taji} />
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
          <h2>{c.kw} 자주 묻는 질문</h2>
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
          <h2>{p.name} 다른 지역 타지역 홍보</h2>
          <p className="wd-p">
            {p.sido.name} 밖 지역도 함께 맡으신다면 시·도별 안내를 보세요.{openTsvcSlug(p.tajiSlug) && <> 타지역서비스 방식 비교는 <Link href={tsvcPath(p.tajiSlug)}>{p.sido.name} {p.name} 타지역서비스</Link>에서 볼 수 있습니다.</>} 업종 전체 안내는 <Link href={webdocPath(`${p.name}-홍보`)}>{industryTitle(p.name, p.group)}</Link>에 있습니다.
          </p>
          <div className="industry-grid">
            {otherSido.map((o) => (
              <Link key={o.tajiSlug} href={tajiPath(o.tajiSlug)}>
                {o.sido.name}
              </Link>
            ))}
          </div>
        </section>

        {sameSido.length > 0 && (
          <section className="content-section">
            <h2>
              {p.sido.name} {p.group} 다른 업종
            </h2>
            <div className="related-grid">
              {sameSido.map((o) => (
                <Link key={o.tajiSlug} href={tajiPath(o.tajiSlug)}>
                  {tajiTitle(o)}
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
