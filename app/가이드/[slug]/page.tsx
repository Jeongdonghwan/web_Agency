import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '../../../components/JsonLd';
import { Sh, Actions, Faq, Crumb, Closing, Table, Side } from '../../../components/ui';
import { breadcrumbJsonLd, faqPageJsonLd, articleJsonLd, itemListJsonLd } from '../../../lib/jsonld';
import { ogMeta, COMPANY } from '../../../lib/site';
import { getGuides, getGuide, guidePath, encPath, ogFor, GUIDE_HUB } from '../../../lib/content';

export const dynamicParams = false;
export const generateStaticParams = () => getGuides().map((g) => ({ slug: g.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return {};
  const path = encPath(guidePath(g.slug));
  return { title: { absolute: g.title }, description: g.description, keywords: g.keywords, alternates: { canonical: path }, ...ogMeta(g.title, g.description, path, ogFor(g.slug)) };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();
  const path = encPath(guidePath(g.slug));
  const related = g.related.map((s) => getGuide(s)).filter(Boolean) as NonNullable<ReturnType<typeof getGuide>>[];
  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '가이드', path: encPath(GUIDE_HUB) }, { name: g.name, path }]),
          faqPageJsonLd(g.faq),
          articleJsonLd({ title: g.title, description: g.description, path, datePublished: g.updatedAt, dateModified: g.updatedAt, image: ogFor(g.slug) }),
          itemListJsonLd(`${g.name} 관련 가이드`, related.map((r) => ({ name: r.name, url: encPath(guidePath(r.slug)), image: ogFor(r.slug) }))),
        ]}
      />
      <div className="page-hd">
        <div className="wrap">
          <Crumb items={[{ name: '홈', href: '/' }, { name: '가이드', href: GUIDE_HUB }, { name: g.name }]} />
          <h1>{g.name}</h1>
          <p className="lead">{g.description}</p>
          <ol className="sum">
            {g.summary.map((x) => <li key={x}>{x}</li>)}
          </ol>
        </div>
      </div>
      <div className="wrap cols">
        <div className="body">
          {g.sections.map((s, k) => (
            <section className="sec" key={s.h}>
              <Sh no={String(k + 1).padStart(2, '0')} title={s.h} />
              {s.p.map((x) => <p key={x}>{x}</p>)}
              {s.table && <Table head={s.table.head} rows={s.table.rows} />}
              {k === 1 && (
                <div className="midcta">
                  <b>지역과 서비스 목록만 보내 주세요</b>
                  <a className="btn-text" href={COMPANY.kakao} target="_blank" rel="noopener noreferrer">카톡으로 구성안 받기</a>
                </div>
              )}
            </section>
          ))}
          <section className="sec">
            <Sh no={String(g.sections.length + 1).padStart(2, '0')} title={`${g.name} 자주 묻는 질문`} />
            <Faq items={g.faq} />
          </section>
          <section className="sec">
            <Sh no={String(g.sections.length + 2).padStart(2, '0')} title="이어서 볼 가이드" />
            <div className="related">
              {related.map((r) => (
                <Link key={r.slug} href={guidePath(r.slug)}>
                  {r.name}
                  <span>{r.summary[0]}</span>
                </Link>
              ))}
            </div>
            <Actions />
          </section>
        </div>
        <Side />
      </div>
      <Closing title="출장 가시는 지역과 하시는 서비스만 알려 주세요" text="표로 정리해 페이지 수와 구성안을 먼저 보내 드립니다." />
    </main>
  );
}
