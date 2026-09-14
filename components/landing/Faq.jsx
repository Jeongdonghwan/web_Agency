'use client';

import { useState } from 'react';
import { KakaoIcon } from './icons';
import { landingFaqs } from '../../data/landing-faqs';

// V4 FAQ — 좌측 고정 타이틀 + 우측 아코디언 (2단)
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="lp-faq" id="faq">
      <div className="lp-container">
        <div className="lp-faq-grid">
          <div className="lp-faq-left">
            <span className="lp-eyebrow">FAQ</span>
            <h2 className="lp-h2">이런 내용이<br />궁금하셨나요?</h2>
            <p className="lp-sub">사장님들이 가장 많이 물어보시는 질문들을 정리했습니다.</p>
            <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="lp-pill">
              <KakaoIcon size={18} /> 궁금한 내용이 더 있어요
              <span className="lp-pill-arrow">→</span>
            </a>
          </div>

          <div className="lp-faq-list">
            {landingFaqs.map((faq, index) => (
              <div key={index} className={`lp-faq-item ${openIndex === index ? 'open' : ''}`}>
                <button
                  className="lp-faq-q"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span>{faq.q}</span>
                  <span className="lp-faq-plus">+</span>
                </button>
                <div className="lp-faq-a">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
