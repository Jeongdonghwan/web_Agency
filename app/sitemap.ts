import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { getAllIndustries, getActiveCategories } from '../lib/industries';
import { getAllPosts } from '../lib/posts';
import { getAllServices, serviceEncodedPath } from '../lib/services';
import { getAllRegions, regionEncodedPath } from '../lib/regions';
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
      url: `${SITE_URL}/homepage/${encodeURIComponent(ind.urlSlug)}/`,
      lastModified: ind.updatedAt ? new Date(ind.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // 제작 서비스
  if (getAllServices().length > 0) {
    entries.push({ url: `${SITE_URL}/service/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 });
    for (const s of getAllServices()) {
      entries.push({
        url: `${SITE_URL}${serviceEncodedPath(s)}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.9,
      });
    }
  }

  // 지역 페이지
  if (getAllRegions().length > 0) {
    entries.push({ url: `${SITE_URL}/region/`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
    for (const r of getAllRegions()) {
      entries.push({
        url: `${SITE_URL}${regionEncodedPath(r)}`,
        lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
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
