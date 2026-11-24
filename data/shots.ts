import { SITE_KEY } from '../lib/site';
// 실제 페이지 화면(public/shots/, scripts/capture.py 로 생성) — JD8 이 같은 방식으로 직접 운영하는 jd8.co.kr 페이지 캡처.
export const SHOTS: { file: string; label: string; group?: string }[] = [
  { file: 'hasugu', label: '경기 하수구 타지역서비스', group: '하수구·배관' },
  { file: 'nusu', label: '서울 누수탐지 타지역서비스', group: '누수·방수' },
  { file: 'cheongso', label: '인천 입주청소 타지역서비스', group: '청소' },
  { file: 'isa', label: '부산 포장이사 타지역서비스', group: '이사·운반' },
  { file: 'crane', label: '경남 크레인 타지역서비스', group: '크레인·장비' },
  { file: 'curtain', label: '대구 커튼 타지역서비스', group: '커튼·창호·인테리어' },
  { file: 'boiler', label: '충남 보일러 타지역서비스', group: '설비·설치' },
  { file: 'cheolgeo', label: '경북 철거 타지역서비스', group: '철거·공사' },
  { file: 'bangyeok', label: '대전 방역 타지역서비스', group: '방역' },
  { file: 'lawyer', label: '서울 변호사 타지역서비스', group: '법률·전문직' },
  { file: 'loan', label: '경기 사업자대출 타지역서비스', group: '대출·금융' },
  { file: 'hoesaeng', label: '광주 개인회생 타지역서비스', group: '회생·채무' },
  { file: 'car', label: '경기 렌트카 타지역서비스', group: '자동차' },
  { file: 'maeip', label: '전북 중고가전매입 타지역서비스', group: '수거·매입' },
  { file: 'blind', label: '경기 블라인드 타지역 홍보' },
  { file: 'sadari', label: '서울 사다리차 타지역 홍보' },
  { file: 'wd-hasugu', label: '하수구 업체 홍보 웹문서' },
  { file: 'wd-bangchung', label: '방충망 업체 홍보 웹문서' },
  { file: 'hub', label: '경기 타지역서비스 업종 목록' },
  { file: 'blog', label: '네이버 SEO 가이드 글' },
];
// 포춘마케팅은 같은 페이지를 상호만 바꿔 찍은 화면을 쓴다 (public/shots-fortune/, scripts/rebrand_server.py)
export const shotSrc = (file: string) => `/${SITE_KEY === 'jd8' ? 'shots' : 'shots-' + SITE_KEY}/${file}.jpg`;
export const shotFor = (group: string) => SHOTS.find((s) => s.group === group) || SHOTS[18];
