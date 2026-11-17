// 실제 배포 페이지 자료. 고객사 이름·도메인·실제 키워드는 그대로 쓰지 않고 ○○ 로 가려 적는다(예: "○○크레인", "경기 ○○시", "○○ 하수구막힘").
// 화면 캡처에도 상호·전화번호·도메인이 보이면 가린 뒤 public/refs/ 에 넣는다. 바깥 링크는 걸지 않는다.
export interface Reference { industry: string; region: string; name: string; img: string }
export const REFERENCES: Reference[] = [
  // { industry: '보관이사', region: '경기 ○○시', name: '○○보관이사', img: '/refs/sample.jpg' },
];

// 실제 고객사 사례 — JD8이 웹문서를 제작한 고객사 2곳(업체명 비공개)의 네이버 서치어드바이저 캡처(2026.11.01 기준, 최근 30일). 숫자는 캡처 그대로.
export const CASES = [
  { id: 'A', img: '/refs/case-a.png', clicks: '300', imp: '2.5만', clickUp: '+126.9%', impUp: '+337.3%' },
  { id: 'B', img: '/refs/case-b.png', clicks: '456', imp: '9.7천', clickUp: '+126.2%', impUp: '+199.9%' },
];
