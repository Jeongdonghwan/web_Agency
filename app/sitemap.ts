import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { getAllIndustries, getActiveCategories } from '../lib/industries';
import { getAllPosts } from '../lib/posts';
import { portfolios } from '../data/portfolios';

// 빌드 시 out/sitemap.xml 로 생성됨 (output: 'export')
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/homepage/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog/`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/references/index.html`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 카테고리 허브
  for (const cat of getActiveCategories()) {
    entries.push({
      url: `${SITE_URL}/homepage/category/${cat.slug}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // 업종 페이지
  for (const ind of getAllIndustries()) {
    entries.push({
      url: `${SITE_URL}/homepage/${ind.slug}/`,
      lastModified: ind.updatedAt ? new Date(ind.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // 블로그 글
  for (const post of getAllPosts()) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}/`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // 레퍼런스 데모 (기존 색인 URL 유지)
  for (const demo of portfolios) {
    entries.push({
      url: `${SITE_URL}${demo.link}`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    });
  }

  return entries;
}
