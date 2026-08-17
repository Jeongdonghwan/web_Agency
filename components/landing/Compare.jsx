'use client';

import { useIntersectionObserver } from './hooks';

// 비교 섹션
const CompareSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <section className="compare" id="compare">
      <div className="section-container">
        <h2 className="section-title">300만원 가치의 홈페이지를 <br /> 30만원에</h2>
        <p className="section-subtitle">똑같은 퀄리티, 합리적인 가격</p>

        <div className={`compare-table ${isVisible ? 'animate-in' : ''}`} ref={ref}>
          <div className="compare-row compare-header">
            <div className="compare-cell"></div>
            <div className="compare-cell competitor">일반 업체</div>
            <div className="compare-cell us">저희</div>
          </div>
          <div className="compare-row">
            <div className="compare-cell label">제작 비용</div>
            <div className="compare-cell competitor">100~300만원</div>
            <div className="compare-cell us highlight">30만원</div>
          </div>
          <div className="compare-row">
            <div className="compare-cell label">제작 기간</div>
            <div className="compare-cell competitor">2~4주</div>
            <div className="compare-cell us highlight">3~7일</div>
          </div>
          <div className="compare-row">
            <div className="compare-cell label">반응형</div>
            <div className="compare-cell competitor">추가 비용</div>
            <div className="compare-cell us highlight">기본 포함</div>
          </div>
          <div className="compare-row">
            <div className="compare-cell label">유지보수</div>
            <div className="compare-cell competitor">느리거나 안됨</div>
            <div className="compare-cell us highlight">빠르고 가능</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompareSection;
