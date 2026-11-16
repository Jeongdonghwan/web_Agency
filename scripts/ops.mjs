// 빌드 뒤 out/.ops.json 을 만든다 — 운영 대시보드(seo.jd8.co.kr)의 "남은 수·남은 일정" 칸에 쓰인다.
// 형식: {"schedule":[{"date":"2026-11-20","pages":120,"posts":3}]}  (오늘 이후에 새로 열릴 것만)
// 공개일 계산은 lib/webdoc.ts loadSchedule 과 같다: 묶음의 launch + days[plan 에서 찾은 단계].
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const today = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10); // KST
const addDays = (iso, d) => new Date(Date.parse(iso) + d * 864e5).toISOString().slice(0, 10);
const byDate = {};
const bump = (date, key) => {
  if (date <= today) return;
  (byDate[date] ??= { pages: 0, posts: 0 })[key]++;
};

const dir = path.join(root, 'data', 'webdoc');
for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => x.endsWith('schedule.json')) : []) {
  const seen = new Set();
  for (const b of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')).batches || []) {
    b.slugs.forEach((slug, i) => {
      if (seen.has(slug)) return;
      seen.add(slug);
      const wave = b.plan.findIndex((r) => i < Math.ceil(b.slugs.length * r));
      bump(addDays(b.launch, b.days[wave]), 'pages');
    });
  }
}

const posts = path.join(root, 'content', 'posts');
for (const f of fs.existsSync(posts) ? fs.readdirSync(posts).filter((x) => x.endsWith('.md') && !x.startsWith('_')) : []) {
  const m = fs.readFileSync(path.join(posts, f), 'utf-8').slice(0, 800).match(/^date:\s*["']?(\d{4}-\d\d-\d\d)/m);
  if (m) bump(m[1], 'posts');
}

const schedule = Object.keys(byDate).sort().map((date) => ({ date, ...byDate[date] }));
const out = path.join(root, 'out');
if (fs.existsSync(out)) {
  fs.writeFileSync(path.join(out, '.ops.json'), JSON.stringify({ schedule }));
  console.log(`ops: 남은 일정 ${schedule.length}일, 페이지 ${schedule.reduce((a, x) => a + x.pages, 0)}, 글 ${schedule.reduce((a, x) => a + x.posts, 0)}`);
}
