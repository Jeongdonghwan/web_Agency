import allData from '../data/industries-all.json';
import sidoData from '../data/sido.json';
import { hash, pick, j, q, ro, polite, industryPath, getIndustries, type Industry } from './content';
import { LAUNCH, LANDING, BRAND } from './site';
import { extra, type ExtraAngle } from './make-extra';

// "제작" 페이지: 업종 326 × (전국 + 시·도 17) × 키워드 4종 = 23,472쪽.
//   전용   — ○○ 전용 홈페이지 제작
//   마케팅 — ○○ 마케팅 전용 홈페이지 제작
//   타지역 — ○○ 타지역서비스 홈페이지 제작
//   질문   — ○○ 타지역서비스만 하세요?
// 단계 오픈: LAUNCH 날 70%가 열리고 나머지 30%는 그 뒤 7일에 걸쳐 열린다 (slug 해시로 날짜가 정해진다).
// 묶음은 slug 만으로 정해지므로 업종을 나중에 추가해도 이미 열린 페이지가 닫히지 않는다.

export type Angle = 'jeon' | 'mkt' | 'taji' | 'only' | ExtraAngle;
const BASE = new Set(['jeon', 'mkt', 'taji', 'only']);
export interface Sido { name: string; full: string; unit: string; areas: string[] }
export type Ind = Industry & { regulated?: string | null };
export interface MakePage { slug: string; ind: Ind; sd: Sido | null; angle: Angle; wave: number; openDate: string }

export const ANGLES: { key: Angle; suffix: string; label: string; desc: string }[] = [
  { key: 'jeon', suffix: '전용-홈페이지-제작', label: '전용 홈페이지 제작', desc: '업종에 맞춰 메뉴와 내용을 짠 홈페이지' },
  { key: 'mkt', suffix: '마케팅-전용-홈페이지-제작', label: '마케팅 전용 홈페이지 제작', desc: '검색어를 받고 문의로 잇는 구성의 홈페이지' },
  { key: 'taji', suffix: '타지역서비스-홈페이지-제작', label: '타지역서비스 홈페이지 제작', desc: '다른 지역 검색을 받는 지역 페이지가 붙은 홈페이지' },
  { key: 'only', suffix: '타지역서비스만-하세요', label: '타지역서비스만 하세요?', desc: '타지역서비스에 홈페이지를 더해야 하는 이유' },
  { key: 'aeo', suffix: 'AEO-GEO-홈페이지-제작', label: 'AEO·GEO 홈페이지 제작', desc: 'AI 검색이 읽고 인용하기 쉬운 구조의 홈페이지' },
  { key: 'seo', suffix: '검색-잘-되는-홈페이지-제작', label: '검색 잘 되는 홈페이지 제작', desc: '서비스별 페이지와 검색 등록을 갖춘 홈페이지' },
  { key: 'cheap', suffix: '저렴한-홈페이지-제작', label: '저렴한 홈페이지 제작', desc: '30만원부터, 비용이 정해지는 기준' },
  { key: 'good', suffix: '홈페이지-제작-잘하는-곳', label: '홈페이지 제작 잘하는 곳', desc: '제작 업체를 고를 때 확인할 것' },
  { key: 'resp', suffix: '반응형-홈페이지-제작', label: '반응형 홈페이지 제작', desc: '휴대폰 화면부터 맞추는 홈페이지' },
  { key: 'fast', suffix: '빠른-홈페이지-제작', label: '빠른 홈페이지 제작', desc: '평균 7일, 기간을 줄이는 진행 순서' },
  { key: 'renew', suffix: '홈페이지-리뉴얼', label: '홈페이지 리뉴얼', desc: '기존 홈페이지를 검색어 기준으로 다시 짜기' },
  { key: 'land', suffix: '랜딩페이지-제작', label: '랜딩페이지 제작', desc: '서비스 하나에 집중한 한 장짜리 문의 페이지' },
  { key: 'small', suffix: '소규모-홈페이지-제작', label: '소규모 홈페이지 제작', desc: '1인·소규모 업체가 필요한 것만 넣는 홈페이지' },
];
const angleOf = (k: Angle) => ANGLES.find((a) => a.key === k)!;

export const MAKE_HUB = '/제작/';
export const makePath = (slug: string) => `/제작/${slug}/`;
export const makeListPath = (sido: string, angle: Angle) => `/제작/지역/${sido}-${angleOf(angle).suffix}/`;
export const makeOg = (n: string) => `/og/hp-${n}.jpg`;

