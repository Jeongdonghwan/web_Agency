import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '../../../components/JsonLd';
import { Sh, Actions, Faq, Crumb, Closing, Serp, Side } from '../../../components/ui';
import { PageCalc } from '../../../components/Calc';
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd, itemListJsonLd } from '../../../lib/jsonld';
import { shotFor, shotSrc } from '../../../data/shots';
import { ogMeta } from '../../../lib/site';
import { getIndustries, getIndustry, composeIndustry, industrySlug, industryPath, industryTitle, encPath, ogFor, guidePath, INDUSTRY_HUB } from '../../../lib/content';

export const dynamicParams = false;
export const generateStaticParams = () => getIndustries().map((i) => ({ slug: industrySlug(i.name) }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const ind = getIndustry(params.slug);
  if (!ind) return {};
  const c = composeIndustry(ind);
  const path = encPath(industryPath(ind.name));
  return { title: { absolute: c.title }, description: c.description, keywords: c.keywords, alternates: { canonical: path }, ...ogMeta(c.title, c.description, path, ogFor(industrySlug(ind.name))) };
}

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const ind = getIndustry(params.slug);
  if (!ind) notFound();
  const c = composeIndustry(ind);
  const path = encPath(industryPath(ind.name));
  const t = industryTitle(ind.name);
  const same = getIndustries().filter((i) => i.group === ind.group && i.name !== ind.name).slice(0, 10);
  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '업종별 웹사이트 배포', path: encPath(INDUSTRY_HUB) }, { name: t, path }]),
          faqPageJsonLd(c.faq),
          serviceJsonLd({ name: t, description: c.description, path }),
          itemListJsonLd(`${ind.group} 웹사이트 배포`, same.map((i) => ({ name: industryTitle(i.name), url: encPath(industryPath(i.name)), image: ogFor(industrySlug(i.name)) }))),
        ]}
      />
      <div className="page-hd">
        <div className="wrap hd-cols">
          <div>
          <Crumb items={[{ name: '홈', href: '/' }, { name: '업종별', href: INDUSTRY_HUB }, { name: t }]} />
          <h1>{c.h1}</h1>
          <p className="lead">{c.description}</p>
          <ol className="sum">
            {c.summary.map((x) => <li key={x}>{x}</li>)}
          </ol>
          <Actions />
          </div>
          <div className="hd-visual">
            <Serp query={c.rows[0][1]} rows={[c.rows[1][1]]} />
            <figure className="phone"><img src={shotSrc(shotFor(ind.group).file)} width={390} height={1500} loading="lazy" alt={`${shotFor(ind.group).label} 페이지 실제 화면`} /><figcaption>JD8 운영 페이지 화면</figcaption></figure>
          </div>
        </div>
      </div>

      <div className="wrap cols">
        <div className="body">
          <section className="sec">
            <Sh no="01" title={c.whyH2} />
            {c.why.map((x) => <p key={x}>{x}</p>)}
          </section>

          <section className="sec">
            <Sh no="02" title={c.tableH2} />
            <div className="tbl-scroll">
              <table className="tbl">
                <thead><tr><th>서비스</th><th>검색어 예시</th><th>페이지에 담는 내용</th></tr></thead>
                <tbody>
                  {c.rows.map(([a, q, note]) => (
                    <tr key={a}><td>{a}</td><td className="hl">{q}</td><td>{note}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sec">
            <Sh no="03" title={c.formatH2} />
            <div className="formats">
              <div>
                <span className="tag">TYPE A · 블로그형</span>
                <p>{c.formats.blog.p}</p>
                <ul className="q-list">{c.formats.blog.ex.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <span className="tag">TYPE B · 상품소개형</span>
                <p>{c.formats.product.p}</p>
                <ul className="q-list">{c.formats.product.ex.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
            <p className="note"><Link href={guidePath('블로그형-상품소개형-페이지')}>두 형식의 차이 자세히 보기</Link></p>
          </section>

          <section className="sec">
            <Sh no="04" title={c.timingH2} />
            <p>{c.timing}</p>
            <div style={{ marginTop: 24 }}>
              <PageCalc regions={c.calc.regions} services={c.calc.services} name={ind.name} />
            </div>
          </section>

          <section className="sec">
            <Sh no="05" title={c.stepH2} />
            <ol className="jobs">
              {c.steps.map(([h, p]) => (
                <li key={h}><div><b>{h}</b><span>{p}</span></div></li>
              ))}
            </ol>
          </section>

          <section className="sec">
            <Sh no="06" title={`${t} 자주 묻는 질문`} />
            <Faq items={c.faq} />
          </section>

          {same.length > 0 && (
            <section className="sec">
              <Sh no="07" title={`${ind.group} 다른 업종`} />
              <div className="links">
                {same.map((i) => <Link key={i.name} href={industryPath(i.name)}>{i.name}</Link>)}
              </div>
              <p className="note">
                지도에 기대는 방식의 한계는 <Link href={guidePath('지도-노출-대안')}>지도 노출 대안</Link>에, 전체 진행 방식은 <Link href={guidePath('웹사이트-배포')}>웹사이트 배포 안내</Link>에 정리했습니다.
              </p>
            </section>
          )}
        </div>
        <Side />
      </div>
      <Closing title={c.ctaH2} text={c.ctaText} />
    </main>
  );
}
