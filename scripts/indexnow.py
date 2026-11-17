"""IndexNow 전송 — 서버에 배포한 뒤에 돌린다 (네이버·빙이 받는다. 구글은 받지 않는다).

  python -I scripts/indexnow.py out            # 사이트맵의 전체 주소
  python -I scripts/indexnow.py out --new      # 지난번 전송 뒤 새로 생긴 주소만 (.indexnow-sent.json 기준)

키 파일은 public/4c67f4fe55b46d504c577c620e3b340e.txt (사이트 루트에 그대로 배포된다).
엔드포인트는 처음 돌리기 전에 네이버 서치어드바이저 IndexNow 문서에서 한 번 확인할 것. 수집 보장은 아니다.
"""
import glob, json, os, re, sys, urllib.request

KEY = '4c67f4fe55b46d504c577c620e3b340e'
ENDPOINTS = ['https://searchadvisor.naver.com/indexnow', 'https://api.indexnow.org/indexnow']
out = sys.argv[1] if len(sys.argv) > 1 else 'out'
site = re.search(r"SITE_URL = '([^']+)'", open('lib/site.ts', encoding='utf-8').read()).group(1)
host = site.split('//')[1]
urls = sorted({u for f in glob.glob(os.path.join(out, 'sitemap*.xml')) for u in re.findall(r'<loc>([^<]+)</loc>', open(f, encoding='utf-8').read()) if not u.endswith('.xml')})
state = '.indexnow-sent.json'
sent = set(json.load(open(state, encoding='utf-8'))) if os.path.exists(state) else set()
todo = [u for u in urls if u not in sent] if '--new' in sys.argv else urls
print(f'전송 대상 {len(todo)}개 (사이트맵 {len(urls)}개)')
for ep in ENDPOINTS:
    for i in range(0, len(todo), 10000):  # 요청당 최대 1만 개
        body = json.dumps({'host': host, 'key': KEY, 'keyLocation': f'{site}/{KEY}.txt', 'urlList': todo[i:i + 10000]}).encode()
        req = urllib.request.Request(ep, data=body, headers={'Content-Type': 'application/json; charset=utf-8'})
        try:
            print(ep, i, urllib.request.urlopen(req, timeout=30).status)
        except Exception as e:
            print(ep, i, '실패:', e)
json.dump(sorted(sent | set(todo)), open(state, 'w', encoding='utf-8'))
