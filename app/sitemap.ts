import fs from 'fs';
import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { getOpenMake, getSidos, openBySidoAngle, makePath, makeListPath, ANGLES, MAKE_HUB } from '../lib/make';
import { getIndustries, getGuides, industryPath, guidePath, encPath, INDUSTRY_HUB, GUIDE_HUB } from '../lib/content';

// lastmod 는 원고·데이터 파일의 실제 수정 시각. 빌드 시각을 쓰지 않는다.
const mtime = (f: string) => fs.statSync(f).mtime;

export default function sitemap(): MetadataRoute.Sitemap {
  const ind = mtime('data/industries.json');
  const composer = mtime('lib/content.ts');
  const indLm = ind > composer ? ind : composer;
  const guides = getGuides();
  const guideLm = (d: string) => new Date(d);
  const latestGuide = new Date(Math.max(...guides.map((g) => +guideLm(g.updatedAt))));
  const u = (p: string) => `${SITE_URL}${encPath(p)}`;
  // 제작 페이지: lastmod = 열린 날과 조합기·데이터 수정일 중 늦은 날
  const mk = getOpenMake();
  const mkData = [mtime('lib/make.ts'), mtime('data/industries-all.json'), mtime('data/sido.json')].sort((a, b) => +b - +a)[0];
  const mkLm = (d: string) => (new Date(d) > mkData ? new Date(d) : mkData);
  const hubs: MetadataRoute.Sitemap = [];
  for (const sn of ['전국', ...getSidos().map((x) => x.name)]) for (const a of ANGLES) {
    const l = openBySidoAngle(sn, a.key);
    if (l.length) hubs.push({ url: u(makeListPath(sn, a.key)), lastModified: mkLm(l.map((p) => p.openDate).sort().pop()!), changeFrequency: 'weekly', priority: 0.8 });
  }
  return [
    { url: `${SITE_URL}/`, lastModified: mtime('app/page.tsx'), changeFrequency: 'weekly', priority: 1 },
    { url: u(INDUSTRY_HUB), lastModified: indLm, changeFrequency: 'weekly', priority: 0.9 },
    { url: u(GUIDE_HUB), lastModified: latestGuide, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/about/`, lastModified: mtime('app/about/page.tsx'), changeFrequency: 'yearly', priority: 0.4 },
    ...guides.map((g) => ({ url: u(guidePath(g.slug)), lastModified: guideLm(g.updatedAt), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...(mk.length ? [{ url: u(MAKE_HUB), lastModified: mkLm(mk.map((p) => p.openDate).sort().pop()!), changeFrequency: 'weekly' as const, priority: 0.9 }] : []),
    ...hubs,
    ...getIndustries().map((i) => ({ url: u(industryPath(i.name)), lastModified: indLm, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...mk.map((p) => ({ url: u(makePath(p.slug)), lastModified: mkLm(p.openDate), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
