"""상담 문의 받기 + 관리자 확인 화면 (에이치코 hco.jd8.co.kr 용). 표준 라이브러리만 쓴다.

  POST /api/inquiry   문의 저장 (JSON)
  GET  /admin/        받은 문의 목록 (아이디 admin + 비밀번호)
  POST /admin/done    확인 표시 / POST /admin/delete  삭제

실행:
  INQUIRY_ADMIN_PW=비밀번호 python3 server/inquiry.py                   # 서버: 127.0.0.1:8317, nginx 가 /api/ 와 /admin/ 만 넘긴다
  INQUIRY_ADMIN_PW=test python server/inquiry.py --static dist/hco 3300  # 내 컴퓨터에서 화면까지 같이 보기

저장 위치: INQUIRY_DB (기본 server/inquiry.db). 비밀번호가 없으면 실행되지 않는다.
"""
import base64, hmac, html, http.server, json, os, sqlite3, sys, threading, time, urllib.parse

PW = os.environ.get('INQUIRY_ADMIN_PW', '')
DB = os.environ.get('INQUIRY_DB', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'inquiry.db'))
FIELDS = {'name': 40, 'phone': 20, 'industry': 40, 'region': 60, 'message': 1000}  # 칸 이름: 최대 글자 수
LOCK = threading.Lock()
HITS = {}  # ip -> 최근 접수 시각들. ponytail: 메모리에만 둔다(재시작하면 초기화) — 한 프로세스라 충분


def db():
    c = sqlite3.connect(DB)
    c.execute('CREATE TABLE IF NOT EXISTS inquiry (id INTEGER PRIMARY KEY, at TEXT, name TEXT, phone TEXT, industry TEXT, region TEXT, message TEXT, ip TEXT, done INTEGER DEFAULT 0)')
    return c


def clean(data):
    """폼 값 검사. (저장할 값, 오류 문구) 를 돌려준다."""
    if data.get('website'):  # 숨긴 칸이 채워졌으면 자동 등록 프로그램
        return None, ''
    row = {k: str(data.get(k) or '').strip()[:n] for k, n in FIELDS.items()}
    if not row['name'] or not row['phone']:
        return None, '상호(성함)와 연락처를 적어 주세요.'
    if sum(ch.isdigit() for ch in row['phone']) < 8:
        return None, '연락처를 다시 확인해 주세요.'
    if not data.get('agree'):
        return None, '개인정보 수집·이용에 동의해 주세요.'
    return row, ''


def limited(ip, now=None, per=5, window=600):
    """같은 주소에서 10분에 5건까지만 받는다."""
    now = now or time.time()
    with LOCK:
        recent = [t for t in HITS.get(ip, []) if now - t < window]
        if len(recent) >= per:
            HITS[ip] = recent
            return True
        HITS[ip] = recent + [now]
        return False


PAGE = '''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>상담 문의 관리</title>
<style>body{font:15px/1.6 system-ui,sans-serif;margin:0;background:#f6f5f2;color:#1a1814}main{max-width:1100px;margin:0 auto;padding:24px 16px 60px}
h1{font-size:1.3rem}article{background:#fff;border:1px solid #e3dfd6;border-radius:12px;padding:16px 18px;margin:12px 0}
article.done{opacity:.55}header{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline}header b{font-size:1.05rem}
header a{color:#8a6a1c;font-weight:700}time,small{color:#7a746a;font-size:.85rem}p{margin:8px 0 0;white-space:pre-wrap;word-break:break-word}
form{display:inline}button{font:inherit;padding:5px 12px;border-radius:8px;border:1px solid #cfc9bc;background:#fff;cursor:pointer;margin:10px 6px 0 0}
button.del{color:#a02c2c}</style><main><h1>상담 문의 %d건 <small>(확인 전 %d건)</small></h1>%s</main></html>'''


def render(rows):
    e = html.escape
    items = []
    for i, at, name, phone, industry, region, message, ip, done in rows:
        tel = ''.join(ch for ch in phone if ch.isdigit() or ch == '+')
        items.append(
            f'<article class="{"done" if done else ""}"><header><b>{e(name)}</b><a href="tel:{e(tel)}">{e(phone)}</a>'
            f'<span>{e(industry)}{" · " if industry and region else ""}{e(region)}</span><time>{e(at)}</time></header>'
            f'<p>{e(message) or "(내용 없음)"}</p>'
            f'<form method="post" action="/admin/done"><input type="hidden" name="id" value="{i}"><button>{"확인 취소" if done else "확인함"}</button></form>'
            f'<form method="post" action="/admin/delete" onsubmit="return confirm(\'삭제할까요?\')"><input type="hidden" name="id" value="{i}"><button class="del">삭제</button></form></article>')
    return PAGE % (len(rows), sum(1 for r in rows if not r[8]), ''.join(items) or '<p>아직 받은 문의가 없습니다.</p>')


