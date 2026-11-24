import { BRAND, COMPANY } from './site';

// 키워드형 페이지 공통 머리 규칙 (programmatic-seo composer-patterns §5-1·§5-3)
//   h1 = 키워드 + 수식어(그 페이지 데이터, 키워드 낱말 반복 금지)
//   title = h1 글자 그대로 + " | JD8", 전체 40자 이하 — 넘으면 상호를 뺀다
//   description = 45~80자: 키워드 → 그 페이지에 있는 내용 → 사실 하나 → 상담 연락
// 점검: node scripts/check_kw.cjs

export const hash = (s: string) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619) >>> 0;
  // 하위 비트 편향 방지 (raws_prj에서 FNV 하위 비트로 % 4 가 몰린 버그 있었음)
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507) >>> 0;
  return (h ^ (h >>> 13)) >>> 0;
};

export const TITLE_MAX = 40;
export const kwTitle = (kw: string, sub: string) => {
  const t = sub ? `${kw} ${sub}` : kw;
  return `${t} | ${BRAND}`.length <= TITLE_MAX ? `${t} | ${BRAND}` : t;
};

export const kwWords = (kw: string) => kw.replace(/[?,]/g, '').split(/[\s·×]+/).filter(Boolean);
// 수식어 낱말과 키워드 낱말이 서로를 품으면 반복 (한 글자 낱말은 같을 때만)
export const repeats = (kw: string, sub: string) => {
  const ban = kwWords(kw);
  return kwWords(sub).some((w) => ban.some((b) => (b.length > 1 && w.length > 1 ? w.includes(b) || b.includes(w) : w === b)));
};

type Maybe = string | false | undefined | null;
// 수식어 고르기: 키워드 낱말을 되풀이하지 않고 키워드+수식어가 40자 안에 드는 벌만 남겨 slug 해시로 고정.
//   prefer = 사람이 직접 쓴 문구(조건에 맞으면 그것), list = 그 페이지 데이터가 든 벌(해시로 하나),
//   plain = 데이터 없이도 들어가는 짧은 벌(list 에 맞는 것이 없을 때만 앞에서부터). 그래도 없으면 키워드만.
export function pickSub(kw: string, list: Maybe[], seed: string, prefer?: Maybe, plain: Maybe[] = []): string {
  const ok = (x: Maybe): x is string => !!x && !x.includes('undefined') && !repeats(kw, x) && kw.length + 1 + x.length <= TITLE_MAX;
  if (ok(prefer)) return prefer;
  const good = [...new Set(list.filter(ok))];
  return good.length ? good[hash(seed + 'h1s') % good.length] : plain.find(ok) || '';
}

export const DESC_MIN = 45;
export const DESC_MAX = 80;
const CALLS = [`전화·카톡 상담 ${COMPANY.phone}`, `상담 ${COMPANY.phone}`];
// description: bodies = [긴 문장, 짧은 문장] 벌 여러 개, facts = 사실 문장 여러 개. 해시로 한 벌씩 골라
// 80자를 넘으면 짧은 문장 → 사실 빼기 순으로 줄인다 (글자 중간에서 자르지 않는다).
export function fitDesc(kw: string, seed: string, bodies: [string, string][], facts: string[]): string {
  const body = bodies[hash(seed + 'db') % bodies.length];
  const fact = facts[hash(seed + 'df') % facts.length];
  const calls = hash(seed + 'dc') % 2 ? CALLS : [CALLS[1], CALLS[0]];
  const cands: string[] = [];
  for (const parts of [[body[0], fact], [body[1], fact], [body[0]], [body[1]], []]) for (const call of calls) cands.push(`${kw} — ${[...parts, call].join(' ')}`);
  const fit = (d: string) => d.length >= DESC_MIN && d.length <= DESC_MAX;
  return cands.find(fit) || cands.find((d) => d.length <= DESC_MAX) || cands[cands.length - 1];
}

// md 로 직접 쓴 페이지(업종·지역·제작 서비스·웹문서 핵심): title 프런트매터 "키워드 - 수식어 | JD8" 를 그대로 쓴다.
// 직접 쓴 수식어가 키워드 낱말을 되풀이하거나 40자를 넘으면 그 페이지의 구성 이름(features)·질문 수로 만든 벌에서 고른다.
export function mdHead(
  d: { title: string; features?: { name: string }[]; keywords?: string[]; faq: unknown[] },
  seed: string,
  facts: string[],
) {
  const [lead, ...rest] = d.title.replace(/\s*\|\s*JD8\s*$/, '').split(' - ');
  const kw = lead.trim();
  const F = (d.features || []).map((f) => f.name);
  const G = F.filter((x) => !repeats(kw, x));
  // 웹문서 핵심 페이지는 features 가 없어 관련 검색어(keywords)를 쓴다
  const K = (d.keywords || []).filter((k) => k !== kw);
  const h1sub = pickSub(
    kw,
    [
      G[1] && `${G[0]}·${G[1]}부터 넣는 구성`,
      G[2] && `${G[0]}·${G[1]}·${G[2]} 구성`,
      G[0] && `${G[0]}부터 잡는 구성`,
    ],
    seed,
    rest.join(' - ').trim(),
    [F.length > 0 && `필수 구성 ${F.length}가지와 질문 ${d.faq.length}개`, `진행 방식과 질문 ${d.faq.length}개 정리`],
  );
  const bodies: [string, string][] = F.length
    ? [
        [`${F.slice(0, 3).join('·')} 구성을 정리했습니다.`, `${F.slice(0, 2).join('·')} 구성을 정리했습니다.`],
        [`${F.slice(0, 2).join('·')} 구성과 질문 ${d.faq.length}개를 담았습니다.`, `${F[0]} 구성과 질문 ${d.faq.length}개를 담았습니다.`],
        [`${F[0]}부터 ${F[F.length - 1]}까지 구성 ${F.length}가지를 안내합니다.`, `${F[0]} 등 구성 ${F.length}가지를 안내합니다.`],
      ]
    : [
        [`${K.slice(0, 2).join('·')} 안내와 질문 ${d.faq.length}개를 담았습니다.`, `${K[0]} 안내와 질문 ${d.faq.length}개를 담았습니다.`],
        [`${K.slice(0, 3).join('·')} 내용을 정리했습니다.`, `${K.slice(0, 2).join('·')} 내용을 정리했습니다.`],
      ];
  // 핵심 요약: 그 페이지에 실제 있는 구성·질문 수와 상담 배너의 사실만
  const summary = [
    ...(F.length ? [`${kw}에 넣는 구성 ${F.length}가지: ${F.join(', ')}.`] : []),
    `자주 묻는 질문 ${d.faq.length}개에 답을 달았습니다.`,
    facts.join(' '),
  ];
  return { kw, h1sub, title: kwTitle(kw, h1sub), description: fitDesc(kw, seed, bodies, facts), summary };
}
