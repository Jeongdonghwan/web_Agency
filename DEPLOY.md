# JD8 (jd8.co.kr) 배포 가이드

## 구조 요약

- Next.js 14 App Router + `output: 'export'` — 빌드하면 **out/** 폴더에 완성된 정적 HTML이 생성됨
- 서버에는 Node 프로세스가 필요 없음. nginx가 out/ 폴더를 정적 서빙
- 콘텐츠는 저장소 파일로 관리:
  - 업종 페이지: `content/industries/*.md` (draft: true 로 두면 비공개)
  - 블로그 글: `content/posts/*.md`
  - 새 글/업종 추가 = md 파일 추가 → 커밋 → 서버에서 pull + build

## 최초 1회: 서버 준비

```bash
# 1. Node 버전 확인 — 18.17 이상 필요
node -v
# 낮으면 nvm 등으로 업그레이드 후 진행

# 2. nginx 설정 변경 (기존 CRA build → Next out)
sudo nano /etc/nginx/sites-available/webagency   # 실제 설정 파일명에 맞게
```

nginx 설정에서 아래처럼 변경:

```nginx
server {
    ...
    root /var/www/webagency/out;          # build → out 으로 변경
    index index.html;

    error_page 404 /404.html;             # 404 페이지 연결

    location / {
        try_files $uri $uri/ =404;        # ★ 기존 SPA fallback( .../index.html )이 있으면 반드시 제거
    }
}
```

> **중요**: CRA 시절의 `try_files $uri /index.html;` (SPA fallback)이 남아 있으면
> 존재하지 않는 주소가 전부 메인 페이지로 200 응답되어 소프트 404가 됩니다.
> 검색엔진 평가에 치명적이므로 반드시 `=404` 로 바꾸세요.

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 평상시 배포 (콘텐츠 추가/수정 후)

```bash
cd /var/www/webagency
git pull origin main
npm ci          # package.json 변경이 있을 때만 필요, 평소엔 생략 가능
npm run build   # out/ 재생성
```

빌드가 끝나면 즉시 반영됨 (nginx 재시작 불필요).

## 배포 전 로컬 검증 (선택)

```bash
npm run qa:industries   # 업종 콘텐츠 QA 게이트 (필수 필드·분량·유사도·링크)
npm run build           # 전 라우트 ○(Static) 확인
npx serve out           # 로컬에서 결과물 확인
```

## 배포 후 확인

```bash
curl -I https://jd8.co.kr/                       # 200
curl -I https://jd8.co.kr/homepage/cafe/          # 200
curl -I https://jd8.co.kr/없는페이지/              # 404 (200이면 nginx fallback 제거 안 된 것)
curl -s https://jd8.co.kr/sitemap.xml | head      # XML 정상 출력
curl -s https://jd8.co.kr/rss.xml | head          # XML 정상 출력
```

## 검색엔진 등록 (배포 직후 1회 + 콘텐츠 배치 공개 시마다)

### 네이버 서치어드바이저 (https://searchadvisor.naver.com)

1. 소유확인은 메타태그가 이미 심어져 있으므로 자동 유지됨
2. **요청 → 사이트맵 제출**: `https://jd8.co.kr/sitemap.xml`
3. **요청 → RSS 제출**: `https://jd8.co.kr/rss.xml`
4. **요청 → 웹 페이지 수집**: 주요 URL 수동 요청 (일 할당량 내에서)
   - 1순위: `/`, `/homepage/`, `/blog/`
   - 2순위: 카테고리 허브 14개 (`/homepage/category/food/` 등)
   - 3순위: 업종 페이지를 며칠에 나눠 요청
5. **검증 → 웹 페이지 최적화**: 재검사 실행해 경고 없는지 확인
6. **리포트 → 색인 현황**: 주 1회 색인 수 증가 모니터링

### 구글 서치콘솔 (https://search.google.com/search-console)

1. Sitemaps 메뉴에서 `sitemap.xml` 제출(기존 제출분 갱신)
2. URL 검사로 `/homepage/` 색인 요청
3. 색인 생성 범위 리포트에서 "크롤링됨 - 현재 색인되지 않음" 추이 확인

## 업종 페이지 점진 공개 (권장)

한 번에 200개 URL을 새로 노출하면 스팸 신호로 볼 수 있으므로,
`content/industries/*.md` 의 `draft` 플래그로 주당 25~50개씩 나눠 공개하는 것을 권장.

```bash
# 예: draft: true → false 로 바꾸면 다음 빌드부터 페이지·사이트맵에 포함됨
```

공개할 때마다: 빌드·배포 → 네이버 사이트맵 재제출(자동 재수집됨) → 신규 URL 수집 요청.

## 콘텐츠 운영 루틴

- **블로그**: 주 1~2개 발행 권장. `content/posts/슬러그.md` 추가 (frontmatter: title, description, date, tags, industries=관련 업종 slug)
- **업종 글 연결**: 글의 `industries` 에 업종 slug를 넣으면 업종 페이지 하단 "함께 보면 좋은 페이지"에 자동 노출됨 (상호링크)
- 새 업종 추가 시: `data/taxonomy.json` 에 등록 → `content/industries/슬러그.md` 작성 → `npm run qa:industries` 통과 확인
