'use client';

import { useState } from 'react';
import { CheckCircleIcon } from './icons';

// 문의하기 섹션 (구글 스프레드시트 연동)
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

  // 구글 스프레드시트 연동 URL (Apps Script)
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIRoMgwtz8IxWx448eai99E-1uyKp3GwOno7DNVfebtXHUrvfXV-dLTknRJ3jgDbs/exec';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
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

export default ContactSection;
