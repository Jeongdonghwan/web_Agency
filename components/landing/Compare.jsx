// V4 가격 비교 — 다크 밴드
const rows = [
  ['제작 비용', '100~300만원', '30만원부터'],
  ['제작 기간', '2~4주', '3~7일'],
  ['반응형', '추가 비용', '기본 포함'],
  ['검색 최적화(SEO)', '별도 비용 or 없음', '기본 세팅 + 등록 안내'],
  ['유지보수', '느리거나 안됨', '빠르고 가능'],
];

const CompareSection = () => {
  return (
    <section className="lp-compare" id="compare">
      <div className="lp-container">
        <span className="lp-eyebrow">PRICE</span>
        <h2 className="lp-h2">300만원 가치의 홈페이지를<br />30만원에</h2>
        <p className="lp-sub">거품을 뺐을 뿐, 빠져야 할 것은 빼지 않았습니다</p>

        <div className="lp-cmp-table">
          <div className="lp-cmp-row">
            <div className="lp-cmp-cell head"></div>
            <div className="lp-cmp-cell head">일반 업체</div>
            <div className="lp-cmp-cell head">JD8</div>
          </div>
          {rows.map((r) => (
            <div className="lp-cmp-row" key={r[0]}>
              <div className="lp-cmp-cell label">{r[0]}</div>
              <div className="lp-cmp-cell">{r[1]}</div>
              <div className="lp-cmp-cell us">{r[2]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompareSection;
