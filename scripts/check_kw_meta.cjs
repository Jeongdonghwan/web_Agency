// 제작(키워드) 페이지 h1 수식어·description 점검 — 빌드 없이 조합기를 그대로 돌린다.
//   node scripts/check_kw_meta.cjs            전 페이지(열리지 않은 것 포함) 점검
//   node scripts/check_kw_meta.cjs --show 5   예시 5쪽 출력
// 통과 기준: title 중복 0·앞부분이 h1 과 같음·60자 이하, h1(키워드+수식어) 중복 0, 수식어가 키워드 낱말 반복 0, description 50~80자·중복 0, 조사 오류 0.
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// .ts 를 typescript 로 바로 읽는다 (tsx 없이)
require.extensions['.ts'] = (m, f) => {
  const src = fs.readFileSync(f, 'utf8');
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } });
  m._compile(out.outputText, f);
};
const root = path.join(__dirname, '..');
const make = require(path.join(root, 'lib/make.ts'));
const sidos = require(path.join(root, 'data/sido.json'));
const inds = require(path.join(root, 'data/industries-all.json'));

// 조사 검사: 데이터에 있는 명사(업종·서비스·지역·단위) 바로 뒤 조사가 받침과 맞는지
const H = 0xac00;
const bat = (w) => { const c = w.slice(-1).charCodeAt(0); return c >= H && c <= 0xd7a3 ? (c - H) % 28 : /[lmnLMN013678]/.test(w.slice(-1)) ? 1 : 0; };
const nouns = new Set();
for (const i of inds) { nouns.add(i.name); for (const v of i.services) nouns.add(v.name); }
for (const s of sidos) { nouns.add(s.name); nouns.add(s.unit); for (const a of s.areas) nouns.add(a); nouns.add(`${s.areas.length}개 ${s.unit}`); }
['손님', '의뢰인', '고객', '사장님', '대표님'].forEach((w) => nouns.add(w));
const NL = [...nouns].filter((w) => w.length > 1).sort((a, b) => b.length - a.length);
const RULE = { 을: 1, 은: 1, 이: 1, 과: 1, 를: 0, 는: 0, 가: 0, 와: 0 };
function josaErrors(t) {
  const errs = [];
  for (const m of t.matchAll(/([가-힣A-Za-z0-9·]+?)(으로|로|을|를|은|는|이|가|과|와)(?=[\s.,?']|$)/g)) {
    const w = m[1], p = m[2];
    const noun = NL.find((x) => w.endsWith(x));
    if (!noun || w.length - noun.length > 0 && !/[\s·]/.test(w[w.length - noun.length - 1] || ' ')) continue;
    const b = bat(noun);
    const bad = p === '으로' ? b === 0 || b === 8 : p === '로' ? !(b === 0 || b === 8) : RULE[p] !== (b ? 1 : 0);
    if (bad) errs.push(`${noun}${p}`);
  }
  return errs;
}

// 검사기 자체 확인: 틀린 조사를 잡아야 한다
if (josaErrors('강남구를 보고 하수구막힘을 손님가 찾는다').length !== 1 || josaErrors('손님이 강남구를 하수구막힘으로').length !== 0) throw new Error('조사 검사기 고장');
const pages = make.getAllMake();
const open = new Set(make.getOpenMake().map((p) => p.slug));
const h1s = new Map(), descs = new Map(), subs = new Map();
let minL = 1e9, maxL = 0, badLen = [], rep = [], josa = [], dupH = 0, dupD = 0;
const show = process.argv.includes('--show') ? Number(process.argv[process.argv.indexOf('--show') + 1] || 3) : 0;
let k = 0, dupT = 0, minT = 1e9, maxT = 0;
const titles = new Set(), badT = [];
for (const p of pages) {
  const c = make.composeMake(p);
  k++;
  const h = `${c.h1} ${c.h1sub}`;
  if (h1s.has(h)) dupH++; else h1s.set(h, p.slug);
  if (descs.has(c.description)) dupD++; else descs.set(c.description, p.slug);
  // title = h1 글자 그대로 + ' | 상호' (앞부분 40자 이하, 전체 60자 이하, | 뒤는 상호 한 낱말)
  if (titles.has(c.title)) dupT++; else titles.add(c.title);
  minT = Math.min(minT, c.title.length); maxT = Math.max(maxT, c.title.length);
  if (!c.title.startsWith(h + ' | ') || /\s/.test(c.title.slice(h.length + 3)) || h.length > 40 || c.title.length > 60) badT.push(`${c.title.length} ${c.title}`);
  subs.set(c.h1sub, (subs.get(c.h1sub) || 0) + 1);
  const L = c.description.length;
  minL = Math.min(minL, L); maxL = Math.max(maxL, L);
  if (L < 50 || L > 80) badLen.push(`${L} ${c.description}`);
  if (!c.h1sub || make.repeats(c.h1, c.h1sub)) rep.push(h);
  for (const e of [...josaErrors(c.h1sub), ...josaErrors(c.description)]) josa.push(`${e} ← ${p.slug}`);
  if (show && k % Math.floor(pages.length / show) === 7) console.log(`\n/제작/${p.slug}/\n  title: ${c.title}\n  h1: ${h}\n  desc(${L}): ${c.description}`);
}
const top = [...subs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${v}× ${k}`);
console.log(`\n전체 ${pages.length}쪽 (오늘 열린 ${open.size}쪽)`);
console.log(`h1 중복 ${dupH} · 수식어 키워드 반복 ${rep.length} · 수식어 종류 ${subs.size} (가장 많은: ${top.join(' / ')})`);
console.log(`description ${minL}~${maxL}자 · 범위 밖 ${badLen.length} · 중복 ${dupD}`);
console.log(`title ${minT}~${maxT}자 · 중복 ${dupT} · h1 불일치·길이 초과 ${badT.length}`);
console.log(`조사 오류 ${josa.length}`);
for (const x of [...badT.slice(0, 5), ...badLen.slice(0, 5), ...rep.slice(0, 5), ...josa.slice(0, 10)]) console.log('  ' + x);
process.exit(dupT || badT.length || dupH || dupD || badLen.length || rep.length || josa.length ? 1 : 0);
