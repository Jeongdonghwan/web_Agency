import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// 웹문서 대량제작 상품 섹션 — 핵심 페이지(content/webdoc/*.md) + 업종 페이지(data/webdoc/industries.json 조합)
// 키워드 원본: keywords/웹문서대량제작_키워드.xlsx (생성기 keywords/gen_webdoc_keywords.py)

export interface CoreDoc {
  kind: 'core';
  slug: string;
  name: string;
  title: string;
  description: string;
  keywords: string[];
  summary: string[];
  painPoints: string[];
  faq: { q: string; a: string }[];
  related: string[];
  updatedAt: string;
  content: string;
}

export interface Industry {
  name: string;
  group: string;
  services: string[];
  searches: string[];
  urgent: boolean;
  season: string;
  radius: string;
  decide: string;
  pain: string;
  regulated: string | null;
}

export interface IndustryDoc extends Industry {
  kind: 'industry';
  slug: string;
}

export type WebdocPage = (CoreDoc | IndustryDoc) & { order: number; wave: number; openDate: string };

// ---- 단계 오픈: 오픈일 D0 25% → D2 50% → D4 75% → D6 100% (post-launch 스킬 고정 기준) ----
// 서버가 하루 두 번 빌드하므로 날짜만으로 자동으로 열린다. 열린 페이지는 닫지 않는다(LAUNCH 를 뒤로 옮기지 말 것).
export const LAUNCH = '2026-10-29';
const PLAN = [0.25, 0.5, 0.75, 1];
const EVERY_DAYS = 2;

const addDays = (iso: string, d: number) => new Date(Date.parse(iso) + d * 864e5).toISOString().slice(0, 10);
export const todayKst = () => process.env.WEBDOC_TODAY || new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);

// 사장님이 직접 요청한 업종군을 앞에 — 첫 묶음부터 들어가게
const GROUP_PRIORITY = ['하수구·배관', '누수·방수', '청소', '이사·운반', '크레인·장비', '커튼·창호·인테리어', '대출·금융', '회생·채무', '법률·전문직'];

const toDate = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v || ''));

function loadCore(): CoreDoc[] {
  const dir = path.join(process.cwd(), 'content', 'webdoc');
  if (!fs.existsSync(dir)) return [];
  const docs = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'));
    return {
      kind: 'core' as const,
      slug: String(data.urlSlug || data.slug || f.replace(/\.md$/, '')),
      name: String(data.name),
      title: String(data.title),
      description: String(data.description),
      keywords: data.keywords || [],
      summary: data.summary || [],
      painPoints: data.painPoints || [],
      faq: data.faq || [],
      related: data.related || [],
      updatedAt: toDate(data.updatedAt),
      content,
    };
  });
  const main = '웹문서-대량제작';
  return docs.sort((a, b) => (a.slug === main ? -1 : b.slug === main ? 1 : a.name.localeCompare(b.name, 'ko')));
}

function loadIndustries(): IndustryDoc[] {
  const file = path.join(process.cwd(), 'data', 'webdoc', 'industries.json');
  if (!fs.existsSync(file)) return [];
  const list: Industry[] = JSON.parse(fs.readFileSync(file, 'utf-8'));
  // 업종군 라운드로빈 — 각 묶음에 여러 업종군이 고르게 들어가게
  const groups = new Map<string, Industry[]>();
  for (const i of list) groups.set(i.group, [...(groups.get(i.group) || []), i]);
  const order = [...GROUP_PRIORITY.filter((g) => groups.has(g)), ...[...groups.keys()].filter((g) => !GROUP_PRIORITY.includes(g))];
  const out: IndustryDoc[] = [];
  for (let k = 0; out.length < list.length; k++) {
    for (const g of order) {
      const it = groups.get(g)![k];
      if (it) out.push({ ...it, services: [...it.services.filter((x) => x !== it.name), ...it.services.filter((x) => x === it.name)], kind: 'industry', slug: `${it.name}-홍보` });
    }
  }
  return out;
}

