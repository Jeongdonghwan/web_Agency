import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '../../components/JsonLd';
import { Sh, Crumb, Closing, Side } from '../../components/ui';
import { breadcrumbJsonLd } from '../../lib/jsonld';
import { ogMeta, COMPANY } from '../../lib/site';
import { GUIDE_HUB, INDUSTRY_HUB } from '../../lib/content';

const title = 'JD8 소개 - 홈페이지·웹문서를 만드는 곳 | JD8';
const description = 'JD8은 주식회사 제이디에이치가 운영하는 홈페이지·검색 페이지 제작 서비스입니다. 누가 만들고, 어떤 원칙으로 작업하며, 어떻게 연락하는지 안내합니다.';

export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: '/about/' }, ...ogMeta(title, description, '/about/') };

export default function About() {
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: 'JD8 소개', path: '/about/' }])} />
      <div className="page-hd">
        <div className="wrap">
          <Crumb items={[{ name: '홈', href: '/' }, { name: 'JD8 소개' }]} />
          <h1>JD8 소개</h1>
          <p className="lead">{description}</p>
        </div>
      </div>
      <div className="wrap cols">
        <div className="body">
          <section className="sec">
            <Sh no="01" title="운영 회사" />
            <dl className="info">
              <div><dt>상호</dt><dd>{COMPANY.legalName}</dd></div>
              <div><dt>대표</dt><dd>{COMPANY.ceo}</dd></div>
              <div><dt>사업자등록번호</dt><dd>{COMPANY.bizNumber}</dd></div>
              <div><dt>주소</dt><dd>{COMPANY.address}</dd></div>
              <div><dt>전화</dt><dd><a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a></dd></div>
              <div><dt>카카오톡</dt><dd><a href={COMPANY.kakao} target="_blank" rel="noopener noreferrer">JD8 채널로 문의</a></dd></div>
            </dl>
          </section>
          <section className="sec">
            <Sh no="02" title="하는 일" />
            <p>JD8은 홈페이지 제작(<a href="https://jd8.co.kr/">jd8.co.kr</a>)과 마케팅 대행(<a href="https://ad.jd8.co.kr/">ad.jd8.co.kr</a>)을 함께 운영합니다. 이 사이트는 그 가운데 출장 업종을 위한 웹사이트 배포, 곧 지역 × 서비스 검색 페이지 제작·등록·관리만 따로 안내합니다.</p>
            <p>업종별 구성안은 <Link href={INDUSTRY_HUB}>업종별 웹사이트 배포</Link>에서, 진행 방식과 주의할 점은 <Link href={GUIDE_HUB}>가이드</Link>에서 볼 수 있습니다.</p>
          </section>
          <section className="sec">
            <Sh no="03" title="작업 원칙" />
            <ol className="jobs">
              <li><div><b>순위를 약속하지 않습니다</b><span>검색 순위는 검색엔진이 정합니다. 수집·노출·클릭 숫자를 그대로 보여 드립니다.</span></div></li>
              <li><div><b>가지 않는 지역은 만들지 않습니다</b><span>실제 출장 지역과 실제 서비스만 페이지로 만듭니다.</span></div></li>
              <li><div><b>지어낸 후기와 수치를 쓰지 않습니다</b><span>사장님이 주신 사진과 작업 내용, 확인된 숫자만 씁니다.</span></div></li>
              <li><div><b>사장님 명의로 남깁니다</b><span>도메인과 검색 등록 계정은 사장님 것으로 만들고, 계약이 끝나도 그대로 남습니다.</span></div></li>
            </ol>
          </section>
        </div>
        <Side />
      </div>
      <Closing title="궁금한 점은 카톡이나 전화로 물어보세요" text="업종과 출장 지역을 알려 주시면 그에 맞춰 안내해 드립니다." />
    </main>
  );
}
