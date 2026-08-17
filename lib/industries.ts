import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import taxonomy from '../data/taxonomy.json';

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
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  title: string;
  description: string;
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
  return {
    slug,
    name: String(data.name || ''),
    category,
    categoryName,
    title: String(data.title || ''),
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
  return cache;
}

export function getIndustryBySlug(slug: string): Industry | undefined {
  return getAllIndustries().find((i) => i.slug === slug);
}

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
