import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '../../components/JsonLd';
import { Crumb, Closing } from '../../components/ui';
import { breadcrumbJsonLd, itemListJsonLd } from '../../lib/jsonld';
import { ogMeta } from '../../lib/site';
import { getGuides, guidePath, encPath, ogFor, GUIDE_HUB } from '../../lib/content';

const title = '웹사이트 배포 가이드 - 맡기기 전에 알아 둘 것 | JD8';
const description = '웹사이트 배포가 무엇인지, 지도 노출의 대안이 되는 이유, 페이지 형식, 사이트맵 등록, 색인 관리, 스팸 기준, 광고비 환산까지 맡기기 전에 알아 둘 내용을 정리했습니다.';
const path = encPath(GUIDE_HUB);

export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: path }, ...ogMeta(title, description, path) };

export default function GuideHub() {
  const guides = getGuides();
  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '가이드', path }]),
          itemListJsonLd('웹사이트 배포 가이드', guides.map((g) => ({ name: g.name, url: encPath(guidePath(g.slug)), image: ogFor(g.slug) }))),
        ]}
      />
      <div className="page-hd">
        <div className="wrap">
          <Crumb items={[{ name: '홈', href: '/' }, { name: '가이드' }]} />
          <h1>웹사이트 배포 가이드</h1>
          <p className="lead">{description}</p>
        </div>
      </div>
      <div className="wrap hub">
        <section className="sec">
          <h2 style={{ position: 'absolute', left: -9999 }}>가이드 목록</h2>
          <ol className="jobs">
            {guides.map((g) => (
              <li key={g.slug}>
                <div>
                  <b><Link href={guidePath(g.slug)} style={{ textDecoration: 'none' }}>{g.name}</Link></b>
                  <span>{g.summary[0]}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <Closing title="읽어 보시고 궁금한 점은 카톡으로 물어보세요" text="업종과 지역을 알려 주시면 그에 맞춰 답해 드립니다." />
    </main>
  );
}