// 공개 일정: slug 해시 0~99 가운데 70 미만은 첫날, 나머지 30은 1~7일째에 고르게 나눈다. 전국 페이지는 첫날.
const openDay = (slug: string, national: boolean) => {
  if (national) return 0;
  const h = hash(slug) % 100;
  return h < 70 ? 0 : 1 + Math.floor(((h - 70) * 7) / 30);
};
const addDays = (d: string, n: number) => new Date(+new Date(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const todayKst = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);

const sidos = sidoData as Sido[];
const inds = allData as Ind[];
export const getSidos = () => sidos;

let _all: MakePage[] | null = null;
let _bySlug: Map<string, MakePage> | null = null;
export function getAllMake(): MakePage[] {
  if (_all) return _all;
  const out: MakePage[] = [];
  for (const ind of inds) for (const a of ANGLES) for (const sd of [null, ...sidos]) {
    const slug = `${sd ? sd.name + '-' : ''}${ind.name}-${a.suffix}`;
    const wave = openDay(slug, !sd);
    out.push({ slug, ind, sd, angle: a.key, wave, openDate: addDays(LAUNCH, wave) });
  }
  _all = out;
  _bySlug = new Map(out.map((p) => [p.slug, p]));
  return out;
}

// 미리보기용: OPEN_ALL=1 이면 전부, SAMPLE=20 이면 20분의 1만 (품질 검사·화면 확인용)
let _open: MakePage[] | null = null;
export function getOpenMake(): MakePage[] {
  if (_open) return _open;
  const today = todayKst();
  const sample = Number(process.env.SAMPLE || 0);
  // 포춘마케팅(한 장짜리)은 하위 페이지를 만들지 않는다 — 빌드가 통과하도록 한 쪽만 남기고 빌드 뒤 지운다(scripts/build.mjs)
  if (LANDING) return (_open = getAllMake().slice(0, 1));
  // ONLY_NATIONAL=1: 지역 없는 전국판만 (서버를 먼저 열 때 쓰는 작은 구성)
  const nat = !!process.env.ONLY_NATIONAL;
  _open = getAllMake().filter((p) => (nat ? !p.sd : process.env.OPEN_ALL || p.openDate <= today) && (!sample || hash('s' + p.slug) % sample === 0));
  return _open;
}
export const getMake = (slug: string) => {
  getAllMake();
  let s = slug;
  try { s = decodeURIComponent(slug); } catch {}
  return _bySlug!.get(s);
};

// 묶음 찾기용 색인 (열린 페이지만)
let _idx: Map<string, MakePage[]> | null = null;
function idx() {
  if (_idx) return _idx;
  _idx = new Map();
  const add = (k: string, p: MakePage) => { const a = _idx!.get(k); if (a) a.push(p); else _idx!.set(k, [p]); };
  for (const p of getOpenMake()) {
    const sn = p.sd ? p.sd.name : '전국';
    add(`ia|${p.ind.name}|${p.angle}`, p); // 같은 업종·같은 키워드 → 다른 시·도
    add(`is|${p.ind.name}|${sn}`, p); // 같은 업종·같은 시·도 → 다른 키워드
    add(`sa|${sn}|${p.angle}`, p); // 같은 시·도·같은 키워드 → 다른 업종
  }
  return _idx;
}
export const openByIndAngle = (n: string, a: Angle) => idx().get(`ia|${n}|${a}`) || [];
export const openByIndSido = (n: string, sn: string) => idx().get(`is|${n}|${sn}`) || [];
export const openBySidoAngle = (sn: string, a: Angle) => idx().get(`sa|${sn}|${a}`) || [];

export const makeTitle = (p: MakePage) => `${p.sd ? p.sd.name + ' ' : ''}${p.ind.name} ${angleOf(p.angle).label}`;
const hasWebsitePage = new Set(getIndustries().map((i) => i.name));
export const parentPath = (n: string) => (hasWebsitePage.has(n) ? industryPath(n) : null);

const OFFICE: Record<string, string> = { '법률·전문직': '의뢰인', '회생·채무': '의뢰인', '대출·금융': '고객' };
const NATION = ['김포', '일산', '부천', '수원', '동탄', '분당', '안양', '의정부', '남양주', '하남', '평택', '천안', '청주', '대전', '창원', '김해', '강서구', '마포구', '노원구', '해운대', '대구 수성', '세종'];
const roq = (w: string) => `'${w}'${ro(w).slice(w.length)}`;
const shuffle = <T,>(arr: T[], seed: string) => [...arr].sort((a, b) => hash(seed + String(a)) - hash(seed + String(b)));

export function composeMake(p: MakePage) {
  const { ind, sd, angle } = p;
  const n = ind.name;
  const s = p.slug;
  const loc = sd ? `${sd.name} ` : '';
  const office = OFFICE[ind.group];
  const cust = office || '손님';
  const go = office ? '상담' : '출장';
  const owner = office ? '대표님' : '사장님';
  const A = shuffle(sd ? sd.areas : NATION, s).slice(0, 8);
  const a = (k: number) => A[k % A.length];
  const unit = sd ? sd.unit : '지역';
  const unitN = sd ? `${sd.areas.length}개 ${sd.unit}` : '영업 지역';
  const off = hash(s + 'o') % ind.services.length;
  const svcs = ind.services.map((_, k) => ind.services[(k + off) % ind.services.length]);
  const sv = (k: number) => svcs[k % svcs.length];
  const where = sd ? sd.name : '영업 지역';
  const lab = angleOf(angle).label;
  const h1 = angle === 'only' ? `${loc}${n} 타지역서비스만 하세요?` : `${loc}${n} ${lab}`;
  const PRICE = '홈페이지는 30만원부터, 평균 7일에 만듭니다';


  const description = {
    jeon: pick([
      `${loc}${n} 전용 홈페이지는 ${sv(0).name}·${sv(1).name} 같은 서비스 안내와 ${go} 지역, 문의 동선을 ${n}에 맞춰 짠 홈페이지입니다. ${PRICE}.`,
      `${n} ${cust}이 찾는 내용부터 담는 ${loc}${n} 전용 홈페이지를 만듭니다. ${sv(0).name}, ${sv(1).name} 안내와 '${a(0)} ${sv(0).name}' 같은 지역 검색 페이지까지 함께 구성합니다.`,
    ], s + 'd'),
    mkt: pick([
      `${loc}${n} 마케팅 전용 홈페이지는 '${a(0)} ${sv(0).name}' 같은 검색어를 받고 전화·카톡 문의로 잇도록 짠 홈페이지입니다. 소개용이 아니라 문의를 받는 구성으로 만듭니다.`,
      `검색어를 받는 페이지와 문의 버튼을 먼저 설계하는 ${loc}${n} 마케팅 전용 홈페이지입니다. ${sv(0).name}·${sv(1).name} 서비스별 페이지와 ${where} 지역 페이지를 함께 만듭니다.`,
    ], s + 'd'),
    taji: pick([
      `${loc}${n} 타지역서비스를 알아보셨다면, 지역 페이지가 붙은 홈페이지를 함께 만드세요. '${a(0)} ${sv(0).name}' 같은 검색어마다 ${owner} 도메인에 페이지가 남습니다.`,
      `${n} 타지역서비스 홈페이지는 ${where} ${unit}마다 검색 페이지를 붙여 다른 지역 ${cust}의 검색을 받는 홈페이지입니다. 페이지는 ${owner} 도메인에 쌓입니다.`,
    ], s + 'd'),
    only: pick([
      `${loc}${n} 타지역서비스만 쓰고 계신가요? 홈페이지에 '${a(0)} ${sv(0).name}' 같은 지역 페이지를 더하면 ${owner} 도메인에도 검색 통로가 생깁니다. 무엇이 달라지는지 정리했습니다.`,
      `${n} 타지역서비스에 더해, ${where} ${unit}별 검색 페이지가 붙은 홈페이지를 두는 방법을 안내합니다. 둘은 받는 ${cust}이 달라 함께 쓰는 것이 좋습니다.`,
    ], s + 'd'),
  }[angle];

  const summary = {
    jeon: [`${n} 서비스 ${svcs.length}가지와 ${cust}이 묻는 내용을 기준으로 메뉴를 짭니다`, `${PRICE}`, `${where} ${unit}별 검색 페이지를 붙일 수 있습니다`],
    mkt: [`${n} 검색어를 받는 페이지부터 설계합니다`, `모든 페이지에 전화·카톡 버튼을 두고 누른 횟수를 셉니다`, `${where} ${unit} × 서비스 조합으로 검색 입구를 늘립니다`],
    taji: [`${where} ${unit}마다 ${n} 검색 페이지를 만듭니다`, `페이지는 ${owner} 도메인에 남습니다`, `쓰고 계신 타지역서비스와 함께 운영할 수 있습니다`],
    only: [`타지역서비스는 지도 안의 ${cust}을, 홈페이지는 검색창의 ${cust}을 받습니다`, `${n} 지역 페이지는 계약이 끝나도 ${owner} 도메인에 남습니다`, `${PRICE}`],
  }[angle];

  // 지역 문장 (이 사이트 전용)
  const areaLine = sd
    ? pick([
        `${sd.full}에는 ${j(unitN, '이', '가')} 있고, ${n} ${cust}은 '${a(0)} ${sv(0).name}'처럼 ${sd.unit} 이름을 붙여 검색합니다.`,
        `${sd.name} ${unitN} 가운데 ${a(0)}·${a(1)}·${a(2)}처럼 실제로 ${go} 가는 곳마다 ${n} 검색어가 따로 생깁니다.`,
        `${sd.name}에서 ${j(n, '을', '를')} 찾는 ${cust}은 ${a(0)}, ${a(1)} 같은 ${sd.unit} 이름으로 검색을 시작합니다.`,
      ], s + 'al')
    : pick([
        `${n} ${cust}은 '${a(0)} ${sv(0).name}', '${a(1)} ${sv(1).name}'처럼 지역 이름을 붙여 검색합니다.`,
        `${j(n, '은', '는')} ${a(0)}, ${a(1)}, ${a(2)}처럼 ${go} 가는 지역마다 검색어가 따로 생기는 업종입니다.`,
      ], s + 'al');

  const whyH2 = {
    jeon: pick([`${n} 전용 홈페이지가 따로 필요한 이유`, `${loc}${n} 홈페이지, 업종에 맞춰 만들어야 하는 까닭`], s + 'h'),
    mkt: pick([`${n} 마케팅 전용 홈페이지는 무엇이 다른가요`, `${loc}${n}, 소개용 홈페이지와 문의용 홈페이지의 차이`], s + 'h'),
    taji: pick([`${n} 타지역서비스에 홈페이지가 필요한 이유`, `${loc}${n} 타지역 검색, 도착할 페이지가 있어야 합니다`], s + 'h'),
    only: pick([`${n} 타지역서비스만 할 때 비는 자리`, `${loc}${n}, 지도 밖 검색은 누가 받고 있나요`], s + 'h'),
  }[angle];

  const why1 = {
    jeon: pick([
      `어느 업종에나 쓰는 틀에 상호만 바꾼 홈페이지는 ${n} ${cust}이 궁금해하는 내용을 담지 못합니다. ${polite(ind.decide)}`,
      `${n} ${cust}은 홈페이지에서 회사 소개보다 자기 상황에 맞는 답을 먼저 찾습니다. ${polite(ind.decide)}`,
      `${n} 전용 홈페이지는 메뉴 이름부터 ${sv(0).name}, ${sv(1).name}처럼 ${cust}이 쓰는 말로 짭니다. ${polite(ind.decide)}`,
    ], s + 'w1'),
    mkt: pick([
      `마케팅 전용 홈페이지는 보기 좋은 소개 페이지가 아니라 문의를 받도록 짠 홈페이지입니다. ${n}에서는 ${sv(0).name} 같은 서비스마다 검색어를 받고 전화·카톡으로 이어지는 길을 먼저 설계합니다.`,
      `광고나 검색으로 들어온 ${n} ${cust}이 처음 보는 화면에서 ${sv(0).name} 안내와 연락 방법을 바로 찾게 하는 것이 마케팅 전용 홈페이지의 기준입니다.`,
      `${n} 홈페이지에 방문은 있는데 문의가 없다면 구성이 소개용이기 때문인 경우가 많습니다. 마케팅 전용 홈페이지는 ${sv(0).name}·${sv(1).name} 검색어별 페이지와 문의 버튼을 중심에 둡니다.`,
    ], s + 'w1'),
    taji: pick([
      `타지역서비스로 다른 지역 지도에 이름이 보여도, 눌렀을 때 도착할 ${n} 홈페이지가 없으면 ${cust}은 다른 업체와 비교하다 나갑니다.`,
      `${n} 타지역서비스는 지도 안에서 보이게 하는 방식입니다. 검색창에 ${q(`${a(0)} ${sv(0).name}`, '을', '를')} 치는 ${cust}에게는 그 검색어에 맞는 페이지가 따로 있어야 합니다.`,
      `다른 지역 ${cust}이 ${j(n, '을', '를')} 찾았을 때 "여기까지 오나요"에 답하는 페이지가 필요합니다. 타지역서비스 홈페이지는 그 답을 ${unit}별 페이지로 만들어 둡니다.`,
    ], s + 'w1'),
    only: pick([
      `${n} 타지역서비스만 쓰면 노출은 지도 안에서, 계약 기간 동안만 생깁니다. 지도 플랫폼 기준이 바뀌면 함께 달라지고, ${owner} 쪽에 남는 것은 많지 않습니다.`,
      `타지역서비스는 지도에서 ${j(n, '을', '를')} 찾는 ${cust}을 받습니다. 검색창에 ${q(`${a(0)} ${sv(0).name}`, '을', '를')} 입력하는 ${cust}은 웹 페이지를 보고 고르는데, 이 자리가 비어 있습니다.`,
      `${n} 타지역서비스를 쓰고 계시다면 절반은 하신 셈입니다. 나머지 절반은 ${owner} 도메인에 ${where} 지역 페이지를 쌓아 검색창에서도 보이게 하는 일입니다.`,
    ], s + 'w1'),
  }[angle];
  const why2 = `${areaLine} ${polite(angle === 'jeon' || angle === 'taji' ? ind.pain : ind.radius)}`;

  // 표 1: 지역별 검색어
  const third = (ar: string, x: { name: string }) => ({ jeon: `${x.name} 안내 페이지`, mkt: `${x.name} 문의 페이지`, taji: `${ar} 지역 페이지`, only: `${ar} ${x.name} 페이지` }[angle]);
  const rows: [string, string, string][] = A.map((ar, k) => {
    const x = sv(k);
    return [ar, `${ar} ${x.searches[(k + off) % x.searches.length] || x.name}`, third(ar, x)];
  });
  const tableH2 = sd ? `${sd.name} ${n} ${unit}별 검색어와 만들 페이지` : `${n} 지역별 검색어와 만들 페이지`;

  // 표 2: 서비스별 구성
  const svcRows: [string, string, string][] = svcs.slice(0, angle === 'jeon' || angle === 'mkt' ? 5 : 4).map((x, k) => [x.name, polite(x.note), x.searches[(k + 1) % x.searches.length] || x.name]);
  const svcH2 = { jeon: `${n} 홈페이지에 들어가는 서비스 메뉴`, mkt: `${n} 서비스별 문의 페이지`, taji: `${n} 서비스별로 나눠 받는 검색`, only: `${n} 홈페이지가 받는 서비스 검색` }[angle];

  // 구성 항목 (키워드마다 다름)
  const inclH2 = { jeon: `${loc}${n} 전용 홈페이지 구성`, mkt: `${loc}${n} 마케팅 전용 홈페이지에 넣는 것`, taji: `${loc}${n} 타지역서비스 홈페이지 구성`, only: `${n} 타지역서비스에 홈페이지를 더하면` }[angle];
  const incl = ({
    jeon: [
      ['서비스 메뉴', `${sv(0).name}, ${sv(1).name}, ${sv(2).name}처럼 ${cust}이 쓰는 이름으로 메뉴를 나눕니다.`],
      [office ? '상담 사례' : '작업 사례', `${n} ${office ? '상담 분야와 진행 방식' : '현장 사진과 작업 내용'}을 서비스별로 정리합니다.`],
      [`${go} 지역`, `${a(0)}·${a(1)} 등 실제로 ${go} 가능한 ${unit}을 적습니다.`],
      ['문의 동선', ind.urgent ? `${n} 문의는 급한 경우가 많아 화면 아래에 전화 버튼을 고정합니다.` : `${n} ${cust}은 비교한 뒤 연락하므로 견적 기준과 카톡 버튼을 함께 둡니다.`],
    ],
    mkt: [
      ['검색어별 페이지', `'${a(2)} ${sv(0).name}'처럼 지역과 서비스를 묶은 검색어마다 페이지를 둡니다.`],
      ['첫 화면', `${sv(0).name} 안내, ${go} 지역, 연락 방법 세 가지가 스크롤 없이 보이게 합니다.`],
      ['문의 버튼', `전화·카톡 버튼을 ${n} 모든 페이지에 두고, 누른 횟수를 셉니다.`],
      ['광고 연결', `검색광고를 함께 쓰신다면 ${sv(1).name} 광고가 ${sv(1).name} 페이지로 바로 도착하게 연결합니다.`],
    ],
    taji: [
      [`${unit}별 페이지`, `${a(0)}, ${a(1)}, ${a(2)} 등 ${go} 가는 ${unit}마다 ${n} 페이지를 만듭니다.`],
      ['지역별 내용', `${unit}마다 ${sv(0).name}·${sv(1).name} 안내와 질문을 다르게 구성해 복제 페이지가 되지 않게 합니다.`],
      ['검색 등록', `${n} 페이지 주소를 사이트맵으로 묶어 네이버·구글에 등록하고 수집을 확인합니다.`],
      ['플레이스 연결', `페이지에 플레이스 링크를 넣어 리뷰를 확인하고 연락하는 흐름을 만듭니다.`],
    ],
    only: [
      ['검색창 통로', `지도 밖에서 ${q(`${a(2)} ${sv(0).name}`, '을', '를')} 검색한 ${cust}이 도착할 페이지가 생깁니다.`],
      ['남는 자산', `${n} 지역 페이지는 ${owner} 도메인에 올라가 계약이 끝나도 남습니다.`],
      ['비교 자료', `${sv(0).name}·${sv(1).name} 안내와 ${office ? '상담 방식' : '작업 사례'}을 보여 주어 ${cust}이 고를 근거를 줍니다.`],
      ['두 통로', `타지역서비스는 그대로 두고 홈페이지를 더하면 지도와 검색 두 곳에서 연락이 옵니다.`],
    ],
  } as Record<Angle, [string, string][]>)[angle];

  const timingH2 = pick([`${loc}${n} 문의가 생기는 때`, `${n} ${cust}이 연락하기 전에 보는 것`], s + 'th');
  const timing = `${polite(ind.season)} ${polite(angle === 'jeon' || angle === 'taji' ? ind.radius : ind.pain)} ${pick([
    `그래서 ${where} ${n} 페이지는 문의가 몰리기 전에 미리 열어 둡니다.`,
    `${a(3)}·${a(4)}처럼 ${go} 가는 곳의 ${n} 페이지가 먼저 검색에 잡혀 있어야 그 시기에 연락이 옵니다.`,
    `${n} 홈페이지는 이 시기에 맞춰 ${sv(0).name} 안내를 첫 화면에 올립니다.`,
  ], s + 't')}`;

  // 진행 순서 + 아직 쓰지 않은 업종 사실(전용·타지역은 위에서 decide 를 썼으므로 여기선 마케팅·질문만)
  const flow = `${pick([
    `${loc}${n} 홈페이지는 ${go} 지역과 서비스 목록 확인, 자료 받기, 제작, ${where} 지역 페이지 공개 순서로 진행합니다. 전 과정을 카톡과 전화로 진행하고, 시안은 ${sv(0).name} 페이지부터 보여 드립니다.`,
    `진행은 네 단계입니다. ${n} 서비스와 ${go} 가는 ${unit}을 표로 정리하고, ${office ? '업무 자료' : '현장 사진'}를 받은 뒤 홈페이지를 만들고, ${a(5)}·${a(6)} 같은 지역 페이지를 묶음으로 나눠 엽니다.`,
    `먼저 ${n} 서비스 ${svcs.length}가지와 ${where}에서 ${go} 가는 곳을 함께 정리합니다. 그다음 ${sv(1).name} 등 서비스 페이지를 만들고, 지역 페이지는 나눠 열면서 검색엔진 수집을 확인합니다.`,
  ], s + 'fl')}${angle === 'mkt' || angle === 'only' ? ` ${polite(ind.decide)} ${pick([`${n} 페이지에는 이 내용을 ${cust}이 찾기 쉬운 자리에 둡니다.`, `그래서 ${n} 홈페이지 첫 화면에 이 정보를 먼저 보여 줍니다.`], s + 'fd')}` : ` ${pick([`${a(7)}처럼 나중에 넓히는 ${unit}은 ${n} 페이지를 추가로 붙이면 됩니다.`, `${n} 홈페이지를 연 뒤에도 ${unit}과 서비스는 계속 더할 수 있습니다.`], s + 'fd')}`}`;

  const priceP = pick([
    `${n} ${PRICE}. ${where} 지역 페이지는 ${unit} 수와 서비스 수에 따라 따로 견적을 드립니다.`,
    `${PRICE}. ${n} 지역 페이지를 붙이면 ${unit} 수 × 서비스 수만큼 페이지가 늘고, 그 수에 맞춰 견적을 드립니다.`,
  ], s + 'pr');

  const total = (sd ? sd.areas.length : 20) * svcs.length;
  const noRank = '순위는 검색엔진이 정하므로 보장하지 않습니다.';
  const faq = {
    jeon: [
      { q: `${loc}${n} 전용 홈페이지는 일반 홈페이지와 무엇이 다른가요?`, a: `메뉴와 내용을 ${n}에 맞춰 짭니다. ${sv(0).name}, ${sv(1).name} 같은 서비스별 안내와 ${cust}이 자주 묻는 질문, ${go} 지역이 기본으로 들어갑니다.` },
      { q: `${n} 홈페이지 제작 기간과 비용은 어떻게 되나요?`, a: `${PRICE}. 서비스 수와 지역 페이지 수에 따라 달라지며, 목록을 보내 주시면 견적을 드립니다.` },
      { q: `${where} 지역 페이지도 같이 만들 수 있나요?`, a: `가능합니다. ${a(0)}·${a(1)} 등 ${go} 가는 ${unit}마다 ${n} 페이지를 붙이면 지역 검색을 받을 수 있습니다. ${noRank}` },
      { q: `${office ? '자료' : '사진'}가 많지 않은데 시작할 수 있나요?`, a: office ? `가능합니다. ${n} 업무 분야와 상담 방식을 알려 주시면 그 내용으로 구성합니다.` : `가능합니다. 휴대폰으로 찍은 ${sv(0).name} 현장 사진 몇 장이면 시작할 수 있습니다.` },
    ],
    mkt: [
      { q: `${n} 마케팅 전용 홈페이지란 무엇인가요?`, a: `검색어를 받는 페이지와 문의 버튼을 중심으로 짠 홈페이지입니다. ${roq(`${a(0)} ${sv(0).name}`)} 들어온 ${cust}이 바로 연락할 수 있게 만듭니다.` },
      { q: `${n} 검색광고 도착 페이지로 써도 되나요?`, a: `됩니다. ${sv(0).name} 광고는 ${sv(0).name} 페이지로, ${sv(1).name} 광고는 ${sv(1).name} 페이지로 연결하면 메인으로 보내는 것보다 내용이 맞습니다.` },
      { q: `${n} 문의가 얼마나 오는지 확인할 수 있나요?`, a: `전화·카톡 버튼을 누른 횟수와 어떤 페이지에서 눌렀는지 셀 수 있게 설정해 드립니다.` },
      { q: `${loc}${n} 마케팅 전용 홈페이지 비용은요?`, a: `${PRICE}. ${where} 지역 페이지 ${total}개 안팎을 붙이는 경우는 페이지 수에 따라 견적을 따로 드립니다.` },
    ],
    taji: [
      { q: `${n} 타지역서비스를 쓰는 중인데 홈페이지가 꼭 필요한가요?`, a: `지도에서 본 ${cust}도 홈페이지를 눌러 비교합니다. ${sv(0).name} 안내와 ${go} 지역이 적힌 페이지가 있어야 연락으로 이어집니다.` },
      { q: `${n} 타지역서비스와 같이 써도 되나요?`, a: `같이 쓰시는 것이 좋습니다. 타지역서비스는 지도 안의 ${cust}을, 홈페이지 지역 페이지는 검색창의 ${cust}을 받습니다.` },
      { q: `${where} ${n} 지역 페이지는 몇 개나 만드나요?`, a: `${go} 가는 ${unit} 수와 서비스 수를 곱합니다. ${sd ? `${sd.name} ${unitN}` : '지역 20곳'}에 ${n} 서비스 ${svcs.length}가지면 ${total}개가 기준이고, 가지 않는 곳은 뺍니다.` },
      { q: `${a(0)} 같은 지역 검색에 언제부터 보이나요?`, a: `페이지를 올린 뒤 수집까지 보통 몇 주가 걸리고, ${n} 경쟁 상황에 따라 다릅니다. ${noRank}` },
    ],
    only: [
      { q: `${n} 타지역서비스만 해도 되지 않나요?`, a: `지도에서 찾는 ${cust}만 받는다면 그렇습니다. 다만 '${a(0)} ${sv(0).name}'처럼 검색창에 입력하는 ${cust}은 놓치게 됩니다.` },
      { q: `${n} 타지역서비스를 끊어야 하나요?`, a: `끊을 필요 없습니다. 그대로 두고 ${owner} 도메인에 ${where} 지역 페이지를 더하시면 됩니다.` },
      { q: `홈페이지가 이미 있는데 ${n} 지역 페이지만 붙일 수 있나요?`, a: `가능합니다. 기존 홈페이지 주소 아래에 ${a(1)}·${a(2)} 같은 지역 페이지를 붙이는 방법을 먼저 검토합니다.` },
      { q: `${loc}${n} 홈페이지와 지역 페이지 비용은요?`, a: `${PRICE}. 지역 페이지는 ${unit} 수 × 서비스 수에 따라 견적을 드립니다. ${noRank}` },
    ],
  }[angle];

  const regulated = ind.regulated ? `${n} 홈페이지와 지역 페이지에서 지킬 표시 기준이 있습니다. ${polite(ind.regulated)} JD8은 이 기준에 맞춰 문구를 씁니다.` : null;
  const areasText = sd ? `${sd.full} ${unitN}: ${sd.areas.join(', ')}.` : null;
  const calc = { regions: sd ? sd.areas.length : 20, services: svcs.length };
  const ctaH2 = pick([`${loc}${n} ${go} 지역과 서비스 목록만 보내 주세요`, `${loc}${n} 홈페이지 구성안을 먼저 받아 보세요`], s + 'c');
  const ctaText = `${a(0)}·${a(1)}처럼 ${go} 가시는 곳과 ${sv(0).name} 등 하시는 일을 알려 주시면 ${n} 홈페이지 구성과 견적을 정리해 드립니다.`;
  const keywords = [`${loc}${n} ${lab.replace('?', '')}`, `${loc}${n} 홈페이지 제작`, `${n} 타지역서비스`, `${loc}${n} 홈페이지`];
  const { h1sub, meta } = headMeta(h1, angle, { n, s, sd, cust, owner, unit, unitN, svcs, A });
  if (!BASE.has(angle)) {
    const x = extra(angle as ExtraAngle, { n, loc, cust, go, owner, unit, unitN, where, office: !!office, s, total, count: svcs.length, urgent: ind.urgent, decide: ind.decide, pain: ind.pain, a, sv });
    return {
      title: titleOf(h1, h1sub), h1, h1sub, description: meta, lead: x.description, summary: x.summary, whyH2: x.whyH2, why: [x.why1, why2], tableH2,
      rows: rows.map((r, k) => [r[0], r[1], x.third(r[0], sv(k).name)] as [string, string, string]),
      svcH2: x.svcH2, svcRows, inclH2: x.inclH2, incl: x.incl, timingH2, timing, flow, priceP, regulated, areasText, faq: x.faq, unit, calc, ctaH2, ctaText, keywords,
    };
  }
  return {
    title: titleOf(h1, h1sub), h1, h1sub, description: meta, lead: description, summary, whyH2, why: [why1, why2], tableH2, rows, svcH2, svcRows, inclH2, incl, timingH2, timing, flow, priceP,
    regulated, areasText, faq, unit, calc, ctaH2, ctaText, keywords,
  };
}

// h1 수식어 + 검색 결과용 description (50~80자). 본문 lead 는 기존 문장 그대로 둔다.
// 수식어: 키워드에 있는 낱말(지역·업종·홈페이지·제작 등)을 쓰지 않는 벌만 남겨 slug 해시로 고른다. 사실은 페이지 데이터(서비스·시군구·30만원·평균 7일)만.
interface HM { n: string; s: string; sd: Sido | null; cust: string; owner: string; unit: string; unitN: string; svcs: { name: string }[]; A: string[] }
const DESC_WHAT: Record<Angle, string> = {
  jeon: '업종 맞춤 메뉴', mkt: '문의 받는 구성', taji: '지역 페이지 구성', only: '홈페이지를 더하는 방법', aeo: 'AI 검색용 구조',
  seo: '사이트맵 등록', cheap: '비용이 정해지는 기준', good: '업체 고르는 기준', resp: '모바일 화면 기준', fast: '진행 순서',
  renew: '기존 주소 연결', land: '한 장 문의 페이지', small: '작게 시작하는 구성',
};
// title = h1 글자 그대로 + 상호. 전체 40자(네이버 권장)를 넘으면 상호를 뺀다
const titleOf = (h1: string, sub: string) => { const t = `${h1} ${sub}`; return `${t} | ${BRAND}`.length <= 40 ? `${t} | ${BRAND}` : t; };
export const kwWords = (kw: string) => kw.replace(/[?]/g, '').split(/[\s·]+/).filter(Boolean);
// 수식어 낱말이 키워드 낱말을 품으면 반복 (두 글자 이상은 포함, 한 글자는 같을 때만)
export const repeats = (kw: string, sub: string) => {
  const ban = kwWords(kw);
  return sub.split(/[\s·,]+/).some((w) => ban.some((b) => (b.length > 1 ? w.includes(b) : w === b)));
};
function headMeta(kw: string, angle: Angle, c: HM) {
  const { n, s, sd, cust, owner, unit, unitN, svcs, A } = c;
  const ban = kwWords(kw);
  const ok = (w: string) => !ban.some((b) => b.length > 1 && w.includes(b));
  const S = svcs.map((x) => x.name).filter(ok);
  const R = A.filter(ok);
  const two = S.length >= 2;
  const [S0, S1] = S;
  const [A0, A1, A2] = R;
  const count = svcs.length;
  const sub = (list: (string | false)[]) => {
    const good = list.filter((x): x is string => !!x && !x.includes('undefined') && !repeats(kw, x));
    // title 앞부분으로도 쓰므로 키워드+수식어 40자 이하인 벌만. 벌마다 마지막은 어느 키워드에도 들어가는 짧은 벌이다
    const fit = good.filter((x) => kw.length + 1 + x.length <= 40);
    return pick(fit, s + 'h1s');
  };
  const h1sub = sub(({
    jeon: [two && `${S0}·${S1} 메뉴부터 나누는 구성`, two && `${j(cust, '이', '가')} 찾는 ${S0} 안내를 첫 화면에`, `서비스 ${count}가지를 메뉴로 나누기`, R.length > 1 && `${A0}·${A1} ${unit}까지 담는 구성`, '메뉴부터 나누는 구성'],
    mkt: [two && R.length > 0 && `${A0} ${S0} 검색을 전화·카톡 문의로`, two && `${S0}·${S1} 검색어마다 도착 페이지`, two && `첫 화면에 ${S0} 안내와 연락 버튼`, '검색어를 받아 전화·카톡으로 잇는 법', '전화·카톡 문의로 잇기', two && `${S0} 검색을 문의로 잇기`, two && `${S0} 문의 도착 페이지`],
    taji: [R.length > 2 && `${A0}·${A1}·${A2} ${unit}마다 서는 페이지`, two && R.length > 0 && `${A0} ${S0} 검색어를 ${owner} 도메인으로`, `${unitN} 검색을 받는 페이지 묶음`, `${unit}별 페이지 묶음`, R.length > 1 && `${A0}·${A1} 페이지 묶음`],
    only: [two && R.length > 0 && `지도 밖 ${A0} ${S0} 검색까지 받기`, `${owner} 도메인에 ${unit}별 페이지 더하기`, two && `${S0}·${S1} 검색창 통로를 남기는 법`, '검색창 통로 더하기', two && `지도 밖 ${S0} 검색 받기`, `${unit}별 페이지 더하기`],
    aeo: [two && `${S0} 질문에 답하는 문장과 구조화 데이터`, two && `AI 검색이 읽는 ${S0}·${S1} 안내`, 'llms.txt와 자주 묻는 질문까지 넣는 구성', 'AI 검색이 읽는 구조', two && `${S0} 질문에 답하는 구조`, 'llms.txt까지 넣는 구성'],
    seo: [two && `${S0}·${S1} 서비스마다 다른 페이지`, '사이트맵 등록과 수집 확인까지', R.length > 1 && `${A0}·${A1} ${unit}별 입구 늘리기`, '사이트맵 등록까지', two && `${S0} 안내를 따로 둔 페이지`],
    cheap: [two && `30만원부터 ${S0}·${S1} 기본 구성`, `서비스 ${count}가지 중 필요한 것부터`, '비용이 정해지는 기준과 포함 항목', '비용 기준과 포함 항목'],
    good: [two && `${S0}·${S1} 구성안으로 업체 비교하기`, '도메인 명의와 검색 설정 확인 항목', `${j(cust, '이', '가')} 쓰는 검색어를 아는지 보기`, '업체 확인 항목', two && `${S0} 구성안으로 비교하기`],
    resp: [two && `휴대폰 화면부터 맞추는 ${S0} 안내`, '화면 아래 전화·카톡 버튼 고정', two && `모바일에서 읽히는 ${S0}·${S1} 메뉴`, '휴대폰 화면부터 맞추기'],
    fast: [two && `평균 7일, ${S0} 안내부터 먼저 공개`, '자료 받기부터 공개까지 진행 순서', two && `${S0}·${S1} 페이지를 나눠 여는 순서`, '공개까지 진행 순서'],
    renew: [two && `기존 주소를 지키며 ${S0}·${S1} 다시 나누기`, two && `${S0} 안내를 검색어 기준으로 다시 짜기`, '모바일 화면과 연락 버튼 새로 맞추기', '기존 주소 지키며 다시 짜기'],
    land: [two && `${S0} 하나에 집중한 한 장 문의 화면`, two && `광고를 누른 ${j(cust, '이', '가')} 도착하는 ${S0} 페이지`, R.length > 1 && `${A0}·${A1} ${unit}별로 넓히는 한 장`, '서비스 하나에 집중한 한 장 문의 화면', '한 장 문의 화면'],
    small: [two && `${S0} 안내와 연락 버튼부터 작게`, `${j(owner, '이', '가')} 직접 관리할 일 없는 구성`, two && `일이 늘면 ${S0}·${S1} 더하기`, '연락 버튼부터 작게'],
  } as Record<Angle, (string | false)[]>)[angle]);

  // description: 키워드 → 이 페이지에 있는 내용(서비스 표·검색어 표) → 사실 하나 → 상담
  const x0 = svcs[0].name, x1 = svcs[1].name, a0 = A[0];
  const what = DESC_WHAT[angle];
  const headP = angle === 'only' ? `${kw} ` : `${kw} — `;
  const bodies = [
    [`${x0}·${x1} 안내와 ${a0} 검색어를 담았습니다.`, `${x0} 안내와 ${a0} 검색어를 담았습니다.`],
    [`${j(what, '과', '와')} ${x0}·${x1} 서비스 표를 정리했습니다.`, `${j(what, '과', '와')} ${x0} 서비스 표를 정리했습니다.`],
    [`${x0}·${x1} 서비스 표와 ${a0} 검색어 예시가 있습니다.`, `${x0} 서비스 표와 ${a0} 검색어 예시가 있습니다.`],
  ][hash(s + 'db') % 3];
  const facts = ['30만원부터 시작합니다.', '평균 7일에 만듭니다.', sd ? `${sd.name} ${unitN} 목록도 있습니다.` : '페이지 수 계산기도 있습니다.'];
  const fact = facts[hash(s + 'df') % 3];
  const calls = hash(s + 'dc') % 2 ? ['전화·카톡 상담 1566-3046', '상담 1566-3046'] : ['상담 1566-3046'];
  // 80자를 넘으면 관련 내용을 줄이고, 그래도 넘으면 사실 문장을 뺀다 (글자 중간에서 자르지 않는다)
  const cands: string[] = [];
  for (const parts of [[bodies[0], fact], [bodies[1], fact], [bodies[0]], [bodies[1]]]) for (const call of calls) cands.push(headP + [...parts, call].join(' '));
  const meta = cands.find((d) => d.length >= 50 && d.length <= 80) || cands.find((d) => d.length <= 80) || cands[cands.length - 1];
  return { h1sub, meta };
}

// 목록(허브) 페이지 소개글 — 지역·키워드·열린 업종 수로 채운다
export function hubIntro(sn: string, angle: Angle, list: MakePage[]): string[] {
  const A = angleOf(angle);
  const l = A.label.replace('?', '');
  const sd = sidos.find((x) => x.name === sn);
  const seed = sn + angle;
  const byGroup = new Map<string, number>();
  for (const p of list) byGroup.set(p.ind.group, (byGroup.get(p.ind.group) || 0) + 1);
  const top = [...byGroup.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g, c]) => `${g} ${c}개`).join(', ');
  const ex = list.slice(0, 3).map((p) => p.ind.name);
  const place = sd ? `${sd.full} ${sd.areas.length}개 ${sd.unit}` : '전국';
  return [
    pick([
      `${sn} ${l} 안내는 ${A.desc}를 업종별로 정리한 목록입니다. 지금 ${list.length}개 업종이 열려 있고, ${top} 순으로 많습니다.`,
      `${place}에서 영업하는 업체를 위한 ${l} 안내입니다. ${top} 등 ${list.length}개 업종을 골라 볼 수 있습니다.`,
      `${l}을 ${sn} 업종별로 나눠 안내합니다. 열려 있는 업종은 ${list.length}개이며 ${top} 등이 있습니다.`,
    ], seed + '1'),
    pick([
      `업종을 누르면 ${ex.join(', ')}처럼 그 업종의 서비스별 검색어, ${sd ? sd.unit + '별' : '지역별'} 검색어 표, 홈페이지 구성, 자주 묻는 질문을 볼 수 있습니다.`,
      `각 페이지에는 ${ex[0] || '업종'} 같은 업종의 서비스 안내 구성과 ${sd ? `${sd.name} ${sd.unit}` : '지역'}별 검색어 예시, 페이지 수 계산기가 들어 있습니다.`,
    ], seed + '2'),
    sd
      ? `${sd.full} ${sd.unit}: ${sd.areas.join(', ')}. ${pick([`${sd.name} 업체는 이 가운데 실제로 가는 곳만 골라 지역 페이지를 만듭니다.`, `${sd.name}에서는 ${sd.unit} 이름을 붙인 검색이 많아 ${sd.unit}별 페이지가 검색 입구가 됩니다.`], seed + '3')}`
      : pick([`전국 안내는 지역을 정하지 않은 업종 공통 내용입니다. 시·도를 고르면 그 지역 시·군·구 이름이 들어간 안내를 볼 수 있습니다.`, `영업 지역이 여러 시·도에 걸쳐 있다면 전국 안내를 먼저 보시고, 아래에서 시·도별 안내로 넘어가세요.`], seed + '3'),
    `홈페이지는 30만원부터, 평균 7일에 만듭니다. ${sn} 지역 페이지는 수에 따라 따로 견적을 드리며, 검색 순위는 보장하지 않습니다.`,
  ];
}
