import Link from 'next/link';
import JsonLd from '../components/JsonLd';
import { Sh, Actions, Faq, Closing } from '../components/ui';
import SerpRotate from '../components/SerpRotate';
import { AdCalc, PageCalc } from '../components/Calc';
import { faqPageJsonLd, serviceJsonLd, itemListJsonLd } from '../lib/jsonld';
import { DEFAULT_DESCRIPTION, BRAND, LANDING } from '../lib/site';
import { getIndustries, getGroups, getGuides, industryPath, industryTitle, guidePath, ogFor, industrySlug, INDUSTRY_HUB } from '../lib/content';
import { ANGLES, makeListPath, MAKE_HUB } from '../lib/make';
import { REFERENCES, CASES } from '../data/references';
import { SHOTS, shotSrc } from '../data/shots';
import { IND_SHOTS, JD8_REFERENCES } from '../data/indshots';
import SAMPLES from '../data/samples.json';
import { EXPOSURES } from '../data/exposures';

const FAQS_RAW = [
  { q: '웹사이트 배포는 정확히 무엇을 해 주는 건가요?', a: '출장 지역과 서비스를 조합한 검색어마다 페이지를 만들어 사장님 도메인에 올리고, 네이버 서치어드바이저와 구글 서치콘솔에 직접 등록합니다. 그 뒤 수집 현황을 확인해 알려 드립니다.' },
  { q: '수정은 몇 번까지 가능한가요?', a: '제작 완료까지 무한 수정이 포함되어 있습니다. 마음에 드실 때까지 고쳐 드리고, 오픈 뒤 수정은 건별로 빠르게 반영합니다.' },
  { q: '검색엔진 스팸 정책에 걸리지 않나요?', a: '지역 이름만 바꾼 복제 페이지는 걸러질 수 있습니다. JD8은 서비스별 내용과 지역별 정보를 섞어 쓰고, 열기 전에 페이지끼리 같은 문장 비율을 검사합니다. 그래도 위험이 전혀 없다고 말하지는 않습니다.' },
  { q: '기존 타지역서비스와 어떻게 다른가요?', a: '지도에 올리는 타지역서비스는 지도 플랫폼 안에서 노출되는 방식이라 플랫폼 기준이 바뀌면 영향을 받습니다. 웹사이트 배포는 사장님 도메인에 페이지를 쌓아 웹 검색 결과에 나오게 하는 방식이고, 계약이 끝나도 페이지가 남습니다.' },
  { q: '순위를 보장해 주나요?', a: '보장하지 않습니다. 순위는 검색엔진이 정합니다. 대신 열린 페이지 수, 수집된 페이지 수, 노출·클릭 수를 매달 그대로 보여 드립니다.' },
  { q: '비용은 어떻게 정해지나요?', a: '홈페이지는 30만원부터, 평균 7일에 만듭니다. 지역 검색 페이지는 페이지 수(지역 × 서비스)에 따라 견적을 드립니다. 지역과 서비스 목록을 보내 주시면 정리해 드립니다.' },
];

const FAQS = FAQS_RAW.map((f) => ({ q: f.q, a: f.a.replaceAll('JD8', BRAND) }));

const TILES = ['김포', '일산', '파주', '부천', '인천 서구', '광명', '시흥', '안산', '수원', '용인', '성남', '하남', '구리', '남양주', '의정부', '양주', '화성', '평택', '안양', '군포'];
const NEAR = new Set(['김포', '일산', '부천']); // 사무실(김포) 주변만 지도에 보이는 경우

