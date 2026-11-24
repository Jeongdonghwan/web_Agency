import Link from 'next/link';
import { COMPANY, DISCLAIMER } from '../lib/site';

// 섹션 머리 — 제목 위 작은 라벨·번호는 쓰지 않는다 (no 는 예전 호출과 맞추려고 받기만 한다)
export const Sh = ({ title, sub }: { no?: string; title: string; sub?: string }) => (
  <header className="sh">
    <h2>{title}</h2>
    {sub && <p>{sub}</p>}
  </header>
);

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Actions = ({ label = '카톡으로 구성안 받기' }: { label?: string }) => (
  <div className="actions">
    <a className="btn" href={COMPANY.kakao} target="_blank" rel="noopener noreferrer">
      <span>{label}</span>
      <Arrow />
    </a>
    {COMPANY.phone ? (
      <a className="btn-text" href={`tel:${COMPANY.phone}`}>
        {COMPANY.phone}
      </a>
    ) : (
      <a className="btn-text" href="/#inquiry">상담 문의 남기기</a>
    )}
  </div>
);

// 검색 결과 예시 그림 — 실제 검색 결과가 아니라 예시임을 그림 안에 적는다
export const Serp = ({ query, rows = [] }: { query: string; rows?: string[] }) => (
  <figure className="serp" aria-label={`${query} 검색 결과 예시`}>
    <div className="serp-top" aria-hidden="true"><i /><i /><i /></div>
    <div className="serp-q">{query}</div>
    <div className="serp-tabs" aria-hidden="true"><span>통합</span><span className="on">웹문서</span><span>지도</span><span>블로그</span></div>
    <div className="serp-hit">
      <span className="serp-badge">이 자리에 사장님 업체가 나옵니다</span>
      <strong>{query} | 사장님 상호</strong>
      <p>{query} 안내, 출장 지역, 작업 사례, 자주 묻는 질문. 전화·카톡으로 바로 연결됩니다.</p>
    </div>
    {rows.map((t) => (
      <div className="serp-row" key={t}>
        <strong>{t}</strong>
        <span />
      </div>
    ))}
    <figcaption>예시 화면입니다. 실제 검색 결과와 순위는 검색엔진이 정합니다.</figcaption>
  </figure>
);

// 하위 페이지 옆 고정 상담 카드
export const Side = ({ title = '지역과 서비스만 알려 주세요' }: { title?: string }) => (
  <aside className="side" aria-label="상담 안내">
    <b>{title}</b>
    <p>페이지 수와 구성안, 견적을 정리해 먼저 보내 드립니다.</p>
    <ul>
      <li><span>홈페이지 제작</span><strong>30만원부터</strong></li>
      <li><span>제작 기간</span><strong>평균 7일</strong></li>
      <li><span>수정</span><strong>완료까지 무한</strong></li>
      <li><span>검색 등록</span><strong>네이버·구글 직접</strong></li>
    </ul>
    <a className="btn" href={COMPANY.kakao} target="_blank" rel="noopener noreferrer">
      <span>카톡으로 문의</span>
      <Arrow />
    </a>
    {COMPANY.phone && <a className="tel" href={`tel:${COMPANY.phone}`}>전화 {COMPANY.phone}</a>}
  </aside>
);

export const Faq = ({ items }: { items: { q: string; a: string }[] }) => (
  <div className="faq">
    {items.map((f) => (
      <details key={f.q}>
        <summary>
          <h3>{f.q}</h3>
          <i aria-hidden="true" />
        </summary>
        <p>{f.a}</p>
      </details>
    ))}
  </div>
);

export const Table = ({ head, rows }: { head: string[]; rows: string[][] }) => (
  <div className="tbl-scroll">
    <table className="tbl">
      <thead>
        <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Crumb = ({ items }: { items: { name: string; href?: string }[] }) => (
  <nav className="crumb" aria-label="브레드크럼">
    {items.map((it, i) => (
      <span key={it.name}>
        {i > 0 && <i>/</i>}
        {it.href ? <a href={it.href}>{it.name}</a> : it.name}
      </span>
    ))}
  </nav>
);

export const Closing = ({ title, text }: { title: string; text: string }) => (
  <section className="closing">
    <div className="wrap">
      <h2>{title}</h2>
      <p>{text}</p>
      <Actions label="카톡으로 바로 문의" />
      <p className="disclaimer">{DISCLAIMER}</p>
    </div>
  </section>
);
