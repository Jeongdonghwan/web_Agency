import Link from 'next/link';
import { getPopularIndustries, getAllIndustries } from '../../lib/industries';

// 메인 랜딩 업종 섹션 (서버 컴포넌트 — 내부링크 확보용)
const HomeIndustries = () => {
  const popular = getPopularIndustries(12);
  const total = getAllIndustries().length;

  if (popular.length === 0) return null;

  return (
    <section className="home-industries" id="industries">
      <div className="section-container">
        <h2 className="section-title">업종별 홈페이지 제작</h2>
        <p className="section-subtitle">우리 업종에 필요한 기능과 디자인, 미리 확인하세요</p>
        <div className="industry-grid">
          {popular.map((ind) => (
            <Link key={ind.slug} href={`/homepage/${ind.slug}/`}>
              {ind.name}
            </Link>
          ))}
        </div>
        <Link href="/homepage/" className="view-all">
          {total}개 업종 전체보기 →
        </Link>
      </div>
    </section>
  );
};

export default HomeIndustries;
