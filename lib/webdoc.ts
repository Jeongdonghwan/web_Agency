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

export interface ServiceItem {
  name: string;
  searches: string[];
  note: string;
}

export interface Industry {
  name: string;
  group: string;
  services: string[]; // 서비스 이름만 (조합기 문장용)
  serviceItems: ServiceItem[]; // 서비스별 검색어·특징 (서비스 페이지용)
  searches: string[];
  urgent: boolean;
  season: string;
  radius: string;
  decide: string;
  pain: string;
  regulated: string | null;
  hq?: string; // 브랜드 본사용: 본사 운영 관점 필요
}

export interface IndustryDoc extends Industry {
  kind: 'industry';
  slug: string;
}

// 서비스 페이지: 업종의 서비스 하나 = 페이지 하나 ("변기막힘 업체 홍보")
export interface ServiceDoc extends ServiceItem {
  kind: 'service';
  slug: string;
  group: string;
  parent: IndustryDoc;
}

// 업종군 허브: "하수구·배관 업체 웹문서"
export interface GroupDoc {
  kind: 'group';
  slug: string;
  name: string;
  group: string;
}

export type WebdocPage = (CoreDoc | GroupDoc | IndustryDoc | ServiceDoc | BrandTask) & { order: number; openDate: string };

// ---- 단계 오픈: data/webdoc/schedule.json (scripts/webdoc_schedule.py 로 관리) ----
// 묶음마다 오픈일·일정(2주: 25→40→55→70→85→100%)·slug 순서가 고정돼 있다. 서버가 하루 두 번 빌드하므로 날짜만 지나면 자동 공개.
// 일정에 없는 slug(데이터에 새로 추가한 업종·서비스)는 열리지 않는다 → `python scripts/webdoc_schedule.py --new-batch <오픈일>`.
// 열린 페이지는 닫지 않는다: 묶음의 launch 를 뒤로 옮기거나 slugs 순서를 바꾸지 말 것.
interface Batch { launch: string; days: number[]; plan: number[]; slugs: string[] }
function loadSchedule(name = 'schedule.json'): Map<string, string> {
  const file = path.join(process.cwd(), 'data', 'webdoc', name);
  const open = new Map<string, string>(); // slug → 공개일
  if (!fs.existsSync(file)) return open;
  for (const b of (JSON.parse(fs.readFileSync(file, 'utf-8')).batches as Batch[])) {
    b.slugs.forEach((slug, i) => {
      const wave = b.plan.findIndex((r) => i < Math.ceil(b.slugs.length * r));
      if (!open.has(slug)) open.set(slug, addDays(b.launch, b.days[wave]));
    });
  }
  return open;
}

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

type RawIndustry = Omit<Industry, 'services' | 'serviceItems'> & { services: (string | ServiceItem)[] };

function loadRaw(): Industry[] {
  const file = path.join(process.cwd(), 'data', 'webdoc', 'industries.json');
  if (!fs.existsSync(file)) return [];
  return (JSON.parse(fs.readFileSync(file, 'utf-8')) as RawIndustry[]).map((it) => {
    const items = it.services.map((x) => (typeof x === 'string' ? { name: x, searches: [], note: '' } : x));
    // 업종명과 같은 서비스는 뒤로 (문장 속 "커튼 같은 작업" 방지)
    const ordered = [...items.filter((x) => x.name !== it.name), ...items.filter((x) => x.name === it.name)];
    return { ...it, services: ordered.map((x) => x.name), serviceItems: ordered };
  });
}

// 업종군 라운드로빈 — 각 묶음에 여러 업종군이 고르게 들어가게
function roundRobin<T extends { group: string }>(list: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const i of list) groups.set(i.group, [...(groups.get(i.group) || []), i]);
  const order = [...GROUP_PRIORITY.filter((g) => groups.has(g)), ...[...groups.keys()].filter((g) => !GROUP_PRIORITY.includes(g))];
  const out: T[] = [];
  for (let k = 0; out.length < list.length; k++) for (const g of order) if (groups.get(g)![k]) out.push(groups.get(g)![k]);
  return out;
}

export const groupSlug = (group: string) => `${group.replace(/·/g, '-')}-업체-웹문서`;

let cache: WebdocPage[] | null = null;
export function getAllWebdocPages(): WebdocPage[] {
  if (cache) return cache;
  const core = loadCore();
  const industries: IndustryDoc[] = roundRobin(loadRaw()).map((it) => ({ ...it, kind: 'industry', slug: `${it.name}-홍보` }));
  const groups: GroupDoc[] = [...new Set(industries.map((i) => i.group))].map((g) => ({ kind: 'group', slug: groupSlug(g), name: isBrand(g) ? `${g} 웹문서` : `${g} 업체 웹문서`, group: g }));
  const taken = new Set<string>([...core.map((c) => c.slug), ...groups.map((g) => g.slug), ...industries.map((i) => i.slug)]);
  // 서비스 페이지: 업종마다 k번째 서비스를 돌아가며 — 앞 묶음에 모든 업종의 대표 서비스가 들어가게
  const services: ServiceDoc[] = [];
  const maxK = Math.max(0, ...industries.map((i) => i.serviceItems.length));
  for (let k = 0; k < maxK; k++) {
    for (const ind of industries) {
      const sv = ind.serviceItems[k];
      if (!sv || !sv.note || sv.name === ind.name) continue;
      const slug = `${sv.name}-홍보`;
      if (taken.has(slug)) continue;
      taken.add(slug);
      services.push({ ...sv, kind: 'service', slug, group: ind.group, parent: ind });
    }
  }
  // 브랜드 본사 업무 페이지 — 맨 뒤 (기존 페이지 순서에 영향 없음)
  const tasks = loadBrandTasks().filter((t) => !taken.has(t.slug));
  const all = [...core, ...groups, ...industries, ...services, ...tasks];
  const schedule = loadSchedule();
  // 일정에 없는 페이지는 openDate 를 먼 미래로 — 목록·사이트맵·라우트 어디에도 나오지 않는다
  return (cache = all.map((p, order) => ({ ...p, order, openDate: schedule.get(p.slug) || '9999-12-31' })));
}

export const getOpenWebdocPages = () => getAllWebdocPages().filter((p) => p.openDate <= todayKst());
export const getOpenCore = () => getOpenWebdocPages().filter((p): p is CoreDoc & WebdocPage => p.kind === 'core');
export const getOpenGroups = () => getOpenWebdocPages().filter((p): p is GroupDoc & WebdocPage => p.kind === 'group');
export const getOpenIndustries = () => getOpenWebdocPages().filter((p): p is IndustryDoc & WebdocPage => p.kind === 'industry');
export const getOpenTasks = () => getOpenWebdocPages().filter((p): p is BrandTask & WebdocPage => p.kind === 'task');
export const getOpenServices = () => getOpenWebdocPages().filter((p): p is ServiceDoc & WebdocPage => p.kind === 'service');
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
export const DISCLAIMER = '※ 검색 등록을 지원하며 실제 검색 노출 및 순위는 검색엔진의 정책과 평가에 따라 달라집니다.';
// 사무소형 업종군은 '업체·작업·출동' 대신 '사무소·상담' 어휘
const OFFICE_GROUPS = ['회생·채무', '법률·전문직', '대출·금융'];
export const isOffice = (group: string) => OFFICE_GROUPS.includes(group);
export const industryTitle = (name: string, group: string) =>
  group === '프랜차이즈 본사' ? `${name} 본사 홍보`
  : BRAND_GROUPS.includes(group) ? `${name} 브랜드 홍보`
  : group === '법률·전문직' ? `${name} 홍보` : group === '회생·채무' ? `${name} 사무소 홍보` : `${name} 업체 홍보`;
