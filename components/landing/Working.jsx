'use client';

import { useRef } from 'react';
import { useScrollAnimation } from './hooks';

// V4 쇼케이스 — 그라데이션 목업 카드 3종 (검색·노출·문의)
const WorkingSection = () => {
  const ref = useRef(null);
  useScrollAnimation(ref);

  return (
    <section className="lp-showcase" id="working" ref={ref}>
      <div className="lp-container">
        <span className="lp-eyebrow scroll-animate">WHY JD8</span>
        <h2 className="lp-h2 scroll-animate stagger-1">
          만들고 끝나는 홈페이지가 아니라<br />일하는 홈페이지를 만듭니다
        </h2>
        <p className="lp-sub scroll-animate stagger-2">검색 → 방문 → 문의. 이 흐름이 설계된 홈페이지만 매출에 기여합니다.</p>

        <div className="lp-show-grid">
          {/* 1. 검색 구조 */}
          <div className="lp-show-card g1 scroll-animate stagger-1">
            <div className="lp-mock">
              <p className="lp-mock-head">검색 구조 진단</p>
              <p className="lp-mock-big">95<em>점 / 100</em></p>
              <div className="lp-mock-row"><span className="lp-mock-dot"></span><span className="lp-mock-bar"></span><span className="lp-mock-chip">통과</span></div>
              <div className="lp-mock-row"><span className="lp-mock-dot"></span><span className="lp-mock-bar short"></span><span className="lp-mock-bar"></span></div>
              <div className="lp-mock-row"><span className="lp-mock-dot"></span><span className="lp-mock-bar"></span></div>
              <div className="lp-mock-row"><span className="lp-mock-dot"></span><span className="lp-mock-bar short"></span></div>
            </div>
            <div className="lp-show-caption">
              <h3>검색엔진이 읽기 쉬운 구조부터 설계해<br />노출될 이유가 있는 홈페이지를 만듭니다</h3>
              <span>기본 SEO 세팅 · 네이버 서치어드바이저 등록 안내</span>
            </div>
          </div>

          {/* 2. 지역 검색 노출 */}
          <div className="lp-show-card g2 scroll-animate stagger-2">
            <div className="lp-mock">
              <div className="lp-mock-query"><span className="q-dot"></span>"동네이름 + 업종" 검색 결과는?</div>
              <div className="lp-mock-row"><span className="lp-mock-dot"></span><span className="lp-mock-bar"></span><span className="lp-mock-chip">내 홈페이지</span></div>
              <div className="lp-mock-row"><span className="lp-mock-dot"></span><span className="lp-mock-bar"></span></div>
              <div className="lp-mock-row"><span className="lp-mock-dot"></span><span className="lp-mock-bar short"></span></div>
              <div className="lp-mock-row"><span className="lp-mock-dot"></span><span className="lp-mock-bar"></span></div>
            </div>
            <div className="lp-show-caption">
              <h3>광고 없이도 잡을 수 있는<br />지역+업종 검색을 먼저 공략합니다</h3>
              <span>경쟁 약한 검색부터 선점 · 지역 페이지 연계</span>
            </div>
          </div>

          {/* 3. 문의 전환 */}
          <div className="lp-show-card g3 scroll-animate stagger-3">
            <div className="lp-mock">
              <p className="lp-mock-head">이번 주 들어온 문의</p>
              <p className="lp-mock-big">+12<em>건</em></p>
              <div className="lp-mock-row"><span className="lp-mock-dot" style={{background:'#fee500'}}></span><span className="lp-mock-bar"></span><span className="lp-mock-chip">카톡</span></div>
              <div className="lp-mock-row"><span className="lp-mock-dot" style={{background:'#fee500'}}></span><span className="lp-mock-bar short"></span><span className="lp-mock-chip">카톡</span></div>
              <div className="lp-mock-row"><span className="lp-mock-dot"></span><span className="lp-mock-bar"></span><span className="lp-mock-chip">전화</span></div>
            </div>
            <div className="lp-show-caption">
              <h3>방문자가 헤매지 않도록<br />카톡·전화 문의 동선을 설계합니다</h3>
              <span>첫 화면 고정 문의 버튼 · 업종별 전환 동선</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkingSection;
