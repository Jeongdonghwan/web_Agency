import Link from 'next/link';
import { UPDATED } from '../../lib/site';
import { getAllServices, servicePath } from '../../lib/services';

// 키워드형 페이지 공통 조각 (composer-patterns §5-1·§5-4)

// h1 = 키워드(큰 글씨) + 수식어(작은 줄). 두 span 사이 공백이 있어야 글자가 붙지 않는다
export function KwH1({ kw, sub }: { kw: string; sub?: string }) {
  return (
    <h1>
      <span>{kw}</span>
      {sub && (
        <>
          {' '}
          <span className="hero-sub">{sub}</span>
        </>
      )}
    </h1>
  );
}

export function KwSummary({ kw, items }: { kw: string; items: string[] }) {
  return (
    <aside className="wd-summary" aria-label="핵심 요약">
      <h2>{kw} 핵심 요약</h2>
      <ul>
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="wd-updated">최종 수정 {UPDATED}</p>
    </aside>
  );
}

// 관련 링크 묶음: 제작 방식별 안내 (/service/ 7쪽)
export function ServiceLinks({ except }: { except?: string }) {
  const list = getAllServices().filter((s) => s.slug !== except);
  if (!list.length) return null;
  return (
    <section className="content-section">
      <h2>제작 방식별 안내</h2>
      <div className="industry-grid">
        {list.map((s) => (
          <Link key={s.slug} href={servicePath(s)}>
            {s.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
