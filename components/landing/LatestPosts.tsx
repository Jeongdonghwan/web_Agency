import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';

// V4 최신 칼럼
const LatestPosts = () => {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="lp-posts">
      <div className="lp-container">
        <span className="lp-eyebrow">INSIGHT</span>
        <h2 className="lp-h2">알아두면 도움되는 홈페이지 칼럼</h2>
        <p className="lp-sub">비용, 검색 노출, 준비물 — 사장님들이 가장 많이 묻는 것들</p>

        <div className="lp-post-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}/`} className="lp-post-card">
              <span className="lp-post-tag">{post.tags[0] || '칼럼'}</span>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <span className="lp-post-more">읽어보기 →</span>
            </Link>
          ))}
        </div>

        <div className="lp-center">
          <Link href="/blog/" className="lp-pill">
            칼럼 전체 보러가기
            <span className="lp-pill-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestPosts;
