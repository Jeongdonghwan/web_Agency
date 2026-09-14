import Link from 'next/link';
import { getPopularIndustries, getAllIndustries } from '../../lib/industries';

// V4 업종 그리드
const HomeIndustries = () => {
  const popular = getPopularIndustries(12);
  const total = getAllIndustries().length;

  if (popular.length === 0) return null;

  return (
    <section className="lp-industries" id="industries">
      <div className="lp-container">
        <span className="lp-eyebrow">INDUSTRY</span>
        <h2 className="lp-h2">우리 업종은 어떻게 만들까요?</h2>
        <p className="lp-sub">
          {total}개 업종을 연구해 업종별 필수 기능·디자인·FAQ를 정리해두었습니다.
        </p>

        <div className="lp-ind-grid">
          {popular.map((ind) => (
            <Link key={ind.slug} href={`/homepage/${ind.urlSlug}/`}>
              {ind.name}
            </Link>
          ))}
        </div>

        <div className="lp-center">
          <Link href="/homepage/" className="lp-pill">
            {total}개 업종 전체보기
            <span className="lp-pill-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeIndustries;
