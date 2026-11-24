"""상담 문의 받기 + 관리자 화면 (에이치코 hco.jd8.co.kr 용). 표준 라이브러리만 쓴다.

  POST /api/inquiry        문의 저장 (JSON, 사이트의 상담 문의란이 보낸다)
  GET  /admin/login        로그인 창
  GET  /admin/             받은 문의 목록 (?f=new 면 확인 전만)
  GET  /admin/password     비밀번호 변경
  POST /admin/done·delete·logout·password

실행:
  INQUIRY_ADMIN_PW=처음비밀번호 python3 server/inquiry.py                 # 서버: 127.0.0.1:8317, nginx 가 /api/ 와 /admin 만 넘긴다
  사이트마다 따로 띄운다: INQUIRY_BRAND(관리 화면 상호)·INQUIRY_DB(저장 파일)·INQUIRY_PORT(포트) 를 다르게 준다
  INQUIRY_ADMIN_PW=test1234 python server/inquiry.py --static dist/hco 3300  # 내 컴퓨터에서 화면까지 같이 보기
테스트:
  python -X utf8 server/test_inquiry.py

INQUIRY_ADMIN_PW 는 처음 한 번만 쓴다. 관리자 화면에서 비밀번호를 바꾸면 DB(INQUIRY_DB, 기본 server/inquiry.db)에 저장된 값이 우선한다.
"""
import hashlib, hmac, html, http.cookies, http.server, json, os, secrets, sqlite3, sys, threading, time, urllib.parse

PW = os.environ.get('INQUIRY_ADMIN_PW', '')
DB = os.environ.get('INQUIRY_DB', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'inquiry.db'))
FIELDS = {'name': 40, 'phone': 20, 'industry': 40, 'message': 1000}  # 칸 이름: 최대 글자 수 (표의 region 칸은 예전 문의용으로만 남김)
SESSION_HOURS = 12
BRAND = os.environ.get('INQUIRY_BRAND', '에이치코')  # 관리자 화면에 찍히는 상호
COOKIE = 'hco_admin'
LOCK = threading.Lock()
HITS = {}  # 키 -> 최근 시각들. ponytail: 메모리에만 둔다(재시작하면 초기화) — 프로세스 하나라 충분


def db():
    c = sqlite3.connect(DB)
    c.executescript('''
      CREATE TABLE IF NOT EXISTS inquiry (id INTEGER PRIMARY KEY, at TEXT, name TEXT, phone TEXT, industry TEXT, region TEXT, message TEXT, ip TEXT, done INTEGER DEFAULT 0);
      CREATE TABLE IF NOT EXISTS setting (k TEXT PRIMARY KEY, v TEXT);
      CREATE TABLE IF NOT EXISTS session (token TEXT PRIMARY KEY, exp REAL);''')
    return c


# ---------- 문의 ----------
def clean(data):
    """폼 값 검사. (저장할 값, 오류 문구) 를 돌려준다. 숨긴 칸이 채워졌으면 (None, '') — 조용히 버린다."""
    if data.get('website'):
        return None, ''
    row = {k: str(data.get(k) or '').strip()[:n] for k, n in FIELDS.items()}
    if not row['name'] or not row['phone']:
        return None, '상호(성함)와 연락처를 적어 주세요.'
    if sum(ch.isdigit() for ch in row['phone']) < 8:
        return None, '연락처를 다시 확인해 주세요.'
    if not data.get('agree'):
        return None, '개인정보 수집·이용에 동의해 주세요.'
    return row, ''


def limited(key, per=5, window=600, now=None):
    """같은 키로 window 초 안에 per 번까지만 허용한다."""
    now = now or time.time()
    with LOCK:
        recent = [t for t in HITS.get(key, []) if now - t < window]
        if len(recent) >= per:
            HITS[key] = recent
            return True
        HITS[key] = recent + [now]
        return False


