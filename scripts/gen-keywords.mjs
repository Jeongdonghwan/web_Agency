// 블로그 키워드 큐 생성기 — node scripts/gen-keywords.mjs
// 업종/지역/조합/실무 4개 풀을 라운드로빈으로 섞어 data/keyword-queue.json 에 적재.
// 루틴(자동 발행)은 data/keyword-cursor.json 의 next 인덱스부터 순서대로 소비한다.
import fs from 'node:fs';

const taxonomy = JSON.parse(fs.readFileSync('data/taxonomy.json', 'utf-8'));
const seoul = JSON.parse(fs.readFileSync('data/seoul-dongs.json', 'utf-8'));
const gg = JSON.parse(fs.readFileSync('data/gg-dongs.json', 'utf-8'));
const city = JSON.parse(fs.readFileSync('data/city-dongs.json', 'utf-8'));
const expansion = JSON.parse(fs.readFileSync('data/expansion-dongs.json', 'utf-8'));

// ---- 소스 데이터 ----
const industries = taxonomy.industries.filter((i) => i.priority <= 2); // 207 (콘텐츠 보유)
const p1 = industries.filter((i) => i.priority === 1);

// 지역: 시/구 단위 50 (md와 동일한 이름) + 모든 동
const regionNames = [];
// 서울 구 / 경기 시 / 지방 도시명 (대표 지역명)
const guList = [...seoul.gus.map((g) => ({ n: g.gu === '중구' ? '서울 중구' : g.gu.replace(/구$/, ''), major: true }))];
for (const g of [...gg.gus, ...city.gus, ...expansion.gus]) {
  guList.push({ n: g.gu.replace(/(시|군)$/, ''), major: true });
}
// 동 단위 전체
const dongList = [];
for (const g of [...seoul.gus, ...gg.gus, ...city.gus, ...expansion.gus]) {
  for (const d of g.dongs) dongList.push({ n: d, gu: g.gu });
}

// ---- 각도 뱅크 ----
const indAngles = [
  '{N} 홈페이지 제작 비용, 얼마가 적당할까',
  '{N} 홈페이지 업체 고르는 5가지 기준',
  '{N} 홈페이지 필수 기능 체크리스트',
  '{N} 예약·문의가 늘어나는 홈페이지 구성법',
  '{N} 홈페이지 디자인, 이것부터 정하세요',
  '{N} 네이버 검색에 노출시키는 방법',
  '{N} 개업 전 홈페이지 준비 순서',
  '{N} 홈페이지 리뉴얼, 언제 해야 할까',
  '{N} 인스타그램과 홈페이지 병행 전략',
  '{N} 네이버 플레이스와 홈페이지 연동하기',
  '{N} 홈페이지용 사진 준비 요령',
  '{N} 홈페이지 소개 문구 작성법',
];
const regAngles = [
  '{R} 홈페이지 제작 비용과 시세',
  '{R} 홈페이지 제작 업체 고르는 법',
  '{R} 가게 온라인 노출 전략',
  '{R} 개업 사장님을 위한 홈페이지 준비 가이드',
  '{R} 검색 상위노출을 위한 홈페이지 기본기',
  '{R} 회사·B2B 홈페이지 제작 가이드',
];
const comboAngles = [
  '{R} {N} 홈페이지 제작 가이드',
  '{R} {N} 홈페이지 제작 비용',
  '{R} {N} 사장님을 위한 온라인 마케팅 기본기',
];
const practicalTopics = [
  '홈페이지 도메인 고르는 법', '호스팅 선택 기준', '홈페이지 계약서에서 꼭 확인할 조항', '홈페이지 소유권 분쟁 피하는 법',
  '홈페이지 유지보수 비용 구조', '무료 홈페이지 빌더의 한계', '템플릿 홈페이지 vs 맞춤 제작', '홈페이지 제작 기간 단축 방법',
  '모바일 홈페이지 점검 체크리스트', '홈페이지 속도가 느릴 때 점검할 것', '구글 서치콘솔 기본 사용법', '네이버 서치어드바이저 리포트 읽는 법',
  '홈페이지 방문자 분석 기초', '카카오톡 채널 운영 기본기', '네이버 플레이스 리뷰 관리법', '홈페이지 문의 폼 vs 카톡 문의',
  '상세페이지와 홈페이지의 차이', '랜딩페이지 전환율 높이는 법', '홈페이지 리뉴얼 시 SEO 유지하는 법', '사업자 홈페이지 필수 표기사항',
  '홈페이지 저작권·이미지 사용 주의점', '다국어 홈페이지가 필요한 경우', '홈페이지 보안(https) 기초', '검색 키워드 정하는 법',
  '블로그와 홈페이지의 역할 분담', '홈페이지 오픈 후 첫 달 운영법', '소상공인 온라인 마케팅 우선순위', '홈페이지 제작 견적 비교 요령',
  '사진 없이 홈페이지 시작하는 법', '홈페이지 글쓰기, 사장님 말투로',
];
const practicalVariations = ['', ' (2026년 기준)', ' — 소상공인 편', ' — 실수 사례로 배우기', ' 총정리', ' 5분 요약', ' Q&A'];

