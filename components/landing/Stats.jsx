'use client';

import { useIntersectionObserver, useCountUp } from './hooks';
import { ProjectIcon, StarIcon, ClockIcon, BookIcon } from './icons';

// 실적 통계 섹션 (4항목 카운트업)
const StatsSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const projectCount = useCountUp(500, 2000, isVisible);
  const guideCount = useCountUp(207, 2000, isVisible);
  const satisfactionRate = useCountUp(100, 2000, isVisible);

  const items = [
    { icon: <ProjectIcon size={36} />, value: `${projectCount}+`, label: '제작 완료' },
    { icon: <BookIcon size={36} />, value: `${guideCount}종`, label: '업종별 제작 가이드' },
    { icon: <ClockIcon size={36} />, value: '7일', label: '평균 제작기간' },
    { icon: <StarIcon size={36} />, value: `${satisfactionRate}%`, label: '고객 만족도' },
  ];

  return (
    <section className="stats" ref={ref}>
      <div className="section-container">
        <div className="stats-grid stats-grid-4">
          {items.map((item, i) => (
            <div key={i} className={`stat-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stat-icon">{item.icon}</div>
              <span className="stat-number">{item.value}</span>
              <span className="stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
