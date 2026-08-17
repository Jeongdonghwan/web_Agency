'use client';

import { useIntersectionObserver } from './hooks';

// 프로세스 섹션
const ProcessSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const steps = [
    { num: '01', title: '상담', desc: '무료 상담으로 요구사항 파악' },
    { num: '02', title: '기획', desc: '컨셉 및 구조 확정' },
    { num: '03', title: '제작', desc: '디자인 & 개발 진행' },
    { num: '04', title: '완성', desc: '검수 후 최종 전달' },
  ];

  return (
    <section className="process" id="process">
      <div className="section-container">
        <h2 className="section-title">제작 과정</h2>
        <p className="section-subtitle">간단하고 빠른 4단계</p>

        <div className={`process-steps ${isVisible ? 'animate-in' : ''}`} ref={ref}>
          {steps.map((step, index) => (
            <div
              key={step.num}
              className="process-step"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="step-num">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