export const pageName = (p: WebdocPage) =>
  p.kind === 'core' || p.kind === 'group' ? p.name : p.kind === 'task' ? `${p.group} ${p.name}` : industryTitle(p.name, p.group);
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
  if (stem === '는' || stem.endsWith(' 는')) return stem.slice(0, -1) + '늡니다.';
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
  if (isBrand(ind.group)) return composeBrand(ind);
  const c = composeIndustry(ind);
  if (!isOffice(ind.group)) return c;
  return LEGAL_GROUPS.includes(ind.group) ? legalize(officeize(c)) : officeize(c);
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
    tajiH2: fill(pick(TAJI_H2, s + 'tj')),
    taji: tajiParas(ind, regions),
    keywords: [`${n} 홍보`, `${n} 업체 홍보`, `${n} 마케팅`, `${n} 웹문서 제작`, `${n} 타지역 홍보`, `${n} 타지역서비스`, `${n} 웹문서 배포`],
  };
}

// 타지역서비스를 알아보는 사장님 — 같은 고객층. 경쟁 상품을 깎아내리지 않고 확인할 점으로 비교한다
const TAJI_H2 = ['{n} 타지역서비스, 웹문서로 하면 무엇이 다를까요?', '{n} 타지역 노출, 타지역서비스와 웹문서 비교', '타지역서비스를 알아보는 {n} 사장님께'];
function tajiParas(ind: IndustryDoc, regions: string[]) {
  const n = ind.name;
  const s = ind.slug;
  const off = isOffice(ind.group);
  const far = `${regions[2]}·${regions[3]}`;
  return [
    off
      ? pick([
          `${n} 사무소는 사무소 근처보다 훨씬 넓은 지역에서 상담 문의를 받습니다. 그래서 다른 지역 검색에도 사무소가 보이게 하는 타지역서비스·타지역 노출 상품을 많이 알아봅니다.`,
          `'${regions[2]} ${ind.services[0]}' 검색에 사무소가 보이지 않으면 그 지역 고객은 다른 곳에 상담을 신청합니다. ${n} 쪽에서 타지역 노출 문의가 많은 이유입니다.`,
        ], s + 'tj1')
      : pick([
          `${n} 사장님이 타지역서비스를 찾는 이유는 대개 같습니다. 플레이스는 업체 위치와 가까운 손님에게 먼저 보이는데, 실제 일은 ${far}까지 가서 하기 때문입니다.`,
          `타지역서비스는 사무실이 없는 지역의 검색에도 업체가 보이게 해 주는 상품입니다. ${n} 업체는 ${far}처럼 멀리 가는 일이 많아 이런 상품을 자주 찾습니다.`,
          `'${regions[2]} ${ind.services[0]}' 검색에 업체가 안 보이면 그 지역 손님은 다른 업체에 전화합니다. ${n} 업계에서 타지역서비스·타지역 노출 문의가 많은 이유입니다.`,
        ], s + 'tj1'),
    pick([
      `JD8 웹문서는 지역 × 서비스 페이지를 사장님 사이트 안에 만듭니다. 사이트가 없으면 함께 만들고, 지역마다 ${ind.services.slice(0, 2).join('·')} 안내와 ${off ? '실제 상담 사례' : '실제 작업 사진'}가 들어갑니다.`,
      `웹문서 방식은 다른 곳에 글을 올리는 대신 사장님 도메인 아래에 지역별 페이지를 쌓습니다. 광고처럼 끄면 사라지는 노출이 아니라 사이트에 남는 페이지입니다.`,
      `차이는 페이지가 어디에 남느냐입니다. 웹문서는 사장님 사이트 주소 아래에 ${regions.length}개 지역 페이지를 만들고 사이트맵으로 네이버·구글에 등록합니다.`,
    ], s + 'tj2'),
    pick([
      `어떤 상품이든 계약 전에 세 가지를 확인해 보세요. 페이지가 누구 도메인에 생기는지, 지역마다 내용이 다른지, 상위노출을 보장한다고 하는지입니다. 검색 순위는 누구도 보장할 수 없습니다.`,
      `타지역서비스와 웹문서를 비교할 때는 페이지 소유, 지역별 내용 차이, 계약 종료 후 남는 것을 보면 됩니다. 순위 보장을 약속하는 곳은 피하는 편이 안전합니다.`,
    ], s + 'tj3'),
  ];
}

// 새 업종군 문단 (업종 페이지·업종군 허브 공용)
Object.assign(GROUP_NOTE, {
  '세탁·수선': ['세탁·수선은 수거와 배송이 오가는 서비스라, 수거 가능한 지역을 검색 페이지로 드러내는 것이 곧 영업 범위 안내가 됩니다.', '세탁·수선 손님은 맡기기 전에 처리 사례 사진과 소요 일정을 먼저 확인하고 연락합니다.'],
  '운송·퀵': ['운송·퀵은 출발지와 도착지가 매번 달라, 손님이 지금 있는 지역 이름으로 검색했을 때 바로 보이는 업체가 배차를 가져갑니다.', '화물·퀵 문의는 차종과 짐 크기로 검색이 잘게 나뉘어, 조합별 페이지가 맞는 손님을 골라 데려옵니다.'],
  '건물·시설관리': ['건물·시설관리는 관리인·건물주가 계약 전에 여러 업체를 비교하는 분야라, 관리 지역과 항목별 페이지가 비교 단계에서 계속 보여야 합니다.', '시설관리는 법정 점검처럼 시기가 정해진 수요가 많아, 점검 시기 전에 지역 검색에 걸려 있어야 문의가 옵니다.'],
  '렌탈·설치': ['렌탈은 제품 비교와 설치 가능 지역 확인이 함께 이뤄지는 분야라, 지역별 설치 안내 페이지가 상담으로 이어집니다.', '렌탈 손님은 월 비용보다 설치·관리 방문이 되는지를 먼저 묻습니다. 방문 가능한 지역을 페이지로 보여 주는 이유입니다.'],
  '수거·매입': ['수거·매입은 출장 방문이 기본이라, 갈 수 있는 지역을 검색 페이지로 펼쳐 둘수록 매입 문의가 늘어날 여지가 생깁니다.', '매입 손님은 여러 업체에 사진을 보내 견적을 비교합니다. 비교 대상에 들려면 지역 검색에서 먼저 보여야 합니다.'],
  '반려동물': ['반려동물 서비스는 보호자가 후기와 사진을 꼼꼼히 보고 고르는 분야라, 지역마다 실제 사례가 걸린 페이지가 신뢰를 만듭니다.', '방문·픽업형 반려동물 서비스는 이동 가능한 지역이 곧 영업 범위라, 지역 검색 페이지가 범위 안내 역할을 합니다.'],
  '행사·사진·웨딩': ['행사·촬영은 날짜와 장소가 정해진 예약형 문의라, 행사 장소 지역 이름으로 검색했을 때 포트폴리오가 보이는 업체가 선택됩니다.', '촬영·행사 손님은 결과물 사진을 보고 결정합니다. 지역·행사 종류별 페이지에 실제 작업물을 나눠 거는 것이 핵심입니다.'],
  '보안·통신': ['보안·통신 설치는 매장·사무실 개업 시기에 몰리는 수요라, 개업 지역 이름으로 검색했을 때 보이는 업체에 견적 요청이 갑니다.', '보안·통신은 장비와 설치 환경이 다양해, 설치 대상과 지역을 조합한 페이지가 손님의 상황을 정확히 받아 줍니다.'],
  '조경·농업': ['조경·농업 작업은 계절에 따라 문의가 몰렸다 빠지는 분야라, 시기 전에 지역 검색에 걸려 있어야 일을 받습니다.', '정원·농지는 도심 외곽에 넓게 흩어져 있어, 사무실 근처만 보이는 방식으로는 영업 범위를 다 덮지 못합니다.'],
  '간판·광고물': ['간판·광고물은 개업·리뉴얼 시기에 지역 상권 단위로 문의가 생겨, 상권 지역 이름으로 검색했을 때 시공 사례가 보여야 합니다.', '간판 손님은 시공 사진을 보고 업체를 고르고, 설치 지역의 허가 기준도 함께 묻습니다. 지역 페이지가 그 질문에 답합니다.'],
});

