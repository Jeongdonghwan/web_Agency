# JD8 홈페이지 (jd8.co.kr)

홈페이지 제작 에이전시 JD8의 공식 사이트. Next.js 14 정적 export 기반으로 랜딩페이지 + 업종별 SEO 랜딩 200여 개 + 블로그를 서빙합니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router, `output: 'export'`) |
| UI | React 18, 전역 CSS (App.css + content-pages.css) |
| 콘텐츠 | 마크다운 + gray-matter (frontmatter), remark |
| 배포 | `npm run build` → `out/` 정적 파일을 nginx로 서빙 (DEPLOY.md 참고) |
| 문의 폼 | Google Apps Script → 구글 시트 |

## 프로젝트 구조

```
app/                      # Next.js App Router
├── layout.tsx            # 전역 metadata·JSON-LD·Header/Footer
├── page.tsx              # 메인 랜딩
├── homepage/             # 업종별 홈페이지 제작 (/homepage/, /homepage/[slug]/, category/[category]/)
├── blog/                 # 블로그 (/blog/, /blog/[slug]/)
├── sitemap.ts robots.ts  # 빌드 시 sitemap.xml / robots.txt 생성
├── rss.xml/route.ts      # 빌드 시 rss.xml 생성 (네이버 RSS 제출용)
└── not-found.tsx         # 404

components/
├── landing/              # 랜딩 섹션 (12개, 'use client')
├── blog/                 # 글 목록 컴포넌트
└── seo/JsonLd.tsx        # JSON-LD 출력

content/
├── industries/*.md       # 업종 콘텐츠 (frontmatter + 본문) — draft: true = 비공개
└── posts/*.md            # 블로그 글

data/
├── taxonomy.json         # 업종 마스터 목록 (카테고리 × 업종, 허브·QA 기준)
├── portfolios.js         # 레퍼런스 데모 20종 메타
└── landing-faqs.js       # 랜딩 FAQ (FAQPage JSON-LD 공용)

lib/                      # site 상수, jsonld 빌더, md 파서, 콘텐츠 로더
scripts/qa-industries.mjs # 업종 콘텐츠 QA 게이트 (npm run qa:industries)
public/references/        # 업종별 데모 사이트 (정적 HTML, 그대로 서빙)
```

## 개발

```bash
npm install
npm run dev            # http://localhost:3000
npm run qa:industries  # 업종 콘텐츠 검증 (필수 필드·분량·유사도·링크)
npm run build          # out/ 생성
```

## 콘텐츠 추가

- **블로그 글**: `content/posts/슬러그.md` 작성 (frontmatter: title, description, date, tags, industries)
- **업종 페이지**: `data/taxonomy.json`에 업종 등록 → `content/industries/슬러그.md` 작성 → QA 통과 확인
- 커밋 → 서버에서 `git pull && npm run build` 로 반영 (상세: DEPLOY.md)

## License

Private - JD8
