// 메인: 홈페이지 제작 + 웹문서 대량제작 + 웹블로그(AEO·GEO) 세 상품 강조. 보장 문구 금지
const PRODUCTS = [
  {
    tag: '01 · 홈페이지 제작',
    title: '검색에 잡히는 홈페이지',
    price: '30만원부터 · 평균 7일',
    points: ['1:1 맞춤 디자인, PC·모바일 대응', '검색 노출을 위한 SEO 기본 구조', '카톡·전화 원클릭 문의 동선'],
    href: '/homepage/',
    cta: '업종별 홈페이지 보기',
  },
  {
    tag: '02 · 웹문서 대량제작',
    title: '지역×서비스 검색 페이지 수천 개',
    price: '영업 지역 전체를 검색 페이지로',
    points: ['출장 가는 지역마다 서비스별 페이지', '네이버·구글 웹문서 자리에 업체 노출', '고객사 실제 사례: 지난달 대비 노출 +200~337%'],
    href: '/웹문서/웹문서-대량제작/',
    cta: '웹문서 대량제작 보기',
  },
  {
    tag: '03 · 웹블로그 제작',
    title: 'AI 검색까지 받는 내 사이트 블로그',
    price: 'SEO · AEO · GEO',
    points: ['홈페이지 주소 안에 글이 쌓이는 블로그', '글감 목록대로 꾸준히 자동 발행', '챗GPT·네이버 AI 브리핑이 인용하기 좋은 구조'],
    href: '/웹문서/웹블로그-제작/',
    cta: '웹블로그 제작 보기',
  },
];

export default function ProductsSection() {
  return (
    <section className="lp-products" id="products">
      <div className="lp-container">
        <span className="lp-eyebrow">JD8 SERVICES</span>
        <h2 className="lp-h2">홈페이지 제작만 하지 않습니다</h2>
        <p className="lp-sub">홈페이지 하나로 끝내지 않고, 검색 입구를 세 겹으로 만듭니다.</p>
        <div className="lp-prod-grid">
          {PRODUCTS.map((p) => (
            <a key={p.tag} href={p.href} className="lp-prod-card">
              <span className="lp-prod-tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p className="lp-prod-price">{p.price}</p>
              <ul>
                {p.points.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <span className="lp-prod-cta">{p.cta} →</span>
            </a>
          ))}
        </div>
        <p className="lp-prod-note">세 상품 모두 SEO·AEO·GEO 구조(질문형 답변·구조화 데이터·사이트맵)를 기본으로 넣습니다. 검색 순위와 AI 인용은 보장하지 않습니다.</p>
      </div>
    </section>
  );
}
