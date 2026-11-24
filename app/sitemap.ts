import fs from 'node:fs';
import type { MetadataRoute } from 'next';
import { SITE_URL, UPDATED } from '../lib/site';
import { getAllIndustries, getActiveCategories } from '../lib/industries';
import { getAllPosts } from '../lib/posts';
import { getAllServices, serviceEncodedPath } from '../lib/services';
import { getAllRegions, regionEncodedPath } from '../lib/regions';
import { getAllDongs, dongEncodedPath } from '../lib/dongs';
import { portfolios } from '../data/portfolios';
import { getOpenWebdocPages, webdocEncodedPath, getOpenHomepageGen, homepageGenEncodedPath, getOpenTaji, tajiEncodedPath, tajiSidoEncodedPath, getOpenTsvc, tsvcEncodedPath, tsvcSidoEncodedPath } from '../lib/webdoc';

// lastmod는 실제 내용이 바뀐 시각만 쓴다. 빌드 시각(new Date())을 박으면 매 빌드마다 전 URL이
// "수정됨"이 되어 검색엔진이 lastmod 신호를 무시한다.
const mtime = (...files: string[]) => new Date(Math.max(...files.map((f) => fs.statSync(f).mtimeMs)));
const latest = (dates: (string | Date | undefined)[]) =>
  new Date(Math.max(...dates.filter(Boolean).map((d) => new Date(d as string).getTime())));

// 빌드 시 out/sitemap.xml 로 생성됨 (output: 'export')
// 키워드형 페이지: 자체 수정일과 공통 개정일(UPDATED) 중 늦은 쪽
const kwLm = (...dates: (string | Date | undefined)[]) => latest([...dates, UPDATED]);

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
      lastModified: kwLm(ind.updatedAt),
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
        lastModified: kwLm(s.updatedAt),
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
        lastModified: kwLm(r.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // 동 단위 페이지
  for (const d of getAllDongs()) {
    entries.push({
      url: `${SITE_URL}${dongEncodedPath(d)}`,
      lastModified: kwLm(dongsUpdated),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // 웹문서 대량제작 — 열린 묶음만. lastmod = 내용 변경 시각과 공개일 중 늦은 쪽
  const webdoc = getOpenWebdocPages();
  const webdocData = mtime('data/webdoc/industries.json', 'lib/webdoc.ts');
  const webdocLm = (p: (typeof webdoc)[number]) => latest([p.openDate, p.kind === 'core' ? p.updatedAt : webdocData]);
  if (webdoc.length) {
    entries.push({ url: `${SITE_URL}/${encodeURIComponent('웹문서')}/`, lastModified: latest(webdoc.map(webdocLm)), changeFrequency: 'weekly', priority: 0.9 });
    for (const p of webdoc) {
      entries.push({ url: `${SITE_URL}${webdocEncodedPath(p.slug)}`, lastModified: kwLm(webdocLm(p)), changeFrequency: 'monthly', priority: p.kind === 'core' ? 0.9 : 0.7 });
    }
  }

  // 업종 홈페이지 제작(웹문서 업종 데이터로 생성) — 열린 묶음만
  for (const p of getOpenHomepageGen()) {
    entries.push({ url: `${SITE_URL}${homepageGenEncodedPath(p.slug)}`, lastModified: kwLm(p.openDate, webdocData), changeFrequency: 'monthly', priority: 0.7 });
  }

  // 타지역 홍보 (업종 × 시도) — 열린 묶음만
  const taji = getOpenTaji();
  if (taji.length) {
    const tajiData = mtime('data/webdoc/industries.json', 'data/webdoc/sido.json');
    const tajiLm = (d: string) => latest([d, tajiData]);
    entries.push({ url: `${SITE_URL}/${encodeURIComponent('타지역홍보')}/`, lastModified: latest(taji.map((p) => tajiLm(p.openDate))), changeFrequency: 'weekly', priority: 0.9 });
    for (const sd of [...new Set(taji.map((p) => p.sido.name))]) {
      entries.push({ url: `${SITE_URL}${tajiSidoEncodedPath(sd)}`, lastModified: latest(taji.filter((p) => p.sido.name === sd).map((p) => tajiLm(p.openDate))), changeFrequency: 'weekly', priority: 0.8 });
    }
    for (const p of taji) entries.push({ url: `${SITE_URL}${tajiEncodedPath(p.tajiSlug)}`, lastModified: kwLm(tajiLm(p.openDate)), changeFrequency: 'monthly', priority: 0.7 });
  }

  // 타지역서비스 (업종 × 시도) — 열린 묶음만
  const tsvc = getOpenTsvc();
  if (tsvc.length) {
    const tsvcData = mtime('data/webdoc/industries.json', 'data/webdoc/sido.json');
    const tsvcLm = (d: string) => latest([d, tsvcData]);
    entries.push({ url: `${SITE_URL}/${encodeURIComponent('타지역서비스')}/`, lastModified: latest(tsvc.map((p) => tsvcLm(p.openDate))), changeFrequency: 'weekly', priority: 0.9 });
    for (const sd of [...new Set(tsvc.map((p) => p.sido.name))]) {
      entries.push({ url: `${SITE_URL}${tsvcSidoEncodedPath(sd)}`, lastModified: latest(tsvc.filter((p) => p.sido.name === sd).map((p) => tsvcLm(p.openDate))), changeFrequency: 'weekly', priority: 0.8 });
    }
    for (const p of tsvc) entries.push({ url: `${SITE_URL}${tsvcEncodedPath(p.tajiSlug)}`, lastModified: kwLm(tsvcLm(p.openDate)), changeFrequency: 'monthly', priority: 0.7 });
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
