import type { Metadata } from 'next';
import Link from 'next/link';
import { ogMeta } from '../../lib/site';
import { getOpenCore, getOpenIndustries, webdocPath, webdocOg, pageName, WEBDOC_HUB } from '../../lib/webdoc';
import JsonLd from '../../components/seo/JsonLd';
import PageCalculator from '../../components/webdoc/PageCalculator';
import SerpMock from '../../components/webdoc/SerpMock';
import { breadcrumbJsonLd, itemListJsonLd, serviceJsonLd } from '../../lib/jsonld';

const TITLE = '웹문서 대량제작 - 업종별 지역 검색 페이지 제작 안내 | JD8';
const DESC = '영업 지역 × 서비스마다 검색 페이지를 하나씩 만드는 웹문서 대량제작. 하수구·누수·청소·이사·크레인·커튼·대출·회생·법률 등 업종별 구성 예시와 필요한 페이지 수를 확인하세요.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: `/${encodeURIComponent('웹문서')}/` },
  ...ogMeta(TITLE, DESC, `/${encodeURIComponent('웹문서')}/`, {}, webdocOg('웹문서-대량제작')),
};

export default function WebdocHub() {
  const core = getOpenCore();
  const industries = getOpenIndustries();
  const groups = [...new Set(industries.map((i) => i.group))];
  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '웹문서 대량제작', path: WEBDOC_HUB },
            ]),
            serviceJsonLd({ name: '웹문서 대량제작', description: DESC, path: WEBDOC_HUB }),
            itemListJsonLd('JD8 웹문서 대량제작 안내', [...core, ...industries].slice(0, 20).map((p) => ({ name: pageName(p), url: webdocPath(p.slug), image: webdocOg(p.slug) }))),
          ]}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <span>웹문서 대량제작</span>
        </nav>
        <header className="page-header">
          <span className="page-eyebrow">WEB DOCUMENT</span>
          <h1>웹문서 대량제작, 업종별 안내</h1>
          <p className="page-lead">{DESC}</p>
        </header>
        <aside className="wd-summary" aria-label="핵심 요약">
          <strong>핵심 요약</strong>
          <ul>
            <li>손님은 &lsquo;김포 하수구막힘&rsquo;처럼 지역과 서비스를 붙여 검색합니다. 그 조합마다 페이지를 하나씩 만듭니다.</li>
            <li>플레이스는 사무실 근처에서, 블로그는 최근 글 위주로 보입니다. 웹문서는 영업 지역 전체의 조합 검색을 맡습니다.</li>
            <li>실제 사진·사례로 채우고, 묶음별로 열며 수집을 확인합니다. 노출 보장은 하지 않습니다.</li>
          </ul>
        </aside>

        <section className="content-section">
          <h2>웹문서 대량제작이란 무엇인가요?</h2>
          <p className="wd-p">
            사장님이 실제로 가는 지역과 하는 서비스를 곱해, 손님이 쓰는 검색어 하나에 페이지 하나를 만드는 방식입니다. 출장 범위가 넓은 업종일수록 사무실 위치 기준으로 보이는 플레이스만으로는 옆 도시 문의를 받기 어렵고, 블로그는 지역마다 글을 계속 써야 합니다. 웹문서는 한 번 만든 페이지가 사이트에 남아 계속 검색을 받습니다.
          </p>
          <SerpMock query="김포 하수구막힘" items={['일산 변기막힘', '파주 싱크대막힘']} />
          <PageCalculator />
        </section>

        <section className="content-section">
          <h2>웹문서 제작 안내</h2>
          <div className="related-grid">
            {core.map((p) => (
              <Link key={p.slug} href={webdocPath(p.slug)}>
                {p.name}
                <span>{p.summary[0]?.slice(0, 40)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="content-section">
          <h2>업종별 웹문서 제작</h2>
          {groups.map((g) => (
            <div className="wd-group" key={g}>
              <h3>{g}</h3>
              <div className="industry-grid">
                {industries.filter((i) => i.group === g).map((i) => (
                  <Link key={i.slug} href={webdocPath(i.slug)}>
                    {i.name} 홍보
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="cta-banner">
          <h2>우리 업종은 페이지가 몇 개 필요할까요?</h2>
          <p>영업 지역과 서비스 목록만 보내주시면 페이지 구성안과 예상 페이지 수를 먼저 보여드립니다.</p>
          <div className="cta-actions">
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="primary">카톡으로 구성안 받기</a>
            <a href="tel:1566-3046" className="ghost">전화 상담 1566-3046</a>
          </div>
        </div>
      </div>
    </main>
  );
}
