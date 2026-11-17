// 상호별 빌드. 결과는 dist/<상호>/ 에 생긴다.
//
//   node scripts/build.mjs jd8                      본 사이트 (오늘까지 열린 페이지만)
//   node scripts/build.mjs jd8 --launch 2026-11-20  처음 올릴 때만: 공개 시작일을 정한다 (lib/site.ts LAUNCH 도 같은 날짜로 고쳐 둘 것)
//   node scripts/build.mjs fortune                  포춘마케팅 (메인 한 장, 검색 제외)
//   node scripts/build.mjs jd8 --all                전부 연 상태 (미리보기용)
//   node scripts/build.mjs jd8 --sample 8           8분의 1만 (빠른 확인용)
//   node scripts/build.mjs jd8 --national           지역 없는 전국판만 (서버를 먼저 열 때)
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const site = args[0] === 'fortune' ? 'fortune' : 'jd8';
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : '');
const env = { ...process.env, NEXT_PUBLIC_SITE: site, NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=6144' };
if (opt('--launch')) env.NEXT_PUBLIC_LAUNCH = opt('--launch');
if (args.includes('--all')) env.OPEN_ALL = '1';
if (opt('--sample')) env.SAMPLE = opt('--sample');
if (args.includes('--national')) env.ONLY_NATIONAL = '1'; // 전국판만 (첫 오픈용 작은 구성)

const run = (cmd, a) => spawnSync(cmd, a, { stdio: 'inherit', shell: true, env });
const rm = (p) => fs.rmSync(p, { recursive: true, force: true });
const root = process.cwd();
const out = path.join(root, 'out');

if (run('npx', ['next', 'build']).status !== 0) process.exit(1);

// 남은 공개 일정 파일 (운영 대시보드용)
const ops = path.join(out, 'ops.json');
if (fs.existsSync(ops)) fs.renameSync(ops, path.join(out, '.ops.json'));

if (site === 'jd8') {
  // 묶음별 사이트맵·실제 수정일·llms.txt
  const py = spawnSync('python3', ['--version'], { shell: true }).status === 0 ? 'python3' : 'python';
  run(py, ['-I', 'scripts/postbuild.py', 'out']);
  // 제작 페이지의 화면 전환용 보조 파일(index.txt)은 쓰지 않는다 — 이 페이지들로 가는 링크는 일반 <a> 라서 요청되지 않는다. 용량 약 35% 절감.
  let n = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.txt') { fs.unlinkSync(p); n++; }
    }
  };
  const make = path.join(out, '제작');
  if (fs.existsSync(make)) walk(make);
  console.log(`보조 파일 ${n}개 삭제`);
  // 포춘마케팅 전용 썸네일은 본 사이트에 두지 않는다
  rm(path.join(out, 'og', 'main-fortune.jpg'));
  rm(path.join(out, 'shots-fortune'));
} else {
  // 한 장짜리: 하위 페이지·사이트맵·RSS·다른 썸네일을 지운다
  for (const d of ['제작', '업종', '가이드', 'about', 'rss.xml', 'sitemap.xml', 'llms.txt']) rm(path.join(out, d));
  for (const f of fs.readdirSync(path.join(out, 'og'))) if (f !== 'main-fortune.jpg') rm(path.join(out, 'og', f));
  for (const f of fs.readdirSync(out)) if (/^[0-9a-f]{32}\.txt$/.test(f)) rm(path.join(out, f)); // IndexNow 키 파일
  rm(path.join(out, 'shots')); // 본 사이트용 화면(JD8 표기)은 두지 않는다
}

const dist = path.join(root, 'dist', site);
rm(dist);
fs.mkdirSync(path.dirname(dist), { recursive: true });
fs.renameSync(out, dist);
const count = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((a, e) => a + (e.isDirectory() ? count(path.join(d, e.name)) : e.name === 'index.html' ? 1 : 0), 0);
console.log(`완료: dist/${site} — 페이지 ${count(dist)}쪽`);