let cache: WebdocPage[] | null = null;
export function getAllWebdocPages(): WebdocPage[] {
  if (cache) return cache;
  const all = [...loadCore(), ...loadIndustries()];
  const seen = new Set<string>();
  for (const p of all) {
    if (seen.has(p.slug)) throw new Error(`webdoc slug 충돌: ${p.slug}`);
    seen.add(p.slug);
  }
  return (cache = all.map((p, order) => {
    const wave = PLAN.findIndex((r) => order < Math.ceil(all.length * r));
    return { ...p, order, wave, openDate: addDays(LAUNCH, wave * EVERY_DAYS) };
  }));
}

export const getOpenWebdocPages = () => getAllWebdocPages().filter((p) => p.openDate <= todayKst());
export const getOpenCore = () => getOpenWebdocPages().filter((p): p is CoreDoc & WebdocPage => p.kind === 'core');
export const getOpenIndustries = () => getOpenWebdocPages().filter((p): p is IndustryDoc & WebdocPage => p.kind === 'industry');
export const getWebdocPage = (slug: string) => {
  let key = slug;
  try {
    key = decodeURIComponent(slug);
  } catch {}
  return getOpenWebdocPages().find((p) => p.slug === key);
};

export const WEBDOC_HUB = '/웹문서/';
export const webdocPath = (slug: string) => `/웹문서/${slug}/`;
export const webdocEncodedPath = (slug: string) => `/${encodeURIComponent('웹문서')}/${encodeURIComponent(slug)}/`;
export const webdocOg = (slug: string) => `/og/webdoc/${slug}.jpg`;
// 사무소형 업종군은 '업체·작업·출동' 대신 '사무소·상담' 어휘
const OFFICE_GROUPS = ['회생·채무', '법률·전문직', '대출·금융'];
export const isOffice = (group: string) => OFFICE_GROUPS.includes(group);
export const industryTitle = (name: string, group: string) =>
  group === '법률·전문직' ? `${name} 홍보` : group === '회생·채무' ? `${name} 사무소 홍보` : `${name} 업체 홍보`;
export const pageName = (p: WebdocPage) => (p.kind === 'core' ? p.name : industryTitle(p.name, p.group));
const OFFICE_WORDS: [RegExp, string][] = [
  [/작업 사진·사례/g, '상담 사례·안내 자료'], [/작업 사진과 사례/g, '상담 사례와 안내 자료'], [/작업 사진/g, '상담 안내 자료'],
  [/작업 기록/g, '상담 사례'], [/현장 사진/g, '상담 사례'], [/작업 과정/g, '상담 절차'], [/실제 사진·사례/g, '실제 상담 사례'],
  [/출장 가능 지역/g, '상담 가능 지역'], [/출장 범위/g, '상담 범위'], [/출장 가는 지역/g, '상담하는 지역'], [/업체 페이지/g, '사무소 페이지'],
  [/사장님 업체/g, '대표님 사무소'], [/사장님/g, '대표님'], [/손님/g, '고객'],
  [/ 업체가 실제로 가는 지역/g, ' 사무소가 상담하는 지역'], [/ 업체는 페이지가/g, ' 사무소는 페이지가'], [/ 업체 웹문서/g, ' 웹문서'], [/ 업체도 페이지를/g, ' 사무소도 페이지를'],
];
const officeize = <T,>(v: T): T => {
  if (typeof v === 'string') return OFFICE_WORDS.reduce((t, [a, b]) => t.replace(a, b), v as string) as T;
  if (Array.isArray(v)) return v.map(officeize) as T;
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, officeize(x)])) as T;
  return v;
};

// ---- 업종 페이지 조합기 ----

const hash = (s: string) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619) >>> 0;
  // 하위 비트 편향 방지 (raws_prj에서 FNV 하위 비트로 % 4 가 몰린 버그 있었음)
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507) >>> 0;
  return (h ^ (h >>> 13)) >>> 0;
};
const pick = <T,>(arr: T[], seed: string) => arr[hash(seed) % arr.length];

