'use client';

import { useState, useEffect } from 'react';
import { useIntersectionObserver } from './hooks';

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

export default ReviewsSection;
