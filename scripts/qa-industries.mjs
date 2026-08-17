// 업종 콘텐츠 QA 게이트 — npm run qa:industries
// 1. frontmatter 필수 필드/개수  2. 본문 분량  3. 페이지 간 유사도(3-gram Jaccard)
// 4. 참조 링크 실존  5. slug/카테고리 정합성 + title/description 중복
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const INDUSTRIES_DIR = path.join(ROOT, 'content', 'industries');
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const REFERENCES_DIR = path.join(ROOT, 'public', 'references');
const taxonomy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'taxonomy.json'), 'utf-8'));

const MIN_BODY_CHARS = 600;      // 마크다운 본문 (공백 제외) — 화면 노출 텍스트는 frontmatter(고민·기능·FAQ) 포함이라 총량 기준이 본질
const MIN_TOTAL_CHARS = 1500;    // frontmatter 텍스트 + 본문 합계
const SIM_FAIL = 0.35;           // 3-gram Jaccard 유사도 실패 기준
const SIM_WARN = 0.25;

const errors = [];
const warnings = [];

if (!fs.existsSync(INDUSTRIES_DIR)) {
  console.log('content/industries 가 없습니다. 통과(콘텐츠 0건).');
  process.exit(0);
}

const files = fs.readdirSync(INDUSTRIES_DIR).filter((f) => f.endsWith('.md'));
const catSlugs = new Set(taxonomy.categories.map((c) => c.slug));
const taxSlugs = new Set(taxonomy.industries.map((i) => i.slug));
const postSlugs = new Set(
  fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
    : []
);

const stripText = (s) => String(s || '').replace(/\s+/g, '');
const docs = [];
const seenSlugs = new Set();
const titles = new Map();
const descriptions = new Map();

for (const file of files) {
  const name = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(INDUSTRIES_DIR, file), 'utf-8');
  let data, content;
  try {
    ({ data, content } = matter(raw));
  } catch (e) {
    errors.push(`${file}: frontmatter 파싱 실패 - ${e.message}`);
    continue;
  }
  const ctx = (msg) => errors.push(`${file}: ${msg}`);

  // 1. 필수 필드
  if (!data.slug) ctx('slug 누락');
  if (data.slug && data.slug !== name) ctx(`slug(${data.slug})와 파일명(${name}) 불일치`);
  if (data.slug && seenSlugs.has(data.slug)) ctx(`slug 중복: ${data.slug}`);
  seenSlugs.add(data.slug);
  if (!data.name) ctx('name 누락');
  if (!data.category) ctx('category 누락');
  else if (!catSlugs.has(data.category)) ctx(`category(${data.category})가 taxonomy에 없음`);
  if (data.slug && !taxSlugs.has(data.slug)) warnings.push(`${file}: slug가 taxonomy 목록에 없음 (추가 권장)`);
  if (!data.title) ctx('title 누락');
  else if (data.title.length > 60) ctx(`title ${data.title.length}자 (60자 초과)`);
  if (!data.description) ctx('description 누락');
  else if (data.description.length < 80 || data.description.length > 160)
    ctx(`description ${data.description.length}자 (80~160자 범위 밖)`);
  if (!Array.isArray(data.keywords) || data.keywords.length < 2) ctx('keywords 2개 이상 필요');
  if (!Array.isArray(data.painPoints) || data.painPoints.length < 3) ctx('painPoints 3개 이상 필요');
  if (!Array.isArray(data.features) || data.features.length < 4) ctx('features 4개 이상 필요');
  else data.features.forEach((f, i) => { if (!f?.name || !f?.desc) ctx(`features[${i}] name/desc 누락`); });
  if (!Array.isArray(data.designPoints) || data.designPoints.length < 3) ctx('designPoints 3개 이상 필요');
  if (!Array.isArray(data.faq) || data.faq.length < 4) ctx('faq 4개 이상 필요');
  else data.faq.forEach((f, i) => { if (!f?.q || !f?.a) ctx(`faq[${i}] q/a 누락`); });
  if (!data.publishedAt) ctx('publishedAt 누락');

  // 4. 참조 실존
  for (const ref of data.references || []) {
    if (!fs.existsSync(path.join(REFERENCES_DIR, ref, 'index.html')))
      ctx(`references '${ref}' 데모가 public/references/${ref}/index.html 에 없음`);
  }
  for (const rel of data.relatedIndustries || []) {
    if (!files.includes(`${rel}.md`)) ctx(`relatedIndustries '${rel}' 콘텐츠 파일 없음`);
  }
  for (const rp of data.relatedPosts || []) {
    if (!postSlugs.has(rp)) ctx(`relatedPosts '${rp}' 글 없음`);
  }

  // 2. 분량
  const bodyChars = stripText(content).length;
  const fmText =
    stripText((data.painPoints || []).join('')) +
    stripText((data.features || []).map((f) => `${f?.name}${f?.desc}`).join('')) +
    stripText((data.designPoints || []).join('')) +
    stripText((data.faq || []).map((f) => `${f?.q}${f?.a}`).join(''));
  const totalChars = bodyChars + fmText.length;
  if (bodyChars < MIN_BODY_CHARS) ctx(`본문 ${bodyChars}자 (${MIN_BODY_CHARS}자 미만)`);
  if (totalChars < MIN_TOTAL_CHARS) ctx(`전체 텍스트 ${totalChars}자 (${MIN_TOTAL_CHARS}자 미만)`);

  // 중복 title/description
  if (data.title) {
    if (titles.has(data.title)) ctx(`title이 ${titles.get(data.title)}와 중복`);
    titles.set(data.title, file);
  }
  if (data.description) {
    if (descriptions.has(data.description)) ctx(`description이 ${descriptions.get(data.description)}와 중복`);
    descriptions.set(data.description, file);
  }

  // 유사도 검사용 텍스트 (본문 + painPoints + faq 답변)
  const simText =
    stripText(content) +
    stripText((data.painPoints || []).join('')) +
    stripText((data.faq || []).map((f) => f?.a).join(''));
  docs.push({ file, grams: toGrams(simText) });
}