// ---- 서비스 페이지 조합기 ("변기막힘 업체 홍보") ----
const SVC_H1 = ['{s} 업체 홍보, 지역마다 검색 페이지로', '{s} 손님이 검색하는 곳마다 업체 페이지를', '{s} 업체, 영업 지역 전체 검색에 걸리게'];
const SVC_WHAT_H2 = ['{s} 손님은 어떻게 검색할까요?', '{s} 검색은 어떤 말로 들어올까요?', '{s} 문의는 어디서 시작될까요?'];
const SVC_PAGE_H2 = ['{s} 검색 페이지 구성 예시', '지역 × {s}, 이렇게 페이지가 나뉩니다', '{s} 키워드 페이지 이름 예시'];
const SVC_INC_H2 = ['{s} 페이지에 들어가는 것', '{s} 페이지 한 장의 구성', '{s} 손님을 전화로 잇는 구성'];

// 법률·회생은 '업체' 자체를 '사무소'로 (대출·금융은 '업체'가 자연스러워 그대로)
const LEGAL_GROUPS = ['회생·채무', '법률·전문직'];
const legalize = <T,>(v: T): T => {
  if (typeof v === 'string') return (v as string).replace(/업체/g, '사무소').replace(/필요한 작업/g, '필요한 절차') as T;
  if (Array.isArray(v)) return v.map(legalize) as T;
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, legalize(x)])) as T;
  return v;
};

export function buildServiceContent(svc: ServiceDoc) {
  const c = composeService(svc);
  if (!isOffice(svc.group)) return c;
  return LEGAL_GROUPS.includes(svc.group) ? legalize(officeize(c)) : officeize(c);
}

function composeService(svc: ServiceDoc) {
  const s = svc.name;
  const P = svc.parent;
  const seed = svc.slug;
  const office = isOffice(svc.group);
  const q = svc.searches.length >= 2 ? svc.searches : [...svc.searches, `${s} 업체`, `${s} 비용`].slice(0, 2);
  const others = P.services.filter((x) => x !== s && x !== P.name);
  const regions = regionsFor(seed, 10);
  const mods = office ? ['', ' 상담', ' 비용', ' 절차', ' 잘하는곳'] : P.urgent ? ['', ' 업체', ' 비용', ' 당일', ' 추천'] : ['', ' 업체', ' 비용', ' 견적', ' 잘하는곳'];
  const examples = regions.slice(0, 8).map((r, k) => `${r} ${s}${mods[k % mods.length]}`);
  const fill = (t: string) => t.replace(/\{s\}/g, s);
  const label = industryTitle(s, svc.group);
  const facts = [polite(P.pain), `${j(P.name, '은', '는')} ${polite(P.radius)}`, polite(P.season), polite(P.decide)];
  const f1 = hash(seed + 'fa') % facts.length;
  const f2 = (f1 + 1 + (hash(seed + 'fb') % (facts.length - 1))) % facts.length;

  return {
    label,
    title: `${label} - 지역별 ${s} 검색 페이지 제작 | JD8`,
    description: `${label}는 지역별 웹문서로. '${q[0]}'·'${q[1]}' 같은 검색에 맞춰 영업 지역마다 ${s} 페이지를 만들어 네이버·구글에 등록합니다.`,
    h1: fill(pick(SVC_H1, seed + 'h1')),
    summary: [
      `'${q[0]}', '${q[1]}'처럼 찾는 손님에게 ${s} 업체 페이지를 보여 주는 방법입니다.`,
      `예: ${regions.length}개 지역 × 검색어 형태 ${mods.length}가지 = ${regions.length * mods.length}페이지 (${examples[0]}, ${examples[2]} …).`,
      pick([`${P.name} 업체의 실제 ${s} 사례로 채우고 묶음별로 엽니다. 노출 보장은 하지 않습니다.`, `${s} 페이지부터 단계적으로 열고 수집을 확인합니다. 순위 보장은 하지 않습니다.`], seed + 's3'),
    ],
    whatH2: fill(pick(SVC_WHAT_H2, seed + 'w')),
    what: [
      `'${q[0]}', '${q[1]}'처럼 ${s} 손님은 필요한 작업을 그대로 검색합니다. ${polite(svc.note)} 여기에 '${regions[0]}' 같은 지역 이름이 붙으면 검색 결과는 그 지역에서 ${j(s, '을', '를')} 하는 업체로 좁혀집니다.`,
      `${facts[f1]} ${facts[f2]}`,
      pick([
        `${j(s, '은', '는')} ${P.name} 안에서도 따로 검색되는 서비스라, ${P.name} 페이지 하나에 묶기보다 ${s} 전용 페이지를 두는 쪽이 검색어와 맞아떨어집니다.`,
        `${P.name} 업체 홈페이지에 ${j(s, '이', '가')} 한 줄로만 적혀 있으면 '${q[0]}' 검색에는 잘 걸리지 않습니다. 서비스 이름이 제목인 페이지가 따로 있어야 합니다.`,
        `손님은 '${P.name}'보다 '${s}'처럼 구체적인 말로 검색하는 경우가 많습니다. 그 말 그대로를 제목으로 한 페이지가 지역마다 있어야 연락이 옵니다.`,
      ], seed + 'why'),
    ],
    pageH2: fill(pick(SVC_PAGE_H2, seed + 'p')),
    page: pick([
      `${s} 페이지는 지역 이름과 손님이 붙이는 말(${mods.filter(Boolean).map((m) => m.trim()).join('·')})을 조합해 만듭니다. 아래는 예시로 뽑은 조합이고, 실제 제작 때는 사장님의 영업 지역으로 다시 짭니다.`,
      `검색어 하나에 페이지 하나가 원칙입니다. '${examples[1]}'와 '${examples[3]}'는 서로 다른 손님이 쓰는 말이라 각각 페이지를 둡니다.`,
      `${s} 손님이 지역 뒤에 붙이는 말은 몇 가지로 정리됩니다. 그 말과 영업 지역을 곱하면 필요한 ${s} 페이지 수가 나옵니다.`,
    ], seed + 'pg'),
    examples,
    regions,
    mods: mods.length,
    calcTitle: `${s} 페이지는 몇 개가 필요할까?`,
    serpH2: `${examples[0]} 검색에 사장님 업체가 보이게`,
    serpText: pick([
      `'${examples[0]}' 검색 결과의 웹문서 자리에 ${s} 업체 페이지가 걸리게 만드는 것이 목표입니다. 제목은 검색어 그대로, 본문은 ${s} 작업 내용과 지역 안내로 채웁니다.`,
      `${regions[0]}에서 ${j(s, '을', '를')} 찾는 손님은 첫 화면에서 업체를 고릅니다. 그 화면에 사장님 페이지가 하나 더 있으면 플레이스 거리 밖에서도 연락받을 기회가 생깁니다.`,
    ], seed + 'serp'),
    serpDesc: office ? `${s} 상담 안내, 진행 절차, 자주 묻는 질문 — 전화 한 번으로 바로 연결됩니다.` : `${s} 출동·작업 안내, 작업 사진, 자주 묻는 질문 — 전화 한 번으로 바로 연결됩니다.`,
    incH2: fill(pick(SVC_INC_H2, seed + 'i')),
    features: [
      { h: '전용 썸네일', p: pick([`'${examples[0]}'처럼 지역과 ${j(s, '이', '가')} 들어간 썸네일을 페이지마다 만들어 검색 결과에서 구분되게 합니다.`, `${s} 페이지마다 키워드를 크게 넣은 썸네일을 만들어, 정사각형으로 잘리는 네이버 결과에서도 글자가 보이게 합니다.`], seed + 'f1') },
      { h: `${s} 사례와 사진`, p: pick([`${s} 작업 사진과 설명을 지역 페이지마다 나눠 넣어 같은 사진이 반복되지 않게 합니다.`, `가지고 계신 ${s} 기록을 지역별로 나눠 연결하고, 없는 사례는 만들어 넣지 않습니다.`], seed + 'f2') },
      { h: '전화·카톡 버튼', p: P.urgent ? `${s}처럼 급한 문의가 많은 서비스는 화면 하단에 전화·문자 버튼을 고정해 읽다가 바로 연락하게 합니다.` : `${s} 견적을 비교하는 손님이 마음을 정했을 때 바로 연락할 수 있게 전화·카톡 버튼을 둡니다.` },
      { h: '서비스끼리 연결', p: `${P.name} 페이지와 ${others.slice(0, 2).join('·') || P.name} 페이지를 서로 연결해, 들어온 손님이 필요한 서비스로 이어지게 합니다.` },
    ],
    bundleH2: `${P.name} 업체라면 함께 만드는 페이지`,
    bundle: `${j(s, '은', '는')} ${P.name} 업체가 하는 서비스 ${P.services.length}가지 중 하나입니다. ${others.slice(0, 4).join(', ')} 같은 서비스도 같은 방식으로 지역마다 페이지를 만들 수 있고, 페이지끼리 서로 연결합니다.`,
    faq: [
      { q: `${s} 페이지만 따로 만들 수 있나요?`, a: `가능합니다. 주력인 ${s}부터 영업 지역별로 만들고, 반응을 보며 ${others[0] || P.name} 같은 다른 서비스로 넓히면 됩니다.` },
      { q: `${s} 검색어는 어떻게 고르나요?`, a: `'${q[0]}', '${q[1]}'처럼 손님이 실제로 쓰는 표현과 지역 이름을 조합합니다. 검색이 거의 없는 조합은 빼고 시작합니다.` },
      ...(P.regulated ? [{ q: `${s} 광고 문구는 어떤 기준을 지키나요?`, a: `${polite(P.regulated)} 페이지 문구를 이 기준에 맞춰 쓰고, 필수 표기 항목은 사장님께 받은 정보 그대로 넣습니다.` }] : []),
      { q: `${s} 검색 상위노출을 보장하나요?`, a: `순위나 노출은 누구도 보장할 수 없습니다. 보장을 내세우는 업체는 경계하셔야 합니다. 저희는 ${s} 페이지를 묶음별로 열고 '${q[0]}' 같은 검색어별 수집 현황을 확인하며 진행합니다.` },
    ],
    keywords: [`${s} 홍보`, `${s} 업체 홍보`, `${s} 마케팅`, `${s} 웹문서`],
  };
}

