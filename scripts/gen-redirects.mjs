// 기존 영문 업종 URL → 한글 URL 301 리다이렉트 nginx 설정 생성
// 실행: node scripts/gen-redirects.mjs  →  nginx-redirects.conf 생성
// 서버 적용: nginx server 블록 안에  include /var/www/webagency/nginx-redirects.conf;
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { koSlugOf } from '../lib/koslug.mjs';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'content', 'industries');

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
const lines = [
  '# 자동 생성: node scripts/gen-redirects.mjs (직접 수정 금지)',
  '# 영문 업종 URL → 한글 URL 301 리다이렉트',
];

for (const file of files) {
  const { data } = matter(fs.readFileSync(path.join(DIR, file), 'utf-8'));
  if (data.draft) continue;
  const en = data.slug || file.replace(/\.md$/, '');
  const ko = encodeURIComponent(koSlugOf(String(data.name || '')));
  lines.push(`location = /homepage/${en}/ { return 301 /homepage/${ko}/; }`);
  lines.push(`location = /homepage/${en} { return 301 /homepage/${ko}/; }`);
}

fs.writeFileSync(path.join(ROOT, 'nginx-redirects.conf'), lines.join('\n') + '\n');
console.log(`nginx-redirects.conf 생성 완료: ${(lines.length - 2) / 2}개 업종 리다이렉트`);
