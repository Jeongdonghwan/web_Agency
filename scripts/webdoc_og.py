"""웹문서 섹션 페이지별 og 썸네일 생성 — python scripts/webdoc_og.py [--force]

핵심 페이지(content/webdoc/*.md) + 업종 페이지(data/webdoc/industries.json) 전부를 public/og/webdoc/<slug>.jpg 로.
그리기는 seo-foundation 스킬의 make_og.py (가운데 630×630 안전영역, 굵은 키워드 + 상호·전화).
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAKE_OG = os.path.expanduser('~/.claude/skills/seo-foundation/scripts/make_og.py')
SUB = '이 자리에 사장님 업체가 나옵니다'

items = []
core_dir = os.path.join(ROOT, 'content', 'webdoc')
for f in sorted(os.listdir(core_dir)):
    if not f.endswith('.md') or f.startswith('_'):
        continue
    head = open(os.path.join(core_dir, f), encoding='utf-8').read().split('---')[1]
    name = re.search(r"^name:\s*'?(.+?)'?\s*$", head, re.M).group(1)
    items.append({'slug': f[:-3], 'title': name, 'sub': SUB})
for ind in json.load(open(os.path.join(ROOT, 'data', 'webdoc', 'industries.json'), encoding='utf-8')):
    g = ind['group']
    label = f"{ind['name']} 홍보" if g == '법률·전문직' else f"{ind['name']} 사무소 홍보" if g == '회생·채무' else f"{ind['name']} 업체 홍보"
    items.append({'slug': f"{ind['name']}-홍보", 'title': label, 'sub': SUB})

tmp = os.path.join(ROOT, 'data', 'webdoc', '_og_items.json')
json.dump(items, open(tmp, 'w', encoding='utf-8'), ensure_ascii=False)
cmd = [sys.executable, '-I', MAKE_OG, '--items', tmp, '--out', os.path.join(ROOT, 'public', 'og', 'webdoc'),
       '--bg', '#0f1b2d', '--accent', '#3b82f6', '--brand', 'JD8 · 웹문서 대량제작', '--phone', '1566-3046']
subprocess.run(cmd + (['--force'] if '--force' in sys.argv else []), check=True)
os.remove(tmp)
print(len(items), 'pages')
