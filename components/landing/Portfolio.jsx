import { portfolios } from '../../data/portfolios';

// V4 포트폴리오 — 자동 흐름 마퀴 카드 (틸트 + 호버 확대)
const PortfolioSection = () => {
  return (
    <section className="lp-portfolio" id="portfolio">
      <div className="lp-container">
        <span className="lp-eyebrow">PORTFOLIO</span>
        <h2 className="lp-h2">홈페이지 제작 사례</h2>
        <p className="lp-sub">
          업종이 다르면 홈페이지도 달라야 합니다.<br />
          20개 업종의 실제 제작 스타일을 직접 눌러서 확인해보세요.
        </p>
        <div className="lp-center">
          <a href="/references/index.html" className="lp-pill">
            더 많은 제작 사례 보러가기
            <span className="lp-pill-arrow">→</span>
          </a>
        </div>
      </div>

      <div className="lp-pf-marquee">
        <div className="lp-pf-track">
          {[...portfolios, ...portfolios].map((item, i) => (
            <a key={`${item.id}-${i}`} href={item.link} target="_blank" rel="noopener noreferrer" className="lp-pf-card">
              <div className="lp-pf-thumb">
                <img src={item.image} alt={`${item.title} - ${item.categoryLabel} 홈페이지 제작 사례`} loading="lazy" />
              </div>
              <span className="lp-pf-name">{item.title}</span>
              <span className="lp-pf-cat">{item.categoryLabel}</span>
            </a>
          ))}
        </div>
      </div>

      <p className="lp-pf-note">
        여기 있는 것은 공개 가능한 사례의 일부입니다. 고객사 요청으로 공개하지 못하는 사이트가 훨씬 많습니다.<br />
        <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer">
          우리 업종 사례가 궁금하다면, 카톡으로 요청해주세요 →
        </a>
      </p>
    </section>
  );
};

export default PortfolioSection;
