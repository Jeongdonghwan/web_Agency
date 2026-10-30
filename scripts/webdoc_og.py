"""웹문서 섹션 페이지별 og 썸네일 생성 — python scripts/webdoc_og.py [--force]

핵심(content/webdoc/*.md) + 업종군 허브 + 업종 + 서비스 페이지 전부를 public/og/webdoc/<slug>.jpg 로.
slug 규칙은 lib/webdoc.ts 와 같아야 한다 (업종 `<이름>-홍보`, 서비스 `<서비스>-홍보`, 업종군 `<군(·→-)>-업체-웹문서`).
그리기는 seo-foundation 스킬의 make_og.py (가운데 630×630 안전영역, 굵은 키워드 + 상호·전화).
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAKE_OG = os.path.expanduser('~/.claude/skills/seo-foundation/scripts/make_og.py')
SUB = '이 자리에 사장님 업체가 나옵니다'


def label(name, group):
    if group == '법률·전문직':
        return f'{name} 홍보'
    if group == '회생·채무':
        return f'{name} 사무소 홍보'
    return f'{name} 업체 홍보'


items, taken = [], set()


def add(slug, title):
    if slug in taken:
        return
    taken.add(slug)
    items.append({'slug': slug, 'title': title, 'sub': SUB})


core_dir = os.path.join(ROOT, 'content', 'webdoc')
for f in sorted(os.listdir(core_dir)):
    if f.endswith('.md') and not f.startswith('_'):
        head = open(os.path.join(core_dir, f), encoding='utf-8').read().split('---')[1]
        add(f[:-3], re.search(r"^name:\s*'?(.+?)'?\s*$", head, re.M).group(1))

inds = json.load(open(os.path.join(ROOT, 'data', 'webdoc', 'industries.json'), encoding='utf-8'))
for g in dict.fromkeys(i['group'] for i in inds):
    add(f"{g.replace('·', '-')}-업체-웹문서", f'{g} 업체 웹문서')
for i in inds:
    add(f"{i['name']}-홍보", label(i['name'], i['group']))
for i in inds:
    for s in i['services']:
        if isinstance(s, dict) and s.get('note') and s['name'] != i['name']:
            add(f"{s['name']}-홍보", label(s['name'], i['group']))

tmp = os.path.join(ROOT, 'data', 'webdoc', '_og_items.json')
json.dump(items, open(tmp, 'w', encoding='utf-8'), ensure_ascii=False)
cmd = [sys.executable, '-I', MAKE_OG, '--items', tmp, '--out', os.path.join(ROOT, 'public', 'og', 'webdoc'),
       '--bg', '#0f1b2d', '--accent', '#3b82f6', '--brand', 'JD8 · 웹문서 대량제작', '--phone', '1566-3046']
subprocess.run(cmd + (['--force'] if '--force' in sys.argv else []), check=True)
os.remove(tmp)
print(len(items), 'pages')