# ---------- 비밀번호·세션 ----------
def hash_pw(pw, salt=None):
    salt = salt or secrets.token_hex(16)
    return salt + '$' + hashlib.pbkdf2_hmac('sha256', pw.encode(), salt.encode(), 200_000).hex()


def check_pw(pw):
    with db() as c:
        row = c.execute("SELECT v FROM setting WHERE k='pw'").fetchone()
        if not row:
            if not PW:
                return False
            c.execute("INSERT INTO setting VALUES ('pw', ?)", (hash_pw(PW),))  # 처음 비밀번호를 해시로 옮겨 둔다
            row = c.execute("SELECT v FROM setting WHERE k='pw'").fetchone()
    stored = row[0]
    return hmac.compare_digest(hash_pw(pw, stored.split('$')[0]), stored)


def set_pw(pw):
    with db() as c:
        c.execute("INSERT OR REPLACE INTO setting VALUES ('pw', ?)", (hash_pw(pw),))


def new_session():
    token = secrets.token_urlsafe(32)
    with db() as c:
        c.execute('DELETE FROM session WHERE exp < ?', (time.time(),))
        c.execute('INSERT INTO session VALUES (?, ?)', (token, time.time() + SESSION_HOURS * 3600))
    return token


def valid_session(token):
    if not token:
        return False
    with db() as c:
        row = c.execute('SELECT exp FROM session WHERE token=?', (token,)).fetchone()
    return bool(row and row[0] > time.time())


def end_sessions(token=None, keep=None):
    """token 하나만 끝내거나(로그아웃), keep 을 뺀 전부를 끝낸다(비밀번호 변경)."""
    with db() as c:
        if token:
            c.execute('DELETE FROM session WHERE token=?', (token,))
        else:
            c.execute('DELETE FROM session WHERE token<>?', (keep or '',))


# ---------- 화면 ----------
CSS = '''*{box-sizing:border-box}body{font:15px/1.6 'Pretendard Variable',Pretendard,system-ui,-apple-system,'Malgun Gothic',sans-serif;margin:0;background:#f6f4ef;color:#1a1814;word-break:keep-all}
main{max-width:1000px;margin:0 auto;padding:28px 16px 60px}main.narrow{max-width:420px;padding-top:12vh}
h1{font-size:1.35rem;margin:0}.brand{display:inline-block;background:#14110c;color:#e6c462;font-weight:900;letter-spacing:.04em;padding:3px 9px;border-radius:7px;font-size:.85rem;margin-bottom:12px}
.box{background:#fff;border:1px solid #e3dfd6;border-radius:16px;padding:22px;margin-top:18px}
label{display:block;font-weight:700;font-size:.92rem;margin:0 0 14px}input{display:block;width:100%;font:inherit;padding:12px 13px;margin-top:6px;border:1px solid #d9d3c6;border-radius:10px;background:#faf9f6}
input:focus{outline:2px solid #a67c1a;outline-offset:1px;background:#fff}
button,.btn{font:inherit;font-weight:700;padding:7px 14px;border-radius:9px;border:1px solid #cfc9bc;background:#fff;color:#1a1814;cursor:pointer;text-decoration:none;display:inline-block}
button.main{width:100%;padding:13px;background:#14110c;border-color:#14110c;color:#f1d98a;font-size:1rem;margin-top:4px}button.main:hover{background:#7d5c0e;color:#fff}
.msg{padding:11px 14px;border-radius:10px;margin-top:16px;font-weight:600}.err{background:#fbeaea;color:#9b1c1c}.ok{background:#eef6e9;color:#2f6b1e}
.top .brand{margin:0 6px 0 0;vertical-align:3px}.top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}.top div{display:flex;gap:8px;align-items:center}
.tabs{display:flex;gap:6px;margin:18px 0 4px}.tabs a{padding:7px 14px;border-radius:9px;text-decoration:none;color:#5b554a;font-weight:700;border:1px solid transparent}.tabs a.on{background:#fff;border-color:#d9d3c6;color:#1a1814}
article{background:#fff;border:1px solid #e3dfd6;border-radius:14px;padding:16px 18px;margin:10px 0}article.done{opacity:.55}
article header{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline}article header b{font-size:1.06rem}article header a{color:#7d5c0e;font-weight:700}
.badge{font-size:.75rem;font-weight:800;color:#7d5c0e;background:#f3ead2;padding:2px 7px;border-radius:6px}
time,small,.sub{color:#7a746a;font-size:.86rem}article p{margin:8px 0 0;white-space:pre-wrap;word-break:break-word}
form.inline{display:inline}article .act{margin-top:10px;display:flex;gap:6px}button.del{color:#a02c2c}.empty{color:#7a746a;padding:30px 0}
.back{display:inline-block;margin-top:16px;color:#5b554a}'''


