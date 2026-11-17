import industriesData from '../data/industries.json';
import { GUIDES, type Guide } from '../data/guides';

// 업종 페이지("○○ 웹사이트 배포") 조합기 — 원본 데이터는 jd8.co.kr data/webdoc/industries.json 의 출장형 업종.
// 문장은 jd8.co.kr 웹문서 페이지와 겹치지 않게 이 사이트 전용으로 쓴다.

export interface ServiceItem { name: string; searches: string[]; note: string }
export interface Industry {
  name: string; group: string; services: ServiceItem[]; searches: string[];
  urgent: boolean; season: string; radius: string; decide: string; pain: string;
}

export const hash = (s: string) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507) >>> 0;
  return (h ^ (h >>> 13)) >>> 0;
};
export const pick = <T,>(arr: T[], seed: string) => arr[hash(seed) % arr.length];

const HANGUL = 0xac00;
const batchim = (ch: string) => (ch.charCodeAt(0) - HANGUL) % 28;
const withBatchim = (ch: string, b: number) => String.fromCharCode(ch.charCodeAt(0) - batchim(ch) + b);
// "~다" 평서 종결 → "~습니다/ㅂ니다"
export function polite(clause: string): string {
  const s = clause.trim().replace(/[.。]$/, '');
  if (!s.endsWith('다')) return s + '.';
  const stem = s.slice(0, -1);
  const last = stem.slice(-1);
  if (!last || last.charCodeAt(0) < HANGUL || last.charCodeAt(0) > 0xd7a3) return s + '.';
  if (stem === '는' || stem.endsWith(' 는')) return stem.slice(0, -1) + '늡니다.'; // 문의가 는다 → 늡니다
  if (stem.endsWith('는')) return stem.slice(0, -1) + '습니다.';
  if (batchim(last) === 4 || batchim(last) === 0) return stem.slice(0, -1) + withBatchim(last, 17) + '니다.';
  return stem + '습니다.';
}
const hasBatchim = (w: string) => {
  const c = w.trim().slice(-1);
  if (/[a-zA-Z0-9]/.test(c)) return /[lmnLMN013678]$/.test(c);
  return c.charCodeAt(0) >= HANGUL && c.charCodeAt(0) <= 0xd7a3 && batchim(c) !== 0;
};
export const j = (w: string, a: string, b: string) => w + (hasBatchim(w) ? a : b);
// 으로/로: 받침이 없거나 ㄹ 받침이면 '로'
export const ro = (w: string) => { const c = w.trim().slice(-1); const code = c.charCodeAt(0); const b = code >= HANGUL && code <= 0xd7a3 ? batchim(c) : hasBatchim(w) ? 1 : 0; return w + (b === 0 || b === 8 ? '로' : '으로'); };
// 따옴표로 감싼 검색어 + 조사
export const q = (w: string, a: string, b: string) => `'${w}'${hasBatchim(w) ? a : b}`;

const REGIONS = ['김포', '일산', '파주', '부천', '인천 서구', '송도', '수원 영통', '동탄', '용인 수지', '분당', '안양', '의정부', '남양주', '구리', '하남',
  '광명', '시흥', '안산', '평택', '천안', '청주', '대전 유성', '창원', '김해', '서울 강서', '마포', '은평', '노원', '해운대', '대구 수성', '세종', '울산 남구'];
function regionsFor(seed: string, n: number) {
  const pool = [...REGIONS];
  const out: string[] = [];
  let s = seed;
  while (out.length < n && pool.length) { s += '#'; out.push(pool.splice(hash(s) % pool.length, 1)[0]); }
  return out;
}

export const INDUSTRY_HUB = '/업종/';
export const GUIDE_HUB = '/가이드/';
export const encPath = (p: string) => p.split('/').map(encodeURIComponent).join('/');
export const industrySlug = (name: string) => `${name}-웹사이트-배포`;
export const industryPath = (name: string) => `/업종/${industrySlug(name)}/`;
export const guidePath = (slug: string) => `/가이드/${slug}/`;
export const ogFor = (slug: string) => `/og/${slug}.jpg`;
export const decodeSlug = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export const getIndustries = () => industriesData as Industry[];
export const getIndustry = (slug: string) => getIndustries().find((i) => industrySlug(i.name) === decodeSlug(slug));
export const getGroups = () => [...new Set(getIndustries().map((i) => i.group))];
export const getGuides = () => GUIDES;
export const getGuide = (slug: string): Guide | undefined => GUIDES.find((g) => g.slug === decodeSlug(slug));
export const industryTitle = (n: string) => `${n} 웹사이트 배포`;

