// 실제 운영 사례 — 사장님 운영 사이트 2곳의 네이버 서치어드바이저 캡처(2026.11.01 기준, 최근 30일)
// 숫자는 캡처 그대로. 광고비 환산은 클릭당 200~300원 가정을 문구에 그대로 밝힌다(실제 절감액 아님).
const CPC = [200, 300];
const CASES = [
  { id: 'A', img: '/images/webdoc/case-a.png', w: 507, h: 472, clicks: 300, clicksLabel: '300', imp: '2.5만', clickUp: '+126.9%', impUp: '+337.3%' },
  { id: 'B', img: '/images/webdoc/case-b.png', w: 510, h: 551, clicks: 456, clicksLabel: '456', imp: '9.7천', clickUp: '+126.2%', impUp: '+199.9%' },
];
const won = (n: number) => (n >= 10000 ? `${Math.round(n / 1000) / 10}만원` : `${n.toLocaleString('ko-KR')}원`);

export default function CaseStudy() {
  return (
    <section className="content-section wd-case" aria-label="실제 운영 사례">
      <span className="page-eyebrow">실제 운영 사례</span>
      <h2>페이지 약 5천 개 사이트, 최근 30일 검색 클릭 300~456회</h2>
      <p className="wd-p">
        JD8이 직접 운영하는 사이트 2곳의 네이버 서치어드바이저 화면입니다(2026.11.01 기준, 최근 30일). 같은 클릭을 파워링크 광고로 샀다면 클릭당 200~300원 기준으로 <strong>사이트당 월 약 6만~14만원어치</strong>이고, 만든 페이지는 광고를 끄면 사라지는 광고와 달리 계속 남아 검색을 받습니다.
      </p>
      <div className="wd-case-grid">
        {CASES.map((c) => (
          <figure className="wd-case-card" key={c.id}>
            <img src={c.img} width={c.w} height={c.h} loading="lazy" alt={`웹문서 운영 사이트 ${c.id} 네이버 서치어드바이저 노출·클릭 현황 — 최근 30일 클릭 ${c.clicksLabel}, 노출 ${c.imp}`} />
            <figcaption>
              <strong>운영 사이트 {c.id}</strong>
              <span>
                최근 30일 노출 {c.imp} · 클릭 {c.clicksLabel} (지난달 대비 노출 {c.impUp} · 클릭 {c.clickUp})
              </span>
              <span className="wd-case-won">
                광고비 환산: {c.clicksLabel}회 × {CPC[0]}~{CPC[1]}원 = 약 {won(c.clicks * CPC[0])}~{won(c.clicks * CPC[1])}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="wd-disclaimer wd-case-note">
        ※ 광고비 환산은 같은 클릭 수를 파워링크로 얻을 때의 추정 비용(클릭당 200~300원 가정)이며 실제 절감액이 아닙니다. 키워드마다 클릭 단가가 다르고, 노출·클릭 결과는 업종·지역·경쟁 상황에 따라 달라지며 보장하지 않습니다.
      </p>
    </section>
  );
}
