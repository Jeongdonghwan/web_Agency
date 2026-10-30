import type { Metadata } from 'next';
import Link from 'next/link';
import { ogMeta } from '../../lib/site';
import { getOpenCore, getOpenGroups, getOpenIndustries, getOpenServices, webdocPath, webdocOg, pageName, WEBDOC_HUB, DISCLAIMER } from '../../lib/webdoc';
import JsonLd from '../../components/seo/JsonLd';
import PageCalculator from '../../components/webdoc/PageCalculator';
import SerpMock from '../../components/webdoc/SerpMock';
import { breadcrumbJsonLd, itemListJsonLd, serviceJsonLd } from '../../lib/jsonld';

const TITLE = '웹문서 대량제작 - 홈페이지 제작부터 수천 개 검색 페이지까지 | JD8';
const DESC = '영업 지역과 서비스를 조합해 네이버·구글에서 검색될 수 있는 업체 소개 페이지를 수백~수천 개까지 제작합니다. 홈페이지 제작, 실제 사진·사례, 썸네일·전화 버튼, 플레이스 연결, 검색 등록까지.';
const HUB = `/${encodeURIComponent('웹문서')}/`;

const EXAMPLE = ['김포 하수구', '일산 하수구 뚫는 업체', '파주 싱크대 막힘', '인천 변기 막힘', '부천 하수구 비용'];

// 서비스 범위 — 상품 구성
const SCOPE = [
  ['홈페이지 제작 또는 기존 홈페이지 연결', '홈페이지가 없으면 반응형·기본 SEO를 갖춘 홈페이지부터 만들고, 있으면 그 사이트에 검색 페이지를 붙입니다.'],
  ['영업 지역 × 서비스 키워드별 페이지 수백~수천 개', '시·군·구에서 생활권·동까지, 서비스 이름과 손님이 붙이는 말(비용·업체·당일 등)을 조합해 페이지를 만듭니다.'],
  ['실제 사진과 시공 사례 활용', '사장님 홈페이지·블로그의 실제 사진과 작업 사례를 지역 페이지마다 나눠 넣습니다. 지어낸 후기·수치는 쓰지 않습니다.'],
  ['페이지마다 업체 소개·전용 썸네일·문의 버튼', '키워드와 상호가 들어간 썸네일, 업체 소개, 화면 하단 전화·문자·카톡 버튼을 페이지마다 넣습니다.'],
  ['네이버 플레이스·지도 연결', '각 페이지에서 플레이스로 연결해 리뷰와 위치를 함께 확인하게 합니다.'],
  ['네이버·구글 검색 등록과 사이트맵 제출', '서치어드바이저·서치콘솔 등록, 사이트맵·RSS 제출, 주요 페이지 수집 요청까지 진행합니다.'],
  ['캐러셀·FAQ 구조화 데이터와 AI 검색 대응', '빵부스러기·FAQ·캐러셀(ItemList) 구조화 데이터와 상단 핵심 요약을 넣어 검색엔진·AI 답변이 읽기 쉽게 만듭니다.'],
  ['단계별 오픈과 색인 현황 리포트', '한 번에 다 열지 않고 묶음별로 공개하며 수집·색인 현황을 공유합니다.'],
  ['(선택) 관련 키워드 블로그 글 정기 발행', '업종 질문형 키워드로 정보 글을 정기 발행해 사이트가 운영되는 신호를 만듭니다.'],
  ['(선택) 지역·서비스 확장과 유지보수', '반응을 보고 지역과 서비스를 넓히고, 사진·문구를 교체합니다.'],
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: HUB },
  ...ogMeta(TITLE, DESC, HUB, {}, webdocOg('웹문서-대량제작')),
};