// ---- 업종군 허브 ("하수구·배관 업체 웹문서") ----
export function buildGroupContent(g: GroupDoc, industries: IndustryDoc[]) {
  const names = industries.map((i) => i.name);
  const notes = GROUP_NOTE[g.group] || [];
  const office = isOffice(g.group);
  return {
    title: isBrand(g.group) ? `${g.group} 웹문서 제작 - 본사용 검색 페이지 | JD8` : `${g.group} 업체 웹문서 제작 - 업종별 지역 검색 페이지 | JD8`,
    description: `${g.group} 업종(${names.slice(0, 4).join('·')} 등)의 영업 지역 × 서비스 검색 페이지 제작 안내. 업종별 페이지 구성과 필요한 페이지 수를 확인하세요.`,
    h1: isBrand(g.group) ? `${g.group} 웹문서 제작` : `${g.group} 업체 웹문서 제작`,
    summary: [
      `${g.group} 업종 ${names.length}개(${names.slice(0, 5).join(', ')} 등)의 웹문서 구성을 모았습니다.`,
      ...notes.slice(0, 1),
      isBrand(g.group) ? '제품·고민별 검색, 판매처·가맹 지역 검색마다 공식 페이지를 만들고, 광고 규정에 맞춰 문구를 검수합니다.' : office ? '상담 지역 × 사건·상품 유형마다 페이지를 만들고, 광고 규정에 맞춰 문구를 씁니다.' : '영업 지역 × 서비스마다 페이지를 만들고, 실제 사진·사례로 채웁니다.',
    ],
    intro: notes.slice(1).join(' '),
    cards: industries.map((i) => ({ slug: i.slug, name: industryTitle(i.name, i.group), pain: polite(i.pain), services: i.services.slice(0, 4) })),
  };
}

// ==== 업종 홈페이지 제작 페이지 (/homepage/<업종>-홈페이지제작/) — 기존 207업종 md 와 대응 안 되는 웹문서 업종만 ====
// 대응표: data/webdoc/homepage-map.json (웹문서 업종명 → 기존 홈페이지 업종 영문 slug | null)
// 공개 일정: data/webdoc/homepage-schedule.json (scripts/webdoc_schedule.py --section homepage)

export interface HomepageGenDoc extends Industry {
  kind: 'homepage';
  slug: string; // "하수구-홈페이지제작"
  openDate: string;
}

let hmapCache: Record<string, string | null> | null = null;
export function getHomepageMap(): Record<string, string | null> {
  if (hmapCache) return hmapCache;
  const file = path.join(process.cwd(), 'data', 'webdoc', 'homepage-map.json');
  return (hmapCache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {});
}

let hgCache: HomepageGenDoc[] | null = null;
export function getAllHomepageGen(): HomepageGenDoc[] {
  if (hgCache) return hgCache;
  const map = getHomepageMap();
  const sched = loadSchedule('homepage-schedule.json');
  return (hgCache = roundRobin(loadRaw())
    .filter((i) => !map[i.name])
    .map((i) => {
      const slug = `${i.name}-홈페이지제작`;
      return { ...i, kind: 'homepage' as const, slug, openDate: sched.get(slug) || '9999-12-31' };
    }));
}
export const getOpenHomepageGen = () => getAllHomepageGen().filter((p) => p.openDate <= todayKst());
export const getHomepageGen = (slug: string) => {
  let key = slug;
  try {
    key = decodeURIComponent(slug);
  } catch {}
  return getOpenHomepageGen().find((p) => p.slug === key);
};
export const homepageGenPath = (slug: string) => `/homepage/${slug}/`;
export const homepageGenEncodedPath = (slug: string) => `/homepage/${encodeURIComponent(slug)}/`;
export const homepageGenOg = (slug: string) => `/og/homepage/${slug}.jpg`;

// 같은 업종의 홈페이지 제작 페이지 경로 — 생성 페이지는 열렸을 때만 (기존 md 페이지 경로는 호출부에서 lib/industries 로 만든다)
export function homepageGenHrefFor(name: string): string | null {
  const g = getOpenHomepageGen().find((p) => p.name === name);
  return g ? homepageGenPath(g.slug) : null;
}

// ---- 형제 사이트(ad.jd8.co.kr, 마케팅 대행) 링크 ----
// 문맥 안에서 같은 업종으로만 1~2개. 업종 마케팅 페이지는 그쪽 일정이 끝난 뒤에만 링크(안 열린 페이지로 링크하면 404).
export const AD_SITE = 'https://ad.jd8.co.kr';
const AD_INDUSTRY_FULL_OPEN = '2026-11-13';
export function adMarketingHref(name: string): string {
  return todayKst() >= AD_INDUSTRY_FULL_OPEN
    ? `${AD_SITE}/industry/${encodeURIComponent(`${name}-마케팅`)}/`
    : `${AD_SITE}/service/${encodeURIComponent('블로그-마케팅')}/`;
}
const AD_BRAND_FULL_OPEN = '2026-11-17';
export function adBrandHref(name: string, group: string): string | null {
  if (todayKst() < AD_BRAND_FULL_OPEN) return null;
  return `${AD_SITE}/brand/${encodeURIComponent(`${name}-${group === '프랜차이즈 본사' ? '가맹' : '브랜드'}-마케팅`)}/`;
}
export const adServiceHref = (urlSlug: string) => `${AD_SITE}/service/${encodeURIComponent(urlSlug)}/`;

