"""실제 페이지 화면 캡처 — jd8.co.kr 빌드 결과(로컬 3200 포트)에서 모바일 화면을 찍어 public/shots/ 에 넣는다.

  python -I -X utf8 scripts/capture.py            # 없는 것만
  python -I -X utf8 scripts/capture.py --force

화면에 쓰는 이미지는 JD8 이 같은 방식으로 직접 운영하는 페이지의 실제 화면이다(스톡·가상 고객사 화면 아님).
헤드리스 브라우저는 창 최소 폭 때문에 390px 을 iframe 으로 감싸 찍고 왼쪽 390px 만 잘라 쓴다.
"""
import os, subprocess, sys, tempfile, urllib.parse
from PIL import Image

EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
BASE = os.environ.get('CAPTURE_BASE', 'http://localhost:3200')
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), *os.environ.get('CAPTURE_OUT', 'public/shots').split('/'))
os.makedirs(OUT, exist_ok=True)
FORCE = '--force' in sys.argv

# (파일 이름, 경로, 업종군) — 업종군은 하위 페이지에서 같은 업종군 화면을 고를 때 쓴다
MOBILE = [
    ('hasugu', '/타지역서비스/경기-하수구/', '하수구·배관'), ('nusu', '/타지역서비스/서울-누수탐지/', '누수·방수'),
    ('cheongso', '/타지역서비스/인천-입주청소/', '청소'), ('isa', '/타지역서비스/부산-포장이사/', '이사·운반'),
    ('crane', '/타지역서비스/경남-크레인/', '크레인·장비'), ('curtain', '/타지역서비스/대구-커튼/', '커튼·창호·인테리어'),
    ('boiler', '/타지역서비스/충남-보일러/', '설비·설치'), ('cheolgeo', '/타지역서비스/경북-철거/', '철거·공사'),
    ('bangyeok', '/타지역서비스/대전-방역/', '방역'), ('lawyer', '/타지역서비스/서울-변호사/', '법률·전문직'),
    ('loan', '/타지역서비스/경기-사업자대출/', '대출·금융'), ('hoesaeng', '/타지역서비스/광주-개인회생/', '회생·채무'),
    ('car', '/타지역서비스/경기-렌트카/', '자동차'), ('maeip', '/타지역서비스/전북-중고가전매입/', '수거·매입'),
    ('blind', '/타지역홍보/경기-블라인드/', ''), ('sadari', '/타지역홍보/서울-사다리차/', ''),
    ('wd-hasugu', '/웹문서/하수구-홍보/', ''), ('wd-bangchung', '/웹문서/방충망-홍보/', ''),
    ('hub', '/타지역서비스/지역/경기/', ''), ('blog', '/blog/naver-seo-guide/', ''),
]
DESKTOP = [('d-product', '/타지역서비스/경기-하수구/'), ('d-blog', '/blog/naver-seo-guide/')]


def shot(url, path, w, h):
    subprocess.run([EDGE, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=7000', f'--window-size={w},{h}', f'--screenshot={path}', url],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)


tmp = tempfile.mkdtemp()
for name, p, _ in MOBILE:
    dst = os.path.join(OUT, name + '.jpg')
    if os.path.exists(dst) and not FORCE: continue
    frame = os.path.join(tmp, 'f.html')
    open(frame, 'w', encoding='utf-8').write(f'<!doctype html><meta charset=utf-8><body style="margin:0;background:#fff"><iframe src="{BASE}{urllib.parse.quote(p)}" style="width:390px;height:1500px;border:0"></iframe>')
    png = os.path.join(tmp, name + '.png')
    shot('file:///' + frame.replace('\\', '/'), png, 600, 1500)
    if not os.path.exists(png): print('실패', name); continue
    im = Image.open(png).convert('RGB').crop((0, 0, 390, 1500))
    im.save(dst, quality=72, optimize=True)
    print(name, os.path.getsize(dst) // 1024, 'KB')
for name, p in DESKTOP:
    dst = os.path.join(OUT, name + '.jpg')
    if os.path.exists(dst) and not FORCE: continue
    png = os.path.join(tmp, name + '.png')
    shot(BASE + urllib.parse.quote(p), png, 1280, 900)
    if not os.path.exists(png): print('실패', name); continue
    Image.open(png).convert('RGB').resize((960, 675), Image.LANCZOS).save(dst, quality=76, optimize=True)
    print(name, os.path.getsize(dst) // 1024, 'KB')