export default function WebdocHub() {
  const core = getOpenCore();
  const groups = getOpenGroups();
  const industries = getOpenIndustries();
  const services = getOpenServices();
  const total = core.length + groups.length + industries.length + services.length;
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
            itemListJsonLd('JD8 웹문서 대량제작 안내', [...core, ...groups].slice(0, 20).map((p) => ({ name: pageName(p), url: webdocPath(p.slug), image: webdocOg(p.slug) }))),
          ]}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <span>웹문서 대량제작</span>
        </nav>
        <header className="page-header">
          <span className="page-eyebrow">WEB DOCUMENT</span>
          <h1>홈페이지 제작부터 수천 개 검색 페이지까지</h1>
          <p className="page-lead">우리 업체를 더 많은 지역에서 검색할 수 있도록 만들어 드립니다. {DESC}</p>
        </header>
        <aside className="wd-summary" aria-label="핵심 요약">
          <strong>핵심 요약</strong>
          <ul>
            <li>손님은 &lsquo;김포 하수구&rsquo;처럼 지역과 서비스를 붙여 검색합니다. 그 조합마다 업체 소개 페이지를 하나씩 만듭니다.</li>
            <li>플레이스는 사무실 근처에서, 블로그는 최근 글 위주로 보입니다. 웹문서는 영업 지역 전체의 조합 검색을 맡습니다.</li>
            <li>실제 사진·사례로 채우고, 묶음별로 열며 수집을 확인합니다. 노출 보장은 하지 않습니다.</li>
          </ul>
        </aside>

        <section className="content-section">
          <h2>홈페이지 하나만 만들어 놓고 고객을 기다리지 마세요</h2>
          <p className="wd-p">
            홈페이지 한 장은 업체 이름이나 대표 키워드 몇 개에만 걸립니다. 손님은 사는 동네와 필요한 작업을 붙여 검색하기 때문에, 영업 지역과 서비스를 조합한 검색어마다 업체 소개 페이지가 있어야 그 검색에 걸릴 기회가 생깁니다. 예를 들어 하수구 업체라면 이런 검색어마다 페이지를 만듭니다.
          </p>
          <ul className="point-list">
            {EXAMPLE.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <SerpMock query="김포 하수구" items={['일산 하수구 뚫는 업체', '파주 싱크대 막힘']} />
          <PageCalculator />
        </section>

        <section className="content-section">
          <h2>주요 제공 서비스</h2>
          <div className="feature-grid">
            {SCOPE.map(([h, p]) => (
              <div className="feature-card" key={h}>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="content-section">
          <h2>이런 업체라면 추천합니다</h2>
          <ul className="point-list">
            <li>누수탐지, 하수구, 방수, 청소처럼 출동 범위가 넓은 업체</li>
            <li>인테리어, 이사, 철거처럼 여러 지역에서 견적 문의를 받는 업체</li>
            <li>법률·회생·대출 상담처럼 비대면 상담으로 전국 의뢰를 받는 사무소</li>
            <li>여러 지역에서 고객을 확보하고 싶은 업체, 기존 홈페이지의 검색 유입을 늘리고 싶은 업체</li>
          </ul>
          <div className="industry-grid">
            {groups.map((g) => (
              <Link key={g.slug} href={webdocPath(g.slug)}>
                {g.group}
              </Link>
            ))}
          </div>
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
          <p className="wd-p">지금 업종 {industries.length}개, 서비스 {services.length}개의 구성 안내가 열려 있습니다 (안내 페이지 {total.toLocaleString('ko-KR')}개).</p>
          {groups.map((g) => (
            <div className="wd-group" key={g.slug}>
              <h3>
                <Link href={webdocPath(g.slug)}>{g.group}</Link>
              </h3>
              <div className="industry-grid">
                {industries.filter((i) => i.group === g.group).map((i) => (
                  <Link key={i.slug} href={webdocPath(i.slug)}>
                    {i.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="cta-banner">
          <h2>제작 비용 및 상담 문의 환영합니다</h2>
          <p>영업 지역과 서비스 목록만 보내주시면 페이지 구성안과 예상 페이지 수를 먼저 보여드립니다.</p>
          <div className="cta-actions">
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="primary">카톡으로 구성안 받기</a>
            <a href="tel:1566-3046" className="ghost">전화 상담 1566-3046</a>
          </div>
          <p className="wd-disclaimer">{DISCLAIMER}</p>
        </div>
      </div>
    </main>
  );
}