export function buildHomepageContent(ind: HomepageGenDoc) {
  const c = composeHomepage(ind);
  if (!isOffice(ind.group)) return c;
  return LEGAL_GROUPS.includes(ind.group) ? legalize(officeize(c)) : officeize(c);
}

const HP_NEED_H2 = ['{n} 홈페이지에 꼭 들어가야 할 것', '{n} 홈페이지, 무엇을 보여 줘야 문의가 올까요?', '{n} 업체 홈페이지의 기본 구성'];
const HP_MENU_H2 = ['{n} 홈페이지 메뉴 구성 예시', '{n} 홈페이지는 이렇게 나눕니다', '{n} 사이트 메뉴, 이렇게 짭니다'];

function composeHomepage(ind: HomepageGenDoc) {
  const n = ind.name;
  const sv = ind.services;
  const seed = ind.slug;
  const office = isOffice(ind.group);
  const fill = (t: string) => t.replace(/\{n\}/g, n);
  const q = ind.searches;
  return {
    title: `${n} 홈페이지 제작 - ${office ? '상담으로 이어지는 사무소 사이트' : '문의로 이어지는 업체 사이트'} | JD8`,
    description: `${n} 홈페이지 제작은 JD8. ${sv.slice(0, 3).join('·')} 안내, 작업 사례, ${office ? '상담 지역' : '출장 지역'}, 전화·카톡 문의 동선까지 30만원부터 평균 7일에 만듭니다.`,
    h1: `${n} 홈페이지 제작`,
    summary: [
      `${polite(ind.decide)} 그래서 ${n} 홈페이지는 사례와 문의 버튼이 첫 화면 가까이에 있어야 합니다.`,
      `서비스 ${sv.length}가지 안내, 사례, ${office ? '상담' : '출장'} 지역, 문의 동선을 기본으로 30만원부터 평균 7일에 만듭니다.`,
      `홈페이지 하나로 부족한 지역 검색은 웹문서(지역×서비스 페이지)로 넓힐 수 있습니다.`,
    ],
    needH2: fill(pick(HP_NEED_H2, seed + 'n')),
    needs: [
      { h: '서비스별 안내', p: `${sv.slice(0, 4).join('·')}처럼 서비스마다 따로 소개해야 '${q[1] || q[0]}' 같은 검색과 맞아떨어집니다. 한 화면에 몰아 적으면 손님이 찾는 작업을 놓칩니다.` },
      { h: '사례와 사진', p: pick([`${n} 손님은 결과물로 판단합니다. 작업 전후 사진과 사례를 서비스별로 정리해 첫 화면 가까이에 둡니다.`, `${sv[0]} 같은 대표 작업의 사례부터 지역·날짜와 함께 올려, 같은 동네 손님이 비슷한 사례를 바로 찾게 합니다.`], seed + 'c') },
      { h: '문의 동선', p: ind.urgent ? `${n}은(는) 급한 문의가 많아 모바일 화면 하단에 전화·문자 버튼을 고정하고, 운영 시간을 눈에 띄게 적습니다.`.replace(`${n}은(는)`, j(n, '은', '는')) : `${n} 손님은 비교 후 연락하므로, 견적 문의 폼과 카톡 상담 버튼을 서비스 안내 바로 아래에 둡니다.` },
      { h: office ? '상담 지역 안내' : '출장 지역 안내', p: `${j(n, '은', '는')} ${polite(ind.radius)} 그래서 ${office ? '상담 가능한' : '갈 수 있는'} 지역을 목록으로 보여 줘야 "여기도 되나요?" 문의 전에 연락이 옵니다.` },
      ...(ind.regulated ? [{ h: '표시 기준', p: `${polite(ind.regulated)} 필수 표기 항목은 대표님께 받은 정보 그대로 하단에 넣습니다.` }] : []),
    ],
    menuH2: fill(pick(HP_MENU_H2, seed + 'm')),
    menu: [
      ['홈', `대표 서비스 ${sv[0]}·${sv[1] || sv[0]}, ${ind.urgent ? '전화 버튼' : '상담 버튼'}, 대표 사례`],
      ['서비스 안내', sv.slice(0, 5).join(', ')],
      ['작업 사례', office ? `${sv[0]}·${sv[1] || sv[0]} 진행 사례(의뢰인 동의를 받은 것만)` : `${sv[0]}·${sv[2] || sv[0]} 작업의 지역별 전후 사진`],
      [office ? '상담 절차' : '비용 안내', office ? `${sv[0]} 상담 → 서류 준비 → 진행 순서와 기간 안내` : `${sv[0]} 비용이 정해지는 기준(작업 범위·거리·자재)`],
      [office ? '상담 지역' : '출장 지역', office ? `사무소 위치와 ${n} 비대면 상담 범위` : `${n} 출동 가능한 시·군·구 목록`],
      ['문의', ind.urgent ? `${n} 전화·문자 버튼 고정, 카톡 상담` : `${sv[0]} 견적 문의 폼, 카톡 상담`],
    ],
    cost: pick([
      `JD8의 ${n} 홈페이지는 1:1 맞춤 디자인으로 30만원부터, 평균 7일에 완성합니다. 반응형·기본 SEO·문의 동선이 기본으로 들어가고, 사진이 부족해도 시작할 수 있습니다.`,
      `${n} 홈페이지는 30만원부터 시작해 평균 7일이면 완성됩니다. 모바일 화면, 검색 기본 설정, 전화·카톡 문의 버튼까지 기본 구성에 포함됩니다.`,
    ], seed + 'cost'),
    serviceRows: ind.serviceItems.filter((x) => x.note).slice(0, 6).map((x) => [x.name, polite(x.note), (x.searches[0] || `${x.name} 업체`)]),
    beyond: `${polite(ind.pain)} 이럴 때는 홈페이지에 '${q[0]}' 같은 검색어를 지역별로 받는 웹문서 페이지를 붙여 영업 지역 전체로 넓힙니다.`,
    faq: [
      { q: `${n} 홈페이지에 넣을 사진이 거의 없는데 괜찮을까요?`, a: `괜찮습니다. 가지고 계신 ${sv[0]} 작업 사진부터 쓰고, 부족한 곳은 작업 과정 설명으로 채운 뒤 사진이 생기는 대로 바꿉니다.` },
      { q: `${n} 홈페이지 제작 기간은 얼마나 걸리나요?`, a: `평균 7일입니다. ${sv[0]}·${sv[1] || sv[0]} 같은 서비스 설명과 사진을 받는 속도에 따라 달라지며, 전 과정 비대면으로 진행합니다.` },
      { q: `${n} 홈페이지가 있는데 검색이 잘 안 되면요?`, a: `홈페이지 한 장은 상호나 대표 키워드에만 걸리기 쉽습니다. '${q[2] || q[0]}'처럼 지역과 서비스를 붙인 검색은 웹문서 페이지로 받는 것이 효과적입니다.` },
      { q: `${n} 홈페이지를 만들면 검색 상위에 나오나요?`, a: `순위는 누구도 보장할 수 없습니다. '${q[0]}' 같은 검색어가 제목과 본문에 자연스럽게 들어간 구조와 검색 등록까지 해 드리고, 노출은 검색엔진의 평가에 따라 달라집니다.` },
    ],
  };
}