// "~다" 평서 종결 → "~습니다/ㅂ니다" (데이터 문장을 존댓말 본문에 쓰기 위해)
const HANGUL = 0xac00;
const batchim = (ch: string) => (ch.charCodeAt(0) - HANGUL) % 28;
const withBatchim = (ch: string, b: number) => String.fromCharCode(ch.charCodeAt(0) - batchim(ch) + b);
export function polite(clause: string): string {
  const s = clause.trim().replace(/[.。]$/, '');
  if (!s.endsWith('다')) return s + '.';
  const stem = s.slice(0, -1);
  const last = stem.slice(-1);
  if (!last || last.charCodeAt(0) < HANGUL || last.charCodeAt(0) > 0xd7a3) return s + '.';
  if (stem.endsWith('는')) return stem.slice(0, -1) + '습니다.';
  if (batchim(last) === 4) return stem.slice(0, -1) + withBatchim(last, 17) + '니다.'; // ㄴ다 → ㅂ니다
  if (batchim(last) === 0) return stem.slice(0, -1) + withBatchim(last, 17) + '니다.'; // 크다 → 큽니다
  return stem + '습니다.';
}

// 조사: 받침 유무로 은/는, 이/가, 을/를, 으로/로
const hasBatchim = (w: string) => {
  const c = w.trim().slice(-1);
  if (/[a-zA-Z0-9]/.test(c)) return /[lmnLMN013678]$/.test(c);
  return c.charCodeAt(0) >= HANGUL && c.charCodeAt(0) <= 0xd7a3 && batchim(c) !== 0;
};
const j = (w: string, a: string, b: string) => w + (hasBatchim(w) ? a : b);

const SAMPLE_REGIONS = ['김포', '일산', '파주', '부천', '인천 서구', '송도', '수원 영통', '동탄', '용인 수지', '성남 분당', '안양', '의정부',
  '남양주', '구리', '하남', '광명', '시흥', '안산', '평택', '천안', '청주', '대전 유성', '창원', '김해', '서울 강서', '마포', '은평', '노원'];

function regionsFor(seed: string, n: number) {
  const pool = [...SAMPLE_REGIONS];
  const out: string[] = [];
  let s = seed;
  while (out.length < n && pool.length) {
    s += '#';
    out.push(pool.splice(hash(s) % pool.length, 1)[0]);
  }
  return out;
}

