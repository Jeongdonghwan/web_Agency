import type { MetadataRoute } from 'next';
import { SITE_URL, INDEXABLE } from '../lib/site';

export default function robots(): MetadataRoute.Robots {
  // 포춘마케팅(카톡 도착 페이지)은 검색에서 제외한다
  if (!INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${SITE_URL}/sitemap.xml` };
}