// ---- 웹문서 업종 페이지: "광고·마케팅 무엇부터" 비교 ----
export function buildChannelPlan(ind: Industry) {
  if (isBrand(ind.group)) {
    const n = ind.name;
    const fr = ind.group === '프랜차이즈 본사';
    const rows: [string, string][] = fr
      ? [
          ['파워링크(창업 키워드)', `'${n} 창업' 같은 예비 점주 검색을 받지만 창업 키워드는 클릭 단가가 높습니다.`],
          ['창업 박람회·중개 플랫폼', `${n} 예비 점주를 한 번에 만나지만 다른 브랜드와 나란히 비교됩니다.`],
          ['블로그·인스타', `${n} 매장 분위기와 점주 이야기를 보여 주지만 지역별로 계속 써야 합니다.`],
          ['웹문서(지역 가맹·지점 페이지)', `지역별 ${n} 창업·지점 검색마다 본사 공식 정보가 남아 계속 검색을 받습니다.`],
          ['본사 홈페이지', `가맹 조건·정보공개서 안내·상담 신청이 모이는 곳입니다. ${n} 브랜드 신뢰의 기준이 됩니다.`],
        ]
      : [
          ['쇼핑검색광고·오픈마켓 광고', `${n} 같은 상품 검색을 바로 받지만, 광고를 끄면 노출도 끝납니다.`],
          ['스마트스토어·쿠팡', `${n} 구매가 일어나는 곳이라 리뷰·상세페이지 관리가 매출을 좌우합니다.`],
          ['인스타·인플루언서', `${n} 인지도를 만들지만 협찬 게시물은 대가성 표기가 필수입니다.`],
          ['블로그 체험단', `'${(ind as IndustryDoc).serviceItems?.[0]?.name || n}' 같은 후기 검색을 채우지만 대가성 표기와 표현 검수가 함께 필요합니다.`],
          ['웹문서(제품·판매처 페이지)', `${n} 고민·대상별 검색과 판매처 검색에 공식 정보가 남아 계속 유입됩니다.`],
        ];
    return {
      h2: `${n} ${fr ? '본사' : '브랜드'} 광고·마케팅, 무엇부터 해야 할까요?`,
      rows,
      order: fr
        ? `${n} 본사는 홈페이지(가맹 조건) 정비 → 지역 가맹·지점 웹문서 → 창업 키워드 광고 순서를 권합니다.`
        : `${n} 브랜드는 오픈마켓 상세·리뷰 정비 → 제품·판매처 웹문서 → 인플루언서·광고 확대 순서를 권합니다.`,
    };
  }
  const n = ind.name;
  const q = ind.searches;
  const office = isOffice(ind.group);
  const rows: [string, string][] = [
    ['파워링크(키워드 광고)', ind.urgent ? `'${q[0]}'처럼 급한 검색을 바로 받지만, 클릭마다 광고비가 나가 ${n} 성수기엔 단가가 오릅니다.` : `${n} 손님이 비교하는 단계에서 보이지만, 비교 클릭이 많아 광고비가 쌓이기 쉽습니다.`],
    ['네이버 플레이스', `${office ? '사무소' : '매장·사무실'} 근처 '${q[1] || q[0]}' 검색에 강하고 리뷰가 신뢰를 만들지만, 거리 밖 지역에서는 잘 보이지 않습니다.`],
    ['블로그 광고·체험단', office ? `${n}은(는) 광고 규정상 체험단 후기보다 절차·비용을 설명하는 정보 글이 맞습니다.`.replace(`${n}은(는)`, j(n, '은', '는')) : `${n} 후기와 사진을 보고 고르는 손님에게 효과가 있지만, 지역마다 글을 계속 새로 써야 합니다.`],
    ['웹문서(지역×서비스 페이지)', `'${q[0]}' 앞에 지역을 붙인 조합 검색을 영업 지역 전체에서 받고, 만든 페이지가 계속 남습니다.`],
    ['홈페이지', `모든 채널이 도착하는 곳입니다. ${n} 사례와 문의 버튼이 정리돼 있어야 광고비가 새지 않습니다.`],
  ];
  const order = office
    ? `${n}은(는) 홈페이지(사무소 소개·절차) → 웹문서로 상담 지역 확장 → 정보 글 순서를 권합니다.`
    : ind.urgent
      ? `${n}은(는) 플레이스 정비 → 파워링크 소액 → 웹문서로 옆 지역까지 확장 순서를 권합니다.`
      : `${n}은(는) 홈페이지·사례 정리 → 웹문서로 지역 검색 확보 → 블로그 후기 순서를 권합니다.`;
  return {
    h2: `${n} 광고·마케팅, 무엇부터 해야 할까요?`,
    rows,
    order: order.replace(`${n}은(는)`, j(n, '은', '는')),
  };
}

// ==== 브랜드 본사 (제조·유통 브랜드, 프랜차이즈 본사) ====
// 판매 페이지가 노리는 말은 본사 담당자의 검색어("유산균 브랜드 마케팅", "가맹점 모집 광고").
// 소비자 검색어("아기 유산균 추천")는 "이렇게 만들어 드린다" 예시 표에만 쓴다. 효능·효과 표현은 절대 쓰지 않는다.
export const BRAND_GROUPS = ['화장품 브랜드', '건강기능식품 브랜드', '식품 브랜드', '생활·펫 브랜드', '프랜차이즈 본사'];
export const isBrand = (group: string) => BRAND_GROUPS.includes(group);
const isFranchise = (group: string) => group === '프랜차이즈 본사';

Object.assign(GROUP_NOTE, {
  '화장품 브랜드': ['화장품은 소비자가 피부 고민·성분·대상으로 잘게 검색하는 시장이라, 제품명 하나로는 그 검색들을 받지 못합니다.', '화장품 광고는 의약품으로 오인될 표현을 쓰면 안 되고 기능성은 심사받은 내용만 쓸 수 있어, 검색 페이지 문구도 이 기준으로 검수해야 합니다.'],
  '건강기능식품 브랜드': ['건강기능식품은 광고 전에 표시·광고 심의를 받아야 해서, 검색 페이지도 심의받은 문구와 원료·제품 정보 위주로 구성해야 합니다.', '영양제 시장은 원료·함량·대상별 비교 검색이 많아, 비교 단계에서 공식 정보가 보이는 브랜드가 신뢰를 얻습니다.'],
  '식품 브랜드': ['식품은 일반식품을 건강기능식품처럼 광고하면 안 되므로, 원재료·제조 방식·먹는 상황 중심의 검색 페이지가 맞습니다.', '식품 브랜드는 선물·간편식·지역 특산처럼 구매 상황별 검색이 많아 상황별 페이지가 유입 통로가 됩니다.'],
  '생활·펫 브랜드': ['생활·펫 제품은 사용 대상과 상황(반려동물 나이, 아기 월령, 공간)별로 검색이 나뉘어 상황별 페이지가 필요합니다.', '생활·펫 브랜드는 오픈마켓 판매 비중이 커서 공식몰과 판매처 정보를 검색에서 정리해 두는 것이 중요합니다.'],
  '프랜차이즈 본사': ['프랜차이즈 본사는 예비 점주가 지역·창업 비용·가맹 조건을 검색하며 비교하는 단계에서 정확한 정보로 보여야 합니다.', '가맹점이 늘수록 "지역 + 브랜드" 지점 검색도 늘어, 지점 찾기와 가맹 모집 페이지를 지역별로 두는 본사가 유리합니다.'],
});

