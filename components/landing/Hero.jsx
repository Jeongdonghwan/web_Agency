'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, KakaoIcon } from './icons';

// 히어로 로테이터 업종 목록
const ROTATOR_WORDS = ['카페', '치과', '헬스장', '법무법인', '쇼핑몰', '학원', '미용실', '펜션', '공장', '동물병원'];

// Hero 섹션 — 성과 중심 카피 + 업종 로테이터
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % ROTATOR_WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const tickerItems = ['카페/레스토랑', '쇼핑몰', '병원/클리닉', '법률사무소', 'IT기업', '건설', '뷰티/네일', '피트니스', '학원/교육', '부동산', '마케팅', '인테리어'];

  const previewSites = [
    { img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', label: '레스토랑', name: '르 메종' },
    { img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80', label: '클리닉', name: '루미에르 피부과' },
    { img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', label: '마케팅', name: '그로스랩' },
    { img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80', label: '쇼핑몰', name: 'MODEN' },
    { img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', label: '건설', name: '한성건설' },
  ];

  return (
    <section className="hero">
      {/* 배경 레이어 */}
      <div className="hero-bg-image"></div>
      <div className="hero-overlay"></div>
      <div className="hero-orb orb-1" aria-hidden="true"></div>
      <div className="hero-orb orb-2" aria-hidden="true"></div>

      <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>
        <div className="hero-text">
          <p className="hero-subtitle">
            <span className="hero-badge">SEARCH-READY</span>
            검색되고, 문의가 들어오는 홈페이지
          </p>
          <h1 className="hero-title">
            <span className="line">예쁘기만 한 홈페이지는</span>
            <span className="line">매출을 만들지 못합니다</span>
          </h1>
          <p className="hero-rotator" aria-live="off">
            JD8은{' '}
            <span className="rotator-box">
              <span key={wordIdx} className="rotator-word">{ROTATOR_WORDS[wordIdx]}</span>
            </span>{' '}
            홈페이지도 검색되게 만듭니다
          </p>
          <div className="hero-price-box glass" onClick={scrollToContact} style={{cursor:'pointer'}}>
            <span className="price-amount">30<span className="price-unit">만원부터</span></span>
            <span className="price-suffix">기본 SEO·반응형·문의 동선 포함 →</span>
          </div>
          <p className="hero-desc">
            네이버·구글 검색에 잡히는 구조와<br />
            카톡 문의로 이어지는 동선까지, 7일이면 충분합니다
          </p>
          <div className="hero-cta-group">
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="cta-button kakao-cta">
              <KakaoIcon size={18} />
              카톡 간편문의
            </a>
            <button className="cta-button primary" onClick={scrollToContact}>
              무료 상담 신청하기
              <span className="cta-arrow">→</span>
            </button>
          </div>
          <div className="hero-trust">
            <span className="trust-item"><CheckCircleIcon size={14} /> 500+ 제작 완료</span>
            <span className="trust-divider">·</span>
            <span className="trust-item"><CheckCircleIcon size={14} /> 업종별 가이드 207종</span>
            <span className="trust-divider">·</span>
            <span className="trust-item"><CheckCircleIcon size={14} /> 평균 7일 완성</span>
          </div>
        </div>

        {/* 포트폴리오 프리뷰 카드 */}
        <div className="hero-preview">
          <div className="preview-stack">
            {previewSites.map((site, i) => (
              <div key={i} className={`preview-card preview-card-${i + 1}`}>
                <div className="preview-browser-bar">
                  <span className="browser-dot red"></span>
                  <span className="browser-dot yellow"></span>
                  <span className="browser-dot green"></span>
                </div>
                <img src={site.img} alt={site.name} loading="lazy" />
                <div className="preview-label">{site.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 업종 티커 */}
      <div className="hero-ticker">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      <div className="scroll-indicator">
        <span>스크롤</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
};

export default HeroSection;