class H(http.server.SimpleHTTPRequestHandler):
    static = None  # --static 으로 준 폴더 (내 컴퓨터 확인용)

    def log_message(self, *a):
        pass

    def send(self, code, body, ctype='application/json; charset=utf-8', extra=()):
        b = body.encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(b)))
        self.send_header('Cache-Control', 'no-store')
        for k, v in extra:
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(b)

    def authed(self):
        try:
            user, _, pw = base64.b64decode(self.headers.get('Authorization', '').split(' ', 1)[1]).decode('utf-8').partition(':')
        except Exception:
            user = pw = ''
        if user == 'admin' and hmac.compare_digest(pw.encode(), PW.encode()):
            return True
        self.send(401, '로그인이 필요합니다.', 'text/plain; charset=utf-8', [('WWW-Authenticate', 'Basic realm="inquiry", charset="UTF-8"')])
        return False

    def body(self, limit=8192):
        n = int(self.headers.get('Content-Length') or 0)
        return self.rfile.read(n).decode('utf-8', 'replace') if 0 < n <= limit else ''

    def do_GET(self):
        path = self.path.split('?')[0]
        if path in ('/admin', '/admin/'):
            if self.authed():
                with db() as c:
                    self.send(200, render(c.execute('SELECT * FROM inquiry ORDER BY id DESC').fetchall()), 'text/html; charset=utf-8')
        elif self.static and not path.startswith(('/admin', '/api')):
            super().do_GET()
        else:
            self.send(404, '{"error":"not found"}')

    def do_POST(self):
        path = self.path.split('?')[0]
        if path == '/api/inquiry':
            ip = (self.headers.get('X-Forwarded-For') or self.client_address[0]).split(',')[0].strip()
            try:
                data = json.loads(self.body() or '{}')
                assert isinstance(data, dict)
            except Exception:
                return self.send(400, '{"error":"형식이 올바르지 않습니다."}')
            row, err = clean(data)
            if err:
                return self.send(400, json.dumps({'error': err}, ensure_ascii=False))
            if row:
                if limited(ip):
                    return self.send(429, '{"error":"잠시 뒤 다시 시도해 주세요."}')
                with db() as c:
                    c.execute('INSERT INTO inquiry (at,name,phone,industry,region,message,ip) VALUES (?,?,?,?,?,?,?)',
                              (time.strftime('%Y-%m-%d %H:%M'), *row.values(), ip))
            return self.send(200, '{"ok":true}')
        if path in ('/admin/done', '/admin/delete'):
            if not self.authed():
                return
            # 다른 사이트에서 몰래 보내는 요청 막기: 같은 주소에서 온 요청만 받는다
            origin = self.headers.get('Origin') or ''
            if origin and urllib.parse.urlparse(origin).netloc != self.headers.get('Host'):
                return self.send(403, 'forbidden', 'text/plain')
            i = urllib.parse.parse_qs(self.body()).get('id', [''])[0]
            if i.isdigit():
                with db() as c:
                    c.execute('DELETE FROM inquiry WHERE id=?' if path.endswith('delete') else 'UPDATE inquiry SET done=1-done WHERE id=?', (int(i),))
            self.send_response(303)
            self.send_header('Location', '/admin/')
            self.end_headers()
            return
        self.send(404, '{"error":"not found"}')


def demo():
    assert clean({'name': '가', 'phone': '010-1234-5678', 'agree': '1'})[0]['phone'] == '010-1234-5678'
    assert clean({'name': '가', 'phone': '010-1234-5678'})[1]                      # 동의 없음
    assert clean({'name': '', 'phone': '010-1234-5678', 'agree': '1'})[1]          # 이름 없음
    assert clean({'name': '가', 'phone': '1234', 'agree': '1'})[1]                 # 번호 짧음
    assert clean({'name': '가', 'phone': '010-1234-5678', 'agree': '1', 'website': 'x'}) == (None, '')  # 숨긴 칸
    assert len(clean({'name': '가' * 99, 'phone': '010-1234-5678', 'agree': '1'})[0]['name']) == 40
    HITS.clear()
    assert [limited('t', now=100) for _ in range(6)] == [False] * 5 + [True] and not limited('t', now=800)
    assert '&lt;script&gt;' in render([(1, 't', '<script>', '010', '', '', '', 'ip', 0)])
    print('ok')


if __name__ == '__main__':
    args = sys.argv[1:]
    if args[:1] == ['--demo']:
        demo(); sys.exit()
    if not PW:
        sys.exit('INQUIRY_ADMIN_PW (관리자 비밀번호) 를 정하고 실행하세요.')
    if args[:1] == ['--static']:
        H.static = args[1]; args = args[2:]
    port = int(args[0]) if args else 8317
    handler = (lambda *a, **k: H(*a, directory=H.static, **k)) if H.static else H
    print(f'상담 문의 서버 http://127.0.0.1:{port}  (관리자 /admin/ , 아이디 admin)')
    http.server.ThreadingHTTPServer(('127.0.0.1', port), handler).serve_forever()
