import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getAdjacentPosts } from '../../../lib/posts';
import { getIndustryBySlug } from '../../../lib/industries';
import { markdownToHtml } from '../../../lib/markdown';
import JsonLd from '../../../components/seo/JsonLd';
import { articleJsonLd, breadcrumbJsonLd } from '../../../lib/jsonld';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}/`,
      publishedTime: post.date,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const html = await markdownToHtml(post.content);
  const { prev, next } = getAdjacentPosts(post.slug);
  const industries = post.industries
    .map((slug) => getIndustryBySlug(slug))
    .filter(Boolean);
  const path = `/blog/${post.slug}/`;

  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '블로그', path: '/blog/' },
              { name: post.title, path },
            ]),
            articleJsonLd({
              title: post.title,
              description: post.description,
              path,
              datePublished: post.date,
              dateModified: post.updatedAt,
            }),
          ]}
        />

        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href="/blog/">블로그</Link>
          <span className="sep">›</span>
          <span>{post.title}</span>
        </nav>

        <header className="page-header">
          <h1>{post.title}</h1>
        </header>
        <div className="post-header-meta">
          <time dateTime={post.date}>{post.date}</time>
          {post.tags.map((tag) => (
            <span key={tag} className="post-tag">{tag}</span>
          ))}
        </div>

        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {industries.length > 0 && (
          <section className="content-section">
            <h2>관련 업종 홈페이지 제작</h2>
            <div className="related-grid">
              {industries.map((ind: any) => (
                <Link key={ind.slug} href={`/homepage/${ind.slug}/`}>
                  {ind.name} 홈페이지 제작
                  <span>{ind.categoryName}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="post-nav">
          {prev ? (
            <Link href={`/blog/${prev.slug}/`}>
              <span>이전 글</span>
              {prev.title}
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/blog/${next.slug}/`} className="next">
              <span>다음 글</span>
              {next.title}
            </Link>
          ) : <span />}
        </div>

        <div className="cta-banner">
          <h2>홈페이지 제작이 필요하신가요?</h2>
          <p>JD8이 업종에 맞는 홈페이지를 평균 7일 안에 만들어드립니다.</p>
          <div className="cta-actions">
            <a href="/#contact" className="primary">무료 상담 신청</a>
            <a href="http://pf.kakao.com/_Izxnxgn" target="_blank" rel="noopener noreferrer" className="ghost">카톡 문의</a>
          </div>
        </div>
      </div>
    </main>
  );
}
