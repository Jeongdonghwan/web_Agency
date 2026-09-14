'use client';

import { useState, useEffect } from 'react';
import { KakaoIcon } from './icons';

const WORDS = ['카페', '치과', '헬스장', '법무법인', '쇼핑몰', '학원', '미용실', '펜션', '공장', '동물병원'];

// V4 히어로 — 풀블리드 다크 + 잉크 블롭 + 아웃라인 워터마크
const HeroSection = () => {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="lp-hero">
      <div className="lp-ink i1" aria-hidden="true"></div>
      <div className="lp-ink i2" aria-hidden="true"></div>
      <div className="lp-ink i3" aria-hidden="true"></div>
      <span className="lp-watermark wl" aria-hidden="true">HOMEPAGE</span>
      <span className="lp-watermark wr" aria-hidden="true">JD8</span>

      <div className="lp-hero-inner">
        <p className="lp-hero-eyebrow">매출이 필요한 사장님께</p>
        <h1 className="lp-hero-title">
          <span className="t-line">예쁘기만 한 홈페이지는</span>
          <span className="t-line"><span className="accent">매출</span>을 만들지 못합니다</span>
        </h1>
        <p className="lp-hero-sub">
          준비된 자료가 없어도 괜찮습니다.<br />
          <span className="lp-rotator"><span key={wordIdx} className="word">{WORDS[wordIdx]}</span></span> 홈페이지도
          네이버에서 검색되고, 카톡 문의로 이어지게 만들어드립니다.
        </p>

        <div className="lp-center">
          <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="lp-pill kakao-pill">
            <KakaoIcon size={20} /> 카톡으로 무료 상담
            <span className="lp-pill-arrow">→</span>
          </a>
          <a href="#contact" className="lp-pill on-dark">
            제작 안내 보기
            <span className="lp-pill-arrow">→</span>
          </a>
        </div>

        <div className="lp-hero-meta">
          <span><b>500+</b>제작 완료</span>
          <span><b>207종</b>업종별 가이드</span>
          <span><b>7일</b>평균 완성</span>
          <span><b>30만원</b>부터 시작</span>
        </div>
      </div>

      <div className="lp-scroll-hint" aria-hidden="true"></div>
    </section>
  );
};

export default HeroSection;
