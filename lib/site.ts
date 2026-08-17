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
  kakaoChannel: 'http://pf.kakao.com/_Izxnxgn',
};

export const DEFAULT_TITLE = '고퀄리티 반응형 홈페이지제작 JD8 에이전시';
export const DEFAULT_DESCRIPTION =
  '고퀄리티 반응형 홈페이지 제작 전문. 랜딩페이지, 기업 홈페이지를 합리적인 가격에 제작해드립니다. 무료 상담 가능.';
export const OG_IMAGE = '/images/og-image.png';

// 절대 URL 생성 (trailingSlash 정책과 일치하도록 사용처에서 슬래시 포함 경로 전달)
export const absUrl = (path: string) => `${SITE_URL}${path}`;
