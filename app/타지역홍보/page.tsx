import type { Metadata } from 'next';
import Link from 'next/link';
import { ogMeta } from '../../lib/site';
import { getOpenTaji, getSidos, tajiSidoPath, tajiPath, tajiTitle, webdocOg, webdocPath, DISCLAIMER } from '../../lib/webdoc';
import TopPromo from '../../components/blog/TopPromo';
import JsonLd from '../../components/seo/JsonLd';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';

const TITLE = '타지역서비스(타지역 홍보) - 업종별·지역별 웹문서로 신규 고객 문의 | JD8';
const DESC = '하수구·누수·커튼·블라인드·방충망·법률사무소·프랜차이즈 본사까지, 사무실에서 먼 지역 검색에도 업체가 보이도록 17개 시·도별 웹문서를 만듭니다. 타지역서비스를 알아보셨다면 바로 문의하세요.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: '/타지역홍보/' },
  ...ogMeta(TITLE, DESC, '/타지역홍보/'),
};

export default function TajiHub() {
  const open = getOpenTaji();
  const sidos = getSidos();
  const featured = open.filter((p) => p.sido.name === '경기').slice(0, 20);
  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '타지역서비스', path: '/타지역홍보/' },
            ]),
            itemListJsonLd('경기 타지역서비스', featured.map((p) => ({ name: tajiTitle(p), url: tajiPath(p.tajiSlug), image: webdocOg(`${p.name}-홍보`) }))),
          ]}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <span>타지역서비스</span>
        </nav>
        <header className="page-header">
          <span className="page-eyebrow">타지역서비스 · 타지역 홍보</span>
          <h1>타지역서비스, 업종별·지역별 웹문서로</h1>
          <p className="page-lead">플레이스는 사무실 근처에서만 보입니다. 출장 가는 시·군·구마다 검색 페이지를 만들어, 먼 지역 손님의 검색에도 업체가 보이게 합니다.</p>
          <p className="page-lead">타지역서비스를 알아보셨다면, 페이지가 사장님 사이트에 남는 웹문서로 바로 문의하세요.</p>
        </header>
        <TopPromo />
        <section className="content-section">
          <h2>시·도별 타지역서비스</h2>
          <div className="industry-grid">
            {sidos.map((s) => {
              const n = open.filter((p) => p.sido.name === s.name).length;
              return n ? (
                <Link key={s.name} href={tajiSidoPath(s.name)}>
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
              <Link key={p.tajiSlug} href={tajiPath(p.tajiSlug)}>
                {tajiTitle(p)}
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
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="primary">
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
