import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';

// 최신 칼럼 섹션 (서버 컴포넌트 — 홈 → 블로그 내부링크)
const LatestPosts = () => {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="home-posts-section">
      <div className="section-container">
        <h2 className="section-title">홈페이지 제작 인사이트</h2>
        <p className="section-subtitle">비용, 검색 노출, 준비물 — 사장님들이 가장 많이 묻는 것들을 정리했습니다</p>

        <div className="home-posts">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}/`} className="home-post-card">
              <span className="home-post-tag">{post.tags[0] || '칼럼'}</span>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <span className="home-post-more">읽어보기 →</span>
            </Link>
          ))}
        </div>

        <Link href="/blog/" className="view-all">
          블로그 전체보기 →
        </Link>
      </div>
    </section>
  );
};

export default LatestPosts;