// 업종군마다 "지도만으로 부족한 이유"
const GROUP_WHY: Record<string, string[]> = {
  '하수구·배관': ['배관 문제는 터진 자리에서 바로 검색합니다. 손님은 지도 앱을 열기보다 검색창에 동네 이름과 증상을 함께 칩니다.', '막힘·역류는 사무실이 아니라 손님 집에서 일어나는 일입니다. 사무실 주소 한 곳을 기준으로 잡히는 지도 노출로는 출동 범위 전체를 덮기 어렵습니다.'],
  '누수·방수': ['누수는 원인을 모르는 상태에서 검색이 시작됩니다. 증상을 풀어 쓴 긴 검색어가 많아, 업체 이름만 올라 있는 지도 목록과는 잘 맞지 않습니다.', '방수·누수 공사는 건물 종류와 위치마다 검색어가 갈립니다. 옥상, 욕실, 외벽을 지역 이름과 묶은 검색어마다 답할 페이지가 따로 있어야 합니다.'],
  '청소': ['청소는 이사 날짜나 공사 일정에 맞춰 미리 비교하는 업종입니다. 손님은 여러 지역 검색 결과를 넘겨 가며 견적을 받습니다.', '청소 업체는 사무실 없이 현장으로 바로 나가는 경우가 많습니다. 주소가 기준인 지도보다 서비스 지역을 적은 페이지가 영업 범위를 더 정확히 보여 줍니다.'],
  '이사·운반': ['이사는 출발지와 도착지가 서로 다른 지역입니다. 업체 주소 주변만 보이는 방식으로는 두 지역 손님을 모두 만나기 어렵습니다.', '운반·이사 손님은 견적을 세 곳 넘게 비교합니다. 비교 목록에 들어가려면 손님이 사는 지역 이름으로 검색했을 때 먼저 보여야 합니다.'],
  '크레인·장비': ['장비 임대는 현장 주소가 매번 바뀝니다. 차고지 한 곳의 지도 등록만으로는 작업이 나오는 시·군 전체에서 검색되기 어렵습니다.', '장비를 찾는 현장 담당자는 톤수·작업 높이와 지역을 함께 검색합니다. 이 조합마다 제원과 출동 지역을 적은 페이지가 있으면 통화가 짧아집니다.'],
  '설비·설치': ['설치·수리는 제품명, 증상, 지역이 한 검색어에 같이 들어옵니다. 조합이 많아 메인 페이지 한 장으로는 다 받지 못합니다.', '설비 업체는 방문 작업이 기본입니다. 매장 위치보다 "어디까지 가는가"가 손님에게 중요한 정보라, 지역별 페이지가 그 답이 됩니다.'],
  '방역': ['해충 문제는 발견한 순간 검색합니다. 벌레 이름과 동네 이름을 붙인 검색어가 대부분이라 조합별 페이지가 그대로 맞습니다.', '방역은 가정, 식당, 창고처럼 대상에 따라 방법과 비용이 다릅니다. 대상과 지역을 나눈 페이지가 있어야 손님이 자기 상황을 찾습니다.'],
  '철거·공사': ['철거는 현장을 보고 견적을 내는 업종입니다. 손님은 현장이 있는 지역 이름으로 업체를 찾고, 사무실 위치는 따지지 않습니다.', '철거·원상복구는 계약 만료일이 정해져 있어 지역 안에서 빨리 올 수 있는 업체를 찾습니다. 현장 지역마다 페이지가 있어야 그 검색에 걸립니다.'],
  '수거·매입': ['수거·매입은 손님이 있는 곳으로 가는 일입니다. 갈 수 있는 지역을 페이지로 펼쳐 두어야 그 지역 검색에서 연락이 옵니다.', '매입 손님은 사진을 여러 업체에 보내 값을 비교합니다. 손님 동네 이름으로 검색했을 때 보이는 업체가 비교 대상이 됩니다.'],
};