def page(title, body, narrow=False):
    cls = ' class="narrow"' if narrow else ''
    return (f'<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<meta name="robots" content="noindex"><title>{title} · {BRAND} 관리</title><style>{CSS}</style><main{cls}>{body}</main></html>')


def msg_html(err='', ok=''):
    if err:
        return f'<p class="msg err" role="alert">{html.escape(err)}</p>'
    return f'<p class="msg ok" role="status">{html.escape(ok)}</p>' if ok else ''


def login_page(err=''):
    return page('로그인', f'''<span class="brand">{html.escape(BRAND)}</span><h1>상담 문의 관리</h1><p class="sub">관리자 로그인</p>{msg_html(err)}
<form class="box" method="post" action="/admin/login"><label>비밀번호<input type="password" name="pw" required autofocus autocomplete="current-password"></label>
<button class="main">로그인</button></form>''', narrow=True)


def password_page(err='', ok=''):
    return page('비밀번호 변경', f'''<span class="brand">{html.escape(BRAND)}</span><h1>비밀번호 변경</h1>{msg_html(err, ok)}
<form class="box" method="post" action="/admin/password">
<label>현재 비밀번호<input type="password" name="current" required autocomplete="current-password"></label>
<label>새 비밀번호 <small>8자 이상</small><input type="password" name="new" required minlength="8" maxlength="100" autocomplete="new-password"></label>
<label>새 비밀번호 확인<input type="password" name="new2" required minlength="8" maxlength="100" autocomplete="new-password"></label>
<button class="main">비밀번호 바꾸기</button></form><a class="back" href="/admin/">← 상담 목록으로</a>''', narrow=True)


def list_page(rows, only_new):
    e = html.escape
    total, waiting = len(rows), sum(1 for r in rows if not r[8])
    back = '/admin/?f=new' if only_new else '/admin/'
    items = []
    for i, at, name, phone, industry, region, message, ip, done in rows:
        if only_new and done:
            continue
        tel = ''.join(ch for ch in phone if ch.isdigit() or ch == '+')
        where = ' · '.join(x for x in (industry, region) if x)
        badge = '' if done else '<span class="badge">확인 전</span>'
        items.append(
            f'<article class="{"done" if done else ""}"><header>{badge}<b>{e(name)}</b><a href="tel:{e(tel)}">{e(phone)}</a>'
            f'<span>{e(where)}</span><time>{e(at)}</time></header><p>{e(message) or "(내용 없음)"}</p><div class="act">'
            f'<form class="inline" method="post" action="/admin/done"><input type="hidden" name="id" value="{i}"><input type="hidden" name="back" value="{back}"><button>{"확인 취소" if done else "확인함"}</button></form>'
            f'<form class="inline" method="post" action="/admin/delete" onsubmit="return confirm(\'이 문의를 삭제할까요? 되돌릴 수 없습니다.\')"><input type="hidden" name="id" value="{i}"><input type="hidden" name="back" value="{back}"><button class="del">삭제</button></form>'
            f'</div></article>')
    on_all, on_new = ('', ' class="on"') if only_new else (' class="on"', '')
    body = (f'<header class="top"><h1><span class="brand">{e(BRAND)}</span> 상담 문의</h1><div><a class="btn" href="/admin/password">비밀번호 변경</a>'
            f'<form class="inline" method="post" action="/admin/logout"><button>로그아웃</button></form></div></header>'
            f'<nav class="tabs"><a href="/admin/"{on_all}>전체 {total}</a><a href="/admin/?f=new"{on_new}>확인 전 {waiting}</a></nav>'
            + (''.join(items) or '<p class="empty">아직 받은 문의가 없습니다.</p>'))
    return page('상담 문의', body)


