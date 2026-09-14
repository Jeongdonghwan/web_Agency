import HeroSection from '../components/landing/Hero';
import StatsSection from '../components/landing/Stats';
import WorkingSection from '../components/landing/Working';
import LatestPosts from '../components/landing/LatestPosts';
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
    <main className="lp">
      <JsonLd data={faqPageJsonLd(landingFaqs)} />
      <HeroSection />
      <StatsSection />
      <WorkingSection />
      <PortfolioSection />
      <IncludesSection />
      <CompareSection />
      <HomeIndustries />
      <ProcessSection />
      <ReviewsSection />
      <LatestPosts />
      <FAQSection />
      <ContactSection />
    </main>
  );
}
