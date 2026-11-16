import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ogMeta } from '../../../../lib/site';
import { getOpenTaji, getSidos, tajiPath, tajiTitle, tajiSidoEncodedPath, webdocOg, TAJI_HUB } from '../../../../lib/webdoc';
import TopPromo from '../../../../components/blog/TopPromo';
import JsonLd from '../../../../components/seo/JsonLd';
import { breadcrumbJsonLd, itemListJsonLd } from '../../../../lib/jsonld';

export const dynamicParams = false;

const key = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export function generateStaticParams() {
  const open = getOpenTaji();
  return getSidos()
    .filter((s) => open.some((p) => p.sido.name === s.name))
    .map((s) => ({ sido: s.name }));
}

export function generateMetadata({ params }: { params: { sido: string } }): Metadata {
  const sd = getSidos().find((s) => s.name === key(params.sido));
  if (!sd) return {};
  const title = `${sd.name} 타지역서비스(타지역 홍보) - ${sd.areas.length}개 ${sd.unit} 업종별 웹문서 | JD8`;
  const desc = `${sd.full} ${sd.areas.length}개 ${sd.unit} 검색에 업체가 보이도록 업종별 타지역서비스(타지역 홍보) 웹문서를 만듭니다. 하수구·누수·커튼·법률사무소 등 업종을 골라 보세요.`;
  const path = tajiSidoEncodedPath(sd.name);
  return { title: { absolute: title }, description: desc, alternates: { canonical: path }, ...ogMeta(title, desc, path) };
}

export default function TajiSidoHub({ params }: { params: { sido: string } }) {
  const sd = getSidos().find((s) => s.name === key(params.sido));
  if (!sd) notFound();
  const list = getOpenTaji().filter((p) => p.sido.name === sd.name);
  const groups = [...new Set(list.map((p) => p.group))];
  const path = tajiSidoEncodedPath(sd.name);
  return (
    <main className="content-page">
      <div className="content-container">
        <JsonLd
          data={[
            breadcrumbJsonLd([
              { name: '홈', path: '/' },
              { name: '타지역서비스', path: TAJI_HUB },
              { name: `${sd.name} 타지역서비스`, path },
            ]),
            itemListJsonLd(`${sd.name} 타지역서비스`, list.slice(0, 20).map((p) => ({ name: tajiTitle(p), url: tajiPath(p.tajiSlug), image: webdocOg(`${p.name}-홍보`) }))),
          ]}
        />
        <nav className="breadcrumb" aria-label="브레드크럼">
          <Link href="/">홈</Link>
          <span className="sep">›</span>
          <Link href={TAJI_HUB}>타지역서비스</Link>
          <span className="sep">›</span>
          <span>{sd.name}</span>
        </nav>
        <header className="page-header">
          <span className="page-eyebrow">{sd.full}</span>
          <h1>{sd.name} 타지역서비스</h1>
          <p className="page-lead">{sd.traits[0]}</p>
          <p className="page-lead">
            {sd.areas.length}개 {sd.unit}마다 검색 페이지를 만들어 신규 고객 문의 통로를 넓힙니다. 업종을 골라 보세요.
          </p>
        </header>
        <TopPromo />
        {groups.map((g) => (
          <section className="content-section" key={g}>
            <h2>
              {sd.name} {g}
            </h2>
            <div className="industry-grid">
              {list
                .filter((p) => p.group === g)
                .map((p) => (
                  <Link key={p.tajiSlug} href={tajiPath(p.tajiSlug)}>
                    {p.name}
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
