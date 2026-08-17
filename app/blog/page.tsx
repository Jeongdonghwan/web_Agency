import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';
import PostList from '../../components/blog/PostList';
import JsonLd from '../../components/seo/JsonLd';
import { breadcrumbJsonLd } from '../../lib/jsonld';

export const metadata: Metadata = {
  title: '홈페이지 제작 블로그 - 비용, 기획, SEO 가이드',
  description:
    '홈페이지 제작 비용부터 업종별 기획 노하우, 네이버·구글 검색 노출 방법까지. 홈페이지 제작 전문 JD8이 실무 경험을 바탕으로 알려드립니다.',
  alternates: { canonical: '/blog/' },
  openGraph: {
    title: '홈페이지 제작 블로그 | JD8',
    description: '홈페이지 제작 비용, 기획, SEO — 실무 노하우를 공유합니다.',
    url: '/blog/',
  },
};

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: '홈', path: '/' },
            { name: '블로그', path: '/blog/' },
          ])}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <span>블로그</span>
        </nav>

        <header className="page-header">
          <span className="page-eyebrow">BLOG</span>
          <h1>홈페이지 제작 블로그</h1>
          <p className="page-lead">
            제작 비용, 업종별 기획, 검색 노출(SEO)까지 — 홈페이지를 준비하는 사장님들을 위한 실무 가이드를 연재합니다.
          </p>
        </header>

        <PostList posts={posts} />
      </div>
    </main>
  );
}
