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

# id, 갤러리 라벨(업종), 카드 제목, 한 줄 후킹 — 지역명 대신 "전국 홍보" 관점으로 쓴다
S = [
    ('hasugu', '하수구막힘', '하수구 업체 전국 홍보 페이지', "'동네 + 하수구' 검색어마다 이런 페이지가 하나씩"),
    ('nusu', '누수탐지', '누수탐지 업체 전국 홍보 페이지', '천장 얼룩을 검색한 손님이 바로 전화하는 구성'),
    ('doorlock', '도어락', '도어락 출장 전국 홍보 페이지', '문이 안 열려 검색하는 그 순간에 보이게'),
    ('julnun', '줄눈 시공', '줄눈 시공 전국 홍보 페이지', '후기 글 하나가 지역마다 문의 통로가 됩니다'),
    ('boiler', '보일러 교체', '보일러 교체 전국 홍보 페이지', "겨울 전 '보일러 교체' 검색을 잡는 구성"),
    ('cheolgeo', '철거', '철거 업체 전국 홍보 페이지', '원상복구 견적을 찾는 상가 사장님께 바로'),
    ('isa', '보관이사', '보관이사 전국 홍보 페이지', '입주일을 고민하는 손님이 읽고 바로 문의'),
    ('cheongso', '입주청소', '입주청소 전국 홍보 페이지', "신축 단지마다 '입주청소' 검색어를 잡습니다"),
    ('sofa', '소파 리폼', '소파 리폼 전국 홍보 페이지', '수거·배송으로 지역 제한 없이 받는 일감'),
    ('lawyer', '이혼 상담', '이혼 상담 전국 홍보 페이지', '이혼 상담 검색에서 들어온 손님이 바로 상담 예약'),
    ('sadari', '사다리차', '사다리차 전국 홍보 페이지', "'○○동 사다리차' 검색마다 바로 예약 전화"),
    ('water', '정수기 렌탈', '정수기 렌탈 전국 홍보 페이지', '제품 비교부터 상담 신청까지 한 페이지에서'),
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
    for sid, label, title, hook in S:
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
        meta.append({'id': sid, 'mobile': f'/sample/m/{sid}.jpg', 'href': f'/sample/{sid}/', 'img': f'/sample/thumb/{sid}.jpg', 'label': label, 'title': title, 'hook': hook})
        print(sid, os.path.getsize(dst) // 1024, 'KB')
    b.close()
srv.shutdown()
json.dump(meta, open(os.path.join(ROOT, 'data', 'samples.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
