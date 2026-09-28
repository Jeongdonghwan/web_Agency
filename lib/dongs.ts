import seoulData from '../data/seoul-dongs.json';
import ggData from '../data/gg-dongs.json';
import { getAllRegions } from './regions';

// 서울·경기·인천 동 단위 페이지 — 데이터 기반 생성 (md 파일 없이 조합)
// 콘텐츠는 문장 뱅크를 동별 해시로 회전 조합해 같은 구 안에서도 구성이 달라진다.

export interface DongEntry {
  dong: string;          // 송파동
  gu: string;            // 송파구 / 수원시 / 인천
  guShort: string;       // 송파 / 수원 / 인천
  province: string;      // 서울 / 경기 / 인천
  regionLabel: string;   // 서울 송파구 / 경기 수원시 / 인천광역시
  containedIn: string;   // 서울특별시 송파구 / 경기도 수원시 / 인천광역시
  guRegionSlug: string;  // seoul-songpa (기존 시/구 페이지 md slug)
  traits: string;
  industries: string[];
  urlSlug: string;       // 송파동-홈페이지제작 (중복 동명은 구-동-홈페이지제작)
  siblings: { dong: string; urlSlug: string }[];
}

const hashOf = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

let cache: DongEntry[] | null = null;

export function getAllDongs(): DongEntry[] {
  if (cache) return cache;

  const allGus = [
    ...seoulData.gus.map((g: any) => ({ ...g, province: '서울' })),
    ...ggData.gus,
  ];

  // 동명 중복(예: 신사동 강남/은평, 정자동 수원/성남) 파악 — 중복이면 양쪽 모두 구/시 접두
  const counts = new Map<string, number>();
  for (const g of allGus) {
    for (const d of g.dongs) counts.set(d, (counts.get(d) || 0) + 1);
  }

  const entries: DongEntry[] = [];
  for (const g of allGus) {
    const guShort = g.gu.replace(/(시|구|군)$/, '');
    const regionLabel =
      g.province === '서울' ? `서울 ${g.gu}` : g.province === '인천' ? '인천광역시' : `경기 ${g.gu}`;
    const containedIn =
      g.province === '서울' ? `서울특별시 ${g.gu}` : g.province === '인천' ? '인천광역시' : `경기도 ${g.gu}`;
    for (const d of g.dongs) {
      const dup = (counts.get(d) || 0) > 1;
      entries.push({
        dong: d,
        gu: g.gu,
        guShort,
        province: g.province,
        regionLabel,
        containedIn,
        guRegionSlug: g.region,
        traits: g.traits,
        industries: g.industries,
        urlSlug: dup ? `${guShort}-${d}-홈페이지제작` : `${d}-홈페이지제작`,
        siblings: [],
      });
    }
  }

  // 형제(같은 구) 링크 채우기
  const byGu = new Map<string, DongEntry[]>();
  for (const e of entries) {
    if (!byGu.has(e.gu)) byGu.set(e.gu, []);
    byGu.get(e.gu)!.push(e);
  }
  for (const e of entries) {
    e.siblings = byGu
      .get(e.gu)!
      .filter((s) => s.dong !== e.dong)
      .map((s) => ({ dong: s.dong, urlSlug: s.urlSlug }));
  }

  // 기존 지역(md) urlSlug와 충돌 시 빌드 차단
  const regionSlugs = new Set(getAllRegions().map((r) => r.urlSlug));
  const seen = new Set<string>();
  for (const e of entries) {
    if (regionSlugs.has(e.urlSlug)) throw new Error(`동 urlSlug가 지역 페이지와 충돌: ${e.urlSlug}`);
    if (seen.has(e.urlSlug)) throw new Error(`동 urlSlug 중복: ${e.urlSlug}`);
    seen.add(e.urlSlug);
  }

  cache = entries;
  return entries;
}

export const getDongByUrlSlug = (urlSlug: string) => {
  let key = urlSlug;
  try {
    key = decodeURIComponent(urlSlug);
  } catch {}
  return getAllDongs().find((d) => d.urlSlug === key);
};

export const getDongsByRegionSlug = (regionSlug: string) =>
  getAllDongs().filter((d) => d.guRegionSlug === regionSlug);

