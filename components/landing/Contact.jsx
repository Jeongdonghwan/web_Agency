import { CheckCircleIcon, KakaoIcon, PhoneIcon } from './icons';

// 문의 섹션 — 입력 폼 없이 카카오톡 상담 단일 동선
const ContactSection = () => {
  return (
    <section className="contact" id="contact">
      <div className="section-container">
        <div className="contact-wrapper">
          <div className="contact-info">
            <h2 className="contact-title">무료 상담 신청</h2>
            <p className="contact-desc">
              카카오톡으로 편하게 물어보세요<br />
              <strong>빠르게</strong> 답변드립니다
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

          <div className="contact-form contact-kakao">
            <div className="contact-kakao-icon"><KakaoIcon size={52} /></div>
            <h3>카카오톡으로 바로 상담하세요</h3>
            <p>
              업종과 원하시는 스타일만 말씀해주시면<br />
              구성과 견적을 바로 안내해드립니다.
            </p>
            <a
              href="https://pf.kakao.com/_Izxnxgn"
              target="_blank"
              rel="noopener noreferrer"
              className="submit-button kakao-submit"
            >
              <KakaoIcon size={20} /> 카톡 문의하기
            </a>
            <a href="tel:1566-3046" className="contact-phone-link">
              <PhoneIcon /> 전화 상담 1566-3046
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
