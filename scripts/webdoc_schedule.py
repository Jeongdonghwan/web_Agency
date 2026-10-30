"""웹문서 공개 일정(data/webdoc/schedule.json) 관리 — 확장해도 이미 열린 페이지가 닫히지 않게 순서를 파일로 고정한다.

  python scripts/webdoc_schedule.py                       # 현황: 묶음별 페이지 수·공개 일정, 일정에 없는(대기) 페이지 수
  python scripts/webdoc_schedule.py --new-batch 2026-11-20  # 대기 페이지 전부를 새 묶음으로 추가 (그날부터 2주 일정)
  python scripts/webdoc_schedule.py --init 2026-10-29     # 처음 1회: 현재 전체 페이지를 1번 묶음으로

페이지 목록·순서 규칙은 lib/webdoc.ts 와 같다(핵심 → 업종군 허브 → 업종(업종군 라운드로빈) → 서비스(업종별 k번째 돌아가며)).
lib/webdoc.ts 는 schedule.json 에 있는 slug 만 공개한다 — 데이터에 업종·서비스를 추가해도 --new-batch 전에는 열리지 않는다.
"""
import argparse, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEDULE = os.path.join(ROOT, 'data', 'webdoc', 'schedule.json')
# 2주 일정: 오픈일 25% → 2일 40% → 4일 55% → 6일 70% → 9일 85% → 12일 100%
DAYS = [0, 2, 4, 6, 9, 12]
PLAN = [0.25, 0.4, 0.55, 0.7, 0.85, 1]
GROUP_PRIORITY = ['하수구·배관', '누수·방수', '청소', '이사·운반', '크레인·장비', '커튼·창호·인테리어', '대출·금융', '회생·채무', '법률·전문직']


def all_slugs():
    core_dir = os.path.join(ROOT, 'content', 'webdoc')
    core = []
    for f in os.listdir(core_dir):
        if f.endswith('.md') and not f.startswith('_'):
            head = open(os.path.join(core_dir, f), encoding='utf-8').read().split('---')[1]
            m = re.search(r"^urlSlug:\s*'?(.+?)'?\s*$", head, re.M) or re.search(r"^slug:\s*'?(.+?)'?\s*$", head, re.M)
            name = re.search(r"^name:\s*'?(.+?)'?\s*$", head, re.M).group(1)
            core.append((m.group(1) if m else f[:-3], name))
    main = '웹문서-대량제작'
    # lib: main 먼저, 나머지는 name 의 ko localeCompare — 여기서는 파일 순서와 무관하게 같은 결과가 나오도록 비교 함수 대신 검증으로 맞춘다
    core.sort(key=lambda x: (x[0] != main, x[1]))
    data = json.load(open(os.path.join(ROOT, 'data', 'webdoc', 'industries.json'), encoding='utf-8'))
    for it in data:
        items = [s if isinstance(s, dict) else {'name': s, 'searches': [], 'note': ''} for s in it['services']]
        it['_items'] = [x for x in items if x['name'] != it['name']] + [x for x in items if x['name'] == it['name']]
    groups = {}
    for it in data:
        groups.setdefault(it['group'], []).append(it)
    order = [g for g in GROUP_PRIORITY if g in groups] + [g for g in groups if g not in GROUP_PRIORITY]
    inds, k = [], 0
    while len(inds) < len(data):
        for g in order:
            if k < len(groups[g]):
                inds.append(groups[g][k])
        k += 1
    group_slugs = [f"{g.replace('·', '-')}-업체-웹문서" for g in dict.fromkeys(i['group'] for i in inds)]
    taken = set([c[0] for c in core] + group_slugs + [f"{i['name']}-홍보" for i in inds])
    svcs = []
    for k in range(max(len(i['_items']) for i in inds)):
        for i in inds:
            if k < len(i['_items']):
                s = i['_items'][k]
                slug = f"{s['name']}-홍보"
                if s.get('note') and s['name'] != i['name'] and slug not in taken:
                    taken.add(slug)
                    svcs.append(slug)
    return [c[0] for c in core] + group_slugs + [f"{i['name']}-홍보" for i in inds] + svcs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--init')
    ap.add_argument('--new-batch')
    a = ap.parse_args()
    slugs = all_slugs()
    if a.init:
        if os.path.exists(SCHEDULE):
            sys.exit('schedule.json 이 이미 있다 — 확장은 --new-batch')
        sched = {'batches': [{'launch': a.init, 'days': DAYS, 'plan': PLAN, 'slugs': slugs}]}
        json.dump(sched, open(SCHEDULE, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        print(f'1번 묶음 {len(slugs)}페이지, 오픈 {a.init}')
        return
    sched = json.load(open(SCHEDULE, encoding='utf-8'))
    listed = {s for b in sched['batches'] for s in b['slugs']}
    pending = [s for s in slugs if s not in listed]
    gone = sorted(listed - set(slugs))
    if a.new_batch:
        if not pending:
            sys.exit('대기 페이지가 없다')
        if any(b['launch'] >= a.new_batch for b in sched['batches']):
            sys.exit('새 묶음 오픈일은 기존 묶음보다 뒤여야 한다')
        sched['batches'].append({'launch': a.new_batch, 'days': DAYS, 'plan': PLAN, 'slugs': pending})
        json.dump(sched, open(SCHEDULE, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        print(f'{len(sched["batches"])}번 묶음 {len(pending)}페이지 추가, 오픈 {a.new_batch}')
        return
    from datetime import date, timedelta
    for n, b in enumerate(sched['batches'], 1):
        d0 = date.fromisoformat(b['launch'])
        steps = ', '.join(f"{d0 + timedelta(days=d)} {int(p * 100)}%" for d, p in zip(b['days'], b['plan']))
        print(f'{n}번 묶음 {len(b["slugs"])}페이지 | {steps}')
    print(f'대기(일정에 없음) {len(pending)}페이지' + (' → --new-batch YYYY-MM-DD 로 추가' if pending else ''))
    if gone:
        print(f'⚠ 일정에는 있는데 데이터에서 사라진 페이지 {len(gone)}개 (이미 열렸다면 404): {gone[:10]}')


if __name__ == '__main__':
    main()
