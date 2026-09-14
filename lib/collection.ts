import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// 서비스 유형/지역 페이지 공용 콘텐츠 로더
// (업종은 taxonomy 결합 등 전용 로직이 있어 lib/industries.ts 를 그대로 둔다)

export interface PageDoc {
  slug: string;      // 영문 파일명 (내부 id)
  urlSlug: string;   // 한글 URL 슬러그 (frontmatter 명시)
  name: string;      // 표시명 (서비스: h1 전체 문구, 지역: 지역명)
  title: string;
  description: string;
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

export function loadCollection(dirName: string): PageDoc[] {
  const dir = path.join(process.cwd(), 'content', dirName);
  if (!fs.existsSync(dir)) return [];
  const docs = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'));
      return {
        slug: String(data.slug || f.replace(/\.md$/, '')),
        urlSlug: String(data.urlSlug || ''),
        name: String(data.name || ''),
        title: String(data.title || ''),
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
