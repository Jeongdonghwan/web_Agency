"""server/inquiry.py 테스트 — 실제 서버를 띄워 HTTP 로 문의 접수·로그인·목록·확인/삭제·비밀번호 변경·로그아웃을 확인한다.

  python -X utf8 server/test_inquiry.py
"""
import http.client, http.server, json, os, sqlite3, sys, tempfile, threading, time, unittest, urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import inquiry as inq

FIRST = 'first-pass-1'
OK = {'name': '○○하수구', 'phone': '010-1234-5678', 'industry': '하수구', 'message': '문의합니다', 'agree': '1'}


class InquiryServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        inq.DB = os.path.join(cls.tmp.name, 'test.db')
        inq.PW = FIRST
        cls.srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), inq.H)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        cls.srv.server_close()
        cls.tmp.cleanup()

    def setUp(self):
        inq.HITS.clear()

    # ---- 도우미 ----
    def req(self, method, path, form=None, js=None, token='', headers=None, raw=None):
        h = dict(headers or {})
        body = raw
        if js is not None:
            body, h['Content-Type'] = json.dumps(js), 'application/json'
        elif form is not None:
            body, h['Content-Type'] = urllib.parse.urlencode(form), 'application/x-www-form-urlencoded'
        if token:
            h['Cookie'] = f'{inq.COOKIE}={token}'
        c = http.client.HTTPConnection('127.0.0.1', self.srv.server_port, timeout=5)
        c.request(method, path, body=body, headers=h)
        r = c.getresponse()
        text = r.read().decode('utf-8')
        c.close()
        return r.status, r, text

    def login(self, pw, **kw):
        s, r, text = self.req('POST', '/admin/login', form={'pw': pw}, **kw)
        cookie = r.getheader('Set-Cookie') or ''
        token = cookie.split(';')[0].split('=', 1)[1] if cookie.startswith(inq.COOKIE + '=') else ''
        return s, r, text, token

    def rows(self):
        with inq.db() as c:
            return c.execute('SELECT name, phone, done FROM inquiry ORDER BY id').fetchall()

    def clear(self):
        with inq.db() as c:
            c.execute('DELETE FROM inquiry')

    # ---- 문의 접수 ----
    def test_inquiry_validation(self):
        self.clear()
        cases = [
            ({**OK, 'agree': ''}, 400, '동의'),
            ({**OK, 'phone': '1234'}, 400, '연락처'),
            ({**OK, 'name': ' '}, 400, '상호'),
        ]
        for data, code, word in cases:
            s, _, text = self.req('POST', '/api/inquiry', js=data)
            self.assertEqual(s, code, data)
            self.assertIn(word, json.loads(text)['error'])
        self.assertEqual(self.req('POST', '/api/inquiry', raw='not json', headers={'Content-Type': 'application/json'})[0], 400)
        self.assertEqual(self.req('POST', '/api/inquiry', js=[1, 2])[0], 400)
        # 숨긴 칸이 채워지면 성공처럼 답하되 저장하지 않는다
        self.assertEqual(self.req('POST', '/api/inquiry', js={**OK, 'website': 'spam'})[0], 200)
        self.assertEqual(self.rows(), [])
        s, _, text = self.req('POST', '/api/inquiry', js={**OK, 'name': '가' * 99})
        self.assertEqual((s, json.loads(text)), (200, {'ok': True}))
        self.assertEqual(self.rows(), [('가' * 40, '010-1234-5678', 0)])

    def test_inquiry_rate_limit(self):
        h = {'X-Forwarded-For': '7.7.7.7'}
        codes = [self.req('POST', '/api/inquiry', js=OK, headers=h)[0] for _ in range(6)]
        self.assertEqual(codes, [200] * 5 + [429])
        self.assertEqual(self.req('POST', '/api/inquiry', js=OK, headers={'X-Forwarded-For': '8.8.8.8'})[0], 200)

    # ---- 로그인 없이는 못 들어간다 ----
    def test_admin_requires_login(self):
        for path in ('/admin/', '/admin/password', '/admin/?f=new'):
            s, r, _ = self.req('GET', path)
            self.assertEqual((s, r.getheader('Location')), (303, '/admin/login'), path)
        self.assertEqual(self.req('GET', '/admin')[1].getheader('Location'), '/admin/')
        self.clear()
        self.req('POST', '/api/inquiry', js=OK)
        for path in ('/admin/delete', '/admin/done'):
            s, r, _ = self.req('POST', path, form={'id': '1'}, token='fake-token')
            self.assertEqual((s, r.getheader('Location')), (303, '/admin/login'))
        self.assertEqual(len(self.rows()), 1)
        s, _, text = self.req('GET', '/admin/login')
        self.assertEqual(s, 200)
        self.assertIn('type="password" name="pw"', text)
        self.assertEqual(self.req('HEAD', '/inquiry.py')[0], 405)  # 서버 폴더 파일을 내주지 않는다
        self.assertEqual(self.req('GET', '/inquiry.py')[0], 404)

    def test_expired_session(self):
        with inq.db() as c:
            c.execute('INSERT INTO session VALUES (?, ?)', ('old-token', time.time() - 1))
        self.assertEqual(self.req('GET', '/admin/', token='old-token')[0], 303)

    def test_login_rate_limit(self):
        h = {'X-Forwarded-For': '9.9.9.9'}
        codes = [self.login('wrong', headers=h)[0] for _ in range(11)]
        self.assertEqual(codes, [401] * 10 + [429])
        self.assertEqual(self.login('wrong', headers={'X-Forwarded-For': '9.9.9.10'})[0], 401)

    # ---- 로그인 → 목록 → 확인/삭제 → 비밀번호 변경 → 로그아웃 ----
    def test_flow(self):
        self.clear()
        self.req('POST', '/api/inquiry', js={**OK, 'name': '<script>alert(1)</script>', 'message': '첫 줄\n둘째 줄'})
        self.req('POST', '/api/inquiry', js={**OK, 'name': '두번째상호'})

        s, _, text, token = self.login('wrong')
        self.assertEqual((s, token), (401, ''))
        self.assertIn('비밀번호가 맞지 않습니다', text)

        s, r, _, token = self.login(FIRST, headers={'X-Forwarded-Proto': 'https'})
        self.assertEqual((s, r.getheader('Location')), (303, '/admin/'))
        cookie = r.getheader('Set-Cookie')
        for flag in ('HttpOnly', 'SameSite=Strict', 'Path=/admin', 'Secure'):
            self.assertIn(flag, cookie)
        self.assertEqual(self.req('GET', '/admin/login', token=token)[1].getheader('Location'), '/admin/')

        s, _, text = self.req('GET', '/admin/', token=token)
        self.assertEqual(s, 200)
        self.assertIn('&lt;script&gt;alert(1)&lt;/script&gt;', text)
        self.assertNotIn('<script>alert', text)
        self.assertIn('전체 2', text)
        self.assertIn('확인 전 2', text)
        self.assertIn('href="tel:01012345678"', text)
        self.assertLess(text.index('두번째상호'), text.index('&lt;script'))  # 최신 문의가 위

        ids = [r[0] for r in sqlite3.connect(inq.DB).execute('SELECT id FROM inquiry ORDER BY id')]
        s, r, _ = self.req('POST', '/admin/done', form={'id': ids[0], 'back': '/admin/?f=new'}, token=token)
        self.assertEqual((s, r.getheader('Location')), (303, '/admin/?f=new'))
        self.assertEqual([row[2] for row in self.rows()], [1, 0])
        text = self.req('GET', '/admin/?f=new', token=token)[2]
        self.assertIn('두번째상호', text)
        self.assertNotIn('&lt;script', text)
        self.assertIn('확인 전 1', text)
        self.req('POST', '/admin/done', form={'id': ids[0]}, token=token)  # 확인 취소
        self.assertEqual([row[2] for row in self.rows()], [0, 0])
        self.assertEqual(self.req('POST', '/admin/done', form={'id': ids[0], 'back': 'https://evil.example/'}, token=token)[1].getheader('Location'), '/admin/')

        # 다른 사이트에서 보낸 요청은 막는다
        s, _, _ = self.req('POST', '/admin/delete', form={'id': ids[1]}, token=token, headers={'Origin': 'https://evil.example', 'Host': 'hco.jd8.co.kr'})
        self.assertEqual(s, 403)
        self.assertEqual(len(self.rows()), 2)
        s, _, _ = self.req('POST', '/admin/delete', form={'id': ids[1]}, token=token, headers={'Origin': 'https://hco.jd8.co.kr', 'Host': 'hco.jd8.co.kr'})
        self.assertEqual(s, 303)
        self.assertEqual(len(self.rows()), 1)

        # 비밀번호 변경
        _, _, _, other = self.login(FIRST)  # 다른 기기 로그인
        self.assertEqual(self.req('GET', '/admin/password', token=token)[0], 200)
        bad = [
            ({'current': 'nope', 'new': 'newpass-2', 'new2': 'newpass-2'}, '현재 비밀번호가 맞지 않습니다'),
            ({'current': FIRST, 'new': 'short', 'new2': 'short'}, '8자 이상'),
            ({'current': FIRST, 'new': 'newpass-2', 'new2': 'newpass-3'}, '서로 다릅니다'),
            ({'current': FIRST, 'new': FIRST, 'new2': FIRST}, '다른 비밀번호'),
        ]
        for form, word in bad:
            s, _, text = self.req('POST', '/admin/password', form=form, token=token)
            self.assertEqual(s, 400, form)
            self.assertIn(word, text)
        s, _, text = self.req('POST', '/admin/password', form={'current': FIRST, 'new': 'newpass-2', 'new2': 'newpass-2'}, token=token)
        self.assertEqual(s, 200)
        self.assertIn('비밀번호를 바꿨습니다', text)
        self.assertEqual(self.req('GET', '/admin/', token=token)[0], 200)   # 바꾼 기기는 그대로
        self.assertEqual(self.req('GET', '/admin/', token=other)[0], 303)   # 다른 기기는 끊김
        self.assertEqual(self.login(FIRST)[0], 401)                          # 옛 비밀번호 안 됨
        self.assertEqual(self.login('newpass-2')[0], 303)                    # 새 비밀번호 됨
        stored = sqlite3.connect(inq.DB).execute("SELECT v FROM setting WHERE k='pw'").fetchone()[0]
        self.assertNotIn('newpass-2', stored)                                # 비밀번호는 해시로만 저장

        # 로그아웃
        s, r, _ = self.req('POST', '/admin/logout', token=token)
        self.assertEqual((s, r.getheader('Location')), (303, '/admin/login'))
        self.assertIn('Max-Age=0', r.getheader('Set-Cookie'))
        self.assertEqual(self.req('GET', '/admin/', token=token)[0], 303)


if __name__ == '__main__':
    unittest.main(verbosity=2)
