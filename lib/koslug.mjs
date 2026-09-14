// 업종명 → 한글 URL 슬러그 ("카페-홈페이지제작")
// lib/industries.ts, scripts/qa-industries.mjs, scripts/gen-redirects.mjs 가 공유하는 단일 구현
export const koSlugOf = (name) =>
  name
    .replace(/[·・,/]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^0-9A-Za-z가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-홈페이지제작';
