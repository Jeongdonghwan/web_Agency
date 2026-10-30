"""data/webdoc/parts/*.json → data/webdoc/industries.json 병합 — python scripts/webdoc_merge_parts.py

업종군 순서는 GROUP_ORDER (기존 14개 군 원래 순서 → 새 군). 업종명이 겹치면 앞의 것을 남긴다.
기존 업종(병합 전 industries.json)이 하나라도 빠지면 중단한다 — 이미 열린 페이지가 404가 된다.
"""
import collections, glob, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUP_ORDER = ['하수구·배관', '누수·방수', '청소', '이사·운반', '크레인·장비', '커튼·창호·인테리어', '설비·설치', '철거·공사', '방역',
               '대출·금융', '회생·채무', '법률·전문직', '자동차', '기타 출장',
               '세탁·수선', '운송·퀵', '건물·시설관리', '렌탈·설치', '수거·매입', '반려동물', '행사·사진·웨딩', '보안·통신', '조경·농업', '간판·광고물']

target = os.path.join(ROOT, 'data', 'webdoc', 'industries.json')
before = [i['name'] for i in json.load(open(target, encoding='utf-8'))]
by_group = collections.defaultdict(list)
for f in sorted(glob.glob(os.path.join(ROOT, 'data', 'webdoc', 'parts', '*.json'))):
    for it in json.load(open(f, encoding='utf-8')):
        by_group[it['group']].append(it)
unknown = set(by_group) - set(GROUP_ORDER)
if unknown:
    sys.exit(f'모르는 업종군: {unknown}')

out, seen, dropped = [], set(), []
for g in GROUP_ORDER:
    for it in by_group.get(g, []):
        if it['name'] in seen:
            dropped.append(f"{it['name']}({g})")
            continue
        seen.add(it['name'])
        out.append(it)
missing = [n for n in before if n not in seen]
if missing:
    sys.exit(f'기존 업종 누락: {missing}')

json.dump(out, open(target, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
svc = collections.Counter(s['name'] for i in out for s in i['services'] if isinstance(s, dict))
print(f'업종 {len(out)} (기존 {len(before)}), 업종군 {len({i["group"] for i in out})}, 서비스 {sum(svc.values())} (고유 {len(svc)})')
if dropped:
    print('겹쳐서 뺀 업종:', ', '.join(dropped))
