import type { MetadataRoute } from 'next';
import { SITE_URL, INDEXABLE } from '../lib/site';

export default function robots(): MetadataRoute.Robots {
  // 포춘마케팅(카톡 도착 페이지)은 검색에서 제외한다
  if (!INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] };
  // _rsc·index.txt = 화면 전환용 보조 파일. 네이버 로봇이 페이지보다 몇 배 더 가져가 수집 한도를 깎는다(내용은 HTML 에 다 있음)
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/*?_rsc=', '/*/index.txt'] }], sitemap: `${SITE_URL}/sitemap.xml` };
}