// 업종군별 고유 문단 — 같은 업종군끼리만 공유되고 군이 다르면 완전히 다른 문장
const GROUP_NOTE: Record<string, string[]> = {
  '하수구·배관': ['막힘·역류는 손님이 기다려 주지 않는 문제라, 검색 결과 맨 위에서 바로 전화가 연결되는 업체가 일을 가져갑니다.', '배관 작업은 동네 단위로 문의가 흩어져 있어, 사무실이 있는 동네만 잡아서는 출동 가능한 범위를 다 채우지 못합니다.'],
  '누수·방수': ['누수는 아랫집 피해와 보험 문제가 얽혀 있어 손님이 "어디까지 확인해 주는지"를 먼저 읽고 연락합니다.', '방수는 계절과 날씨에 따라 문의가 한꺼번에 몰렸다가 빠지는 업종이라, 성수기에 검색에 걸려 있어야 합니다.'],
  '청소': ['청소는 날짜가 정해진 예약형 문의가 많아, 손님이 여러 업체를 비교한 뒤 고릅니다. 비교 단계에서 보이는 페이지가 많을수록 유리합니다.', '청소 업체는 아파트 단지·신축 입주 지역처럼 수요가 몰리는 곳이 계속 바뀌어, 지역 페이지를 넓게 깔아 두는 쪽이 따라가기 쉽습니다.'],
  '이사·운반': ['이사는 출발지와 도착지가 다른 지역인 경우가 많아, 한 지역 플레이스만으로는 손님의 검색 범위를 다 덮지 못합니다.', '운반·이사 문의는 견적 비교가 기본이라, 손님이 검색하는 지역마다 업체 이름이 보이는 것이 첫 관문입니다.'],
  '크레인·장비': ['장비 업종은 현장이 매번 바뀌어 사무실 위치와 상관없는 지역에서 문의가 옵니다. 현장 지역 이름으로 검색했을 때 보여야 합니다.', '장비 임대는 톤수·높이·작업 종류로 검색이 잘게 나뉘어, 조합마다 페이지가 있어야 맞는 손님이 들어옵니다.'],
  '커튼·창호·인테리어': ['커튼·창호·인테리어는 계약 전에 사진과 시공 사례를 오래 보는 업종이라, 지역마다 실제 시공 사진이 걸린 페이지가 상담으로 이어집니다.', '실측과 시공을 위해 방문해야 하는 업종이라, 방문 가능한 지역 이름을 하나씩 페이지로 드러내는 것이 곧 영업 범위 안내가 됩니다.'],
  '설비·설치': ['설치 업종은 고장·교체 시점에 급하게 찾는 손님과 미리 견적을 비교하는 손님이 섞여 있어, 두 검색어를 모두 받아야 합니다.', '설비 작업은 제품명·증상·지역이 함께 검색되는 경우가 많아, 조합별 페이지가 손님의 말과 그대로 맞아떨어집니다.'],
  '철거·공사': ['철거·공사는 금액이 큰 만큼 손님이 업체 정보를 꼼꼼히 확인합니다. 지역별 작업 사례가 쌓인 페이지가 신뢰를 만듭니다.', '공사 업종은 현장 지역마다 인허가·소음 민원 같은 조건이 달라, 지역 페이지에 그 차이를 담으면 다른 업체와 구분됩니다.'],
  '방역': ['방역은 증상을 발견한 그날 검색하는 경우가 많아, 지역과 해충 이름을 함께 검색했을 때 바로 보이는 업체에 연락이 갑니다.', '방역은 가정·상가·사업장마다 필요한 작업이 달라, 대상과 지역을 조합한 페이지가 손님의 상황을 정확히 받아 줍니다.'],
  '대출·금융': ['금융 상품은 검색어가 아주 구체적이고 광고 경쟁이 치열해, 클릭당 광고비 대신 남는 페이지로 롱테일 검색을 받는 쪽이 비용 구조가 낫습니다.', '대출 상담은 손님이 조건을 꼼꼼히 비교하는 분야라, 과장 없이 절차와 확인 사항을 정리한 페이지가 오히려 상담으로 이어집니다.'],
  '회생·채무': ['채무 문제는 손님이 주변에 묻기 어려워 검색으로 먼저 알아보는 분야입니다. 지역과 상황을 붙인 질문에 답하는 페이지가 첫 상담 창구가 됩니다.', '회생·파산은 관할 법원이 지역마다 달라, 지역 이름과 함께 검색하는 손님이 많고 지역별 안내가 실제로 쓸모가 있습니다.'],
  '법률·전문직': ['전문직 상담은 손님이 사무소를 고르기 전에 여러 페이지를 읽어 보며 판단합니다. 사건 유형과 지역을 조합한 안내가 신뢰의 출발점입니다.', '전문직 사무소는 비대면 상담이 늘면서 사무소 소재지 밖의 의뢰도 받는데, 그 지역 검색에 보이는 수단이 마땅치 않습니다.'],
  '자동차': ['자동차 관련 서비스는 차가 있는 곳으로 가거나 차를 받으러 가는 경우가 많아, 출장 가능한 지역을 검색 페이지로 보여 주는 것이 영업이 됩니다.', '자동차 서비스는 차종·증상·지역을 함께 검색하는 손님이 많아, 조합별 페이지가 맞는 문의를 골라 데려옵니다.'],
  '기타 출장': ['출장형 서비스는 영업 지역이 곧 상품입니다. 갈 수 있는 지역을 페이지로 하나씩 드러내야 손님이 "여기도 오나요?"를 묻지 않고 바로 연락합니다.', '출장 서비스는 행사·수리처럼 필요한 날짜와 장소가 정해진 문의가 많아, 지역 이름으로 검색했을 때 바로 보이는 업체가 선택받습니다.'],
};