export function composeIndustry(ind: Industry) {
  const n = ind.name;
  const s = n;
  const svcs = ind.services;
  const R = regionsFor(n, 8);
  const sv = (k: number) => svcs[k % svcs.length];
  const total = R.length * svcs.length;
  const biz = /업체|센터|대행|임대|렌탈$/.test(n) ? n : `${n} 업체`;

  const title = `${n} 웹사이트 배포 - 지역×서비스 검색 페이지 제작 | JD8`;
  const description = pick([
    `${biz}의 출장 지역과 ${svcs.slice(0, 3).map((x) => x.name).join('·')} 같은 서비스를 조합해 검색 페이지를 만들고 네이버·구글에 등록합니다. 페이지는 사장님 도메인에 남습니다.`,
    `${n} 웹사이트 배포는 '${R[0]} ${sv(0).name}'처럼 지역과 서비스를 묶은 검색어마다 페이지를 만들어 사장님 도메인에 올리고 검색엔진에 등록하는 작업입니다.`,
    `'${R[0]} ${sv(0).name}', '${R[1]} ${sv(1).name}' 같은 검색어마다 ${n} 페이지를 만들어 사장님 사이트에 올립니다. 사이트맵 등록과 색인 확인까지 맡습니다.`,
  ], s + 'd');

  const summary = [
    `${n} 서비스 ${svcs.length}가지를 출장 지역과 곱해 검색어별 페이지를 만듭니다`,
    pick([`${n} 페이지는 광고 지면이 아니라 사장님 도메인에 쌓입니다`, `${biz} 도메인에 올리므로 계약이 끝나도 페이지는 남습니다`], s + 's2'),
    pick([`한 번에 다 열지 않고 묶음별로 열며 ${n} 페이지 색인을 확인합니다`, `${n} 사이트맵을 네이버·구글에 등록하고 수집 현황을 리포트로 드립니다`], s + 's3'),
  ];

  const why = [
    `${pick(GROUP_WHY[ind.group] || GROUP_WHY['설비·설치'], s + 'w')} ${polite(ind.pain)}`,
    `${polite(ind.radius)} ${pick([
      `그 범위 안의 지역마다 ${n} 페이지가 있으면 ${q(`${R[2]} ${sv(0).name}`, '을', '를')} 검색한 손님에게도 답할 자리가 생깁니다.`,
      `${R[2]}, ${R[3]}처럼 실제로 가는 지역 이름이 페이지 제목에 들어가야 그 지역 검색에서 ${j(n, '이', '가')} 보입니다.`,
      `출동하는 지역을 페이지로 하나씩 적어 두는 것이 ${n} 웹사이트 배포의 출발점입니다.`,
    ], s + 'w2')}`,
  ];

  // 검색어 표: 서비스 × 지역
  const rows: [string, string, string][] = svcs.slice(0, 6).map((x, k) => [x.name, `${R[k % R.length]} ${x.searches[k % x.searches.length] || x.name}`, polite(x.note)]);

  // 두 형식 예시
  const m = ind.urgent ? ['비용', '당일 가능한 곳', '원인'] : ['비용', '견적 비교', '준비할 것'];
  const formats = {
    blog: {
      p: pick([
        `정보를 찾는 검색어에 답하는 글 형태입니다. ${n}에서는 ${m[0]}, ${m[2]}처럼 손님이 전화하기 전에 궁금해하는 내용을 다룹니다.`,
        `${n} 손님이 업체를 고르기 전에 찾아보는 내용을 글로 정리한 페이지입니다. 작업 과정과 ${m[0]} 기준을 사실대로 적습니다.`,
      ], s + 'fb'),
      ex: [`${R[4]} ${sv(0).name} ${m[0]}`, `${sv(1).name} ${m[2]}`, `${R[5]} ${sv(2).name} ${m[1]}`],
    },
    product: {
      p: pick([
        `업체를 바로 찾는 검색어에 답하는 안내 페이지입니다. ${sv(0).name} 작업 범위, 출장 지역, 전화·카톡 버튼을 한 화면에 둡니다.`,
        `'지역 + ${sv(0).name}'처럼 업체를 찾는 검색어를 받는 페이지입니다. ${n} 서비스 설명과 출동 지역, 문의 버튼이 들어갑니다.`,
      ], s + 'fp'),
      ex: [`${R[6]} ${sv(0).name}`, `${R[7]} ${sv(1).name} 업체`, `${R[0]} ${sv(3).name}`],
    },
  };

  const timing = `${polite(ind.season)} ${polite(ind.decide)} ${ind.urgent
    ? pick([`${n} 문의는 급하게 들어오므로 모든 페이지 아래쪽에 전화 버튼을 고정합니다.`, `급한 손님이 읽다가 바로 걸 수 있게 ${n} 페이지마다 통화 버튼을 화면에 붙여 둡니다.`, `그래서 ${n} 페이지는 첫 화면에 출동 지역과 전화번호를 먼저 보여 줍니다.`], s + 't')
    : pick([`${n} 손님은 비교한 뒤 연락하므로 페이지마다 작업 범위와 견적 기준을 먼저 적습니다.`, `비교하는 손님을 위해 ${n} 페이지에는 작업 사례와 카톡 상담 버튼을 함께 둡니다.`, `그래서 ${n} 페이지는 문의가 몰리는 시기 전에 미리 열어 색인을 받아 둡니다.`], s + 't')}`;

  const steps: [string, string][] = [
    ['지역·서비스 정리', `${n} 출장 지역과 서비스 ${svcs.length}가지를 표로 정리합니다. 가지 않는 지역은 넣지 않습니다.`],
    ['자료 받기', `${sv(0).name}·${sv(1).name} 현장 사진과 작업 설명을 카톡으로 받습니다.`],
    ['페이지 제작', `${n} 페이지를 블로그형과 상품소개형으로 나눠 만들고, 같은 문장 비율을 검사합니다.`],
    ['묶음별 배포·등록', `${R[0]}·${R[1]} 지역부터 묶음별로 올리고 네이버·구글에 사이트맵을 등록합니다.`],
    ['색인 확인·리포트', `${n} 페이지가 얼마나 수집됐는지 확인해 매달 알려 드립니다.`],
  ];

  const faq = [
    { q: `${n} 페이지는 몇 개나 만드나요?`, a: pick([
      `출장 지역 수와 서비스 수를 곱해 정합니다. 예를 들어 지역 ${R.length}곳에 ${n} 서비스 ${svcs.length}가지면 ${total}개가 기본이고, 여기에 비용·시기 같은 정보글을 더합니다.`,
      `실제로 가는 지역과 하는 서비스만 곱합니다. ${R[0]}·${R[1]} 등 ${R.length}곳과 서비스 ${svcs.length}가지라면 ${total}개에서 시작합니다.`,
    ], s + 'q1') },
    { q: `${n} 페이지가 많으면 스팸으로 걸리지 않나요?`, a: pick([
      `지역 이름만 바꾼 복제 페이지는 위험합니다. 그래서 ${sv(0).name}, ${sv(1).name}처럼 서비스마다 내용을 다르게 쓰고, 같은 문장 비율을 검사해 기준을 넘긴 페이지만 엽니다.`,
      `검색엔진은 내용이 같은 페이지를 대량으로 올리는 것을 문제 삼습니다. ${n} 페이지는 서비스별 작업 내용과 지역별 정보를 섞어 쓰고, 한 번에 열지 않고 묶음으로 나눠 엽니다.`,
    ], s + 'q2') },
    { q: `${n} 지도(플레이스) 등록과 같이 해도 되나요?`, a: `같이 하시는 것이 좋습니다. 지도는 사무실 주변 손님을, 웹사이트 배포는 '${R[1]} ${sv(0).name}'처럼 지역 이름을 붙여 검색하는 손님을 받습니다. ${n} 페이지에 플레이스 링크도 넣어 드립니다.` },
    { q: `${n} 문의는 언제부터 들어오나요?`, a: pick([
      `${n} 페이지를 올린 뒤 검색엔진이 수집하는 데 보통 몇 주가 걸립니다. 먼저 연 묶음부터 노출이 쌓이며, 지역 경쟁에 따라 차이가 큽니다. 순위는 보장하지 않습니다.`,
      `${R[0]}처럼 먼저 연 지역부터 수집이 시작됩니다. 보통 몇 주가 걸리고 ${n} 경쟁 상황에 따라 달라집니다. 순위를 약속하지는 않고, 수집 현황을 리포트로 보여 드립니다.`,
    ], s + 'q4') },
  ];

  return {
    title, description, summary, h1: `${n} 웹사이트 배포`,
    whyH2: pick([`${biz}, 지도 등록만으로 부족한 이유`, `${n} 손님은 지역 이름을 붙여 검색합니다`, `${n} 검색, 지도 밖에서 일어나는 일`], s + 'h1'),
    why,
    tableH2: `${n} 서비스별 검색어와 만들 페이지`,
    rows,
    formatH2: `${n} 페이지, 두 가지 형식으로 만듭니다`,
    formats,
    timingH2: pick([`${n} 문의가 몰리는 시기와 손님이 보는 것`, `${n} 손님이 업체를 고르는 기준`], s + 'h3'),
    timing,
    stepH2: `${n} 웹사이트 배포 진행 순서`,
    steps,
    faq,
    calc: { regions: R.length, services: svcs.length },
    ctaH2: pick([`${n} 출장 지역과 서비스 목록만 보내 주세요`, `${biz} 페이지 구성안을 먼저 받아 보세요`], s + 'c'),
    ctaText: `${R[0]}·${R[1]}처럼 가시는 지역과 ${sv(0).name} 등 하시는 서비스를 알려 주시면 ${n} 페이지 수와 견적을 정리해 드립니다.`,
    keywords: [`${n} 웹사이트 배포`, `${n} 웹사이트 상위배포`, `${n} 지역 키워드`, `${n} 랜딩페이지 제작`, `${n} 검색 등록`],
  };
}
