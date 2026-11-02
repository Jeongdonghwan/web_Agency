// 실제 고객사 사례 — JD8이 웹문서를 제작한 고객사 사이트 2곳(업체명 비공개)의 네이버 서치어드바이저 캡처(2026.11.01 기준, 최근 30일). 숫자는 캡처 그대로.
const CASES = [
  { id: 'A', img: '/images/webdoc/case-a.png', w: 507, h: 472, clicks: '300', imp: '2.5만', clickUp: '+126.9%', impUp: '+337.3%' },
  { id: 'B', img: '/images/webdoc/case-b.png', w: 507, h: 472, clicks: '456', imp: '9.7천', clickUp: '+126.2%', impUp: '+199.9%' },
];

export default function CaseStudy() {
  return (
    <section className="content-section wd-case" aria-label="실제 고객사 사례">
      <span className="page-eyebrow">실제 고객사 사례</span>
      <h2>웹문서 약 5천 페이지 고객사, 지난달 대비 노출 +200~337%</h2>
      <p className="wd-case-meta">네이버 서치어드바이저 · 최근 30일 · 2026.11.01 기준 · 업체명 비공개</p>
      <p className="wd-p">JD8이 웹문서를 제작한 실제 고객사 사이트 2곳입니다.</p>
      <p className="wd-p">지역×서비스 검색 페이지를 연 뒤 노출과 클릭이 한 달 새 크게 늘었습니다. 만든 페이지는 광고처럼 끄면 사라지지 않고 계속 검색을 받습니다.</p>
      <div className="wd-case-grid">
        {CASES.map((c) => (
          <figure className="wd-case-card" key={c.id}>
            <img src={c.img} width={c.w} height={c.h} loading="lazy" alt={`웹문서 고객사 ${c.id} 네이버 서치어드바이저 노출·클릭 현황 — 최근 30일 노출 ${c.imp}, 클릭 ${c.clicks}`} />
            <figcaption>
              <strong>고객사 {c.id}</strong>
              <span>
                최근 30일 노출 {c.imp} · 클릭 {c.clicks}
              </span>
              <span className="wd-case-won">
                지난달 대비 노출 {c.impUp} · 클릭 {c.clickUp}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="wd-disclaimer wd-case-note">※ 노출·클릭 결과는 업종·지역·경쟁 상황에 따라 달라지며 보장하지 않습니다.</p>
    </section>
  );
}
