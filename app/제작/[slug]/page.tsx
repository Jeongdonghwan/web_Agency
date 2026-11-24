import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '../../../components/JsonLd';
import { Sh, Actions, Faq, Crumb, Closing, Serp, Side } from '../../../components/ui';
import { PageCalc } from '../../../components/Calc';
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd, itemListJsonLd } from '../../../lib/jsonld';
import { shotFor, shotSrc } from '../../../data/shots';
import { ogMeta } from '../../../lib/site';
import { encPath } from '../../../lib/content';
import { getOpenMake, getMake, composeMake, makePath, makeListPath, makeTitle, makeOg, parentPath, openByIndAngle, openByIndSido, openBySidoAngle, ANGLES, MAKE_HUB } from '../../../lib/make';

export const dynamicParams = false;
export const generateStaticParams = () => getOpenMake().map((p) => ({ slug: p.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getMake(params.slug);
  if (!p) return {};
  const c = composeMake(p);
  const path = encPath(makePath(p.slug));
  return { title: { absolute: c.title }, description: c.description, keywords: c.keywords, alternates: { canonical: path }, ...ogMeta(c.title, c.description, path, makeOg(p.ind.name)) };
}

export default function MakePageView({ params }: { params: { slug: string } }) {
  const p = getMake(params.slug);
  if (!p) notFound();
  const c = composeMake(p);
  const path = encPath(makePath(p.slug));
  const t = makeTitle(p);
  const sn = p.sd ? p.sd.name : '전국';
  const angle = ANGLES.find((a) => a.key === p.angle)!;
  const otherAngles = openByIndSido(p.ind.name, sn).filter((o) => o.slug !== p.slug);
  const otherSido = openByIndAngle(p.ind.name, p.angle).filter((o) => o.slug !== p.slug);
  const sameGroup = openBySidoAngle(sn, p.angle).filter((o) => o.ind.group === p.ind.group && o.slug !== p.slug).slice(0, 8);
  const parent = parentPath(p.ind.name);
  const listPath = makeListPath(sn, p.angle);
  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '홈페이지 제작', path: encPath(MAKE_HUB) }, { name: `${sn} ${angle.label}`, path: encPath(listPath) }, { name: t, path }]),
          faqPageJsonLd(c.faq),
          serviceJsonLd({ name: t, description: c.description, path, ...(p.sd ? { area: { name: p.sd.full, containedIn: '대한민국' } } : {}) }),
          itemListJsonLd(`${sn} ${p.ind.group} ${angle.label}`, sameGroup.map((o) => ({ name: makeTitle(o), url: encPath(makePath(o.slug)), image: makeOg(o.ind.name) }))),
        ]}
      />
      <div className="page-hd">
        <div className="wrap hd-cols">
          <div>
          <Crumb items={[{ name: '홈', href: '/' }, { name: '홈페이지 제작', href: MAKE_HUB }, { name: `${sn} ${angle.label}`, href: listPath }, { name: p.ind.name }]} />
          <h1><span>{c.h1}</span>{' '}<span className="hero-sub">{c.h1sub}</span></h1>
          <p className="lead">{c.lead}</p>
          <ol className="sum">
            {c.summary.map((x) => <li key={x}>{x}</li>)}
          </ol>
          <Actions />
          </div>
          <div className="hd-visual">
            <Serp query={c.rows[0][1]} rows={[c.rows[1][1]]} />
            <figure className="phone"><img src={shotSrc(shotFor(p.ind.group).file)} width={390} height={1500} loading="lazy" alt={`${shotFor(p.ind.group).label} 페이지 실제 화면`} /><figcaption>JD8 운영 페이지 화면</figcaption></figure>
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
            <Sh no="02" title={c.inclH2} />
            <ol className="jobs">
              {c.incl.map(([h, x]) => (
                <li key={h}><div><b>{h}</b><span>{x}</span></div></li>
              ))}
            </ol>
            <p style={{ marginTop: 20 }}>{c.priceP}</p>
            {c.regulated && <p>{c.regulated}</p>}
          </section>

          <section className="sec">
            <Sh no="03" title={c.svcH2} />
            <div className="tbl-scroll">
              <table className="tbl">
                <thead><tr><th>서비스</th><th>찾는 상황</th><th>받는 검색어</th></tr></thead>
                <tbody>
                  {c.svcRows.map(([a, b, q]) => (
                    <tr key={a}><td>{a}</td><td>{b}</td><td className="hl">{q}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sec">
            <Sh no="04" title={c.tableH2} />
            <div className="tbl-scroll">
              <table className="tbl">
                <thead><tr><th>{c.unit}</th><th>검색어 예시</th><th>만들 페이지</th></tr></thead>
                <tbody>
                  {c.rows.map(([a, q, u]) => (
                    <tr key={a}><td>{a}</td><td className="hl">{q}</td><td>{u}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {c.areasText && <p className="note">{c.areasText}</p>}
            <div style={{ marginTop: 24 }}>
              <PageCalc regions={c.calc.regions} services={c.calc.services} name={`${p.sd ? p.sd.name + ' ' : ''}${p.ind.name}`} />
            </div>
          </section>

          <section className="sec">
            <Sh no="05" title={c.timingH2} />
            <p>{c.timing}</p>
            <p>{c.flow}</p>
          </section>

          <section className="sec">
            <Sh no="06" title={`${t.replace('?', '')} 자주 묻는 질문`} />
            <Faq items={c.faq} />
          </section>

          <section className="sec">
            <Sh no="07" title={`${p.ind.name} 관련 안내`} />
            {otherAngles.length > 0 && (
              <div className="related" style={{ marginBottom: 28 }}>
                {otherAngles.map((o) => (
                  <a key={o.slug} href={makePath(o.slug)}>
                    {makeTitle(o)}
                    <span>{ANGLES.find((a) => a.key === o.angle)!.desc}</span>
                  </a>
                ))}
              </div>
            )}
            {otherSido.length > 0 && (
              <>
                <p className="note">{p.ind.name} {angle.label.replace('?', '')} · 다른 지역</p>
                <div className="links">
                  {otherSido.map((o) => <a key={o.slug} href={makePath(o.slug)}>{o.sd ? o.sd.name : '전국'}</a>)}
                </div>
              </>
            )}
            {sameGroup.length > 0 && (
              <>
                <p className="note" style={{ marginTop: 28 }}>{sn} {p.ind.group} · 다른 업종</p>
                <div className="links">
                  {sameGroup.map((o) => <a key={o.slug} href={makePath(o.slug)}>{o.ind.name}</a>)}
                </div>
              </>
            )}
            <p className="note" style={{ marginTop: 28 }}>
              <a href={listPath}>{sn} {angle.label.replace('?', '')} 전체 업종 보기</a>
              {parent && <> · <a href={parent}>{p.ind.name} 웹사이트 배포 안내</a></>}
            </p>
          </section>
        </div>
        <Side />
      </div>
      <Closing title={c.ctaH2} text={c.ctaText} />
    </main>
  );
}