function toGrams(text) {
  const grams = new Set();
  for (let i = 0; i < text.length - 2; i++) grams.add(text.slice(i, i + 3));
  return grams;
}

function jaccard(a, b) {
  let inter = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const g of small) if (large.has(g)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

// 3. 페이지 간 유사도 (O(n^2) — 250개면 3만 쌍, 충분히 빠름)
let maxSim = 0;
let maxPair = '';
for (let i = 0; i < docs.length; i++) {
  for (let j = i + 1; j < docs.length; j++) {
    const sim = jaccard(docs[i].grams, docs[j].grams);
    if (sim > maxSim) {
      maxSim = sim;
      maxPair = `${docs[i].file} ↔ ${docs[j].file}`;
    }
    if (sim > SIM_FAIL) errors.push(`유사도 ${(sim * 100).toFixed(1)}%: ${docs[i].file} ↔ ${docs[j].file} (${SIM_FAIL * 100}% 초과)`);
    else if (sim > SIM_WARN) warnings.push(`유사도 ${(sim * 100).toFixed(1)}%: ${docs[i].file} ↔ ${docs[j].file}`);
  }
}

console.log(`검사 대상: ${files.length}개 업종 콘텐츠`);
if (docs.length >= 2) console.log(`최대 유사도: ${(maxSim * 100).toFixed(1)}% (${maxPair})`);
if (warnings.length) {
  console.log(`\n경고 ${warnings.length}건:`);
  warnings.slice(0, 30).forEach((w) => console.log(`  ⚠ ${w}`));
  if (warnings.length > 30) console.log(`  ... 외 ${warnings.length - 30}건`);
}
if (errors.length) {
  console.error(`\n오류 ${errors.length}건:`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}
console.log('\nQA 통과 ✓');
