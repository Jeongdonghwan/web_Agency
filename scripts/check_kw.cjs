// 키워드형 페이지 검수 1단계 — 빌드 없이 실제 페이지 컴포넌트(조합기 + 템플릿)를 그대로 그려서 본다.
//   node scripts/check_kw.cjs            사이트맵에 나오는(=오늘 열린) 키워드형 페이지 전부
//   node scripts/check_kw.cjs --show 3   종류마다 예시 3쪽 출력
//   node scripts/check_kw.cjs --every 20  20쪽마다 하나만 (빠른 확인용 — 배포 전에는 전체를 돌린다)
// 통과 기준(programmatic-seo composer-patterns §5-1·§5-3·§5-4, site-launch 검수 규칙 1단계):
//   h1·title·description 중복 0 / title 이 h1 글자(+ " | JD8")와 같고 40자 이하 / og·twitter 제목 동일 / description 45~80자
//   수식어가 키워드 낱말 반복 0 / 키워드 전체가 든 h2 4개 이상 / h2 이모지 0 / 핵심 요약·자주 묻는 질문 h2 + FAQPage
//   본문 내부링크 10개 이상 / 조사 오류 0 / canonical 그대로 / 사이트맵 lastmod >= 개정일(UPDATED)
// 메인·블로그·데모·목록(허브) 페이지는 대상이 아니다.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const root = path.join(__dirname, '..');
process.chdir(root);

// 프로젝트의 .ts/.tsx/.js/.mjs 를 typescript 로 바로 읽는다 (node_modules 는 그대로)
const compile = (m, f) => {
  if (f.includes('node_modules')) return m._compile(fs.readFileSync(f, 'utf8'), f);
  const out = ts.transpileModule(fs.readFileSync(f, 'utf8'), {
    fileName: f,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX, allowJs: true },
  });
  m._compile(out.outputText, f);
};
for (const ext of ['.ts', '.tsx', '.js', '.jsx', '.mjs']) require.extensions[ext] = compile;

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
// next 런타임 없이 그리기 위한 대역
const stubs = {
  'next/link': { __esModule: true, default: ({ href, children, prefetch, ...r }) => React.createElement('a', { href, ...r }, children) },
  'next/navigation': { notFound: () => { throw new Error('notFound'); } },
};
const load = Module._load;
Module._load = function (request, ...rest) { return stubs[request] || load.call(this, request, ...rest); };

const { UPDATED, BRAND, SITE_URL, SITE_NAME } = require(path.join(root, 'lib/site.ts'));
const { repeats, TITLE_MAX, DESC_MIN, DESC_MAX } = require(path.join(root, 'lib/kw.ts'));
const sitemap = require(path.join(root, 'app/sitemap.ts')).default;
const { getIndustryByUrlSlug } = require(path.join(root, 'lib/industries.ts'));
const { getRegionByUrlSlug } = require(path.join(root, 'lib/regions.ts'));
const { getAllDongs } = require(path.join(root, 'lib/dongs.ts'));
const { getWebdocPage, getSidos } = require(path.join(root, 'lib/webdoc.ts'));

const ROUTES = {
  homepage: 'app/homepage/[slug]/page.tsx',
  service: 'app/service/[slug]/page.tsx',
  region: 'app/region/[slug]/page.tsx',
  웹문서: 'app/웹문서/[slug]/page.tsx',
  타지역홍보: 'app/타지역홍보/[slug]/page.tsx',
  타지역서비스: 'app/타지역서비스/[slug]/page.tsx',
};
const mods = {};
const route = (sec) => (mods[sec] ??= require(path.join(root, ROUTES[sec])));
const kindOf = (sec, slug) => {
  if (sec === 'homepage') return getIndustryByUrlSlug(slug) ? '업종 홈페이지 제작(md)' : '업종 홈페이지 제작(조합)';
  if (sec === 'service') return '제작 서비스(md)';
  if (sec === 'region') return getRegionByUrlSlug(slug) ? '지역 시·구(md)' : '지역 동(조합)';
  if (sec === '웹문서') return { core: '웹문서 핵심(md)', group: '웹문서 업종군', industry: '웹문서 업종', service: '웹문서 서비스', task: '웹문서 본사 업무' }[getWebdocPage(slug).kind];
  return sec === '타지역홍보' ? '타지역 홍보' : '타지역서비스';
};

