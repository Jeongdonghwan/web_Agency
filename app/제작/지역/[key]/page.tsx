import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '../../../../components/JsonLd';
import { Sh, Crumb, Closing } from '../../../../components/ui';
import { breadcrumbJsonLd, itemListJsonLd } from '../../../../lib/jsonld';
import { ogMeta } from '../../../../lib/site';
import { encPath } from '../../../../lib/content';
import { getSidos, openBySidoAngle, makePath, makeListPath, makeTitle, makeOg, hubIntro, ANGLES, MAKE_HUB, type Angle } from '../../../../lib/make';

export const dynamicParams = false;

const AREAS = ['전국', ...getSidos().map((s) => s.name)];
const keyOf = (sn: string, a: Angle) => `${sn}-${ANGLES.find((x) => x.key === a)!.suffix}`;
function parse(key: string) {
  let k = key;
  try { k = decodeURIComponent(key); } catch {}
  for (const sn of AREAS) for (const a of ANGLES) if (k === keyOf(sn, a.key)) return { sn, a };
  return null;
}

export function generateStaticParams() {
  const out: { key: string }[] = [];
  for (const sn of AREAS) for (const a of ANGLES) if (openBySidoAngle(sn, a.key).length) out.push({ key: keyOf(sn, a.key) });
  return out;
}

const meta = (sn: string, label: string, count: number) => {
  const l = label.replace('?', '');
  return {
    title: `${sn} ${l} - 업종별 안내 ${count}개 | JD8`,
    description: `${sn === '전국' ? '전국' : sn + ' 지역'} 업종별 ${l} 안내입니다. 하수구·누수·청소·이사·인테리어·법률 등 업종을 고르면 서비스별 검색어와 홈페이지 구성, 지역 페이지 수를 볼 수 있습니다.`,
  };
};

export function generateMetadata({ params }: { params: { key: string } }): Metadata {
  const r = parse(params.key);
  if (!r) return {};
  const m = meta(r.sn, r.a.label, openBySidoAngle(r.sn, r.a.key).length);
  const path = encPath(makeListPath(r.sn, r.a.key));
  return { title: { absolute: m.title }, description: m.description, alternates: { canonical: path }, ...ogMeta(m.title, m.description, path) };
}

export default function MakeList({ params }: { params: { key: string } }) {
  const r = parse(params.key);
  if (!r) notFound();
  const list = openBySidoAngle(r.sn, r.a.key);
  const groups = [...new Set(list.map((p) => p.ind.group))];
  const m = meta(r.sn, r.a.label, list.length);
  const path = encPath(makeListPath(r.sn, r.a.key));
  const l = r.a.label.replace('?', '');
  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '홈페이지 제작', path: encPath(MAKE_HUB) }, { name: `${r.sn} ${l}`, path }]),
          itemListJsonLd(`${r.sn} ${l}`, list.slice(0, 20).map((p) => ({ name: makeTitle(p), url: encPath(makePath(p.slug)), image: makeOg(p.ind.name) }))),
        ]}
      />
      <div className="page-hd">
        <div className="wrap">
          <Crumb items={[{ name: '홈', href: '/' }, { name: '홈페이지 제작', href: MAKE_HUB }, { name: `${r.sn} ${l}` }]} />
          <h1>{r.sn} {r.a.label}</h1>
          <p className="lead">{m.description}</p>
        </div>
      </div>
      <div className="wrap hub">
        <div className="body" style={{ paddingTop: 40 }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: 14 }}>{r.sn} {l} 안내</h2>
          {hubIntro(r.sn, r.a.key, list).map((x) => <p key={x}>{x}</p>)}
        </div>
        {groups.map((g, k) => (
          <section className="sec" key={g}>
            <Sh no={String(k + 1).padStart(2, '0')} title={`${r.sn} ${g}`} />
            <div className="links">
              {list.filter((p) => p.ind.group === g).map((p) => (
                <a key={p.slug} href={makePath(p.slug)}>{p.ind.name}</a>
              ))}
            </div>
          </section>
        ))}
        <section className="sec">
          <Sh no={String(groups.length + 1).padStart(2, '0')} title={`${l} · 다른 지역`} />
          <div className="links">
            {AREAS.filter((sn) => sn !== r.sn && openBySidoAngle(sn, r.a.key).length).map((sn) => (
              <a key={sn} href={makeListPath(sn, r.a.key)}>{sn}</a>
            ))}
          </div>
        </section>
      </div>
      <Closing title="찾는 업종이 없어도 괜찮습니다" text="업종과 영업 지역을 알려 주시면 서비스와 검색어부터 조사해 구성안을 만들어 드립니다." />
    </main>
  );
}
