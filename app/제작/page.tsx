import type { Metadata } from 'next';
import JsonLd from '../../components/JsonLd';
import { Sh, Crumb, Closing } from '../../components/ui';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';
import { ogMeta } from '../../lib/site';
import { encPath } from '../../lib/content';
import { getSidos, getOpenMake, openBySidoAngle, makeListPath, makePath, makeTitle, makeOg, ANGLES, MAKE_HUB } from '../../lib/make';

const title = '업종별 홈페이지 제작 - 전용·마케팅 전용·타지역서비스 홈페이지 | JD8';
const description = '업종 전용 홈페이지, 마케팅 전용 홈페이지, 타지역서비스 홈페이지를 업종과 시·도별로 안내합니다. 홈페이지는 30만원부터 평균 7일에 만들고, 지역 검색 페이지를 함께 붙일 수 있습니다.';
const path = encPath(MAKE_HUB);

export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: path }, ...ogMeta(title, description, path) };

export default function MakeHub() {
  const areas = ['전국', ...getSidos().map((s) => s.name)];
  const open = getOpenMake();
  const featured = open.filter((p) => !p.sd).slice(0, 20);
  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '홈페이지 제작', path }]),
          itemListJsonLd('업종별 홈페이지 제작', featured.map((p) => ({ name: makeTitle(p), url: encPath(makePath(p.slug)), image: makeOg(p.ind.name) }))),
        ]}
      />
      <div className="page-hd">
        <div className="wrap">
          <Crumb items={[{ name: '홈', href: '/' }, { name: '홈페이지 제작' }]} />
          <h1>업종별 홈페이지 제작</h1>
          <p className="lead">{description}</p>
        </div>
      </div>
      <div className="wrap hub">
        {ANGLES.map((a, k) => (
          <section className="sec" key={a.key}>
            <Sh no={String(k + 1).padStart(2, '0')} title={a.label} sub={a.desc} />
            <div className="links">
              {areas.filter((sn) => openBySidoAngle(sn, a.key).length).map((sn) => (
                <a key={sn} href={makeListPath(sn, a.key)}>{sn}</a>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Closing title="업종과 영업 지역만 알려 주세요" text="홈페이지 구성과 지역 페이지 수, 견적을 정리해 보내 드립니다." />
    </main>
  );
}
