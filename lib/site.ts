// 사이트 전역 상수. 한 코드에서 상호 두 벌을 빌드한다 — 빌드할 때 NEXT_PUBLIC_SITE 로 고른다 (scripts/build.mjs).
//   jd8     : 본 사이트. 검색 유입용, 하위 페이지 전부.
//   fortune : 포춘마케팅. 카톡으로 보내는 링크의 도착 페이지 한 장. 검색 제외, 하위 페이지 없음.
const KEY: 'jd8' | 'fortune' = process.env.NEXT_PUBLIC_SITE === 'fortune' ? 'fortune' : 'jd8';

const SITES = {
  jd8: {
    key: 'jd8',
    url: 'https://web.jd8.co.kr',
    name: 'JD8 홈페이지·웹문서',
    short: 'JD8',
    logoMark: 'JD8',
    logoText: '홈페이지·웹문서',
    title: '홈페이지 제작·웹문서 대량제작·타지역서비스 | JD8',
    description:
      '업종 전용 홈페이지와 지역×서비스 웹문서 대량제작, 타지역서비스. 네이버·구글 등록까지 직접, 홈페이지 30만원부터.',
    ogImage: '/og/main.jpg',
    landing: false, // 하위 페이지 있음
    index: true, // 검색 등록
    theme: '',
    company: {
      legalName: '주식회사 제이디에이치',
      ceo: '정동환',
      phone: '1566-3046',
      bizNumber: '503-87-03619',
      address: '경기도 용인시 기흥구 금화로 3, 제이20호',
      kakao: 'https://pf.kakao.com/_Izxnxgn',
    },
  },
  fortune: {
    key: 'fortune',
    url: 'https://fortune.jd8.co.kr',
    name: '포춘마케팅',
    short: '포춘마케팅',
    logoMark: '포춘',
    logoText: '마케팅',
    title: '사장님, 내 업체를 전국에 홍보하세요 | 포춘마케팅',
    description: '지역·키워드 검색어마다 업체 페이지를 만들어 네이버·구글에 등록해 드립니다. 클릭당 광고비 0원, 계약이 끝나도 남는 검색 홍보.',
    ogImage: '/og/main-fortune.jpg',
    landing: true, // 메인 한 장만
    index: false, // 검색 제외 (본 사이트와 내용이 같아 중복 문서가 되지 않게)
    theme: 'theme-fortune',
    company: {
      legalName: '포춘마케팅',
      ceo: '',
      phone: '010-8254-1411',
      bizNumber: '',
      address: '',
      kakao: 'https://pf.kakao.com/_LytNX',
    },
  },
} as const;

export const SITE = SITES[KEY];
export const SITE_KEY = KEY;
export const SITE_URL: string = SITE.url;
export const SITE_NAME: string = SITE.name;
export const BRAND: string = SITE.short;
export const LANDING: boolean = SITE.landing;
export const INDEXABLE: boolean = SITE.index;
export const COMPANY: { legalName: string; ceo: string; phone: string; bizNumber: string; address: string; kakao: string } = SITE.company;
export const DEFAULT_TITLE: string = SITE.title;
export const DEFAULT_DESCRIPTION: string = SITE.description;
export const OG_IMAGE: string = SITE.ogImage;

// 제작 페이지 공개 시작일 — 서버에 처음 올리는 날. 이 날 70%가 열리고 나머지 30%는 그 뒤 7일에 걸쳐 열린다 (lib/make.ts).
// 한번 정하면 바꾸지 않는다(열린 페이지가 닫히지 않게). 처음 올릴 때만 `node scripts/build.mjs jd8 --launch 2026-11-20` 으로 덮어쓸 수 있다.
export const LAUNCH: string = process.env.NEXT_PUBLIC_LAUNCH || '2026-11-17';
// 본문 개정일 (scripts/postbuild.py 가 사이트맵 lastmod 에 쓴다)
export const UPDATED = '2026-11-17';
export const DISCLAIMER = `검색 노출과 순위는 검색엔진 정책과 경쟁 상황에 따라 달라지며, ${SITE.short}은 순위를 보장하지 않습니다.`;

// Next.js는 openGraph를 얕게 병합한다 — 페이지 메타는 반드시 이 헬퍼로 만든다
export const ogMeta = (title: string, description: string, url: string, image?: string) => {
  const images = [{ url: image || OG_IMAGE, width: 1200, height: 630, alt: title }];
  return {
    openGraph: { type: 'website' as const, siteName: SITE_NAME, locale: 'ko_KR', title, description, url, images },
    twitter: { card: 'summary_large_image' as const, title, description, images },
  };
};
