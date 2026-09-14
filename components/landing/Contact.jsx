import { KakaoIcon } from './icons';

// V4 최종 CTA 밴드 — 카카오 단일 동선 (id="contact" 유지: 전 사이트 /#contact 링크의 도착지)
const ContactSection = () => {
  return (
    <section className="lp-cta" id="contact">
      <div className="lp-ink i2" aria-hidden="true" style={{ opacity: 0.3 }}></div>
      <h2 className="lp-cta-big">
        홈페이지에 생각과 고민을<br />
        <span className="accent">카톡 한 통</span>으로 보내주세요
      </h2>
      <p className="lp-cta-sub">
        업종과 원하시는 방향만 말씀해주시면 구성과 견적을 바로 안내해드립니다.<br />
        준비된 자료가 없어도 괜찮습니다. 견적 확인은 무료입니다.
      </p>
      <div className="lp-center">
        <a href="https://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="lp-pill kakao-pill">
          <KakaoIcon size={20} /> 카톡으로 무료 상담 받기
          <span className="lp-pill-arrow">→</span>
        </a>
      </div>
      <p className="lp-cta-tel">
        전화가 편하시다면 <a href="tel:1566-3046">1566-3046</a> (평일·주말 상담 가능)
      </p>
    </section>
  );
};

export default ContactSection;
