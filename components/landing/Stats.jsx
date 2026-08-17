'use client';

import { useIntersectionObserver, useCountUp } from './hooks';
import { ProjectIcon, StarIcon, ClockIcon } from './icons';

// 실적 통계 섹션
const StatsSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const projectCount = useCountUp(300, 2000, isVisible);
  const satisfactionRate = useCountUp(100, 2000, isVisible);

  return (
    <section className="stats" ref={ref}>
      <div className="section-container">
        <div className="stats-grid">
          <div className={`stat-item ${isVisible ? 'animate-in' : ''}`}>
            <div className="stat-icon"><ProjectIcon size={36} /></div>
            <span className="stat-number">{projectCount}+</span>
            <span className="stat-label">제작 완료</span>
          </div>
          <div className={`stat-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon"><StarIcon size={36} /></div>
            <span className="stat-number">{satisfactionRate}%</span>
            <span className="stat-label">고객 만족도</span>
          </div>
          <div className={`stat-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon"><ClockIcon size={36} /></div>
            <span className="stat-number">7일</span>
            <span className="stat-label">평균 제작기간</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