# ---------- 서버 ----------
class H(http.server.SimpleHTTPRequestHandler):
    static = None  # --static 으로 준 폴더 (내 컴퓨터 확인용). 서버에서는 nginx 가 정적 파일을 낸다

    def log_message(self, *a):
        pass

    def send(self, code, body, ctype='text/html; charset=utf-8', extra=()):
        b = body.encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(b)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Frame-Options', 'DENY')
        for k, v in extra:
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(b)

    def go(self, where, extra=()):
        self.send_response(303)
        self.send_header('Location', where)
        self.send_header('Content-Length', '0')
        for k, v in extra:
            self.send_header(k, v)
        self.end_headers()

    def ip(self):
        return (self.headers.get('X-Forwarded-For') or self.client_address[0]).split(',')[0].strip()

    def token(self):
        try:
            c = http.cookies.SimpleCookie(self.headers.get('Cookie', ''))
            return c[COOKIE].value if COOKIE in c else ''
        except http.cookies.CookieError:
            return ''

    def cookie(self, value, max_age):
        secure = '; Secure' if self.headers.get('X-Forwarded-Proto') == 'https' else ''
        return ('Set-Cookie', f'{COOKIE}={value}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age={max_age}{secure}')

    def same_origin(self):
        origin = self.headers.get('Origin')
        return not origin or urllib.parse.urlparse(origin).netloc == self.headers.get('Host')

    def body(self, limit=8192):
        n = int(self.headers.get('Content-Length') or 0)
        return self.rfile.read(n).decode('utf-8', 'replace') if 0 < n <= limit else ''

    def form(self):
        return {k: v[0] for k, v in urllib.parse.parse_qs(self.body()).items()}

    def is_app(self, path):
        return path.startswith(('/admin', '/api/'))

    def do_HEAD(self):
        path = self.path.split('?')[0]
        if self.static and not self.is_app(path):
            return super().do_HEAD()
        self.send(405, '')

    def do_GET(self):
        path, _, qs = self.path.partition('?')
        if path == '/admin':
            return self.go('/admin/')
        if path == '/admin/login':
            return self.go('/admin/') if valid_session(self.token()) else self.send(200, login_page())
        if path in ('/admin/', '/admin/password'):
            if not valid_session(self.token()):
                return self.go('/admin/login')
            if path == '/admin/password':
                return self.send(200, password_page())
            only_new = urllib.parse.parse_qs(qs).get('f') == ['new']
            with db() as c:
                rows = c.execute('SELECT * FROM inquiry ORDER BY id DESC').fetchall()
            return self.send(200, list_page(rows, only_new))
        if self.static and not self.is_app(path):
            return super().do_GET()
        self.send(404, '{"error":"not found"}', 'application/json; charset=utf-8')

    def do_POST(self):
        path = self.path.split('?')[0]
        if path == '/api/inquiry':
            return self.inquiry()
        if not path.startswith('/admin/'):
            return self.send(404, '{"error":"not found"}', 'application/json; charset=utf-8')
        # 다른 사이트에서 몰래 보내는 요청은 받지 않는다 (쿠키도 SameSite=Strict)
        if not self.same_origin():
            return self.send(403, '허용되지 않은 요청입니다.', 'text/plain; charset=utf-8')
        if path == '/admin/login':
            pw = self.form().get('pw', '')
            if limited('login:' + self.ip(), per=10, window=600):
                return self.send(429, login_page('로그인을 너무 여러 번 시도했습니다. 10분 뒤 다시 시도해 주세요.'))
            if not check_pw(pw):
                return self.send(401, login_page('비밀번호가 맞지 않습니다.'))
            return self.go('/admin/', [self.cookie(new_session(), SESSION_HOURS * 3600)])
        token = self.token()
        if not valid_session(token):
            return self.go('/admin/login')
        if path == '/admin/logout':
            end_sessions(token=token)
            return self.go('/admin/login', [self.cookie('', 0)])
        if path == '/admin/password':
            return self.change_password(token)
        if path in ('/admin/done', '/admin/delete'):
            f = self.form()
            if f.get('id', '').isdigit():
                with db() as c:
                    sql = 'DELETE FROM inquiry WHERE id=?' if path.endswith('delete') else 'UPDATE inquiry SET done=1-done WHERE id=?'
                    c.execute(sql, (int(f['id']),))
            return self.go(f.get('back') if f.get('back') in ('/admin/', '/admin/?f=new') else '/admin/')
        self.send(404, 'not found', 'text/plain; charset=utf-8')

    def inquiry(self):
        try:
            data = json.loads(self.body() or '{}')
            assert isinstance(data, dict)
        except Exception:
            return self.send(400, '{"error":"형식이 올바르지 않습니다."}', 'application/json; charset=utf-8')
        row, err = clean(data)
        if err:
            return self.send(400, json.dumps({'error': err}, ensure_ascii=False), 'application/json; charset=utf-8')
        if row:
            if limited(self.ip()):
                return self.send(429, '{"error":"잠시 뒤 다시 시도해 주세요."}', 'application/json; charset=utf-8')
            with db() as c:
                c.execute('INSERT INTO inquiry (at,name,phone,industry,message,ip) VALUES (?,?,?,?,?,?)',
                          (time.strftime('%Y-%m-%d %H:%M'), *row.values(), self.ip()))
        self.send(200, '{"ok":true}', 'application/json; charset=utf-8')

    def change_password(self, token):
        f = self.form()
        cur, new, new2 = f.get('current', ''), f.get('new', ''), f.get('new2', '')
        if limited('pw:' + self.ip(), per=10, window=600):
            err = '너무 여러 번 시도했습니다. 10분 뒤 다시 시도해 주세요.'
        elif not check_pw(cur):
            err = '현재 비밀번호가 맞지 않습니다.'
        elif not 8 <= len(new) <= 100:
            err = '새 비밀번호는 8자 이상으로 정해 주세요.'
        elif new != new2:
            err = '새 비밀번호 두 칸이 서로 다릅니다.'
        elif new == cur:
            err = '지금과 다른 비밀번호로 정해 주세요.'
        else:
            set_pw(new)
            end_sessions(keep=token)  # 다른 기기의 로그인은 끊는다
            return self.send(200, password_page(ok='비밀번호를 바꿨습니다. 다른 기기에서 로그인된 곳은 모두 로그아웃됐습니다.'))
        self.send(400, password_page(err=err))


if __name__ == '__main__':
    args = sys.argv[1:]
    if args[:1] == ['--static']:
        H.static = args[1]
        args = args[2:]
    with db() as c:
        has_pw = c.execute("SELECT 1 FROM setting WHERE k='pw'").fetchone()
    if not has_pw and not PW:
        sys.exit('처음 실행할 때는 INQUIRY_ADMIN_PW (처음 비밀번호) 를 정해 주세요.')
    port = int(args[0]) if args else int(os.environ.get('INQUIRY_PORT', '8317'))
    handler = (lambda *a, **k: H(*a, directory=H.static, **k)) if H.static else H
    print(f'상담 문의 서버 http://127.0.0.1:{port}  (관리자 /admin/)')
    http.server.ThreadingHTTPServer(('127.0.0.1', port), handler).serve_forever()
