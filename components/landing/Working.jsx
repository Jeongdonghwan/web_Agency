'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useScrollAnimation } from './hooks';
import { SearchIcon, ChatIcon, TargetIcon } from './icons';

// "홈페이지가 일하게 만듭니다" — 매출·고객·검색 3카드
const WorkingSection = () => {
  const sectionRef = useRef(null);
  useScrollAnimation(sectionRef);

  return (
    <section className="working" id="working" ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-title scroll-animate">만들고 끝나는 홈페이지가 아니라,<br />일하는 홈페이지를 만듭니다</h2>
        <p className="section-subtitle scroll-animate stagger-1">JD8이 모든 제작에 기본으로 담는 세 가지</p>

        <div className="working-grid">
          <div className="working-card scroll-animate stagger-1">
            <div className="working-icon"><SearchIcon /></div>
            <h3>검색에 잡히는 구조</h3>
            <p>
              네이버·구글 검색봇이 읽기 좋은 제목 구조와 메타 정보를 기본 세팅하고,
              완성 후 서치어드바이저 등록까지 안내합니다. 동네이름+업종 검색은
              광고 없이도 노려볼 수 있는 시장입니다.
            </p>
            <Link href="/blog/naver-seo-guide/" className="working-link">네이버 노출 가이드 보기 →</Link>
          </div>

          <div className="working-card scroll-animate stagger-2">
            <div className="working-icon"><ChatIcon /></div>
            <h3>문의로 이어지는 동선</h3>
            <p>
              들어온 방문자가 헤매지 않도록 첫 화면부터 카톡·전화 버튼을 배치하고,
              업종에 맞는 문의 흐름을 설계합니다. 방문이 많아도 문의가 없다면
              동선의 문제입니다.
            </p>
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="working-link">카톡으로 경험해보기 →</a>
          </div>

          <div className="working-card scroll-animate stagger-3">
            <div className="working-icon"><TargetIcon /></div>
            <h3>업종에 맞는 설계</h3>
            <p>
              카페와 치과, 공장의 홈페이지는 담아야 할 것이 다릅니다.
              JD8은 207개 업종을 연구해 업종별 필수 기능과 구성을 정리해두었고,
              그 기준으로 제작합니다.
            </p>
            <Link href="/homepage/" className="working-link">업종별 가이드 207종 보기 →</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkingSection;
