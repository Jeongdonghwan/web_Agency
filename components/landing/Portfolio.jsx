'use client';

import { useState, useRef } from 'react';
import { useScrollAnimation } from './hooks';
import { ArrowIcon } from './icons';
import { portfolios } from '../../data/portfolios';

// 포트폴리오 섹션
const PortfolioSection = () => {
  const sectionRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all');
  useScrollAnimation(sectionRef);

  const filterCategories = [
    { key: 'all', label: '전체' },
    { key: 'fnb', label: 'F&B' },
    { key: 'corporate', label: '기업' },
    { key: 'commerce', label: '커머스' },
    { key: 'professional', label: '전문직' },
    { key: 'finance', label: '금융' },
    { key: 'education', label: '교육' },
    { key: 'service', label: '서비스' },
  ];

  const filteredPortfolios = activeFilter === 'all'
    ? portfolios
    : portfolios.filter(p => p.category === activeFilter);

  return (
    <section className="portfolio" id="portfolio" ref={sectionRef}>
      <div className="section-container">
        <h2 className="section-title scroll-animate">포트폴리오</h2>
        <p className="section-subtitle scroll-animate stagger-1">다양한 업종의 실제 제작 사례</p>

        <div className="portfolio-filters scroll-animate stagger-2">
          {filterCategories.map((cat) => (
            <button
              key={cat.key}
              className={`filter-btn ${activeFilter === cat.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="portfolio-grid">
          {filteredPortfolios.map((item, index) => (
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

export default PortfolioSection;
