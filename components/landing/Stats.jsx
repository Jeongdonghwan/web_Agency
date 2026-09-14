'use client';

import { useIntersectionObserver, useCountUp } from './hooks';

// V4 숫자 스트립
const StatsSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const projects = useCountUp(500, 1800, isVisible);
  const guides = useCountUp(207, 1800, isVisible);
  const days = useCountUp(7, 1400, isVisible);
  const rate = useCountUp(100, 1800, isVisible);

  const items = [
    { num: <>{projects}<em>+</em></>, label: '누적 제작' },
    { num: <>{guides}<em>종</em></>, label: '업종별 제작 가이드' },
    { num: <>{days}<em>일</em></>, label: '평균 완성 기간' },
    { num: <>{rate}<em>%</em></>, label: '고객 만족도' },
  ];

  return (
    <section className="lp-strip" ref={ref}>
      <div className="lp-container">
        <div className="lp-strip-grid">
          {items.map((it, i) => (
            <div key={i}>
              <span className="lp-stat-num">{it.num}</span>
              <span className="lp-stat-label">{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
