import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // _rsc·index.txt = 화면 전환용 보조 파일. 네이버 로봇이 페이지보다 몇 배 더 가져가 수집 한도를 깎는다(내용은 HTML 에 다 있음)
        disallow: ['/mockups/', '/*?_rsc=', '/*/index.txt'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
