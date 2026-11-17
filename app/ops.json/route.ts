import { getAllMake } from '../../lib/make';
import { LANDING } from '../../lib/site';

// 운영 대시보드용 남은 공개 일정 — 빌드 뒤 scripts/build.mjs 가 out/.ops.json 으로 옮긴다
export const dynamic = 'force-static';

export async function GET() {
  const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const by: Record<string, number> = {};
  if (!LANDING) for (const p of getAllMake()) if (p.openDate > today) by[p.openDate] = (by[p.openDate] || 0) + 1;
  const schedule = Object.keys(by).sort().map((date) => ({ date, pages: by[date], posts: 0 }));
  return Response.json({ schedule });
}
