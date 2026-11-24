import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { mdHead } from './kw';

// 서비스 유형/지역 페이지 공용 콘텐츠 로더
// (업종은 taxonomy 결합 등 전용 로직이 있어 lib/industries.ts 를 그대로 둔다)

export interface PageDoc {
  slug: string;      // 영문 파일명 (내부 id)
  urlSlug: string;   // 한글 URL 슬러그 (frontmatter 명시)
  name: string;      // 표시명 (서비스: h1 전체 문구, 지역: 지역명)
  title: string;     // 키워드 + 수식어 | JD8 (lib/kw.ts mdHead — 프런트매터 title 에서 만든다)
  kw: string;        // 페이지 키워드 (프런트매터 title 의 " - " 앞)
  h1sub: string;     // h1 수식어
  meta: string;      // meta description 45~80자
  summary: string[]; // 핵심 요약
  description: string; // 본문 첫 문단
  keywords: string[];
  painPoints: string[];
  features: { name: string; desc: string }[];
  faq: { q: string; a: string }[];
  relatedIndustries: string[]; // 업종 영문 slug
  relatedServices: string[];   // 서비스 영문 slug
  relatedRegions: string[];    // 지역 영문 slug
  publishedAt: string;
  updatedAt: string;
  draft: boolean;
  content: string;
}

const toDateString = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v || '');
};

// description·핵심 요약에 쓰는 사실 — 각 템플릿의 상담 배너에 이미 있는 문장만
const FACTS: Record<string, string[]> = {
  services: ['평균 7일 안에 완성합니다.', '목적에 맞는 구성을 먼저 제안합니다.'],
  regions: ['30만원부터 평균 7일.', '전 과정 비대면으로 진행합니다.'],
};

export function loadCollection(dirName: string): PageDoc[] {
  const dir = path.join(process.cwd(), 'content', dirName);
  if (!fs.existsSync(dir)) return [];
  const docs = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'));
      const h = mdHead({ title: String(data.title || ''), features: data.features || [], faq: data.faq || [] }, String(data.urlSlug || ''), FACTS[dirName] || FACTS.services);
      return {
        slug: String(data.slug || f.replace(/\.md$/, '')),
        urlSlug: String(data.urlSlug || ''),
        name: String(data.name || ''),
        title: h.title,
        kw: h.kw,
        h1sub: h.h1sub,
        meta: h.description,
        summary: h.summary,
        description: String(data.description || ''),
        keywords: data.keywords || [],
        painPoints: data.painPoints || [],
        features: data.features || [],
        faq: data.faq || [],
        relatedIndustries: data.relatedIndustries || [],
        relatedServices: data.relatedServices || [],
        relatedRegions: data.relatedRegions || [],
        publishedAt: toDateString(data.publishedAt),
        updatedAt: toDateString(data.updatedAt || data.publishedAt),
        draft: Boolean(data.draft),
        content,
      } as PageDoc;
    })
    .filter((d) => !d.draft)
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const seen = new Map<string, string>();
  for (const d of docs) {
    if (!d.urlSlug) throw new Error(`${dirName}/${d.slug}: urlSlug 누락`);
    if (seen.has(d.urlSlug)) throw new Error(`${dirName} urlSlug 충돌: ${seen.get(d.urlSlug)} ↔ ${d.slug}`);
    seen.set(d.urlSlug, d.slug);
  }
  return docs;
}

export const findByUrlSlug = (docs: PageDoc[], urlSlug: string) => {
  let key = urlSlug;
  try {
    key = decodeURIComponent(urlSlug);
  } catch {}
  return docs.find((d) => d.urlSlug === key);
};
