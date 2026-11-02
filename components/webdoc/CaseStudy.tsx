// 실제 운영 사례 — 사장님 운영 사이트 2곳의 네이버 서치어드바이저 캡처(2026.11.01 기준, 최근 30일). 숫자는 캡처 그대로.
const CASES = [
  { id: 'A', img: '/images/webdoc/case-a.png', w: 507, h: 472, clicks: '300', imp: '2.5만', clickUp: '+126.9%', impUp: '+337.3%' },
  { id: 'B', img: '/images/webdoc/case-b.png', w: 510, h: 551, clicks: '456', imp: '9.7천', clickUp: '+126.2%', impUp: '+199.9%' },
];

export default function CaseStudy() {
  return (
    <section className="content-section wd-case" aria-label="실제 운영 사례">
      <span className="page-eyebrow">실제 운영 사례</span>
      <h2>웹문서 약 5천 페이지 운영 사이트, 지난달 대비 노출 +200~337%</h2>
      <p className="wd-p">
        JD8이 직접 운영하는 사이트 2곳의 네이버 서치어드바이저 화면입니다(2026.11.01 기준, 최근 30일). 광고비를 쓰지 않고 검색 페이지만으로 노출과 클릭이 한 달 새 크게 늘었고, 만든 페이지는 광고처럼 끄면 사라지지 않고 계속 검색을 받습니다.
      </p>
      <div className="wd-case-grid">
        {CASES.map((c) => (
          <figure className="wd-case-card" key={c.id}>
            <img src={c.img} width={c.w} height={c.h} loading="lazy" alt={`웹문서 운영 사이트 ${c.id} 네이버 서치어드바이저 노출·클릭 현황 — 최근 30일 노출 ${c.imp}, 클릭 ${c.clicks}`} />
            <figcaption>
              <strong>운영 사이트 {c.id}</strong>
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
