"""타지역 홍보(/타지역홍보/<시도>-<업종>/) 공개 일정 — data/webdoc/taji-schedule.json

  python scripts/taji_schedule.py                  # 현황
  python scripts/taji_schedule.py --new-batch 2026-11-16   # 일정에 없는 (시도×업종) 전부를 새 묶음으로 (그날부터 2주)

순서: 업종(업종군 라운드로빈, lib/webdoc.ts 와 같은 우선순위) × 시도 17개 — 첫 묶음부터 모든 시도가 들어간다.
이미 일정에 있는 slug 는 건드리지 않는다(열린 페이지가 닫히지 않게).
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(ROOT, 'data', 'webdoc', 'taji-schedule.json')
DAYS, PLAN = [0, 2, 4, 6, 9, 12], [0.25, 0.4, 0.55, 0.7, 0.85, 1]
PRIORITY = ['하수구·배관', '누수·방수', '청소', '이사·운반', '크레인·장비', '커튼·창호·인테리어', '대출·금융', '회생·채무', '법률·전문직']
BRAND = {'화장품 브랜드', '건강기능식품 브랜드', '식품 브랜드', '생활·펫 브랜드'}

inds = [i for i in json.load(open(os.path.join(ROOT, 'data', 'webdoc', 'industries.json'), encoding='utf-8')) if i['group'] not in BRAND]
groups = {}
for i in inds:
    groups.setdefault(i['group'], []).append(i['name'])
order = [g for g in PRIORITY if g in groups] + [g for g in groups if g not in PRIORITY]
rr, k = [], 0
while len(rr) < len(inds):
    for g in order:
        if k < len(groups[g]):
            rr.append(groups[g][k])
    k += 1
sidos = [s['name'] for s in json.load(open(os.path.join(ROOT, 'data', 'webdoc', 'sido.json'), encoding='utf-8'))]
slugs = [f'{s}-{n}' for n in rr for s in sidos]

d = json.load(open(F, encoding='utf-8')) if os.path.exists(F) else {'batches': []}
have = {s for b in d['batches'] for s in b['slugs']}
pending = [s for s in slugs if s not in have]
if '--new-batch' in sys.argv:
    launch = sys.argv[sys.argv.index('--new-batch') + 1]
    if pending:
        d['batches'].append({'launch': launch, 'days': DAYS, 'plan': PLAN, 'slugs': pending})
        json.dump(d, open(F, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'새 묶음 {launch}: {len(pending)}쪽')
else:
    for b in d['batches']:
        print(b['launch'], len(b['slugs']))
    print('대기', len(pending), '/ 전체', len(slugs))