const WHY_H2 = ['{n} 업체, 왜 웹문서가 필요할까요?', '{n} 사장님이 검색에서 놓치는 손님은 어디에 있을까요?', '{n} 홍보, 플레이스와 블로그만으로는 왜 부족할까요?', '{n} 손님은 어떻게 업체를 찾을까요?'];
const HOW_H2 = ['{n} 웹문서는 이렇게 만들어집니다', '{n} 업체 페이지 구성 예시', '영업 지역 × {n} 서비스, 이렇게 페이지가 나뉩니다', '{n} 검색 페이지, 어떤 이름으로 만들어지나요?'];
const INCL_H2 = ['페이지마다 들어가는 것', '{n} 페이지 한 장에 담기는 구성', '검색에 걸리고 전화로 이어지게 넣는 것들'];
const STEP_H2 = ['진행 순서', '{n} 웹문서 제작은 이렇게 진행됩니다', '상담부터 오픈까지'];

const URGENT_LINE = [
  '{n은} 급하게 찾는 손님이 많은 업종이라, 검색 결과에서 전화 버튼까지 한 번에 닿는 구조가 중요합니다.',
  '당일 연락이 오가는 업종일수록 손님은 처음 본 업체 몇 곳 중에서 결정합니다. 그 몇 곳 안에 드는 것이 목표입니다.',
  '급한 문의는 비교할 시간이 짧습니다. 손님이 지금 있는 지역 이름으로 검색했을 때 보이는 업체에 먼저 전화가 갑니다.',
];
const PLANNED_LINE = [
  '{n은} 손님이 여러 곳을 비교하고 고르는 업종이라, 비교하는 동안 여러 지역·서비스 검색에서 계속 눈에 띄는 것이 유리합니다.',
  '미리 알아보고 결정하는 손님이 많아, 페이지에서 확인할 수 있는 정보가 구체적일수록 상담 전환이 높아집니다.',
  '결정까지 시간이 걸리는 업종이라 손님은 여러 번 검색합니다. 검색할 때마다 다른 페이지로 같은 업체를 만나게 하는 것이 웹문서의 역할입니다.',
];

const FEATURES = (ind: Industry, seed: string) => {
  const n = ind.name;
  const sv = ind.services;
  return [
    { h: '전용 썸네일', p: pick([`'${sv[0]}' 같은 검색어와 상호가 들어간 썸네일을 페이지마다 만들어 검색 결과와 카톡 공유에서 ${n} 업체임이 바로 보이게 합니다.`, `${n} 페이지마다 대표 이미지(썸네일)를 따로 만들어, ${sv[1] || sv[0]} 페이지와 ${sv[2] || sv[0]} 페이지가 검색 결과에서 구분되게 합니다.`, `썸네일 가운데에 '${n} 업체 홍보'처럼 키워드를 크게 넣어, 정사각형으로 잘려 보이는 네이버 결과에서도 글자가 살아 있게 합니다.`], seed + 'f1') },
    { h: '실제 사진과 사례', p: `${polite(ind.decide)} ${pick([`그래서 사장님의 실제 ${n} 작업 사진과 사례를 지역 페이지마다 나눠 배치합니다.`, `${n} 현장 사진을 지역별로 나눠 같은 사진이 여러 페이지에 반복되지 않게 씁니다.`, `가지고 계신 ${sv[0]} 작업 기록부터 지역 페이지에 하나씩 연결합니다.`], seed + 'f2')}` },
    { h: '전화·카톡 버튼과 플레이스 연결', p: ind.urgent ? pick([`${n} 문의는 급한 경우가 많아 모바일 화면 하단에 전화·문자 버튼을 고정하고, 플레이스 링크로 리뷰까지 바로 확인하게 합니다.`, `급하게 ${sv[0]} 업체를 찾는 손님이 읽다 말고 바로 전화할 수 있게 통화 버튼을 화면에 고정합니다.`], seed + 'f3') : pick([`${n} 손님은 비교하다 상담을 남기는 경우가 많아, 카톡 상담 버튼과 플레이스 리뷰 링크를 함께 둡니다.`, `견적을 비교하는 ${n} 손님이 마음을 정했을 때 바로 연락할 수 있게 전화·카톡 버튼을 페이지마다 둡니다.`], seed + 'f3') },
    { h: '구조화 데이터와 캐러셀', p: pick([`빵부스러기·자주 묻는 질문·캐러셀(ItemList) 구조화 데이터를 넣어 검색엔진이 ${n} 페이지들 사이의 관계를 읽게 합니다.`, `${sv.slice(0, 2).join('·')} 페이지를 서로 묶는 관련 목록과 FAQ를 구조화 데이터로 표시해, 질문·캐러셀 형태로 보일 수 있는 조건을 갖춥니다.`, `${n} 서비스별 페이지 목록을 캐러셀용 데이터로 정리해, 한 페이지로 들어온 손님이 다른 서비스 페이지로 이어지게 합니다.`], seed + 'f4') },
    { h: '등록과 단계 오픈', p: pick([`사이트맵·RSS를 제출하고 서치어드바이저·서치콘솔에 등록한 뒤, ${n} 페이지를 묶음별로 열면서 수집 상황을 확인합니다.`, `${n} 페이지를 한 번에 다 열지 않고 주력 지역부터 묶음별로 공개하며, 수집 현황을 보고 다음 묶음을 엽니다.`, `${polite(ind.season)} 성수기 전에 주력 페이지가 수집되도록 오픈 순서를 잡습니다.`], seed + 'f5') },
  ];
};