// ---- 조사 검사: 데이터에 있는 명사(업종·서비스·지역·동) 바로 뒤 조사가 받침과 맞는지 ----
const H = 0xac00;
const bat = (w) => { const c = w.slice(-1).charCodeAt(0); return c >= H && c <= 0xd7a3 ? (c - H) % 28 : /[lmnLMN013678]/.test(w.slice(-1)) ? 1 : 0; };
const nouns = new Set(['손님', '의뢰인', '고객', '사장님', '대표님', '업체', '사무소', '본사', '홈페이지', '웹문서', '타지역서비스', '홍보', '제작']);
for (const i of JSON.parse(fs.readFileSync('data/webdoc/industries.json', 'utf8'))) { nouns.add(i.name); for (const v of i.services) nouns.add(typeof v === 'string' ? v : v.name); }
for (const s of getSidos()) { nouns.add(s.name); nouns.add(s.unit); for (const a of s.areas) nouns.add(a); nouns.add(`${s.areas.length}개 ${s.unit}`); }
for (const d of getAllDongs()) { nouns.add(d.dong); nouns.add(d.gu); }
// 낱말 끝에서 가장 긴 명사를 찾는다 (명사 수천 개를 매번 훑지 않게 접미사로 조회)
const longestNoun = (w) => { for (let i = 0; i < w.length - 1; i++) if (nouns.has(w.slice(i))) return w.slice(i); };
const RULE = { 을: 1, 은: 1, 이: 1, 과: 1, 를: 0, 는: 0, 가: 0, 와: 0 };
function josaErrors(t) {
  const errs = [];
  for (const m of t.matchAll(/([가-힣A-Za-z0-9·]+?)(으로|로|을|를|은|는|이|가|과|와)(?=[\s.,?']|$)/g)) {
    const w = m[1], p = m[2];
    const noun = longestNoun(w);
    if (!noun || (w.length - noun.length > 0 && !/[\s·]/.test(w[w.length - noun.length - 1] || ' '))) continue;
    const b = bat(noun);
    const bad = p === '으로' ? b === 0 || b === 8 : p === '로' ? !(b === 0 || b === 8) : RULE[p] !== (b ? 1 : 0);
    if (bad) errs.push(`${noun}${p}`);
  }
  return errs;
}
// 검사기 자체 확인: 틀린 조사를 잡아야 한다
if (josaErrors('강남구를 보고 하수구막힘을 손님가 찾는다').length !== 1 || josaErrors('손님이 강남구를 하수구막힘으로').length !== 0) throw new Error('조사 검사기 고장');
if (!repeats('송파동 홈페이지제작', '홈페이지 구성') || repeats('송파동 홈페이지제작', '카페 업종 구성')) throw new Error('반복 검사기 고장');

const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

async function render(sec, slug) {
  const m = route(sec);
  const params = { slug };
  let el = await m.default({ params });
  // 맨 위 비동기 컴포넌트(md 페이지)는 직접 풀어 준다
  while (el && typeof el.type === 'function') el = await el.type(el.props);
  return { meta: m.generateMetadata({ params }), html: renderToStaticMarkup(el) };
}

(async () => {
  const showN = process.argv.includes('--show') ? Number(process.argv[process.argv.indexOf('--show') + 1] || 3) : 0;
  // --every K: K쪽마다 하나만 (조합기를 고치는 중 빠르게 볼 때. 중복 검사는 전체를 돌려야 의미가 있다)
  const every = process.argv.includes('--every') ? Number(process.argv[process.argv.indexOf('--every') + 1]) : 1;
  let idx = 0;
  const entries = sitemap();
  const stat = new Map(); // 종류 → 집계
  const seen = { h1: new Map(), title: new Map(), desc: new Map() };
  const bad = {};
  const fail = (k, msg) => { (bad[k] ||= []).push(msg); };
  let total = 0;
  for (const e of entries) {
    const segs = decodeURIComponent(e.url.slice(SITE_URL.length)).split('/').filter(Boolean);
    if (segs.length !== 2 || !ROUTES[segs[0]]) continue; // 메인·목록·블로그·데모·시도 목록
    const [sec, slug] = segs;
    if (every > 1 && idx++ % every) continue;
    const kind = kindOf(sec, slug);
    const urlPath = e.url.slice(SITE_URL.length);
    let r;
    try { r = await render(sec, slug); } catch (err) { fail('그리기 실패', `${urlPath} ${err.message}`); continue; }
    total++;
    const { meta, html } = r;
    const st = stat.get(kind) || stat.set(kind, { n: 0, brand: 0, nosub: 0, tMax: 0, dMin: 1e9, dMax: 0, h2Min: 1e9, linkMin: 1e9, len: 0, lenMin: 1e9, show: [] }).get(kind);
    st.n++;
    const where = `/${sec}/${slug}/`;
    const title = meta.title && meta.title.absolute;
    const desc = meta.description || '';
    const spans = [...(html.match(/<h1>([\s\S]*?)<\/h1>/) || ['', ''])[1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map((x) => strip(x[1]));
    const [kw, sub = ''] = spans;
    const h1 = strip((html.match(/<h1>([\s\S]*?)<\/h1>/) || ['', ''])[1]).trim();
    const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((x) => strip(x[1]).trim());
    const main = (html.match(/<main[\s\S]*<\/main>/) || [''])[0];
    const links = (main.match(/<a [^>]*href="\/[^"]*"/g) || []).length;
    const text = strip(main.replace(/<script[\s\S]*?<\/script>/g, '')).replace(/\s+/g, '');

    if (!kw || h1 !== (sub ? `${kw} ${sub}` : kw)) fail('h1 형태(키워드 span + 수식어 span)', `${where} ${h1}`);
    if (!(title === h1 || title === `${h1} | ${BRAND}`)) fail('title 앞 != h1', `${where} [${title}] / [${h1}]`);
    if (!title || title.length > TITLE_MAX) fail(`title ${TITLE_MAX}자 초과`, `${where} ${title && title.length} ${title}`);
    if (title === h1 && `${h1} | ${BRAND}`.length <= TITLE_MAX) fail('상호를 붙일 수 있는데 뺌', `${where} ${title}`);
    if (meta.openGraph.title !== title || meta.twitter.title !== title) fail('og·twitter 제목 != title', where);
    if (meta.openGraph.siteName !== SITE_NAME) fail('og:site_name', where);
    if (meta.openGraph.description !== desc) fail('og 설명 != description', where);
    if (meta.alternates.canonical !== urlPath) fail('canonical 바뀜', `${where} ${meta.alternates.canonical}`);
    if (desc.length < DESC_MIN || desc.length > DESC_MAX) fail(`description ${DESC_MIN}~${DESC_MAX}자 밖`, `${where} ${desc.length} ${desc}`);
    if (!desc.startsWith(kw)) fail('description 이 키워드로 시작 안 함', `${where} ${desc}`);
    if (sub && repeats(kw, sub)) fail('수식어가 키워드 낱말 반복', `${where} ${h1}`);
    for (const [k, v] of [['h1', h1], ['title', title], ['desc', desc]]) {
      if (seen[k].has(v)) fail(`${k} 중복`, `${where} = ${seen[k].get(v)} : ${v}`); else seen[k].set(v, where);
    }
    const kwH2 = h2s.filter((x) => x.includes(kw)).length;
    if (kwH2 < 4) fail('키워드 h2 4개 미만', `${where} ${kwH2}개: ${h2s.join(' | ')}`);
    if (h2s.some((x) => EMOJI.test(x))) fail('h2 이모지', where);
    if (!h2s.includes(`${kw} 핵심 요약`)) fail('핵심 요약 h2 없음', where);
    // 업종군 페이지는 목록(허브) 성격이라 질문 데이터가 없다 — FAQ 는 보지 않는다
    if (kind !== '웹문서 업종군' && (!h2s.some((x) => x.includes('자주 묻는 질문')) || !html.includes('"@type":"FAQPage"'))) fail('자주 묻는 질문 h2·FAQPage 없음', where);
    if (links < 10) fail('본문 내부링크 10개 미만', `${where} ${links}개`);
    if (/undefined|\(는\)|\(가\)|\(를\)|NaN/.test(strip(main))) fail('치환 실패 글자(undefined 등)', where);
    for (const x of [...josaErrors(sub), ...josaErrors(desc), ...h2s.flatMap(josaErrors)]) fail('조사 오류', `${where} ${x}`);
    if (new Date(e.lastModified).toISOString().slice(0, 10) < UPDATED) fail('사이트맵 lastmod < 개정일', `${where} ${new Date(e.lastModified).toISOString().slice(0, 10)}`);

    if (title !== h1) st.brand++;
    if (!sub) st.nosub++;
    st.tMax = Math.max(st.tMax, title.length);
    st.dMin = Math.min(st.dMin, desc.length); st.dMax = Math.max(st.dMax, desc.length);
    st.h2Min = Math.min(st.h2Min, kwH2); st.linkMin = Math.min(st.linkMin, links);
    st.len += text.length; st.lenMin = Math.min(st.lenMin, text.length);
    if (st.show.length < showN && st.n % 7 === 3) st.show.push(`  ${where}\n    h1: ${kw} / ${sub}\n    title(${title.length}): ${title}\n    desc(${desc.length}): ${desc}\n    h2: ${h2s.join(' | ')}`);
  }

  console.log(`개정일 ${UPDATED} · 사이트맵 주소 ${entries.length}개 중 키워드형 ${total}쪽\n`);
  console.log('종류 | 쪽수 | 상호 붙은 title | 수식어 없음 | title 최대 | description | 키워드 h2 최소 | 내부링크 최소 | 본문 평균(최소)자');
  for (const [k, s] of stat) console.log(`${k} | ${s.n} | ${s.brand} | ${s.nosub} | ${s.tMax} | ${s.dMin}~${s.dMax} | ${s.h2Min} | ${s.linkMin} | ${Math.round(s.len / s.n)}(${s.lenMin})`);
  if (showN) for (const [k, s] of stat) console.log(`\n[${k}]\n${s.show.join('\n')}`);
  const keys = Object.keys(bad);
  console.log(keys.length ? '\n미달:' : '\n전 항목 통과 (h1·title·description 중복 0, title 앞 == h1, 40자 이하, description 45~80자, 키워드 h2 4개 이상, 조사 오류 0)');
  for (const k of keys) { console.log(`- ${k}: ${bad[k].length}건`); for (const x of bad[k].slice(0, 6)) console.log(`    ${x}`); }
  process.exit(keys.length ? 1 : 0);
})();