export const dongPath = (d: { urlSlug: string }) => `/region/${d.urlSlug}/`;
export const dongEncodedPath = (d: { urlSlug: string }) => `/region/${encodeURIComponent(d.urlSlug)}/`;

// ===== 콘텐츠 조합 =====

export interface DongContent {
  title: string;
  description: string;
  paragraphs: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
}

export function buildDongContent(e: DongEntry): DongContent {
  const h = hashOf(e.dong + e.gu);
  const { dong, gu } = e;

  const intros = [
    `${dong}에서 가게나 사무실을 운영하고 계신가요? 손님과 거래처는 방문 전에 "${dong} ○○"을 검색합니다. 그 검색 결과에 내 홈페이지가 있느냐 없느냐가 ${gu} 안에서의 경쟁을 가릅니다. 전단과 현수막은 지나가는 사람에게만 닿지만, 검색은 ${dong}에 올 이유가 있는 사람에게 정확히 닿습니다.`,
    `"${dong} 맛집", "${dong} 학원"처럼 동 이름을 붙인 검색은 이미 마음을 반쯤 정한 손님이 하는 검색입니다. ${dong} 홈페이지제작이 필요한 이유는 단순합니다 — 이 검색에 잡히는 가게가 그 손님을 가져갑니다. 아직 ${dong}의 많은 가게가 이 자리를 비워두고 있습니다.`,
    `${gu} 안에서도 ${dong} 상권에는 ${dong}만의 흐름이 있습니다. 값비싼 포털 광고를 시작하기 전에 먼저 할 일은, ${dong}을 검색하는 사람에게 우리 가게가 보이게 만드는 것입니다. 홈페이지는 그 첫 번째 도구이자 광고비 없이 계속 일하는 자산입니다.`,
    `${dong} 사장님들이 홈페이지를 만드는 이유는 명확합니다. 새 손님의 절반 이상이 검색으로 가게를 고르는 시대에, 검색 결과에 없는 가게는 비교 대상에도 오르지 못하기 때문입니다. JD8은 그 검색의 길목에 ${dong} 사장님의 홈페이지를 세워드립니다.`,
    `홈페이지 없이도 장사는 됩니다. 하지만 ${dong}에서 단골이 아닌 새 손님은 대부분 검색을 거쳐 옵니다. 상호를 검색했을 때 정돈된 공식 홈페이지가 나오는 가게와 오래된 블로그 글이 전부인 가게는 첫인상부터 다릅니다.`,
  ];

  const approaches = [
    `JD8은 ${dong} 홈페이지제작 시 "${dong}+업종" 검색어를 제목과 메타 구조에 반영하고, 완성 후 네이버 서치어드바이저 등록까지 안내합니다. 동 단위 검색은 경쟁 문서가 적어, 기본기를 갖춘 홈페이지가 비교적 빠르게 자리 잡는 영역입니다.`,
    `제작은 전 과정 비대면으로 진행됩니다. ${dong} 매장에 방문하실 필요 없이 카톡으로 자료를 주고받으면 평균 7일 안에 완성되고, 완성 후에는 ${dong} 지역 검색에 잡히도록 검색엔진 등록 절차를 함께 안내해드립니다.`,
    `같은 ${gu} 안에서도 업종이 다르면 담아야 할 내용이 다릅니다. JD8은 207개 업종별 제작 가이드를 바탕으로, ${dong}의 우리 가게에 맞는 페이지 구조와 문의 동선을 처음부터 제안해드립니다.`,
    `JD8의 ${dong} 홈페이지제작은 보여주기용이 아니라 문의를 받기 위한 설계입니다. 첫 화면의 카톡·전화 버튼, 오시는 길, 대표 서비스 소개까지 방문자가 바로 연락하게 되는 순서로 배치합니다.`,
  ];

  const prices = [
    `비용은 30만원부터 시작하며 1:1 맞춤 디자인, 반응형 화면, 기본 SEO 세팅, 문의 폼이 모두 포함됩니다. ${dong}에서 개업을 준비 중이라면 오픈 일정에 맞춰 제작 일정을 역산해드립니다.`,
    `30만원부터 시작하는 기본 구성에 맞춤 디자인과 반응형, 기본 SEO, 문의 동선이 전부 포함됩니다. 숨은 비용 없이, ${dong} 사장님의 예산 안에서 필요한 만큼만 제안드립니다.`,
    `가격은 30만원부터이며 반응형·기본 SEO·문의 폼이 기본입니다. 페이지 수와 기능(예약·갤러리 등)에 따라 견적이 달라지니, ${dong} 매장 상황을 카톡으로 말씀해주시면 정확한 견적을 안내해드립니다.`,
  ];

  const faqBank: { q: string; a: string }[] = [
    { q: `${dong} 홈페이지제작 비용은 얼마인가요?`, a: `기본 구성 30만원부터입니다. 맞춤 디자인과 반응형, 기본 SEO, 문의 폼이 포함되며 기능 추가에 따라 견적이 달라집니다. 카톡으로 업종만 말씀해주시면 바로 안내해드립니다.` },
    { q: `${dong}까지 방문 상담을 오시나요?`, a: `전 과정이 비대면으로 진행되어 방문이 필요 없습니다. 카톡과 전화로 상담부터 시안 확인, 완성까지 평균 7일 안에 마무리됩니다.` },
    { q: `홈페이지를 만들면 "${dong}+업종" 검색에 나오나요?`, a: `제작 시 검색엔진이 읽기 좋은 구조와 지역 키워드를 반영하고, 네이버 서치어드바이저 등록을 안내해드립니다. 동 단위 검색은 경쟁이 적어 비교적 빠르게 노출이 시작되는 편입니다.` },
    { q: `사진이나 소개 자료가 없어도 되나요?`, a: `괜찮습니다. 업종에 맞는 이미지로 우선 제작하고 이후 실제 사진으로 교체해드립니다. 상호와 연락처, 하시는 일만 알려주셔도 시작할 수 있습니다.` },
    { q: `제작 후 수정이나 관리는 어떻게 하나요?`, a: `완성 후 1회 무료 수정이 포함되며, 이후에도 건별로 빠르게 반영해드립니다. 메뉴나 가격처럼 자주 바뀌는 정보는 수정이 쉬운 구조로 설계해드립니다.` },
    { q: `${gu}의 다른 동에서도 제작 가능한가요?`, a: `물론입니다. ${gu} 전 지역은 물론 서울·전국 어디든 같은 방식으로 제작해드립니다. 페이지 하단의 인근 지역 안내에서 해당 동을 선택하실 수 있습니다.` },
  ];

  const faq = [faqBank[h % 6], faqBank[(h + 2) % 6], faqBank[(h + 4) % 6]];

  const descs = [
    `${dong} 홈페이지제작은 JD8. ${gu} ${dong}의 소상공인과 기업을 위한 맞춤 홈페이지를 30만원부터, 평균 7일에 제작합니다. 반응형·기본 SEO·카톡 문의 동선 포함.`,
    `${gu} ${dong} 홈페이지제작 전문 JD8. 동네 검색에 잡히는 구조와 카톡 문의 동선을 갖춘 홈페이지를 30만원부터 비대면으로 제작해드립니다. 평균 7일 완성.`,
    `JD8의 ${dong} 홈페이지제작 — ${gu} 상권에 맞는 구성과 지역 검색 대응 SEO, 문의 동선까지 30만원부터. 자료가 없어도 카톡 상담으로 바로 시작할 수 있습니다.`,
  ];

  return {
    title: `${dong} 홈페이지제작 | ${gu} 지역 전문 - JD8`,
    description: descs[h % 3],
    paragraphs: [
      { heading: `${dong} 홈페이지제작, 왜 필요할까요?`, body: intros[h % 5] },
      {
        heading: `${gu} 상권을 아는 제작`,
        body: `${gu} 지역은 ${e.traits}. ${dong} 역시 이 흐름 안에 있어, 지역 특성과 업종을 함께 고려한 홈페이지 구성이 효과적입니다.`,
      },
      { heading: `JD8이 ${dong}에서 일하는 방식`, body: approaches[h % 4] },
      { heading: `비용과 기간`, body: prices[h % 3] },
    ],
    faq,
  };
}
