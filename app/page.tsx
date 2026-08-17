import HeroSection from '../components/landing/Hero';
import StatsSection from '../components/landing/Stats';
import IncludesSection from '../components/landing/Includes';
import CompareSection from '../components/landing/Compare';
import PortfolioSection from '../components/landing/Portfolio';
import HomeIndustries from '../components/landing/HomeIndustries';
import ProcessSection from '../components/landing/Process';
import ReviewsSection from '../components/landing/Reviews';
import FAQSection from '../components/landing/Faq';
import { landingFaqs } from '../data/landing-faqs';
import ContactSection from '../components/landing/Contact';
import JsonLd from '../components/seo/JsonLd';
import { faqPageJsonLd } from '../lib/jsonld';

// 메인 랜딩 페이지 (서버 컴포넌트 — 빌드 시 완성 HTML로 프리렌더)
export default function HomePage() {
  return (
    <main className="landing-page">
      <JsonLd data={faqPageJsonLd(landingFaqs)} />
      <HeroSection />
      <StatsSection />
      <IncludesSection />
      <CompareSection />
      <PortfolioSection />
      <HomeIndustries />
      <ProcessSection />
      <ReviewsSection />
      <FAQSection />
      <ContactSection />
    </main>
  );
}
