import fs from 'node:fs';
import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { getAllIndustries, getActiveCategories } from '../lib/industries';
import { getAllPosts } from '../lib/posts';
import { getAllServices, serviceEncodedPath } from '../lib/services';
import { getAllRegions, regionEncodedPath } from '../lib/regions';
import { getAllDongs, dongEncodedPath } from '../lib/dongs';
import { portfolios } from '../data/portfolios';

// lastmod는 실제 내용이 바뀐 시각만 쓴다. 빌드 시각(new Date())을 박으면 매 빌드마다 전 URL이
// "수정됨"이 되어 검색엔진이 lastmod 신호를 무시한다.
const mtime = (...files: string[]) => new Date(Math.max(...files.map((f) => fs.statSync(f).mtimeMs)));
const latest = (dates: (string | Date | undefined)[]) =>
  new Date(Math.max(...dates.filter(Boolean).map((d) => new Date(d as string).getTime())));

// 빌드 시 out/sitemap.xml 로 생성됨 (output: 'export')
export default function sitemap(): MetadataRoute.Sitemap {
  const industries = getAllIndustries();
  const services = getAllServices();
  const regions = getAllRegions();
  const posts = getAllPosts();

  const postsUpdated = latest(posts.map((p) => p.updatedAt || p.date));
  const industriesUpdated = latest(industries.map((i) => i.updatedAt));
  const dongsUpdated = mtime(
    'lib/dongs.ts',
    'data/seoul-dongs.json',
    'data/gg-dongs.json',
    'data/city-dongs.json',
    'data/expansion-dongs.json',
    'data/portfolios.js',
  );
  const demosUpdated = mtime('data/portfolios.js');

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: postsUpdated, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/homepage/`, lastModified: industriesUpdated, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog/`, lastModified: postsUpdated, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/references/index.html`, lastModified: demosUpdated, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 카테고리 허브
  for (const cat of getActiveCategories()) {
    entries.push({
      url: `${SITE_URL}/homepage/category/${cat.slug}/`,
      lastModified: industriesUpdated,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // 업종 페이지
  for (const ind of industries) {
    entries.push({
      url: `${SITE_URL}/homepage/${encodeURIComponent(ind.urlSlug)}/`,
      lastModified: new Date(ind.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // 제작 서비스
  if (services.length > 0) {
    entries.push({ url: `${SITE_URL}/service/`, lastModified: latest(services.map((s) => s.updatedAt)), changeFrequency: 'weekly', priority: 0.9 });
    for (const s of services) {
      entries.push({
        url: `${SITE_URL}${serviceEncodedPath(s)}`,
        lastModified: new Date(s.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.9,
      });
    }
  }

  // 지역 페이지
  if (regions.length > 0) {
    entries.push({ url: `${SITE_URL}/region/`, lastModified: latest([...regions.map((r) => r.updatedAt), dongsUpdated]), changeFrequency: 'weekly', priority: 0.7 });
    for (const r of regions) {
      entries.push({
        url: `${SITE_URL}${regionEncodedPath(r)}`,
        lastModified: new Date(r.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // 동 단위 페이지
  for (const d of getAllDongs()) {
    entries.push({
      url: `${SITE_URL}${dongEncodedPath(d)}`,
      lastModified: dongsUpdated,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // 블로그 글
  for (const post of posts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}/`,
      lastModified: new Date(post.updatedAt || post.date),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // 레퍼런스 데모 (기존 색인 URL 유지)
  for (const demo of portfolios) {
    entries.push({
      url: `${SITE_URL}${demo.link}`,
      lastModified: demosUpdated,
      changeFrequency: 'yearly',
      priority: 0.3,
    });
  }

  return entries;
}
