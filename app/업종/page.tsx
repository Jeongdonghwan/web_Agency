import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '../../components/JsonLd';
import { Sh, Crumb, Closing } from '../../components/ui';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';
import { ogMeta } from '../../lib/site';
import { getIndustries, getGroups, industryPath, industryTitle, industrySlug, encPath, ogFor, INDUSTRY_HUB } from '../../lib/content';

const title = '업종별 웹사이트 배포 - 출장 업종 구성안 | JD8';
const description = '하수구·누수·청소·이사·크레인·설비·철거·방역 등 손님에게 찾아가는 업종별로 서비스와 검색어, 만들 페이지 구성을 정리했습니다. 업종을 골라 구성안을 확인하세요.';
const path = encPath(INDUSTRY_HUB);

export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: path }, ...ogMeta(title, description, path) };

export default function IndustryHub() {
  const list = getIndustries();
  const groups = getGroups();
  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '업종별 웹사이트 배포', path }]),
          itemListJsonLd('업종별 웹사이트 배포', list.map((i) => ({ name: industryTitle(i.name), url: encPath(industryPath(i.name)), image: ogFor(industrySlug(i.name)) }))),
        ]}
      />
      <div className="page-hd">
        <div className="wrap">
          <Crumb items={[{ name: '홈', href: '/' }, { name: '업종별' }]} />
          <h1>업종별 웹사이트 배포</h1>
          <p className="lead">출장 업종 {list.length}개의 서비스와 검색어를 미리 정리해 두었습니다. 업종을 고르면 어떤 페이지를 만들지 볼 수 있습니다.</p>
        </div>
      </div>
      <div className="wrap hub">
        {groups.map((g, k) => (
          <section className="sec" key={g}>
            <Sh no={String(k + 1).padStart(2, '0')} title={g} sub={`${list.filter((i) => i.group === g).length}개 업종`} />
            <div className="links">
              {list.filter((i) => i.group === g).map((i) => (
                <Link key={i.name} href={industryPath(i.name)}>{i.name}</Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Closing title="찾는 업종이 없어도 괜찮습니다" text="업종과 출장 지역을 알려 주시면 서비스와 검색어부터 조사해 구성안을 만들어 드립니다." />
    </main>
  );
}