const TYPES: [string, string, string, string][] = [
  ['출장·방문형', '크레인, 누수, 커튼, 이사, 입주청소', '지역 × 서비스 (+ 공간·목적)', '행정동 세대 수, 공동주택 단지, 지역 주거 형태 같은 공공데이터'],
  ['매장·내방형', '분양샵, 치과·피부과, 학원, 미용실', '지역 × 품목·시술 + 오는 길·주차', '상권과 교통(역까지 거리), 품목 자료. 손님이 오는 상권 안 동네만 만듭니다'],
  ['상품·용도형', '쇼핑몰, 부품·자재', '상품 × 용도·공간·증상, 비교·호환', '상품 제원과 가격표(공식 표기만)'],
  ['전문직·상담형', '법무사, 세무사, 노무사', '사안 × 상황·대상·지역', '법령, 수수료 기준, 절차. AI 답변에 인용되기 좋은 질문·답 구조와 잘 맞습니다'],
  ['B2B·기업 서비스', '소프트웨어, 물류, 인쇄', '업종 × 기능·문제', '업종별 유통 경로와 규제. 자료가 있는 업종만 만듭니다'],
  ['정보·비교형', '가격 비교, 지역 정보', '항목 × 조건', '통계·등록 자료 같은 공공데이터'],
];

// 실제 화면 3열 — 열마다 다른 화면
const COLS = [SAMPLES.slice(0, 4), SAMPLES.slice(4, 8), SAMPLES.slice(8, 12)];

