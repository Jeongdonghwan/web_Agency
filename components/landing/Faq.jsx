'use client';

import { useState } from 'react';
import { useIntersectionObserver } from './hooks';
import { landingFaqs } from '../../data/landing-faqs';

// FAQ 섹션
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <section className="faq" id="faq">
      <div className="section-container">
        <h2 className="section-title">자주 묻는 질문</h2>
        <p className="section-subtitle">궁금한 점을 미리 확인하세요</p>

        <div className={`faq-list ${isVisible ? 'animate-in' : ''}`} ref={ref}>
          {landingFaqs.map((faq, index) => (
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

export default FAQSection;
