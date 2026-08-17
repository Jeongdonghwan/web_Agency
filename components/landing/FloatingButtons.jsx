'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { KakaoIcon } from './icons';

// 플로팅 버튼들 (카카오톡 + 상담) — 홈이 아니면 /#contact로 이동
const FloatingButtons = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContact = (e) => {
    if (isHome) {
      e.preventDefault();
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 카카오톡 채널 URL
  const kakaoChannelUrl = 'http://pf.kakao.com/_Izxnxgn';

  return (
    <div className={`floating-buttons ${isVisible ? 'visible' : ''}`}>
      <a
        href={kakaoChannelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn kakao"
        title="카카오톡 상담"
      >
        <KakaoIcon size={24} />
        <span className="kakao-label">카톡문의</span>
      </a>
      <a
        className="floating-btn cta"
        href="/#contact"
        onClick={handleContact}
      >
        지금문의
      </a>
    </div>
  );
};

export default FloatingButtons;
