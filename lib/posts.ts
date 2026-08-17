import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

export const POSTS_PER_PAGE = 10;

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedAt: string;
  tags: string[];
  industries: string[]; // 관련 업종 slug (상호링크)
  draft: boolean;
  content: string;
}

const toDateString = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v || '');
};

function parsePostFile(filePath: string): Post {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug: String(data.slug || path.basename(filePath, '.md')),
    title: String(data.title || ''),
    description: String(data.description || ''),
    date: toDateString(data.date),
    updatedAt: toDateString(data.updatedAt || data.date),
    tags: data.tags || [],
    industries: data.industries || [],
    draft: Boolean(data.draft),
    content,
  };
}

let cache: Post[] | null = null;

// 공개 글 전체 (최신순)
export function getAllPosts(): Post[] {
  if (cache) return cache;
  if (!fs.existsSync(POSTS_DIR)) return (cache = []);
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  cache = files
    .map((f) => parsePostFile(path.join(POSTS_DIR, f)))
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return cache;
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getTotalPages(): number {
  return Math.max(1, Math.ceil(getAllPosts().length / POSTS_PER_PAGE));
}

export function getPostsPage(page: number): Post[] {
  const start = (page - 1) * POSTS_PER_PAGE;
  return getAllPosts().slice(start, start + POSTS_PER_PAGE);
}

// 이전/다음 글 (최신순 배열 기준)
export function getAdjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const posts = getAllPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return {
    prev: posts[idx + 1], // 더 오래된 글
    next: posts[idx - 1], // 더 최신 글
  };
}

// 특정 업종을 참조하는 글 (업종 페이지 역노출용)
export function getPostsByIndustry(industrySlug: string): Post[] {
  return getAllPosts().filter((p) => p.industries.includes(industrySlug));
}
