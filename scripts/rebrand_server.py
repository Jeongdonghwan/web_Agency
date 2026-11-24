"""포춘마케팅용 화면 캡처를 위한 임시 서버 — jd8.co.kr 빌드 결과(C:/side_Prj/web_Agency/out)를 그대로 내주되,
HTML 안의 상호 표기 'JD8' 을 '포춘마케팅' 으로 바꾸고 스크립트를 뺀다(화면이 다시 그려지며 원래 상호로 돌아가지 않게).

  python -I -X utf8 scripts/rebrand_server.py 3201 &
  CAPTURE_BASE=http://localhost:3201 CAPTURE_OUT=public/shots-fortune python -I -X utf8 scripts/capture.py --force
"""
import http.server, os, re, sys, urllib.parse

ROOT = r'C:/side_Prj/web_Agency/out'
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3201
# 다른 상호로 찍을 때: REBRAND_NAME=에이치코 REBRAND_TAG=hco (CAPTURE_OUT=public/shots-hco)
NAME = os.environ.get('REBRAND_NAME', '포춘마케팅')
TAG = os.environ.get('REBRAND_TAG', 'fortune')


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass

    def do_GET(self):
        p = urllib.parse.unquote(self.path.split('?')[0])
        f = os.path.join(ROOT, p.lstrip('/'))
        if os.path.isdir(f): f = os.path.join(f, 'index.html')
        if f.endswith('.html') and os.path.isfile(f):
            s = open(f, encoding='utf-8').read()
            s = re.sub(r'<script\b[^>]*>.*?</script>', '', s, flags=re.S)
            s = s.replace('JD8', NAME).replace('jd8.co.kr', TAG)
            b = s.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(b)))
            self.end_headers()
            self.wfile.write(b)
            return
        super().do_GET()


http.server.ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
