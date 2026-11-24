import type { Metadata } from 'next';
import Link from 'next/link';
import { ogMeta } from '../../lib/site';
import { getOpenTsvc, getSidos, tsvcSidoPath, tsvcPath, tsvcTitle, webdocOg, webdocPath, DISCLAIMER } from '../../lib/webdoc';
import TopPromo from '../../components/blog/TopPromo';
import JsonLd from '../../components/seo/JsonLd';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';

const TITLE = '타지역서비스 - 사무실 없는 지역 검색에도 보이게, 업종·시도별 안내 | JD8';
const DESC = '타지역서비스는 사무실이 없는 지역의 검색에도 업체가 보이게 하는 서비스입니다. JD8은 하수구·누수·커튼·블라인드·방충망·법률사무소 등 업종별로 17개 시·도 지역 페이지를 사장님 사이트에 만드는 웹문서 방식으로 합니다.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: '/타지역서비스/' },
  ...ogMeta(TITLE, DESC, '/타지역서비스/'),
};

export default function TsvcHub() {
  const open = getOpenTsvc();
  const sidos = getSidos();
  const featured = open.filter((p) => p.sido.name === '경기').slice(0, 20);
  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '타지역서비스', path: '/타지역서비스/' },
            ]),
            itemListJsonLd('경기 타지역서비스', featured.map((p) => ({ name: tsvcTitle(p), url: tsvcPath(p.tajiSlug), image: webdocOg(`${p.name}-홍보`) }))),
          ]}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <span>타지역서비스</span>
        </nav>
        <header className="page-header">
          <span className="page-eyebrow">타지역서비스</span>
          <h1>타지역서비스, 사장님 사이트에 남는 웹문서 방식으로</h1>
          <p className="page-lead">타지역서비스는 사무실이 없는 다른 지역의 검색에도 업체가 보이게 하는 서비스입니다. 지도에 올리는 방식과 달리, JD8은 시·군·구마다 검색 페이지를 사장님 도메인에 만들어 계약이 끝나도 남게 합니다.</p>
          <p className="page-lead">시·도와 업종을 고르면 지도 방식과 웹문서 방식 비교, 지역별 검색어, 비용 기준을 볼 수 있습니다. 바로 문의하셔도 됩니다.</p>
        </header>
        <TopPromo />
        <section className="content-section">
          <h2>시·도별 타지역서비스</h2>
          <div className="industry-grid">
            {sidos.map((s) => {
              const n = open.filter((p) => p.sido.name === s.name).length;
              return n ? (
                <Link key={s.name} href={tsvcSidoPath(s.name)}>
                  {s.name} ({n}개 업종)
                </Link>
              ) : null;
            })}
          </div>
        </section>
        <section className="content-section">
          <h2>경기 타지역서비스 바로 보기</h2>
          <div className="related-grid">
            {featured.map((p) => (
              <Link key={p.tajiSlug} href={tsvcPath(p.tajiSlug)}>
                {tsvcTitle(p)}
                <span>{p.group}</span>
              </Link>
            ))}
          </div>
        </section>
        <div className="cta-banner">
          <h2>출장 가는 지역만 알려주세요</h2>
          <p>
            지역과 서비스 목록을 보내주시면 페이지 구성안과 견적을 바로 드립니다. 웹문서가 무엇인지는 <a href={webdocPath('웹문서-대량제작')}>웹문서 대량제작</a>에서 볼 수 있습니다.
          </p>
          <div className="cta-actions">
            <a href="https://pf.kakao.com/_Izxnxgn/chat" target="_blank" rel="noopener noreferrer" className="primary">
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
