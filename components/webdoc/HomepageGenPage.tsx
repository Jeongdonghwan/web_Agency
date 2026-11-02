import Link from 'next/link';
import Paras from './Paras';
import JsonLd from '../seo/JsonLd';
import {
  buildHomepageContent,
  getOpenHomepageGen,
  homepageGenPath,
  homepageGenEncodedPath,
  homepageGenOg,
  webdocPath,
  adMarketingHref,
  DISCLAIMER,
  type HomepageGenDoc,
} from '../../lib/webdoc';
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd, itemListJsonLd } from '../../lib/jsonld';

// 웹문서 업종 데이터로 만든 "{업종} 홈페이지 제작" 페이지 (기존 207업종 md 페이지와 같은 /homepage/ 아래)
export default function HomepageGenPage({ doc }: { doc: HomepageGenDoc }) {
  const c = buildHomepageContent(doc);
  const path = homepageGenEncodedPath(doc.slug);
  const siblings = getOpenHomepageGen().filter((p) => p.group === doc.group && p.slug !== doc.slug).slice(0, 8);
  const webdoc = webdocPath(`${doc.name}-홍보`);
  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '업종별 홈페이지 제작', path: '/homepage/' },
              { name: c.h1, path },
            ]),
            faqPageJsonLd(c.faq),
            serviceJsonLd({ name: c.h1, description: c.description, path }),
            itemListJsonLd(`${doc.group} 홈페이지 제작`, siblings.map((p) => ({ name: `${p.name} 홈페이지 제작`, url: homepageGenPath(p.slug), image: homepageGenOg(p.slug) }))),
          ]}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href="/homepage/">업종별 홈페이지 제작</Link>
          <span className="sep">›</span>
          <span>{c.h1}</span>
        </nav>
        <header className="page-header">
          <span className="page-eyebrow">{doc.group}</span>
          <h1>{c.h1}</h1>
          <p className="page-lead">{c.description}</p>
        </header>
        <aside className="wd-summary" aria-label="핵심 요약">
          <strong>핵심 요약</strong>
          <ul>
            {c.summary.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </aside>

        <section className="content-section">
          <h2>{c.needH2}</h2>
          <div className="feature-grid">
            {c.needs.map((f) => (
              <div className="feature-card" key={f.h}>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="content-section">
          <h2>{c.menuH2}</h2>
          <table className="wd-table">
            <thead>
              <tr>
                <th>메뉴</th>
                <th>담을 내용</th>
              </tr>
            </thead>
            <tbody>
              {c.menu.map(([m, d]) => (
                <tr key={m}>
                  <td>{m}</td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {c.serviceRows.length > 0 && (
          <section className="content-section">
            <h2>{doc.name} 서비스 안내, 이렇게 씁니다</h2>
            <table className="wd-table wd-table-plain">
              <thead>
                <tr>
                  <th>서비스</th>
                  <th>소개에 담을 내용</th>
                  <th>맞춰야 할 검색어</th>
                </tr>
              </thead>
              <tbody>
                {c.serviceRows.map(([name, note, q]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{note}</td>
                    <td>{q}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="content-section">
          <h2>{doc.name} 홈페이지 비용과 기간</h2>
          <Paras text={c.cost} />
        </section>

        <section className="content-section">
          <h2>홈페이지만으로 부족할 때</h2>
          <p className="wd-p">
            {c.beyond} <Link href={webdoc}>{doc.name} 지역 검색 페이지(웹문서) 안내</Link>에서 페이지 구성 예시를 볼 수 있고, 블로그·플레이스 같은 채널 운영은{' '}
            <a href={adMarketingHref(doc.name)}>JD8 마케팅의 {doc.name} 마케팅 안내</a>를 참고하세요.
          </p>
        </section>

        <section className="content-section">
          <h2>{doc.name} 홈페이지 제작 자주 묻는 질문</h2>
          <div className="static-faq">
            {c.faq.map((f) => (
              <div className="qa" key={f.q}>
                <h3>Q. {f.q}</h3>
                <p>A. {f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {siblings.length > 0 && (
          <section className="content-section">
            <h2>{doc.group} 다른 업종 홈페이지</h2>
            <div className="related-grid">
              {siblings.map((p) => (
                <Link key={p.slug} href={homepageGenPath(p.slug)}>
                  {p.name} 홈페이지 제작
                  <span>{p.group}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="cta-banner">
          <h2>{doc.name} 홈페이지, 이번 주에 시작하세요</h2>
          <p>{doc.name} 서비스 목록과 사진만 보내주시면 메뉴 구성안부터 드립니다. 비대면 진행, 평균 7일.</p>
          <div className="cta-actions">
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="primary">카톡으로 무료 상담</a>
            <a href="tel:1566-3046" className="ghost">전화 상담 1566-3046</a>
          </div>
          <p className="wd-disclaimer">{DISCLAIMER}</p>
        </div>
      </div>
    </main>
  );
}
