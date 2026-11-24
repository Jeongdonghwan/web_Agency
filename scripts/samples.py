"""업종별 예시 페이지 — public/sample/<id>/index.html 은 업종마다 따로 디자인한 단독 페이지다(손으로 만든다).
이 스크립트는 그 페이지를 찍어 메인 갤러리 썸네일과 목록(data/samples.json)만 만든다.
상호·전화번호는 ○○ 로 가리고, 검색엔진에는 내보내지 않는다(noindex + robots Disallow /sample/).

  python -I -X utf8 scripts/samples.py      → public/sample/thumb/<id>.jpg(PC 첫 화면) + public/sample/m/<id>.jpg(모바일) + data/samples.json
"""
import functools, http.server, json, os, threading
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')
OUT = os.path.join(PUB, 'sample')

# id, 업종, 지역(시도, 시군구, 동), 형식 — 갤러리 카드 문구
S = [
    ('hasugu', '하수구막힘', ('경기', '수원시 장안구', '정자동'), '지역형'),
    ('nusu', '누수탐지', ('서울', '강동구', '고덕동'), '상품소개형'),
    ('doorlock', '도어락', ('서울', '노원구', '상계동'), '상품소개형'),
    ('julnun', '줄눈 시공', ('경기', '부천시 소사구', '송내동'), '블로그형'),
    ('boiler', '보일러 교체', ('경기', '성남시 수정구', '금토동'), '상품소개형'),
    ('cheolgeo', '철거', ('서울', '구로구', '가리봉동'), '지역형'),
    ('isa', '보관이사', ('경기', '과천시', '문원동'), '블로그형'),
    ('cheongso', '입주청소', ('인천', '연수구', '송도동'), '지역형'),
    ('sofa', '소파 리폼', ('세종', '세종시', '반곡동'), '상품소개형'),
    ('lawyer', '이혼 소송', ('서울', '서초구', '서초동'), '블로그형'),
    ('sadari', '사다리차', ('대전', '서구', '둔산동'), '지역형'),
    ('water', '정수기 렌탈', ('대구', '수성구', '수성동1가'), '상품소개형'),
]

Q = type('Q', (http.server.SimpleHTTPRequestHandler,), {'log_message': lambda *a: None})
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=PUB))
threading.Thread(target=srv.serve_forever, daemon=True).start()
os.makedirs(os.path.join(OUT, 'thumb'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'm'), exist_ok=True)
meta = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome')
    pg = b.new_page(viewport={'width': 1280, 'height': 820})
    for sid, ind, (sd, sg, dong), typ in S:
        pg.goto(f'http://127.0.0.1:{srv.server_port}/sample/{sid}/', wait_until='networkidle')
        pg.add_style_tag(content='*{animation:none!important;transition:none!important}')
        pg.evaluate("document.querySelectorAll('*').forEach(e=>{if(e.textContent.trim()==='예시 화면'&&getComputedStyle(e).position==='fixed')e.style.display='none'})")
        pg.wait_for_timeout(400)
        png = os.path.join(OUT, 'thumb', sid + '.png')
        pg.screenshot(path=png)
        dst = png[:-4] + '.jpg'
        Image.open(png).convert('RGB').resize((800, 513), Image.LANCZOS).save(dst, quality=78, optimize=True)
        os.remove(png)
        # 모바일 화면(메인 히어로에서 흐르는 화면): 고정 바·배지는 빼고 위에서 1500px
        mp = b.new_page(viewport={'width': 390, 'height': 1500}, device_scale_factor=1)
        mp.goto(f'http://127.0.0.1:{srv.server_port}/sample/{sid}/', wait_until='networkidle')
        mp.add_style_tag(content='*{animation:none!important;transition:none!important}')
        mp.evaluate("document.querySelectorAll('body *').forEach(e=>{if(getComputedStyle(e).position==='fixed')e.style.display='none'})")
        mp.wait_for_timeout(400)
        mpng = os.path.join(OUT, 'm', sid + '.png')
        mp.screenshot(path=mpng)
        Image.open(mpng).convert('RGB').save(mpng[:-4] + '.jpg', quality=72, optimize=True)
        os.remove(mpng); mp.close()
        meta.append({'id': sid, 'mobile': f'/sample/m/{sid}.jpg', 'href': f'/sample/{sid}/', 'img': f'/sample/thumb/{sid}.jpg', 'region': f'{sd} · {sg} · {dong}', 'title': f'{ind} {typ} 페이지', 'type': typ})
        print(sid, os.path.getsize(dst) // 1024, 'KB')
    b.close()
srv.shutdown()
json.dump(meta, open(os.path.join(ROOT, 'data', 'samples.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