// ---- 풀 생성 ----
const poolIndustry = [];
for (const a of indAngles) for (const i of industries) poolIndustry.push({ k: a.replace('{N}', i.name), a: 'industry', i: i.slug, r: null });
// p1 업종을 각 각도의 앞으로 (중요도 정렬)
poolIndustry.sort((x, y) => {
  const px = p1.some((p) => p.slug === x.i) ? 0 : 1;
  const py = p1.some((p) => p.slug === y.i) ? 0 : 1;
  return px - py;
});

const poolRegion = [];
for (const a of regAngles) {
  for (const g of guList) poolRegion.push({ k: a.replace('{R}', g.n), a: 'region', i: null, r: g.n });
  for (const d of dongList) poolRegion.push({ k: a.replace('{R}', d.n), a: 'region', i: null, r: `${d.gu} ${d.n}` });
}

// 조합: 인기 업종 50 × 대표 지역(시/구 전체 + 주요 동 200)
const comboInd = industries.slice(0, 60).filter((i) => i.name.length <= 9);
const comboRegions = [...guList.map((g) => g.n), ...dongList.slice(0, 220).map((d) => d.n)];
const poolCombo = [];
for (const a of comboAngles) for (const r of comboRegions) for (const i of comboInd) {
  poolCombo.push({ k: a.replace('{R}', r).replace('{N}', i.name), a: 'combo', i: i.slug, r });
}

const poolPractical = [];
for (const v of practicalVariations) for (const t of practicalTopics) poolPractical.push({ k: t + v, a: 'practical', i: null, r: null });

// ---- 라운드로빈 인터리브 (업종:지역:조합:실무 = 2:2:1:1 비율) ----
const queue = [];
const ratio = [[poolIndustry, 2], [poolRegion, 2], [poolCombo, 1], [poolPractical, 1]];
const idx = [0, 0, 0, 0];
let remaining = poolIndustry.length + poolRegion.length + poolCombo.length + poolPractical.length;
while (remaining > 0) {
  for (let p = 0; p < ratio.length; p++) {
    const [pool, take] = ratio[p];
    for (let t = 0; t < take && idx[p] < pool.length; t++) {
      queue.push(pool[idx[p]++]);
      remaining--;
    }
  }
}

// 키워드 중복 제거 (혹시 모를 동일 문자열)
const seen = new Set();
const deduped = queue.filter((q) => (seen.has(q.k) ? false : (seen.add(q.k), true)));

fs.writeFileSync('data/keyword-queue.json', JSON.stringify(deduped));
if (!fs.existsSync('data/keyword-cursor.json')) {
  fs.writeFileSync('data/keyword-cursor.json', JSON.stringify({ next: 0 }, null, 2) + '\n');
}
console.log('풀 크기 — 업종:', poolIndustry.length, '/ 지역:', poolRegion.length, '/ 조합:', poolCombo.length, '/ 실무:', poolPractical.length);
console.log('큐 총', deduped.length, '개 키워드 생성 (data/keyword-queue.json)');
console.log('하루 10개 발행 시', Math.round(deduped.length / 10 / 365 * 10) / 10, '년치');