export function composeBrand(ind: IndustryDoc) {
  const n = ind.name;
  const g = ind.group;
  const fr = isFranchise(g);
  const seed = ind.slug;
  const label = industryTitle(n, g);
  const owner = ind.searches;
  const consumer = ind.serviceItems.map((x) => x.name);
  const mods = fr ? [''] : ['', ' 추천', ' 비교', ' 성분', ' 후기'];
  const examples = fr
    ? ind.serviceItems.flatMap((x) => (x.searches.length ? x.searches.slice(0, 1) : [x.name])).slice(0, 8)
    : consumer.slice(0, 5).flatMap((c, k) => [c, `${c}${mods[1 + (k % (mods.length - 1))]}`]).slice(0, 10);
  const fill = (t: string) => t.replace(/\{n\}/g, n);
  return {
    label,
    title: `${label} - ${fr ? '가맹 모집·지점 검색 페이지' : '제품·고민별 검색 페이지'} 웹문서 제작 | JD8`,
    description: fr
      ? `${label}는 지역별 가맹 모집·창업 문의·지점 찾기 검색 페이지로. '${owner[0]}' 같은 본사 고민에 맞춰 예비 점주와 고객이 찾는 검색어마다 공식 페이지를 만듭니다.`
      : `${label}는 제품·고민·대상별 검색 페이지로. 공식몰 유입, 판매처·대리점 안내, 입점 문의까지 본사가 필요한 검색 페이지를 광고 규정에 맞춰 만듭니다.`,
    h1: fr ? `${n} 본사 홍보, 가맹 모집부터 지점 검색까지` : `${n} 브랜드 홍보, 제품 검색부터 판매처 안내까지`,
    summary: [
      fr
        ? `예비 점주는 '${examples[0]}'처럼 지역·비용을 붙여 검색하고, 고객은 지점을 찾습니다. 두 검색 모두에 공식 페이지를 둡니다.`
        : `${n} 소비자는 '${consumer[0]}', '${consumer[1] || consumer[0]}'처럼 고민·대상을 붙여 검색합니다. 그 검색마다 공식 정보 페이지를 둡니다.`,
      fr ? `${n} 본사용 구성: 지역별 가맹 모집, 창업 문의, 지점 찾기, 브랜드 검색 정리.` : `${n} 본사용 구성: 공식몰 유입, 판매처·대리점 안내, 입점 문의, 브랜드 검색 정리.`,
      `${polite(ind.regulated || '광고 표시 기준을 지켜야 한다')} 효능·과장 표현 없이 만듭니다.`,
    ],
    whyH2: fill(pick([fr ? '{n} 본사, 왜 웹문서가 필요할까요?' : '{n} 브랜드, 왜 웹문서가 필요할까요?', '{n} 본사가 검색에서 놓치는 곳은 어디일까요?'], seed + 'w')),
    why: [
      `${polite(ind.pain)} ${polite(ind.decide)}`,
      `${j(n, '은', '는')} ${polite(ind.radius)} ${pick(GROUP_NOTE[g] || [''], seed + 'g')}`,
      `${polite(ind.season)} ${polite(ind.hq || '본사 문의 창구가 함께 필요하다')}`,
    ],
    howH2: fr ? `${n} 가맹·지점 검색 페이지 예시` : `${n} 제품 검색 페이지 예시`,
    how: fr
      ? pick([`예비 점주와 고객이 실제로 쓰는 검색어마다 ${n} 공식 페이지를 만듭니다. 아래는 예시이며, 실제로는 본사의 가맹 가능 지역과 지점 목록으로 다시 짭니다.`, `'${examples[0]}'처럼 예비 점주가 지역·비용을 붙여 찾는 말이 ${n} 페이지 이름이 됩니다. 실제 제작 때는 가맹 우선 지역부터 짭니다.`], seed + 'how')
      : pick([`소비자가 쓰는 고민·대상 검색어마다 ${n} 공식 정보 페이지를 만듭니다. 아래는 예시이며, 실제로는 라인업과 심의받은 문구 범위 안에서 짭니다.`, `'${consumer[0]}', '${consumer[2] || consumer[0]}'처럼 소비자가 붙이는 말이 ${n} 페이지 이름이 됩니다. 실제 제작 때는 주력 제품부터 짭니다.`], seed + 'how'),
    examples,
    regions: Array(fr ? 10 : consumer.length).fill(''),
    total: (fr ? 10 : consumer.length) * (fr ? consumer.length : mods.length),
    calcTitle: fr ? `${n} 본사는 페이지가 몇 개 필요할까?` : `${n} 브랜드는 페이지가 몇 개 필요할까?`,
    calcFirst: fr ? ['가맹 지역', '곳'] : ['제품 키워드', '개'],
    calcSecond: fr ? `${n} 검색 유형` : '검색 형태',
    calcSecondCount: fr ? consumer.length : mods.length,
    serpH2: `${examples[0]} 검색에 공식 페이지가 보이게`,
    serpText: fr
      ? `'${examples[0]}' 검색을 한 예비 점주가 블로그 후기·중개 사이트보다 먼저 본사 공식 정보를 보게 만드는 것이 목표입니다.`
      : `'${examples[0]}' 검색 결과에 ${n} 공식 페이지가 있으면, 소비자가 리셀러·비교 글보다 먼저 정확한 제품 정보를 보게 됩니다.`,
    serpDesc: fr ? `${n} 가맹 조건 안내, 창업 절차, 지점 찾기 — 가맹 문의로 바로 연결됩니다.` : `${n} 제품 정보, 공식 판매처, 자주 묻는 질문 — 공식몰로 바로 연결됩니다.`,
    inclH2: '페이지마다 들어가는 것',
    features: [
      { h: '공식 정보와 출처', p: fr ? `${n} 가맹 조건·창업 절차는 정보공개서와 같은 내용으로만 씁니다.` : `${n} 제품 정보는 본사가 준 라벨·심의 문구 범위 안에서만 씁니다.` },
      { h: '전용 썸네일', p: `'${examples[0]}' 같은 검색어와 ${n} 브랜드명이 들어간 썸네일을 페이지마다 만듭니다.` },
      { h: fr ? '가맹 문의 버튼' : '공식몰·판매처 연결', p: fr ? `${n} 페이지마다 가맹 상담 버튼과 지점 찾기 링크를 둡니다.` : `${consumer[1] || n} 같은 페이지마다 공식몰·스마트스토어·판매처로 가는 버튼을 둡니다.` },
      { h: '구조화 데이터와 캐러셀', p: `${fr ? '지점' : consumer.slice(0, 2).join('·') + ' 같은 제품'} 목록을 캐러셀(ItemList) 데이터로 표시해 ${n} 페이지끼리 연결합니다.` },
      { h: '등록과 단계 오픈', p: `${polite(ind.season)} 수요가 오르기 전에 ${n} 주력 페이지가 수집되도록 묶음별로 엽니다.` },
    ],
    hqBlock: {
      h2: fr ? `${n} 본사라면 함께 만드는 페이지` : `${n} 본사라면 함께 만드는 페이지`,
      items: fr
        ? [
            ['지역별 가맹 모집', `'${examples[1] || examples[0]}'처럼 지역을 붙인 ${n} 창업 검색마다 가맹 안내 페이지를 둡니다.`],
            ['지점 찾기', `${n} 가맹점이 생길 때마다 "지역 + 브랜드" 지점 페이지를 추가해 고객 검색을 받습니다.`],
            ['창업 설명회·상담', `${polite(ind.hq || '가맹 문의 창구가 필요하다')} 설명회 일정과 상담 신청을 페이지에서 바로 받습니다.`],
            ['브랜드 검색 정리', `'${owner[1] || owner[0]}'를 고민하는 본사라면, 브랜드명 검색에 공식 가맹 정보가 먼저 보이게 정리합니다.`],
          ]
        : [
            ['공식몰 유입', `${consumer.slice(0, 2).join('·')} 같은 ${n} 검색에서 공식몰로 바로 들어오게 합니다.`],
            ['판매처·대리점 안내', `${polite(ind.radius)} 지역별 판매처와 대리점 위치를 검색 페이지로 정리합니다.`],
            ['입점·B2B 문의', `${polite(ind.hq || '입점 문의 창구가 필요하다')} 문의 전용 페이지를 따로 둡니다.`],
            ['브랜드 검색 정리', `${n} 브랜드명 검색에 리셀러·모조품보다 공식 정보가 먼저 보이게 정리합니다.`],
          ],
    },
    stepH2: '진행 순서',
    steps: fr
      ? [`${n} 가맹 가능 지역과 정보공개서 기준 안내 범위를 받습니다`, `'${examples[0]}' 같은 예비 점주 검색어와 지점 목록으로 페이지 이름을 정합니다`, `${n} 정보공개서와 다른 숫자·표현이 없는지 검수합니다`, '묶음별로 공개하고 가맹 문의 유입을 확인합니다']
      : [`${n} 라인업과 심의받은 문구·라벨 정보를 받습니다`, `'${consumer[0]}' 같은 소비자 검색어와 판매처 지역으로 페이지 이름을 정합니다`, `${n} 문구에 효능·의약품 오인 표현이 없는지 검수합니다`, `묶음별로 공개하고 ${n} 공식몰 유입을 확인합니다`],
    faq: [
      { q: fr ? `${n} 가맹 모집 페이지에 예상 수익을 넣어도 되나요?` : `${n} 페이지에 효과·효능을 쓸 수 있나요?`, a: fr ? '근거 없는 예상 수익이나 과장된 정보는 가맹사업법상 문제가 됩니다. 정보공개서와 같은 내용만 쓰고, 수익 관련 숫자는 본사가 근거를 갖춘 것만 넣습니다.' : `${polite(ind.regulated || '광고 표시 기준을 지켜야 한다')} 그래서 효능 대신 원료·사용법·대상·구매 정보처럼 확인 가능한 사실로 페이지를 채웁니다.` },
      { q: `${n} 페이지는 몇 개부터 시작하나요?`, a: fr ? `${n} 가맹 우선 지역과 기존 지점 수를 기준으로 수십 개부터 시작해 반응을 보며 넓힙니다.` : `${consumer.slice(0, 3).join(', ')}처럼 검색이 많은 ${n} 조합부터 수십 개로 시작하고, 라인업이 늘면 함께 늘립니다.` },
      { q: fr ? `${n} 창업 박람회·중개 플랫폼과는 무엇이 다른가요?` : `${n} 스마트스토어·쿠팡 광고와는 무엇이 다른가요?`, a: fr ? `박람회·플랫폼은 다른 브랜드와 나란히 비교되고, 웹문서는 '${examples[0]}' 같은 검색에서 ${n} 본사 정보가 따로 보이게 합니다.` : `오픈마켓 광고는 그 안의 검색을 받고, 웹문서는 '${consumer[0]}' 같은 통합검색에서 ${n} 공식 정보가 보이게 합니다. 함께 쓰면 광고를 끈 뒤에도 페이지가 남습니다.` },
      { q: `${label}로 검색 상위노출을 보장하나요?`, a: `순위나 노출은 누구도 보장할 수 없습니다. 보장을 내세우는 업체는 경계하셔야 합니다. ${n} 페이지를 묶음별로 공개하며 수집·색인 현황을 공유합니다.` },
    ],
    keywords: [...owner, `${n} 브랜드 홍보`, `${n} 웹문서`],
    ctaText: fr ? `가맹 가능 지역과 지점 목록만 보내주시면 ${n} 본사 페이지 구성안을 먼저 드립니다.` : `라인업과 판매처 목록만 보내주시면 ${n} 브랜드 페이지 구성안을 먼저 드립니다.`,
  };
}

