// 블로그 글 상단 배너 — 홈페이지 제작 + 웹문서 대량제작 + 웹블로그(AEO·GEO). 노출 보장 문구 금지, 카톡 단일 CTA
const ITEMS: [string, string, string][] = [
  ['/', '홈페이지 제작', '30만원부터, 평균 7일. 검색에 잡히는 구조로 만듭니다.'],
  ['/웹문서/웹문서-대량제작/', '웹문서 대량제작', '지역×서비스 검색 페이지 수천 개로 네이버·구글 웹문서 자리를 채웁니다.'],
  ['/웹문서/GEO-AEO-최적화/', '웹블로그 제작', '사장님 사이트 안에 블로그를 두고 글을 꾸준히 발행해, AI 검색(AEO·GEO)이 인용하는 구조로 만듭니다.'],
];

export default function TopPromo() {
  return (
    <aside className="top-promo" aria-label="JD8 서비스 안내">
      <p className="top-promo-eyebrow">이 글처럼 검색에 걸리는 사이트, 직접 만들어 드립니다</p>
      <strong className="top-promo-title">홈페이지 + 웹문서 대량제작, 제대로 하세요</strong>
      <ul>
        {ITEMS.map(([href, h, p]) => (
          <li key={h}>
            <a href={href}>{h}</a>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <p className="top-promo-note">세 가지 모두 AEO·GEO 구조(질문형 답변·구조화 데이터)를 기본으로 넣습니다. 순위 보장은 하지 않습니다.</p>
      <a className="top-promo-cta" href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer">
        카톡으로 무료 상담
      </a>
    </aside>
  );
}
