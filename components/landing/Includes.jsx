'use client';

import { useRef } from 'react';
import { useScrollAnimation } from './hooks';
import { PaletteIcon, DeviceIcon, SearchIcon, DocumentIcon, WrenchIcon, RocketIcon } from './icons';

// 포함 내역 섹션
const IncludesSection = () => {
  const sectionRef = useRef(null);
  useScrollAnimation(sectionRef);

  const includes = [
    { icon: <PaletteIcon />, title: '맞춤 디자인', desc: '템플릿 NO, 1:1 맞춤 제작' },
    { icon: <DeviceIcon />, title: '반응형', desc: 'PC, 태블릿, 모바일 완벽 대응' },
    { icon: <SearchIcon />, title: 'SEO 기본설정', desc: '검색 노출을 위한 기본 세팅' },
    { icon: <DocumentIcon />, title: '문의 폼', desc: '고객 문의 수집 기능 포함' },
    { icon: <WrenchIcon />, title: '1회 수정', desc: '완성 후 수정 1회 무료' },
    { icon: <RocketIcon />, title: '빠른 제작', desc: '최단 3일 내 완성' },
  ];

  return (
    <section className="includes" id="includes" ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-title scroll-animate">30만원에 이 모든 게 포함</h2>
        <p className="section-subtitle scroll-animate stagger-1">추가 비용 없이 올인원 패키지</p>

        <div className="includes-grid">
          {includes.map((item, index) => (
            <div
              key={item.title}
              className={`include-card scroll-animate stagger-${index + 1}`}
            >
              <div className="include-icon">{item.icon}</div>
              <h3 className="include-title">{item.title}</h3>
              <p className="include-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IncludesSection;