// ---- 본사 업무 페이지 ("화장품 브랜드 인플루언서 마케팅") ----
export interface BrandTask {
  kind: 'task';
  group: string;
  name: string;
  slug: string;
  searches: string[];
  points: string[];
  risk: string;
  faq: { q: string; a: string }[];
}
export function loadBrandTasks(): BrandTask[] {
  const f = path.join(process.cwd(), 'data', 'webdoc', 'brand-tasks.json');
  if (!fs.existsSync(f)) return [];
  return (JSON.parse(fs.readFileSync(f, 'utf-8')) as Omit<BrandTask, 'kind'>[]).map((t) => ({ ...t, kind: 'task' as const }));
}
export function buildTaskContent(t: BrandTask) {
  const title = `${t.group} ${t.name}`;
  return {
    label: title,
    title: `${title} - 본사 마케팅·웹문서 대행 | JD8`,
    description: `${title}, 규정을 지키면서 검색에서 보이게. '${t.searches[0]}' 같은 고민을 가진 본사를 위해 할 일과 주의할 점, 웹문서로 함께 만드는 페이지를 정리했습니다.`,
    h1: title,
    summary: [
      `'${t.searches[0]}', '${t.searches[1] || t.searches[0]}' 같은 검색으로 찾아온 ${t.group} 본사를 위한 안내입니다.`,
      polite(t.risk),
      '검색 페이지(웹문서)와 함께 운영하면 광고를 끈 뒤에도 공식 정보가 남습니다.',
    ],
    points: t.points.map((x) => polite(x)),
    whoH2: `이런 ${t.group} 본사에 필요합니다`,
    who: t.searches.map((q, i) => {
      const eul = hasBatchim(q) ? '을' : '를';
      return [`'${q}'${eul} 알아보는 중인 본사`, `'${q}' 단계에서 무엇부터 할지 정리가 필요한 본사`, `'${q}'${eul} 맡겼다가 결과 보고가 불분명했던 본사`][i % 3];
    }),
    noteText: pick(GROUP_NOTE[t.group] || [''], t.slug + 'g'),
    linkH2: `카테고리별로 이렇게 연결합니다`,
    links: roundRobin(loadRaw())
      .filter((i) => i.group === t.group)
      .sort((a, b) => hash(t.slug + a.name) - hash(t.slug + b.name))
      .slice(0, 5)
      .map((i, k) => {
        const ex = i.serviceItems[hash(t.slug + i.name) % Math.max(1, i.serviceItems.length)]?.name || i.name;
        const out = t.name.includes('심의') ? '검수된 문구' : t.name.includes('상세') ? '상세페이지' : '후기·콘텐츠';
        return [i.name, [
          `'${ex}' 같은 ${i.name} 검색 페이지에 ${t.name} 결과물(${out})을 연결해, 광고가 끝난 뒤에도 검색에서 계속 보이게 합니다.`,
          `${i.name}은(는) '${ex}' 검색 페이지가 ${j(out, '을', '를')} 받는 자리가 됩니다.`.replace(`${i.name}은(는)`, j(i.name, '은', '는')),
          `'${ex}'처럼 ${i.name} 소비자가 쓰는 말로 페이지를 두고 ${j(out, '을', '를')} 붙입니다.`,
        ][k % 3]];
      }),
    flowH2: `${t.name} 진행 순서`,
    flow: [
      `현재 ${t.group} 라인업과 운영 중인 채널, '${t.searches[0]}' 관련 지금까지의 진행 내용을 받습니다.`,
      `${polite(t.risk)} 이 기준으로 문구·게시물 검수 범위를 먼저 정합니다.`,
      `${t.name} 실행 계획과 함께, 같은 검색어를 받는 웹문서 페이지 구성안을 드립니다.`,
      `매월 '${t.searches[1] || t.searches[0]}' 같은 검색어별 노출·문의 지표를 공유하고 조정합니다.`,
    ],
    faq: [
      ...t.faq,
      { q: `${title}도 성과를 보장하나요?`, a: '성과나 순위는 누구도 보장할 수 없습니다. 진행 내용과 지표를 매월 공유하며 조정합니다.' },
    ],
    keywords: [...t.searches, title],
  };
}