export default function Home() {
  const industries = getIndustries();
  const groups = getGroups();
  const guides = getGuides();
  return (
    <main>
      <JsonLd
        data={[
          serviceJsonLd({ name: '웹사이트 배포', description: DEFAULT_DESCRIPTION, path: '/' }),
          faqPageJsonLd(FAQS),
          itemListJsonLd('업종별 웹사이트 배포', industries.slice(0, 30).map((i) => ({ name: industryTitle(i.name), url: industryPath(i.name), image: ogFor(industrySlug(i.name)) }))),
        ]}
      />

      <section className="hero">
        <div className="wrap hero-in">
          <div>
            <h1>
              <span><i>사장님,</i></span>
              <span><i>내 업체를 <em className="hl">전국에</em></i></span>
              <span><i><em className="hl">홍보하세요!</em></i></span>
            </h1>
            <p className="hero-lead">
              <b>&lsquo;지역 + 서비스&rsquo; 검색어마다 업체 페이지를 만듭니다.</b>
              <b>원하는 키워드마다 업체 페이지를 만듭니다.</b>
              <span>수천 장을 <em>네이버·구글</em>에 직접 등록해 드립니다.</span>
              <span>사무실 없는 지역도 검색 문의 통로가 생깁니다.</span>
            </p>
            <Actions />
            <ul className="hero-pts">
              <li>클릭당 광고비 0원</li>
              <li>계약 끝나도 페이지는 내 것</li>
              <li>홈페이지 30만원부터 · 평균 7일</li>
              <li>완료까지 무한 수정</li>
            </ul>
            <p className="ai-line">
              <span>네이버 AI 브리핑</span><span>구글 AI</span><span>챗GPT</span>
              <em>덤으로, AI 검색도 인용할 수 있는 <b>AEO·GEO 구조</b></em>
            </p>
          </div>
          <figure className="wall">
            <div className="wall-cols">
              {COLS.map((col, c) => (
                <div className="wall-col" key={c}>
                  <div className="wall-track">
                    {[...col, ...col].map((s, k) => (
                      <img key={k} src={s.mobile} width={390} height={1500} alt={k < col.length ? `${s.title} 예시 화면` : ''} aria-hidden={k >= col.length} loading={c === 0 && k < 2 ? 'eager' : 'lazy'} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <figcaption>업종마다 따로 디자인한 예시 페이지 화면입니다. 상호·전화번호는 가렸습니다. <a href="#samples">예시 페이지 보기</a></figcaption>
          </figure>
        </div>
      </section>

      <section className="sec" id="why">
        <div className="wrap">
          <Sh title="출장 업종은 지도 한 곳으로 부족합니다" sub="지도는 등록한 주소가 기준입니다. 일은 옆 시·군에서도 나오는데, 보이는 곳은 사무실 주변뿐입니다." />
          <div className="cover">
            <figure>
              <span className="ba">BEFORE</span>
              <div className="tiles" aria-hidden="true">
                {TILES.map((t) => <span key={t} className={t === '김포' ? 'pin on' : NEAR.has(t) ? 'on' : ''}>{t}</span>)}
              </div>
              <figcaption><b>지도 등록만 했을 때</b>사무실 주변 3곳에서만 보입니다.</figcaption>
            </figure>
            <figure className="good">
              <span className="ba">AFTER</span>
              <div className="tiles" aria-hidden="true">
                {TILES.map((t) => <span key={t} className={t === '김포' ? 'pin on' : 'on'}>{t}</span>)}
              </div>
              <figcaption><b>검색 페이지를 더했을 때</b>출장 가는 20곳 모두에 페이지가 있습니다.</figcaption>
            </figure>
          </div>
          <div className="power">
            <h3>그래서 {BRAND}에 맡기면</h3>
            <ul>
              <li><b>전국 17개 시·도 어디든</b><span>출장 가는 시·군·구마다 그 지역 이름이 들어간 페이지를 만듭니다.</span></li>
              <li><b>클릭당 광고비 0원</b><span>검색 페이지로 들어온 손님에게는 클릭 비용이 나가지 않습니다.</span></li>
              <li><b>노출 +337%</b><span>실제 고객사의 한 달 변화입니다. 서치어드바이저 화면을 아래에 공개합니다.</span></li>
              <li><b>AI 검색까지 (AEO·GEO)</b><span>네이버 AI 브리핑·구글 AI·챗GPT가 읽고 인용할 수 있게 질문·답 구조로 만듭니다.</span></li>
              <li><b>계약이 끝나도 내 것</b><span>페이지는 사장님 도메인에 남습니다. 광고처럼 꺼지지 않습니다.</span></li>
              <li><b>30만원부터 · 평균 7일</b><span>완료까지 무한 수정, 네이버·구글 등록까지 직접 해 드립니다.</span></li>
            </ul>
            <div className="power-cta">
              <p>출장 가는 지역만 알려 주세요. 페이지 수와 견적을 오늘 정리해 드립니다.</p>
              <Actions label="카톡으로 바로 문의" />
            </div>
          </div>
          <p className="note">지도를 그만두라는 뜻이 아닙니다. 사무실 주변은 지도가, 그 밖의 출장 지역은 검색 페이지가 맡습니다. {!LANDING && <><Link href={guidePath('지도-노출-대안')}>지도 노출의 한계와 대안</Link> · <Link href={guidePath('타지역서비스')}>타지역서비스란</Link></>}</p>
        </div>
      </section>

      <section className="sec soft" id="samples">
        <div className="wrap">
          <Sh title="사장님 업종도 이런 페이지로 전국에 깔립니다" sub="실제 제작하는 페이지와 같은 구성으로 만든 업종별 예시입니다. 눌러서 PC·모바일 화면을 직접 보세요. 상호·전화번호는 가렸습니다." />
          <div className="samples">
            {SAMPLES.map((x) => (
              <a className="sample" href={x.href} target="_blank" rel="noopener" key={x.id} data-reveal>
                <div className="sample-img"><img src={x.img} width={800} height={513} loading="lazy" alt={`${x.title} 예시 화면`} /></div>
                <div className="sample-cap"><span>{x.label}</span><b>{x.title}</b><p>{x.hook}</p><small>예시 페이지 보기 ↗</small></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sec dark" id="cases">
        <div className="wrap">
          <Sh title="웹문서를 연 뒤 한 달, 검색 노출이 3~4배로 늘었습니다" sub="웹문서 약 5천 페이지를 만든 고객사 두 곳의 결과입니다. 무엇이 어떻게 달라졌는지 순서대로 보여 드립니다." />
          <div className="effect">
            <SerpRotate />
            <ol className="effect-steps">
              <li>
                <b>검색 결과에 업체 페이지가 생깁니다</b>
                <span>손님이 &lsquo;지역 + 업종&rsquo;으로 검색하면 광고·지도 아래 웹문서 자리에 업체 페이지가 나올 수 있습니다. 하수구·이사·청소부터 변호사·치과·학원까지, 업종마다 검색어와 제목이 그대로 맞는 페이지를 만듭니다.</span>
              </li>
              <li>
                <b>노출 = 검색 결과에 보인 횟수</b>
                <span>고객사 A는 한 달 동안 검색 결과에 2.5만 번 보였습니다. 지난달보다 337.3% 늘어난 숫자입니다. 페이지 수가 늘어난 만큼 보이는 검색어가 늘었기 때문입니다.</span>
              </li>
              <li>
                <b>클릭 = 손님이 눌러 들어온 횟수</b>
                <span>그 가운데 300번이 실제 방문으로 이어졌습니다(지난달 대비 +126.9%). 검색광고였다면 클릭마다 비용이 나갔을 방문입니다.</span>
              </li>
              <li>
                <b>들어온 손님은 전화·카톡으로 문의합니다</b>
                <span>모든 페이지에 전화·카톡 버튼이 붙어 있습니다. 광고를 끄면 멈추는 방문과 달리, 페이지가 있는 동안 계속 들어옵니다.</span>
              </li>
            </ol>
          </div>
          <p className="effect-cap">아래는 두 고객사의 네이버 서치어드바이저 화면입니다. 최근 30일, 2026.11.01 기준. 업체명과 키워드는 가렸습니다.</p>
          <div className="cases">
            {CASES.map((c) => (
              <figure className="case" key={c.id} data-reveal>
                <div className="case-top">
                  <span>고객사 {c.id} · ○○ 업종</span>
                  <div><b>{c.impUp}</b><small>지난달 대비 노출</small></div>
                </div>
                <img src={c.img} width={507} height={472} loading="lazy" alt={`웹문서 고객사 ${c.id} 네이버 서치어드바이저 노출·클릭 현황 — 최근 30일 노출 ${c.imp}, 클릭 ${c.clicks}`} />
                <figcaption>최근 30일 노출 <b>{c.imp}</b> · 클릭 <b>{c.clicks}</b> · 클릭 증가 <b>{c.clickUp}</b></figcaption>
              </figure>
            ))}
          </div>
          <div className="proof">
            <div className="proof-text">
              <h3>이 클릭을 광고로 샀다면 얼마였을까요</h3>
              <p>검색 페이지로 들어온 클릭은 클릭당 광고비 없이 들어온 방문입니다. 하루 클릭 수와 업종의 클릭당 광고비를 넣어 직접 계산해 보세요.</p>
              <p className="note">노출·클릭 결과는 업종·지역·경쟁 상황에 따라 달라지며 보장하지 않습니다. {!LANDING && <Link href={guidePath('광고비-환산')}>환산 방법과 주의할 점</Link>}</p>
            </div>
            <AdCalc />
          </div>
        </div>
      </section>

      {EXPOSURES.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <Sh title="실제 검색 결과 화면" sub="고객사 페이지가 네이버 통합검색에 나온 화면입니다. 순위는 캡처한 날 기준이며 바뀔 수 있습니다." />
            <div className="expo">
              {EXPOSURES.map((x) => (
                <figure key={x.img} data-reveal>
                  <img src={x.img} alt={`네이버 검색어 ${x.query} 검색 결과 화면 — ${x.name}`} loading="lazy" />
                  <figcaption><span>검색어 &ldquo;{x.query}&rdquo; · {x.region}</span><b>{x.name}, {x.rank}</b><small>{x.date} 캡처</small></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {REFERENCES.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <Sh title="고객사에 배포한 페이지" sub="고객사 이름과 키워드는 ○○로 가렸습니다." />
            <div className="rail" id="refs">
              {REFERENCES.map((r) => (
                <figure className="ref" key={r.img}>
                  <div className="ref-img"><img src={r.img} alt={`${r.region} ${r.industry} 배포 페이지 화면`} loading="lazy" /></div>
                  <figcaption className="cap"><b>{r.name}</b><span>{r.region} · {r.industry}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap">
          <Sh title="검색 의도에 따라 두 가지로 만듭니다" sub="알아보는 손님과 업체를 고르는 손님은 서로 다른 페이지를 원합니다." />
          <div className="split">
            <figure className="browser" data-reveal>
              <div className="browser-bar" aria-hidden="true"><i /><i /><i /><span>{LANDING ? '사장님 도메인/blog/…' : 'jd8.co.kr/blog/…'}</span></div>
              <img src={shotSrc('d-blog')} width={960} height={675} loading="lazy" alt="블로그형 페이지 실제 화면 — 질문에 답하는 정보 글" />
            </figure>
            <div>
              <h3>블로그형 — 비용·원인·과정을 묻는 검색어</h3>
              <p>답을 첫 문단에 먼저 쓰고, 작업 과정과 현장 사진, 비용이 달라지는 조건을 이어 적습니다. 글 끝에서 같은 지역 안내 페이지로 넘깁니다.</p>
              <ul className="q-list">
                <li>일산 싱크대 역류 원인</li>
                <li>과천 보관이사 비용</li>
                <li>분당 누수탐지 방법</li>
              </ul>
            </div>
          </div>
          <div className="split rev">
            <figure className="browser" data-reveal>
              <div className="browser-bar" aria-hidden="true"><i /><i /><i /><span>{LANDING ? '사장님 도메인/경기-하수구/' : 'jd8.co.kr/타지역서비스/경기-하수구/'}</span></div>
              <img src={shotSrc('d-product')} width={960} height={675} loading="lazy" alt="상품소개형 페이지 실제 화면 — 지역과 업종 안내, 문의 버튼" />
            </figure>
            <div>
              <h3>상품소개형 — 지역 + 업종으로 업체를 찾는 검색어</h3>
              <p>서비스 범위, 출장 지역, 전화·카톡 버튼이 첫 화면에 보입니다. 급한 업종은 전화 버튼을 화면에 고정합니다.</p>
              <ul className="q-list">
                <li>대전 사다리차</li>
                <li>인천 지게차 출장</li>
                <li>창원 청소업체</li>
              </ul>
            </div>
          </div>
          {!LANDING && <p className="note"><Link href={guidePath('블로그형-상품소개형-페이지')}>두 형식의 차이와 업종별 비율 보기</Link></p>}
        </div>
      </section>

      <section className="sec soft">
        <div className="wrap">
          <Sh title="제작부터 등록, 그 뒤 관리까지" sub="올리고 끝내지 않습니다. 수집된 숫자를 보고 다음 묶음을 엽니다." />
          <ol className="timeline">
            <li><b>지역·서비스 정리</b><span>실제로 가는 지역과 하는 서비스를 표로 만듭니다.</span></li>
            <li><b>자료 받기</b><span>현장 사진과 작업 설명을 카톡으로 받습니다.</span></li>
            <li><b>페이지 제작</b><span>두 형식으로 만들고 같은 문장 비율을 검사합니다.</span></li>
            <li><b>배포·직접 등록</b><span>나눠 올리고 네이버·구글에 직접 등록합니다.</span></li>
            <li><b>색인 확인·리포트</b><span>수집·노출·클릭을 매달 알려 드립니다.</span></li>
          </ol>
          <div className="two">
            <dl className="info">
              <div><dt>홈페이지</dt><dd>30만원부터 · 평균 7일 · 완료까지 무한 수정</dd></div>
              <div><dt>검색 페이지</dt><dd>지역 수 × 서비스 수로 견적</dd></div>
              <div><dt>포함</dt><dd>페이지별 썸네일, 사이트맵, 네이버·구글 직접 등록</dd></div>
              <div><dt>월관리</dt><dd>수집률 확인, 반응 지역 보강, 월간 리포트</dd></div>
              <div><dt>소유</dt><dd>도메인·계정은 사장님 명의, 계약 뒤에도 남습니다</dd></div>
            </dl>
            <PageCalc />
          </div>
          <Actions label="카톡으로 견적 받기" />
        </div>
      </section>

      {!LANDING && (
      <section className="sec">
        <div className="wrap">
          <Sh title="업종·지역별 홈페이지 제작 안내" sub="업종 326개 × 전국·시도 17곳으로 정리했습니다. 찾는 방식을 골라 보세요." />
          <div className="klist">
            {ANGLES.map((a) => (
              <a key={a.key} href={makeListPath('전국', a.key)}>
                <b>{a.label}</b>
                <span>{a.desc}</span>
              </a>
            ))}
          </div>
          <p className="note"><a href={MAKE_HUB}>시·도별로 보기</a></p>
        </div>
      </section>
      )}

      <section className="sec tint">
        <div className="wrap">
          <Sh title="출장 업종이 아니어도 같은 방식으로 만듭니다" sub="만드는 방식은 같고, 페이지를 나누는 기준만 업종에 맞게 바꿉니다." />
        </div>
        <div className="indrail" aria-label="만드는 업종 예시">
          <div className="indrail-track">
            {[...IND_SHOTS, ...IND_SHOTS].map((x, k) => (
              <figure key={k} aria-hidden={k >= IND_SHOTS.length}>
                <img src={`/ind/${x.id}.jpg`} width={640} height={520} loading="lazy" alt={k < IND_SHOTS.length ? `${x.name} 업종 이미지` : ''} />
                <figcaption><b>{x.name}</b><span>{x.type}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="wrap">
          {!LANDING && (
          <div className="refcta">
            <p><b>홈페이지 제작 레퍼런스</b>업종별 데모 사이트를 jd8.co.kr에서 직접 열어 볼 수 있습니다.</p>
            <a className="btn-text" href={JD8_REFERENCES} target="_blank" rel="noopener noreferrer">홈페이지 제작 레퍼런스 확인하기 →</a>
          </div>
          )}
          <div className="types" role="table" aria-label="업종 유형별 페이지 구성">
            <div className="types-head" role="row">
              <span role="columnheader">업종 유형</span><span role="columnheader">예</span><span role="columnheader">페이지를 나누는 기준</span><span role="columnheader">내용의 근거</span>
            </div>
            {TYPES.map(([t, ex, axis, src]) => (
              <div className="types-row" role="row" key={t}>
                <b role="cell">{t}</b>
                <span role="cell">{ex}</span>
                <span role="cell" className="ax">{axis}</span>
                <span role="cell">{src}</span>
              </div>
            ))}
          </div>
          <p className="note">업종마다 내용의 근거가 되는 자료가 있어야 만듭니다. 없는 숫자와 사례는 만들지 않고, 열기 전에 페이지끼리 같은 문장 비율을 검사한 뒤 나눠서 엽니다.</p>
        </div>
      </section>

      {!LANDING && (
      <section className="sec soft">
        <div className="wrap">
          <Sh title="출장 업종별 웹사이트 배포 구성안" sub={`출장 업종 ${industries.length}개의 서비스와 검색어를 미리 정리해 두었습니다.`} />
          {groups.map((g) => (
            <div className="grp" key={g}>
              <h3>{g}</h3>
              <div className="links">
                {industries.filter((i) => i.group === g).slice(0, 12).map((i) => (
                  <Link key={i.name} href={industryPath(i.name)}>{i.name}</Link>
                ))}
              </div>
            </div>
          ))}
          <p className="note"><Link href={INDUSTRY_HUB}>업종 전체 보기</Link></p>
        </div>
      </section>
      )}

      {!LANDING && (
      <section className="sec">
        <div className="wrap">
          <Sh title="맡기기 전에 알아 두면 좋은 내용" />
          <div className="klist">
            {guides.map((g) => (
              <Link key={g.slug} href={guidePath(g.slug)}>
                <b>{g.name}</b>
                <span>{g.summary[0]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="sec soft" id="faq">
        <div className="wrap">
          <Sh title="자주 묻는 질문" />
          <Faq items={FAQS} />
        </div>
      </section>

      <Closing title="출장 가시는 지역과 하시는 서비스만 알려 주세요" text="표로 정리해 페이지 수와 구성안을 먼저 보내 드립니다. 보시고 결정하시면 됩니다." />
    </main>
  );
}
