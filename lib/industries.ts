import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import taxonomy from '../data/taxonomy.json';
// @ts-ignore - 공유 ESM 모듈 (한글 슬러그 규칙의 단일 출처)
import { koSlugOf } from './koslug.mjs';
import { mdHead } from './kw';

const INDUSTRIES_DIR = path.join(process.cwd(), 'content', 'industries');

export interface IndustryFaq {
  q: string;
  a: string;
}

export interface IndustryFeature {
  name: string;
  desc: string;
}

export interface IndustryMeta {
  slug: string;      // 영문 내부 id (파일명)
  urlSlug: string;   // 한글 URL 슬러그: "카페-홈페이지제작"
  name: string;
  category: string;
  categoryName: string;
  title: string;     // 키워드 + 수식어 | JD8 (lib/kw.ts mdHead — 프런트매터 title 에서 만든다)
  kw: string;        // 페이지 키워드 (프런트매터 title 의 " - " 앞)
  h1sub: string;     // h1 수식어
  meta: string;      // meta description 45~80자
  summary: string[]; // 핵심 요약
  description: string; // 본문 첫 문단
  keywords: string[];
  painPoints: string[];
  features: IndustryFeature[];
  designPoints: string[];
  faq: IndustryFaq[];
  references: string[];
  relatedIndustries: string[];
  relatedPosts: string[];
  publishedAt: string;
  updatedAt: string;
  draft: boolean;
}

export interface Industry extends IndustryMeta {
  content: string; // 마크다운 원문
}

export const getCategories = () => taxonomy.categories;

export const getCategory = (slug: string) =>
  taxonomy.categories.find((c) => c.slug === slug);

export const getTaxonomyIndustry = (slug: string) =>
  taxonomy.industries.find((i) => i.slug === slug);

const toDateString = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v || '');
};

function parseIndustryFile(filePath: string): Industry {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const slug = String(data.slug || path.basename(filePath, '.md'));
  const category = String(data.category || '');
  const categoryName = getCategory(category)?.name || category;
  const urlSlug = koSlugOf(String(data.name || ''));
  const h = mdHead({ title: String(data.title || ''), features: data.features || [], faq: data.faq || [] }, urlSlug, ['평균 7일 안에 완성합니다.', '견적 확인은 무료입니다.']);
  return {
    slug,
    urlSlug,
    name: String(data.name || ''),
    category,
    categoryName,
    title: h.title,
    kw: h.kw,
    h1sub: h.h1sub,
    meta: h.description,
    summary: h.summary,
    description: String(data.description || ''),
    keywords: data.keywords || [],
    painPoints: data.painPoints || [],
    features: data.features || [],
    designPoints: data.designPoints || [],
    faq: data.faq || [],
    references: data.references || [],
    relatedIndustries: data.relatedIndustries || [],
    relatedPosts: data.relatedPosts || [],
    publishedAt: toDateString(data.publishedAt),
    updatedAt: toDateString(data.updatedAt || data.publishedAt),
    draft: Boolean(data.draft),
    content,
  };
}

let cache: Industry[] | null = null;

// 공개(draft:false) 업종 전체 — 빌드 중 반복 호출되므로 메모이즈
export function getAllIndustries(): Industry[] {
  if (cache) return cache;
  if (!fs.existsSync(INDUSTRIES_DIR)) return (cache = []);
  const files = fs.readdirSync(INDUSTRIES_DIR).filter((f) => f.endsWith('.md'));
  cache = files
    .map((f) => parseIndustryFile(path.join(INDUSTRIES_DIR, f)))
    .filter((i) => !i.draft)
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  // 한글 URL 슬러그 충돌은 페이지 덮어쓰기로 이어지므로 빌드를 중단시킨다
  const seen = new Map<string, string>();
  for (const i of cache) {
    if (seen.has(i.urlSlug)) {
      throw new Error(`urlSlug 충돌: ${seen.get(i.urlSlug)} ↔ ${i.slug} (${i.urlSlug})`);
    }
    seen.set(i.urlSlug, i.slug);
  }
  return cache;
}

export function getIndustryBySlug(slug: string): Industry | undefined {
  return getAllIndustries().find((i) => i.slug === slug);
}

// 한글 URL 슬러그로 조회 (인코딩된 파라미터가 올 수 있어 디코딩 후 비교)
export function getIndustryByUrlSlug(urlSlug: string): Industry | undefined {
  let key = urlSlug;
  try {
    key = decodeURIComponent(urlSlug);
  } catch {}
  return getAllIndustries().find((i) => i.urlSlug === key);
}

// 업종 페이지 절대경로 (링크용은 미인코딩, canonical/사이트맵용은 encodeURIComponent 적용해 사용)
export const industryPath = (ind: { urlSlug: string }) => `/homepage/${ind.urlSlug}/`;
export const industryEncodedPath = (ind: { urlSlug: string }) =>
  `/homepage/${encodeURIComponent(ind.urlSlug)}/`;

export function getIndustriesByCategory(category: string): Industry[] {
  return getAllIndustries().filter((i) => i.category === category);
}

// 발행된 업종이 1개 이상 있는 카테고리 목록
export function getActiveCategories() {
  const all = getAllIndustries();
  return taxonomy.categories.filter((c) => all.some((i) => i.category === c.slug));
}

// 메인 랜딩 노출용 인기 업종 (taxonomy priority 1 우선, 부족하면 이름순)
export function getPopularIndustries(limit = 12): Industry[] {
  const all = getAllIndustries();
  const prio = (slug: string) => getTaxonomyIndustry(slug)?.priority ?? 9;
  return [...all].sort((a, b) => prio(a.slug) - prio(b.slug) || a.name.localeCompare(b.name, 'ko')).slice(0, limit);
}