const STEPS = (ind: Industry, seed: string) => {
  const n = ind.name;
  const sv = ind.services;
  return pick([
    [`${n} 출장 가능 지역과 ${sv[0]}·${sv[1] || sv[0]} 같은 주력 서비스를 정리합니다`, `지역 × 서비스 표로 ${n} 페이지 이름과 수를 확정합니다`, `${n} 작업 사진·사례 자료를 받아 지역별로 나눕니다`, '첫 묶음을 열고 수집을 확인한 뒤 나머지를 엽니다'],
    [`상담에서 ${n} 영업 범위와 서비스 목록을 받습니다`, `'${ind.searches[0]}' 같은 손님 검색어로 페이지 제목을 설계합니다`, `실제 사진과 사례로 ${n} 페이지 본문을 채우고 중복 검사를 거칩니다`, '묶음별로 오픈하고 색인 현황을 공유합니다'],
    [`${n} 주력 서비스 ${sv.length}가지와 영업 지역을 받습니다`, `${sv[2] || sv[0]}처럼 검색이 적은 조합은 빼고 시작할 페이지를 고릅니다`, '페이지별 썸네일·본문·FAQ를 만들고 겹치는 문장을 검사합니다', `검색 등록 후 ${n} 주력 지역부터 단계적으로 공개합니다`],
  ], seed);
};

