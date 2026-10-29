// "이 자리에 사장님 업체가 나옵니다" — 검색 결과 예시 화면 (실제 검색 결과가 아니라 예시임을 표시)
export default function SerpMock({ query, items, desc = '출동·상담 안내, 작업 사진, 자주 묻는 질문 — 전화 한 번으로 바로 연결됩니다.' }: { query: string; items: string[]; desc?: string }) {
  return (
    <figure className="wd-serp" aria-label={`${query} 검색 결과 예시`}>
      <div className="wd-serp-bar">
        <span className="wd-serp-q">{query}</span>
        <span className="wd-serp-tab">웹문서</span>
      </div>
      <div className="wd-serp-hit">
        <span className="wd-serp-badge">이 자리에 사장님 업체가 나옵니다</span>
        <strong>{query} | 사장님 상호</strong>
        <p>{query} {desc}</p>
      </div>
      {items.map((t) => (
        <div className="wd-serp-row" key={t}>
          <strong>{t}</strong>
          <span />
        </div>
      ))}
      <figcaption>예시 화면입니다. 실제 검색 결과와 순위는 검색엔진이 정합니다.</figcaption>
    </figure>
  );
}
