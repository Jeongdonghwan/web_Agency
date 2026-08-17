'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, CloseIcon } from './icons';

// Header 컴포넌트 (고정 네비게이션) — 홈에서는 부드러운 스크롤, 다른 페이지에서는 /#앵커로 이동
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnchor = (e, id) => {
    if (isHome) {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const anchorItems = [
    { label: '서비스', id: 'includes' },
    { label: '포트폴리오', id: 'portfolio' },
    { label: 'FAQ', id: 'faq' },
  ];

  const pageItems = [
    { label: '업종별 제작', href: '/homepage/' },
    { label: '블로그', href: '/blog/' },
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link href="/" className="header-logo" onClick={() => setMobileMenuOpen(false)}>
          JD8
        </Link>

        <nav className={`header-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {anchorItems.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              className="nav-link"
              onClick={(e) => handleAnchor(e, item.id)}
            >
              {item.label}
            </a>
          ))}
          {pageItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          className="header-cta"
          href="/#contact"
          onClick={(e) => handleAnchor(e, 'contact')}
        >
          무료 상담
        </a>

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
        {anchorItems.map((item) => (
          <a
            key={item.id}
            href={`/#${item.id}`}
            className="mobile-nav-link"
            onClick={(e) => handleAnchor(e, item.id)}
          >
            {item.label}
          </a>
        ))}
        {pageItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <a
          className="mobile-cta"
          href="/#contact"
          onClick={(e) => handleAnchor(e, 'contact')}
        >
          무료 상담 신청
        </a>
      </div>
    </header>
  );
};

export default Header;