function faqFor(ind: IndustryDoc, regions: string[]) {
  const n = ind.name;
  const pool = [
    { q: `${n} 업체도 페이지를 몇 개나 만들어야 하나요?`, a: `영업 지역 수 × 서비스 수가 기본입니다. 예를 들어 ${regions.length}개 지역에 ${ind.services.length}개 서비스(${ind.services.slice(0, 3).join(', ')} 등)면 ${regions.length * ind.services.length}페이지입니다. 검색이 거의 없는 조합은 빼고 시작합니다.` },
    { q: `${n} 사진이 많지 않은데 가능한가요?`, a: `가지고 계신 ${n} 작업 사진·사례를 지역별로 나눠 씁니다. 사진이 부족하면 ${ind.services[0]} 같은 작업 과정 설명 비중을 늘리고, 이후 사진이 생기는 대로 교체합니다. 없는 사례를 만들어 넣지는 않습니다.` },
    { q: `${n} 플레이스나 블로그를 하고 있는데 같이 해도 되나요?`, a: `같이 하는 것이 좋습니다. ${polite(ind.pain)} 웹문서는 '${regions[2]} ${ind.services[1] || ind.services[0]}' 같은 조합 검색을 맡고, 각 페이지에서 플레이스로 연결해 리뷰도 함께 보이게 합니다.` },
    { q: `${n} 검색 상위노출을 보장하나요?`, a: `순위나 노출은 누구도 보장할 수 없습니다. 보장을 내세우는 업체는 오히려 경계하셔야 합니다. 저희는 ${n} 페이지를 묶음별로 열고 '${ind.searches[1]}' 같은 검색어별 수집·색인 현황을 확인하며 다음 단계를 진행합니다.` },
    { q: `${n} 페이지를 많이 만들면 중복 문서로 걸리지 않나요?`, a: `지역 이름만 바꾼 복제 페이지는 실제로 묻힙니다. 그래서 ${ind.services.slice(0, 3).join(', ')}처럼 서비스마다 다른 내용을 넣고, 공개 전에 페이지끼리 겹치는 비율을 검사해 기준을 넘으면 고칩니다.` },
  ];
  if (ind.urgent) pool.push({ q: `${n} 밤이나 주말 문의도 받을 수 있게 되나요?`, a: `${ind.services[0]}처럼 급한 문의를 놓치지 않게 전화·문자 버튼을 항상 보이도록 고정합니다. 운영 시간 문구는 사장님이 실제로 받는 시간대에 맞춰 넣습니다.` });
  if (ind.regulated) pool.push({ q: `${n} 광고 규정은 어떻게 지키나요?`, a: `${polite(ind.regulated)} 페이지 문구를 이 기준에 맞춰 쓰고, 필수 표기 항목은 사장님께 받은 정보 그대로 넣습니다.` });
  const fixed = pool.filter((f) => f.q.includes('보장'));
  const rest = pool.filter((f) => !f.q.includes('보장')).sort((a, b) => hash(ind.slug + a.q) - hash(ind.slug + b.q));
  return [...rest.slice(0, 3), ...fixed];
}

export function buildIndustryContent(ind: IndustryDoc) {
  const c = composeIndustry(ind);
  return isOffice(ind.group) ? officeize(c) : c;
}

