// 사이트 전역 상수 — 도메인/브랜드 정보의 단일 출처
export const SITE_URL = 'https://jd8.co.kr';
export const SITE_NAME = '홈페이지제작 JD8 에이전시';
export const BRAND = 'JD8';
export const COMPANY = {
  legalName: '주식회사 제이디에이치',
  ceo: '정동환',
  phone: '1566-3046',
  bizNumber: '503-87-03619',
  address: '경기도 용인시 기흥구 금화로 3, 제이20호',
  kakaoChannel: 'https://pf.kakao.com/_Izxnxgn',
};

export const DEFAULT_TITLE = '고퀄리티 반응형 홈페이지제작 JD8 에이전시';
export const DEFAULT_DESCRIPTION =
  '고퀄리티 반응형 홈페이지 제작 전문. 랜딩페이지, 기업 홈페이지를 합리적인 가격에 제작해드립니다. 무료 상담 가능.';
export const OG_IMAGE = '/images/og-image.png';

// 절대 URL 생성 (trailingSlash 정책과 일치하도록 사용처에서 슬래시 포함 경로 전달)
export const absUrl = (path: string) => `${SITE_URL}${path}`;

// Next.js는 openGraph/twitter를 얕게 병합한다 — 페이지가 openGraph를 지정하면 layout의 images가
// 통째로 사라진다. 페이지 메타는 반드시 이 헬퍼로 만들 것.
export const ogMeta = (title: string, description: string, url: string, extra: Record<string, unknown> = {}) => ({
  openGraph: { type: 'website' as const, siteName: SITE_NAME, locale: 'ko_KR', title, description, url, images: [OG_IMAGE], ...extra },
  twitter: { card: 'summary_large_image' as const, title, description, images: [OG_IMAGE] },
});
