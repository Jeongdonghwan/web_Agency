import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// ===== 듀오톤 SVG 아이콘 컴포넌트 =====

// 팔레트 아이콘 (맞춤 디자인)
const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <circle cx="12" cy="12" r="10" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="var(--icon-primary)"/>
  </svg>
);

// 모바일 아이콘 (반응형)
const DeviceIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="2" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14zm-5 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="var(--icon-primary)"/>
  </svg>
);

// 검색 아이콘 (SEO)
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <circle cx="10.5" cy="10.5" r="7" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="var(--icon-primary)"/>
  </svg>
);

// 문서 아이콘 (문의 폼)
const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <path d="M6 2h8l6 6v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2z" fill="var(--icon-primary)"/>
  </svg>
);

// 렌치 아이콘 (수정)
const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <circle cx="12" cy="12" r="10" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="var(--icon-primary)"/>
  </svg>
);

// 로켓 아이콘 (빠른 제작)
const RocketIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none">
    <ellipse cx="12" cy="12" rx="8" ry="10" fill="var(--icon-secondary)" opacity="0.3"/>
    <path d="M12 2.5c-3.9 3.9-5.5 9.3-4.3 14.3l2.6-2.6c-.3-1.3-.3-2.7.1-4.1.9-2.5 2.8-4.4 4.6-5.8-1.1-.7-2.1-1.3-3-1.8zM4.4 18.2l1.4 1.4 3.2-3.2-1.4-1.4-3.2 3.2zm14.2-12.6c-2.2 2.2-5.2 5.8-5.8 9.5l2.6 2.6c5-1.2 10.4-2.8 14.3-6.7-1.2-.1-2.5-.5-3.7-1.1-1.9 1.5-3.6 2.7-5.1 3.5.4-1.5 1.2-3.2 2.5-4.9-.6-1.2-1-2.5-1.1-3.7l-3.7.8z" fill="var(--icon-primary)"/>
    <circle cx="12" cy="6" r="1.5" fill="var(--icon-primary)"/>
    <path d="M5 21l2-2m4 0l2 2" stroke="var(--icon-primary)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// 통계 섹션용 아이콘
const ProjectIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.2"/>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" fill="currentColor"/>
  </svg>
);

const StarIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" fill="currentColor" opacity="0.2"/>
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2zm0 3.77l1.84 4.35 4.72.4-3.58 3.11 1.08 4.62L12 15.4l-4.06 2.85 1.08-4.62-3.58-3.11 4.72-.4L12 5.77z" fill="currentColor"/>
  </svg>
);

const ClockIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
  </svg>
);

// 체크 서클 아이콘 (신뢰/혜택)
const CheckCircleIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <circle cx="12" cy="12" r="10" fill="var(--icon-secondary)" opacity="0.4"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--icon-primary)"/>
  </svg>
);

// 전화 아이콘
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
  </svg>
);

// 이메일 아이콘
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
  </svg>
);

// 메뉴 아이콘
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
  </svg>
);

// 닫기 아이콘
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
  </svg>
);

// 스크롤 애니메이션 훅 (단일 요소용)
const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// 스크롤 애니메이션 훅 (다중 요소용 - scroll-animate 클래스 자동 적용)
const useScrollAnimation = (ref) => {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const items = ref.current.querySelectorAll('.scroll-animate');
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [ref]);
};

