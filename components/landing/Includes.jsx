'use client';

import { useRef } from 'react';
import { useScrollAnimation } from './hooks';
import { PaletteIcon, DeviceIcon, SearchIcon, DocumentIcon, WrenchIcon, RocketIcon } from './icons';

// V4 포함 내역
const IncludesSection = () => {
  const ref = useRef(null);
  useScrollAnimation(ref);

  const includes = [
    { icon: <PaletteIcon />, title: '맞춤 디자인', desc: '템플릿 NO, 1:1 맞춤 제작' },
    { icon: <DeviceIcon />, title: '반응형', desc: 'PC, 태블릿, 모바일 완벽 대응' },
    { icon: <SearchIcon />, title: 'SEO 기본설정', desc: '검색 노출을 위한 구조 세팅' },
    { icon: <DocumentIcon />, title: '문의 동선', desc: '카톡·전화 원클릭 연결' },
    { icon: <WrenchIcon />, title: '1회 수정', desc: '완성 후 수정 1회 무료' },
    { icon: <RocketIcon />, title: '빠른 제작', desc: '최단 3일 내 완성' },
  ];

  return (
    <section className="lp-includes" id="includes" ref={ref}>
      <div className="lp-container">
        <span className="lp-eyebrow scroll-animate">ALL-IN-ONE</span>
        <h2 className="lp-h2 scroll-animate stagger-1">30만원에 이 모든 게 포함</h2>
        <p className="lp-sub scroll-animate stagger-2">추가 비용 없는 올인원 패키지</p>

        <div className="lp-inc-grid">
          {includes.map((item, i) => (
            <div key={item.title} className={`lp-inc-card scroll-animate stagger-${(i % 6) + 1}`}>
              <div className="ic">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IncludesSection;
