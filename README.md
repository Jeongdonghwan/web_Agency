# 홈페이지 제작 랜딩페이지

30만원 홈페이지 제작 서비스를 위한 원페이지 랜딩페이지입니다.

## 🎯 컨셉

**후킹 메시지**: "아직도 100만원, 200만원 비싸게 만드세요? 30만원이면 충분합니다"

- 경쟁사 대비 저렴한 가격 강조
- 월 구독 옵션은 상담 시 별도 안내

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18, CSS3 |
| Backend | Flask (Python) |
| Database | SQLite |
| 폰트 | Pretendard |

## 📁 프로젝트 구조

```
landing-page/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx        # 메인 컴포넌트
│   │   ├── App.css        # 스타일시트
│   │   └── index.js       # 엔트리포인트
│   └── package.json
│
├── backend/
│   ├── app.py             # Flask 서버
│   ├── requirements.txt
│   └── inquiries.db       # SQLite DB (자동 생성)
│
├── README.md
└── ARCHITECTURE.md
```

## 🚀 실행 방법

### Backend (Flask)

```bash
cd backend

# 가상환경 생성 (선택)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 서버 실행
python app.py
```

서버가 `http://localhost:5000`에서 실행됩니다.

### Frontend (React)

```bash
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm start
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 📡 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/inquiry` | 문의 접수 |
| GET | `/api/inquiries` | 문의 목록 (관리자) |
| GET | `/api/inquiries/:id` | 문의 상세 |
| PATCH | `/api/inquiries/:id/status` | 상태 변경 |
| DELETE | `/api/inquiries/:id` | 문의 삭제 |
| GET | `/api/stats` | 통계 조회 |

## 🎨 페이지 섹션

1. **Hero** - 후킹 메시지 + 30만원 강조 + CTA
2. **Includes** - 30만원에 포함되는 내역
3. **Compare** - 일반 업체 vs 우리 비교표
4. **Portfolio** - 제작 사례
5. **Process** - 4단계 제작 과정
6. **Contact** - 문의 폼
7. **Footer** - 연락처 정보

## 🔧 커스터마이징

### 연락처 수정

`App.jsx` 파일 하단 Footer 컴포넌트에서 수정:

```jsx
<p>📞 상담 문의: 010-XXXX-XXXX</p>
<p>✉️ 이메일: contact@jd8.co.kr</p>
```

### 색상 변경

`App.css` 상단 `:root`에서 CSS 변수 수정:

```css
:root {
  --primary: #0A1628;      /* 메인 다크 컬러 */
  --accent: #2563EB;       /* 포인트 블루 */
  /* ... */
}
```

### 포트폴리오 추가

`App.jsx`의 `PortfolioSection` 컴포넌트에서 `portfolios` 배열 수정

## 📱 반응형

- **Desktop**: 1200px+
- **Tablet**: 768px ~ 1199px
- **Mobile**: ~ 767px

## 📝 License

Private - JD8