// Header 컴포넌트 (고정 네비게이션)
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: '서비스', id: 'includes' },
    { label: '포트폴리오', id: 'portfolio' },
    { label: '제작과정', id: 'process' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          JD8
        </div>

        <nav className={`header-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className="nav-link"
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="header-cta"
          onClick={() => scrollToSection('contact')}
        >
          무료 상담
        </button>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴"
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className="mobile-nav-link"
            onClick={() => scrollToSection(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button
          className="mobile-cta"
          onClick={() => scrollToSection('contact')}
        >
          무료 상담 신청
        </button>
      </div>
    </header>
  );
};

// Hero 섹션
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 페이지 로드 후 애니메이션 시작
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPortfolio = () => {
    document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      {/* 배경 레이어들 */}
      <div className="hero-bg-image"></div>
      <div className="hero-overlay"></div>
      <div className="hero-bg-pattern"></div>
      <div className="hero-bg-grid"></div>
      <div className="hero-dots"></div>

      {/* 플로팅 Blob 요소들 */}
      <div className="hero-blob hero-blob-1"></div>
      <div className="hero-blob hero-blob-2"></div>
      <div className="hero-blob hero-blob-3"></div>

      <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>
        <p className="hero-subtitle">홈페이지 제작</p>
        <h1 className="hero-title">
          아직도 <span className="strike-through">100만원</span> <span className="strike-through">200만원</span>
          <br />비싸게 만드세요? <br />매월 선착순 홈페이지 제작
        </h1>
        <div className="hero-price-box glass">
          <span className="price-amount">30<span className="price-unit">만원</span></span>
          <span className="price-suffix">이면 충분합니다</span>
        </div>
        <p className="hero-desc">
          복잡한 견적, 숨겨진 비용 없이<br />
          프로페셔널한 홈페이지를 합리적인 가격에
        </p>
        <div className="hero-cta-group">
          <button className="cta-button primary" onClick={scrollToContact}>
            무료 상담 신청하기
            <span className="cta-arrow">→</span>
          </button>
          <button className="cta-button secondary" onClick={scrollToPortfolio}>
            포트폴리오 보기
          </button>
        </div>
        <div className="hero-trust">
          <span className="trust-item"><CheckCircleIcon size={14} /> 300+ 제작 완료</span>
          <span className="trust-divider">·</span>
          <span className="trust-item"><CheckCircleIcon size={14} /> 100% 만족 보장</span>
          <span className="trust-divider">·</span>
          <span className="trust-item"><CheckCircleIcon size={14} /> 5일 평균 완성</span>
        </div>
      </div>
      <div className="scroll-indicator">
        <span>스크롤</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
};

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

// 비교 섹션
const CompareSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <section className="compare" id="compare">
      <div className="section-container">
        <h2 className="section-title">300만원 가치의 홈페이지를 <br /> 30만원에</h2>
        <p className="section-subtitle">똑같은 퀄리티, 합리적인 가격</p>
        
        <div className={`compare-table ${isVisible ? 'animate-in' : ''}`} ref={ref}>
          <div className="compare-row compare-header">
            <div className="compare-cell"></div>
            <div className="compare-cell competitor">일반 업체</div>
            <div className="compare-cell us">저희</div>
          </div>
          <div className="compare-row">
            <div className="compare-cell label">제작 비용</div>
            <div className="compare-cell competitor">100~300만원</div>
            <div className="compare-cell us highlight">30만원</div>
          </div>
          <div className="compare-row">
            <div className="compare-cell label">제작 기간</div>
            <div className="compare-cell competitor">2~4주</div>
            <div className="compare-cell us highlight">3~7일</div>
          </div>
          <div className="compare-row">
            <div className="compare-cell label">반응형</div>
            <div className="compare-cell competitor">추가 비용</div>
            <div className="compare-cell us highlight">기본 포함</div>
          </div>
          <div className="compare-row">
            <div className="compare-cell label">유지보수</div>
            <div className="compare-cell competitor">느리거나 안됨</div>
            <div className="compare-cell us highlight">빠르고 가능</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 화살표 아이콘
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

// 포트폴리오 섹션
const PortfolioSection = () => {
  const sectionRef = useRef(null);
  useScrollAnimation(sectionRef);

  // 레퍼런스 사이트 데이터
  const portfolios = [
    {
      id: 'cafe',
      category: 'fnb',
      categoryLabel: 'F&B',
      title: 'BREW HOUSE',
      desc: '프리미엄 스페셜티 커피 브랜드의 감각적인 웹사이트',
      tags: ['카페', '브랜딩', '반응형'],
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
      link: '/references/cafe/index.html'
    },
    {
      id: 'trading',
      category: 'corporate',
      categoryLabel: '기업',
      title: '글로벌트레이드',
      desc: '수출입 전문 무역회사의 신뢰감 있는 기업 웹사이트',
      tags: ['무역', 'B2B', '기업'],
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      link: '/references/trading/index.html'
    },
    {
      id: 'shopping',
      category: 'commerce',
      categoryLabel: '커머스',
      title: 'MODEN',
      desc: '미니멀한 감성의 프리미엄 라이프스타일 쇼핑몰',
      tags: ['쇼핑몰', '미니멀', 'e커머스'],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      link: '/references/shopping/index.html'
    },
    {
      id: 'lawfirm',
      category: 'professional',
      categoryLabel: '전문직',
      title: '법무법인 정의',
      desc: '권위와 신뢰를 전달하는 법률사무소 웹사이트',
      tags: ['로펌', '전문직', '상담'],
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
      link: '/references/lawfirm/index.html'
    },
    {
      id: 'fitness',
      category: 'fitness',
      categoryLabel: '피트니스',
      title: 'FIT STUDIO',
      desc: '에너지 넘치는 프리미엄 피트니스 센터 웹사이트',
      tags: ['헬스', 'PT', '운동'],
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      link: '/references/fitness/index.html'
    },
    {
      id: 'nailshop',
      category: 'beauty',
      categoryLabel: '뷰티',
      title: 'NAIL ATELIER',
      desc: '세련된 감성의 프리미엄 네일 아트 샵',
      tags: ['네일', '뷰티', '예약'],
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
      link: '/references/nailshop/index.html'
    },
    {
      id: 'techcorp',
      category: 'tech',
      categoryLabel: 'IT/테크',
      title: 'TECHCORP',
      desc: '첨단 기술 기업의 다크 모던 프리미엄 웹사이트',
      tags: ['IT', '기술', '기업'],
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      link: '/references/techcorp/index.html'
    },
    {
      id: 'construction',
      category: 'construction',
      categoryLabel: '건설',
      title: '한성건설',
      desc: '신뢰와 전문성을 갖춘 종합 건설 기업 웹사이트',
      tags: ['건설', '시공', '기업'],
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      link: '/references/construction/index.html'
    }
  ];

  return (
    <section className="portfolio" id="portfolio" ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-title scroll-animate">포트폴리오</h2>
        <p className="section-subtitle scroll-animate stagger-1">다양한 업종의 실제 제작 사례</p>

        <div className="portfolio-grid">
          {portfolios.map((item, index) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`portfolio-card scroll-animate stagger-${(index % 6) + 1}`}
              data-category={item.category}
            >
              <div className="card-image">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />
                <div className="card-overlay"></div>
                <span className={`card-category category-${item.category}`}>{item.categoryLabel}</span>
              </div>
              <div className="card-content">
                <h3 className="card-title">{item.title}</h3>
                <p className="card-desc">{item.desc}</p>
                <div className="card-tags">
                  {item.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="card-tag">{tag}</span>
                  ))}
                </div>
                <span className="card-link">
                  View Project <ArrowIcon />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// 숫자 카운팅 훅 (easeOutExpo 적용 - 부드러운 감속)
const useCountUp = (end, duration = 2000, isVisible) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // easeOutExpo: 빠르게 시작하고 부드럽게 감속
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return count;
};

// 실적 통계 섹션
const StatsSection = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const projectCount = useCountUp(300, 2000, isVisible);
  const satisfactionRate = useCountUp(100, 2000, isVisible);
  const avgDays = useCountUp(5, 1500, isVisible);

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

// 고객 후기 섹션 (슬라이드)
const ReviewsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [ref, isVisible] = useIntersectionObserver();

  const reviews = [
    {
      name: '김*호 대표',
      business: '카페 운영',
      content: '30만원에 이 퀄리티라니 솔직히 놀랐습니다. 다른 곳은 100만원 넘게 불렀는데...',
      rating: 5
    },
    {
      name: '이*영 실장',
      business: '인테리어 업체',
      content: '요청사항 빠르게 반영해주시고, 3일 만에 완성됐어요. 카톡 응대도 빠르셨습니다.',
      rating: 5
    },
    {
      name: '박*준 원장',
      business: '치과의원',
      content: '병원 홈페이지 깔끔하게 잘 만들어주셨어요. 환자분들 반응도 좋습니다.',
      rating: 5
    },
    {
      name: '최*민 대표',
      business: '온라인 쇼핑몰',
      content: '쇼핑몰 리뉴얼했는데 매출이 30% 올랐어요. 디자인이 확실히 다르네요.',
      rating: 5
    },
    {
      name: '정*수 원장',
      business: '피부과의원',
      content: '예약 문의가 확실히 늘었습니다. 모바일에서도 깔끔하게 보여서 만족해요.',
      rating: 5
    },
    {
      name: '한*진 대표',
      business: '법률사무소',
      content: '전문적이면서도 신뢰감 있는 디자인으로 잘 만들어주셨습니다. 추천드려요.',
      rating: 5
    },
    {
      name: '송*아 실장',
      business: '네일샵',
      content: '인스타 감성으로 예쁘게 만들어주셔서 고객분들이 홈페이지 보고 많이 오세요!',
      rating: 5
    },
    {
      name: '윤*혁 대표',
      business: 'PT 스튜디오',
      content: '빠른 작업에 퀄리티까지 좋아서 주변에 많이 추천하고 있습니다.',
      rating: 5
    }
  ];

  // 한 번에 보여줄 카드 수 (반응형)
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  };

  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlaying || !isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (reviews.length - visibleCount + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isVisible, reviews.length, visibleCount]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % (reviews.length - visibleCount + 1));
  };

  const prevSlide = () => {
    goToSlide(currentIndex === 0 ? reviews.length - visibleCount : currentIndex - 1);
  };

  return (
    <section className="reviews" id="reviews">
      <div className="section-container">
        <h2 className="section-title">고객 후기</h2>
        <p className="section-subtitle">실제 고객님들의 생생한 리뷰</p>

        <div className={`reviews-slider-container ${isVisible ? 'animate-in' : ''}`} ref={ref}>
          <button className="slider-arrow slider-arrow-left" onClick={prevSlide} aria-label="이전">
            ‹
          </button>

          <div className="reviews-slider">
            <div
              className="reviews-track"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="review-card"
                  style={{ flex: `0 0 ${100 / visibleCount}%` }}
                >
                  <div className="review-rating">
                    {'★'.repeat(review.rating)}
                  </div>
                  <p className="review-content">"{review.content}"</p>
                  <div className="review-author">
                    <span className="review-name">{review.name}</span>
                    <span className="review-business">{review.business}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="slider-arrow slider-arrow-right" onClick={nextSlide} aria-label="다음">
            ›
          </button>
        </div>

        {/* 인디케이터 */}
        <div className="slider-indicators">
          {Array.from({ length: reviews.length - visibleCount + 1 }).map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// FAQ 섹션
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [ref, isVisible] = useIntersectionObserver();
  
  const faqs = [
    {
      q: '정말 30만원에 다 포함인가요?',
      a: '네, 맞습니다. 디자인, 개발, 반응형, 기본 SEO, 문의폼까지 모두 포함된 가격입니다. 추가 비용은 없습니다.'
    },
    {
      q: '제작 기간은 얼마나 걸리나요?',
      a: '원페이지 기준 최단 7일, 평균 1~2주 정도 소요됩니다. 페이지 수와 기능에 따라 달라질 수 있습니다.'
    },
    {
      q: '수정은 몇 번까지 가능한가요?',
      a: '기본 1회 수정이 포함되어 있습니다. 추가 수정이 필요하시면 별도 협의 가능합니다.'
    },
    {
      q: '호스팅/도메인은 어떻게 하나요?',
      a: '호스팅과 도메인은 별도입니다. 원하시면 저렴한 업체를 추천해드리거나 대행 세팅도 도와드립니다.'
    },
    {
      q: '디자인 시안을 미리 볼 수 있나요?',
      a: '네, 제작 전 컨셉과 레퍼런스를 충분히 협의한 후 진행하며, 중간 검수 단계에서 시안을 확인하실 수 있습니다.'
    }
  ];

  return (
    <section className="faq" id="faq">
      <div className="section-container">
        <h2 className="section-title">자주 묻는 질문</h2>
        <p className="section-subtitle">궁금한 점을 미리 확인하세요</p>
        
        <div className={`faq-list ${isVisible ? 'animate-in' : ''}`} ref={ref}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'open' : ''}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <button 
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.q}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 문의하기 섹션
const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    business_type: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 구글 스프레드시트 연동 URL (Apps Script 배포 후 여기에 붙여넣기)
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIRoMgwtz8IxWx448eai99E-1uyKp3GwOno7DNVfebtXHUrvfXV-dLTknRJ3jgDbs/exec';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // 구글 스프레드시트로 전송
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // CORS 우회
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toLocaleString('ko-KR'),
        }),
      });

      // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 처리
      setSubmitResult({ type: 'success', message: '문의가 성공적으로 접수되었습니다! 24시간 내 연락드리겠습니다.' });
      setFormData({
        name: '',
        phone: '',
        business_type: '',
        message: ''
      });
    } catch (error) {
      setSubmitResult({ type: 'error', message: '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="section-container">
        <div className="contact-wrapper">
          <div className="contact-info">
            <h2 className="contact-title">무료 상담 신청</h2>
            <p className="contact-desc">
              간단한 정보만 남겨주시면<br />
              <strong>24시간 내</strong> 연락드립니다
            </p>
            <div className="contact-benefits">
              <div className="benefit-item">
                <span className="benefit-icon"><CheckCircleIcon size={18} /></span>
                <span>부담 없는 무료 상담</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon"><CheckCircleIcon size={18} /></span>
                <span>견적 후 결정해도 OK</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon"><CheckCircleIcon size={18} /></span>
                <span>카카오톡 빠른 응대</span>
              </div>
            </div>
          </div>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">이름 / 업체명 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="홍길동 / 카페OO"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">연락처 *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="010-1234-5678"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="business_type">업종</label>
              <select
                id="business_type"
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
              >
                <option value="">선택해주세요</option>
                <option value="요식업">요식업 (카페, 식당 등)</option>
                <option value="쇼핑몰">쇼핑몰 / 판매</option>
                <option value="서비스업">서비스업</option>
                <option value="의료">병원 / 클리닉</option>
                <option value="기업">기업 / 스타트업</option>
                <option value="개인">개인 / 포트폴리오</option>
                <option value="기타">기타</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">요청사항</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="제작하고 싶은 홈페이지에 대해 자유롭게 적어주세요"
                rows="3"
              ></textarea>
            </div>
            
            {submitResult && (
              <div className={`submit-result ${submitResult.type}`}>
                {submitResult.message}
              </div>
            )}
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? '접수 중...' : '무료 상담 신청하기'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="footer">
      <div className="section-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>주식회사 제이디에이치</h3>
            <p>합리적인 가격의 홈페이지 제작</p>
          </div>
          <div className="footer-contact">
            <p><PhoneIcon /> 대표전화: 1566-3046</p>
            <p>대표자: 정동환</p>
          </div>
        </div>
        <div className="footer-info">
          <p>사업자등록번호: 503-87-03619</p>
          <p>주소: 경기도 용인시 기흥구 금화로 3, 제이20호</p>
        </div>
        <div className="footer-bottom">
          <p>© 2024 주식회사 제이디에이치. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// 플로팅 버튼들 (카카오톡 + 상담)
const FloatingButtons = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  };

  // 카카오톡 채널 URL (실제 채널 ID로 교체 필요)
  const kakaoChannelUrl = 'https://pf.kakao.com/_xxxxx';

  return (
    <div className={`floating-buttons ${isVisible ? 'visible' : ''}`}>
      <a 
        href={kakaoChannelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn kakao"
        title="카카오톡 상담"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 3C6.48 3 2 6.58 2 11c0 2.76 1.74 5.18 4.36 6.56-.14.53-.51 1.93-.59 2.23-.1.37.14.36.29.27.12-.08 1.84-1.22 2.58-1.71.44.06.89.1 1.36.1 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
        </svg>
      </a>
      <button 
        className="floating-btn cta"
        onClick={scrollToContact}
      >
        지금문의
      </button>
    </div>
  );
};

// 메인 App
function App() {
  return (
    <div className="landing-page">
      <Header />
      <HeroSection />
      <StatsSection />
      <IncludesSection />
      <CompareSection />
      <PortfolioSection />
      <ProcessSection />
      <ReviewsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <FloatingButtons />
    </div>
  );
}

export default App;