function composeIndustry(ind: IndustryDoc) {
  const n = ind.name;
  const s = ind.slug;
  const regions = regionsFor(s, 10);
  const total = regions.length * ind.services.length;
  const examples = regions.slice(0, 5).flatMap((r, k) => [ind.services[k % ind.services.length], ind.services[(k + 2) % ind.services.length]].map((sv) => `${r} ${sv}`));
  const fill = (t: string) => t.replace(/\{n은\}/g, j(n, '은', '는')).replace(/\{n\}/g, n);

  const label = industryTitle(n, ind.group);
  const title = `${label} - 지역×서비스 웹문서 제작 | JD8`;
  const description = `${label}는 지역마다 검색 페이지를 두는 웹문서로. ${ind.services.slice(0, 3).join('·')} 같은 서비스를 영업 지역별 페이지로 만들어 네이버·구글 검색에 걸리게 합니다.`;
  const summary = [
    `${n} 손님은 '${ind.searches[0]}'처럼 검색하고, 대부분 앞에 지역 이름을 붙입니다.`,
    `영업 지역 × 서비스마다 페이지를 하나씩 만듭니다. 예: ${regions.length}개 지역 × ${ind.services.length}개 서비스 = ${total}페이지.`,
    pick([`${n} 실제 작업 사진·사례로 채우고 묶음별로 열어 수집을 확인합니다. 노출 보장은 하지 않습니다.`, `${polite(ind.decide)} 그래서 실제 사진·사례로 채우고, 노출 보장 대신 단계 오픈과 색인 확인으로 진행합니다.`, `${ind.services[0]} 페이지부터 묶음별로 열고 수집을 확인합니다. 순위 보장은 하지 않습니다.`], s + 's3'),
  ];

  const why = [
    `${ind.searches.map((q) => `'${q}'`).join(', ')}처럼 손님은 문제를 그대로 검색창에 씁니다. 여기에 '${regions[0]}', '${regions[1]}' 같은 지역 이름이 붙는 순간 검색 결과는 그 지역에 맞는 문서로 좁혀집니다. ${polite(ind.pain)}`,
    `${j(n, '은', '는')} ${polite(ind.radius)} ${pick(GROUP_NOTE[ind.group] || GROUP_NOTE['기타 출장'], s + 'g')}`,
    `${polite(ind.season)} ${fill(pick(ind.urgent ? URGENT_LINE : PLANNED_LINE, s + 'u'))}`,
  ];

  const how = pick([
    `${n} 업체가 실제로 가는 지역과 하는 서비스를 조합해 페이지 이름을 정합니다. 아래는 이 페이지에서 예시로 뽑은 조합입니다. 실제 제작 때는 사장님의 출장 범위와 주력 서비스로 다시 짭니다.`,
    `페이지 하나는 검색어 하나를 맡습니다. ${j(n, '이라면', '라면')} ${ind.services.slice(0, 2).join(', ')}처럼 서비스 이름에 지역을 붙인 검색어가 기준이 됩니다. 아래 예시처럼 지역마다 페이지가 생깁니다.`,
    `손님이 쓰는 말 그대로 페이지 제목을 만듭니다. ${n}의 서비스 ${ind.services.length}가지와 영업 지역을 곱하면 필요한 페이지 수가 나옵니다. 예시 조합은 다음과 같습니다.`,
  ], s + 'h');

  return {
    title,
    description,
    h1: `${label}, 웹문서로 ${isOffice(ind.group) ? '상담 지역' : '영업 지역'} 전체에`,
    label,
    serpH2: `${examples[0]} 검색에 사장님 업체가 보이게`,
    serpDesc: isOffice(ind.group) ? '상담 안내, 진행 절차, 자주 묻는 질문 — 전화 한 번으로 바로 연결됩니다.' : '출동·상담 안내, 작업 사진, 자주 묻는 질문 — 전화 한 번으로 바로 연결됩니다.',
    summary,
    whyH2: fill(pick(WHY_H2, s + 'w')),
    why,
    howH2: fill(pick(HOW_H2, s + 'hh')),
    how,
    examples,
    regions,
    total,
    inclH2: fill(pick(INCL_H2, s + 'i')),
    features: FEATURES(ind, s),
    stepH2: fill(pick(STEP_H2, s + 'st')),
    steps: STEPS(ind, s + 'sp'),
    faq: faqFor(ind, regions),
    serpText: pick([
      `손님이 '${examples[0]}' 검색을 했을 때 웹문서 영역에 사장님 업체 페이지가 걸리도록 만드는 것이 목표입니다. 페이지 제목은 검색어 그대로, 본문은 그 지역의 ${n} 상황에 맞게 채웁니다.`,
      `'${examples[0]}' 검색 결과에 ${n} 업체 페이지가 하나 더 있으면, 플레이스 거리 밖의 손님에게도 연락받을 기회가 생깁니다. 아래는 그 자리를 보여 주는 예시 화면입니다.`,
      `${regions[0]}에서 ${j(ind.services[0], '을', '를')} 찾는 손님은 검색 결과 첫 화면에서 업체를 고릅니다. 그 화면의 웹문서 자리에 사장님 페이지가 들어가게 만듭니다.`,
    ], s + 'serp'),
    calcTitle: `${n} 업체는 페이지가 몇 개 필요할까?`,
    ctaText: pick([`${n} 영업 지역과 서비스만 알려주시면 페이지 구성안을 먼저 보여드립니다. 전 과정 비대면.`, `출장 가는 지역과 ${ind.services[0]} 등 서비스 목록을 보내주시면 ${n} 페이지 구성안부터 드립니다.`], s + 'cta'),
    keywords: [`${n} 홍보`, `${n} 업체 홍보`, `${n} 마케팅`, `${n} 웹문서 제작`, `${n} 타지역 홍보`],
  };
}
