// 실제 노출 화면 — 사장님이 주는 네이버 검색 결과 캡처. 비어 있으면 메인에 이 영역이 나오지 않는다.
// 캡처는 public/exposure/ 에 넣고 한 줄씩 추가한다. 순위는 바뀌므로 캡처 날짜를 꼭 적는다. 상호·도메인은 공개 허락을 받은 경우만 그대로, 아니면 ○○.
export interface Exposure { query: string; region: string; name: string; rank: string; date: string; img: string }
export const EXPOSURES: Exposure[] = [
  // { query: '하남 단기창고', region: '경기 하남시 초일동', name: '○○물류', rank: '통합검색 1위', date: '2026.11.20', img: '/exposure/hanam.jpg' },
];
