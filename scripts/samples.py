"""업종별 예시 페이지 화면 — 실제 제작하는 웹문서와 같은 구성으로 예시 페이지를 만들어 캡처만 한다.
업체명·전화번호는 ○○ 로 가린다. 검색엔진에는 내보내지 않는다(noindex + robots Disallow /sample/).

  python -I -X utf8 scripts/samples.py      → public/sample/<id>/index.html + public/sample/thumb/<id>.jpg + data/samples.json
"""
import html, json, os, threading, functools, http.server
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'sample')
os.makedirs(os.path.join(OUT, 'thumb'), exist_ok=True)

# id, 업종, 상호(가림), 지역(시도, 시군구, 동), 형식, 색(강조, 바탕: light|dark), 사진(public/ind), 제목, 한 줄, 핵심 4, 서비스 표, FAQ
S = [
    dict(id='hasugu', ind='하수구막힘', name='○○하수구', reg=('경기', '수원시 장안구', '정자동'), type='지역', acc='#1f5cff', bg='light', img='',
         title='정자동 하수구막힘·배관청소 출장 업체', lead='싱크대·변기·욕실 하수구가 막혔을 때 정자동과 장안구 전 지역으로 출동합니다. 내시경으로 막힌 위치를 확인한 뒤 작업합니다.',
         pts=['정자동·천천동·율전동 출동', '배관 내시경으로 원인 확인', '작업 전 견적 먼저 안내', '작업 후 사진으로 결과 보고'],
         rows=[('싱크대 막힘', '음식물·기름 찌꺼기 제거, 배관 세척'), ('변기 막힘', '이물질 제거, 역류 원인 점검'), ('욕실 배수구', '머리카락·비누 찌꺼기 제거'), ('정기 배관 청소', '상가·식당 고압 세척')],
         faq=[('밤에도 출동하나요?', '야간에도 상담을 받고 가능한 시간을 바로 안내합니다.'), ('비용은 언제 알 수 있나요?', '현장에서 막힌 위치를 확인한 뒤 작업 전에 안내합니다.')]),
    dict(id='nusu', ind='누수탐지', name='○○누수설비', reg=('서울', '강동구', '고덕동'), type='상품', acc='#00a3a3', bg='dark', img='',
         title='고덕동 누수탐지 전문업체 — 아랫집 천장 얼룩부터 확인', lead='배관 누수, 욕실 방수층 누수, 보일러 배관 누수를 장비로 찾고 필요한 부분만 고칩니다. 바닥을 크게 깨지 않는 방식부터 검토합니다.',
         pts=['청음·열화상 장비 탐지', '누수 위치 사진 보고', '부분 보수 우선 검토', '보험 청구용 자료 정리'],
         rows=[('누수 탐지', '청음식·가스식·열화상 장비로 위치 확인'), ('배관 교체', '누수 구간만 잘라 교체'), ('욕실 방수', '줄눈·방수층 보수'), ('보일러 배관', '난방 배관 누수 점검')],
         faq=[('아랫집 피해도 처리되나요?', '일상배상책임 보험 청구에 필요한 사진·소견서를 정리해 드립니다.'), ('탐지만 받을 수도 있나요?', '탐지만 진행하고 보수는 따로 결정하셔도 됩니다.')]),
    dict(id='doorlock', ind='도어락', name='○○열쇠', reg=('서울', '노원구', '상계동'), type='상품', acc='#ff8a00', bg='dark', img='',
         title='상계동 도어락 설치·교체 출장 — 문 열림부터 번호 변경까지', lead='현관 도어락 교체, 번호키 고장, 문 잠김 출장을 상계동과 노원구 전 지역에서 합니다. 문 두께와 타공을 확인한 뒤 맞는 제품을 권합니다.',
         pts=['상계동·중계동·하계동 출장', '문 두께·타공 확인 후 제품 추천', '기존 도어락 철거 포함', '설치 후 사용법 안내'],
         rows=[('도어락 교체', '번호키·지문·카드형 교체'), ('문 잠김 출장', '비파괴 개문 우선'), ('보조키 설치', '방화문·철문 보조키'), ('번호·카드 등록', '사용자 등록, 초기화')],
         faq=[('제품을 직접 사 와도 되나요?', '문에 맞는지 확인한 뒤 설치만 진행할 수 있습니다.'), ('본인 확인은 어떻게 하나요?', '개문 전 거주 확인 서류를 확인합니다.')]),
    dict(id='julnun', ind='줄눈 시공', name='○○줄눈', reg=('경기', '부천시 소사구', '송내동'), type='블로그', acc='#7a5cff', bg='light', img='interior',
         title='송내동 욕실 줄눈 시공 후기 — 곰팡이 줄눈을 케라폭시로 바꾼 날', lead='입주 3년 차 아파트 욕실의 검게 변한 줄눈을 긁어내고 케라폭시로 다시 채운 과정입니다. 시공 전 확인할 점과 양생 시간도 함께 적었습니다.',
         pts=['기존 줄눈 제거 깊이', '케라폭시와 폴리우레아 차이', '양생 시간과 사용 시점', '시공 후 관리법'],
         rows=[('욕실 바닥·벽', '케라폭시 줄눈'), ('현관', '폴리우레아 줄눈'), ('주방 벽', '오염 방지 줄눈'), ('베란다', '곰팡이 방지 시공')],
         faq=[('시공 당일 샤워해도 되나요?', '재료에 따라 다르며, 시공 후 양생 시간을 안내해 드립니다.'), ('색은 고를 수 있나요?', '샘플을 보고 타일 색에 맞춰 고르실 수 있습니다.')]),
    dict(id='boiler', ind='보일러 교체', name='○○보일러', reg=('경기', '성남시 수정구', '금토동'), type='상품', acc='#ff5a1f', bg='light', img='',
         title='금토동 보일러 교체 시기 — 10년 넘은 보일러, 이런 증상이면 교체', lead='온수가 들쭉날쭉하거나 에러 코드가 자주 뜨면 교체 시기일 수 있습니다. 집 평수와 사용량에 맞는 용량을 먼저 계산해 드립니다.',
         pts=['평수·사용량 기준 용량 계산', '친환경 보일러 보조금 안내', '기존 보일러 철거·수거', '설치 후 시운전 확인'],
         rows=[('보일러 교체', '콘덴싱·친환경 보일러'), ('온수 고장 점검', '에러 코드 확인, 부품 교체'), ('배관 청소', '난방 배관 슬러지 제거'), ('분배기 교체', '방별 난방 조절')],
         faq=[('보조금을 받을 수 있나요?', '지자체 친환경 보일러 지원 대상인지 확인해 드립니다.'), ('설치는 얼마나 걸리나요?', '일반 가정은 보통 반나절 안에 끝납니다.')]),
    dict(id='cheolgeo', ind='철거', name='○○철거', reg=('서울', '구로구', '가리봉동'), type='지역', acc='#e0b000', bg='dark', img='construction',
         title='가리봉동 부분철거·원상복구 견적', lead='상가 원상복구, 인테리어 전 부분철거, 폐기물 처리까지 한 번에 진행합니다. 현장을 보고 철거 범위와 폐기물 양을 먼저 정리합니다.',
         pts=['구로구·금천구·영등포구 현장', '철거 범위 사진 견적', '폐기물 분리 배출', '원상복구 후 관리사무소 확인'],
         rows=[('상가 원상복구', '칸막이·천장·바닥 철거'), ('부분철거', '주방·욕실·붙박이장'), ('폐기물 처리', '분리·운반·처리'), ('간판 철거', '외부 간판, 실내 사인')],
         faq=[('견적은 방문해야 하나요?', '사진으로 먼저 대략 안내하고, 필요하면 현장을 봅니다.'), ('야간 작업도 되나요?', '건물 규정에 맞춰 가능한 시간을 협의합니다.')]),
    dict(id='isa', ind='보관이사', name='○○물류', reg=('경기', '과천시', '문원동'), type='블로그', acc='#0b7cff', bg='light', img='moving',
         title='문원동 보관이사 — 입주일이 안 맞을 때 짐을 맡기는 방법', lead='이사 날짜와 입주 날짜 사이가 비면 짐을 컨테이너에 보관했다가 새집으로 옮깁니다. 보관 기간, 습도 관리, 비용 구성을 순서대로 정리했습니다.',
         pts=['보관 기간별 비용 구성', '항온·항습 창고 여부', '파손 보상 범위', '입고·출고 날짜 정하기'],
         rows=[('보관이사', '포장 → 보관 → 새집 배송'), ('단기 보관', '1주~1개월 컨테이너'), ('장기 보관', '1개월 이상 창고'), ('짐 일부 보관', '가구·가전만 따로')],
         faq=[('보관 중에 짐을 꺼낼 수 있나요?', '미리 연락 주시면 일부 출고를 협의할 수 있습니다.'), ('보관료는 어떻게 정해지나요?', '짐 양(컨테이너 크기)과 기간으로 정해집니다.')]),
    dict(id='cheongso', ind='입주청소', name='○○클린', reg=('인천', '연수구', '송도동'), type='지역', acc='#13a36b', bg='light', img='',
         title='송도동 입주청소·이사청소 — 새 아파트 분진부터 창틀까지', lead='신축 입주 전 공사 분진, 스티커 자국, 창틀 먼지를 정리합니다. 평수와 구조를 알려주시면 작업 인원과 시간을 먼저 안내합니다.',
         pts=['송도·연수·동춘 전 지역', '평수별 인원·시간 안내', '친환경 세제 사용', '작업 후 점검표 확인'],
         rows=[('입주청소', '신축 분진·스티커 제거'), ('이사청소', '거주 흔적·주방 기름때'), ('거주청소', '부분 청소, 정기 청소'), ('준공청소', '상가·사무실')],
         faq=[('사람이 있어도 되나요?', '빈집 작업을 권하지만 협의해서 진행할 수 있습니다.'), ('끝나고 확인하나요?', '점검표로 같이 확인하고 부족한 곳은 바로 다시 합니다.')]),
    dict(id='sofa', ind='소파 리폼', name='○○소파', reg=('세종', '세종시', '반곡동'), type='상품', acc='#b5651d', bg='light', img='interior',
         title='반곡동 가죽소파 리폼·소파 천갈이 복원 상담', lead='해지고 갈라진 가죽, 꺼진 방석, 늘어진 천을 새로 갈아 씁니다. 가죽·패브릭 샘플을 가져가 집에서 고르실 수 있습니다.',
         pts=['가죽·패브릭 샘플 방문', '방석 스펀지 교체', '프레임 보강', '수거·배송 포함 견적'],
         rows=[('가죽 천갈이', '천연·인조가죽 교체'), ('패브릭 천갈이', '기능성 원단 교체'), ('스펀지 교체', '꺼진 방석 복원'), ('부분 수선', '찢어진 부분 보수')],
         faq=[('작업 기간은 얼마나 걸리나요?', '소파 크기와 원단에 따라 다르며 상담 때 안내합니다.'), ('새로 사는 것보다 나은가요?', '프레임 상태가 좋으면 리폼이 유리한 경우가 많습니다.')]),
    dict(id='lawyer', ind='이혼 소송', name='법률사무소 ○○', reg=('서울', '서초구', '서초동'), type='블로그', acc='#1c3d7a', bg='light', img='lawfirm',
         title='서초동 이혼 소송 — 재산분할 전에 먼저 정리할 서류', lead='협의이혼과 재판이혼의 차이, 재산분할 대상이 되는 재산, 상담 전에 챙기면 좋은 자료를 정리했습니다.',
         pts=['협의이혼과 재판이혼', '재산분할 대상 재산', '양육권·양육비 기준', '상담 전 준비 서류'],
         rows=[('협의이혼', '숙려기간, 협의서 작성'), ('재판이혼', '소장 작성, 증거 정리'), ('재산분할', '기여도, 분할 비율'), ('양육권', '양육비 산정 기준')],
         faq=[('상담 비용이 있나요?', '첫 상담 방식과 비용은 예약 때 안내합니다.'), ('상대방 모르게 상담할 수 있나요?', '상담 내용은 비밀이 지켜집니다.')]),
    dict(id='sadari', ind='사다리차', name='○○사다리차', reg=('대전', '서구', '둔산동'), type='지역', acc='#f2c200', bg='dark', img='',
         title='둔산동 사다리차 — 이삿짐·가구·자재 올리고 내리기', lead='아파트 고층 이삿짐, 가구 한 점, 공사 자재 양중까지 시간 단위로 작업합니다. 층수와 진입로를 알려주시면 맞는 장비를 보냅니다.',
         pts=['둔산·탄방·월평 출동', '층수별 장비 배정', '가구 한 점도 작업', '진입로 사전 확인'],
         rows=[('이삿짐 사다리차', '고층 아파트 이사'), ('가구 한 점', '침대·소파·냉장고'), ('자재 양중', '인테리어 자재'), ('스카이차', '간판·외벽 작업')],
         faq=[('몇 층까지 되나요?', '장비에 따라 다르며 층수를 알려주시면 안내합니다.'), ('당일 예약도 되나요?', '장비가 비어 있으면 당일도 가능합니다.')]),
    dict(id='water', ind='정수기 렌탈', name='○○정수기', reg=('대구', '수성구', '수성동1가'), type='상품', acc='#0091ea', bg='light', img='',
         title='수성동 정수기 렌탈 — 직수형·탱크형 비교와 관리 주기', lead='직수형과 탱크형의 차이, 필터 교체 주기, 방문 관리와 셀프 관리의 차이를 비교해 고르실 수 있게 정리했습니다.',
         pts=['직수형·탱크형 비교', '필터 교체 주기 안내', '방문·셀프 관리 선택', '설치 공간 사전 확인'],
         rows=[('냉온정수기', '사무실·가정용'), ('정수 전용', '소형 직수형'), ('얼음정수기', '대용량'), ('필터 관리', '정기 방문 점검')],
         faq=[('설치비가 있나요?', '제품과 약정 조건에 따라 다르며 상담 때 안내합니다.'), ('이사하면 어떻게 하나요?', '이전 설치를 신청하시면 됩니다.')]),
]
TYPE = {'상품': '상품소개형', '지역': '지역형', '블로그': '블로그형'}
E = html.escape
J = lambda w, a, b: a if (ord(w[-1]) - 0xAC00) % 28 else b  # 받침 있으면 a

CSS = '''*{box-sizing:border-box}body{margin:0;font-family:"Pretendard Variable",Pretendard,"Malgun Gothic",sans-serif;color:var(--t);background:var(--bg);line-height:1.65}
a{color:inherit;text-decoration:none}.w{max-width:1080px;margin:0 auto;padding:0 28px}
.top{background:var(--acc);color:var(--on);font-size:13px;font-weight:700;text-align:center;padding:7px}
.hd{border-bottom:1px solid var(--ln);background:var(--hd)}.hd .w{display:flex;align-items:center;gap:26px;height:64px}
.lg{display:flex;align-items:center;gap:9px;font-weight:900;font-size:19px;color:var(--h)}.lg i{width:30px;height:30px;border-radius:7px;background:var(--acc);display:block}
.nv{display:flex;gap:22px;font-size:14px;color:var(--m);flex:1}.tel{background:var(--acc);color:var(--on);font-weight:800;padding:9px 16px;border-radius:6px;font-size:14px}
.bc{font-size:13px;color:var(--m);padding:16px 0 6px}.bd{display:inline-block;font-size:12px;font-weight:800;color:var(--acc);border:1px solid var(--acc);padding:3px 9px;border-radius:4px;margin:6px 0 10px}
h1{font-size:34px;line-height:1.3;margin:0 0 12px;color:var(--h);letter-spacing:-.02em}.ld{font-size:16.5px;color:var(--m);max-width:780px;margin:0 0 20px}
.box{border:1px solid var(--ln);border-left:4px solid var(--acc);background:var(--bx);padding:16px 20px;border-radius:6px;margin:0 0 22px}.box b{color:var(--h)}
.pts{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 24px}.pts div{background:var(--bx);border:1px solid var(--ln);border-radius:6px;padding:14px;font-weight:700;font-size:14px;color:var(--h)}.pts small{display:block;color:var(--acc);font-weight:900;font-size:12px;margin-bottom:4px}
.ban{position:relative;height:300px;border-radius:8px;overflow:hidden;background:var(--acc);margin:0 0 26px;display:flex;align-items:flex-end}
.ban img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.ban:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.72),rgba(0,0,0,.1))}
.ban div{position:relative;z-index:1;padding:30px 34px;color:#fff}.ban b{display:block;font-size:34px;line-height:1.2;font-weight:900}.ban span{font-size:15px;opacity:.9}
.ban.flat{background:linear-gradient(120deg,var(--acc),#0b1220)}.ban.flat:after{display:none}
h2{font-size:22px;color:var(--h);margin:30px 0 12px}table{width:100%;border-collapse:collapse;font-size:15px}td,th{border-bottom:1px solid var(--ln);padding:12px 10px;text-align:left}th{width:200px;color:var(--h)}
.near{display:flex;flex-wrap:wrap;gap:8px}.near span{border:1px solid var(--ln);padding:6px 12px;border-radius:4px;font-size:14px;background:var(--bx)}
.faq div{border-bottom:1px solid var(--ln);padding:12px 0}.faq b{color:var(--h)}.faq p{margin:4px 0 0;color:var(--m)}
.meta{font-size:13px;color:var(--m);margin:-4px 0 18px}.art p{font-size:16px;margin:0 0 14px}
.bar{position:fixed;left:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:10px 28px;background:var(--hd);border-top:1px solid var(--ln)}
.bar a{padding:12px;text-align:center;font-weight:800;border-radius:6px;font-size:15px}.bar a:nth-child(1){background:var(--acc);color:var(--on)}.bar a:nth-child(2){background:#fee500;color:#191600}.bar a:nth-child(3){background:var(--h);color:var(--bg)}
.ft{font-size:14px;color:var(--m);border-top:1px solid var(--ln);margin-top:40px;padding:22px 28px 110px}.ft a{color:var(--acc);font-weight:800}
@media(max-width:720px){.w{padding:0 16px}.nv{display:none}.hd .w{height:56px;justify-content:space-between}.tel{padding:7px 10px;font-size:12px}h1{font-size:25px}.ld{font-size:15px}.pts{grid-template-columns:1fr 1fr}.ban{height:200px}.ban b{font-size:25px}.ban div{padding:20px}th{width:110px}.bar{padding:8px 10px;gap:6px}.bar a{padding:11px 4px;font-size:14px}.ex{top:auto;bottom:66px;right:10px}}
.ex{position:fixed;top:44px;right:18px;background:#111;color:#fff;font-size:12px;font-weight:800;padding:5px 10px;border-radius:4px;opacity:.85}'''


def page(s):
    sd, sg, dong = s['reg']
    dark = s['bg'] == 'dark'
    v = dict(acc=s['acc'], on='#111' if s['acc'] in ('#e0b000', '#f2c200', '#ff8a00') else '#fff',
             bg='#0f141c' if dark else '#ffffff', hd='#141b25' if dark else '#ffffff', bx='#18212d' if dark else '#f6f8fb',
             ln='#263243' if dark else '#e4e8ee', h='#ffffff' if dark else '#111827', t='#c9d2de' if dark else '#2b3442', m='#94a3b8' if dark else '#5b6676')
    root = ':root{' + ';'.join(f'--{k}:{x}' for k, x in v.items()) + '}'
    img = f'<img src="/ind/{s["img"]}.jpg" alt="{E(s["ind"])} 작업 사진">' if s['img'] else ''
    ban = f'<div class="ban{"" if img else " flat"}">{img}<div><b>{E(s["ind"])}, 걱정 끝</b><span>{E(dong)} · {E(sg)} 전 지역 상담</span></div></div>'
    near = ''.join(f'<span>{E(x)}</span>' for x in [dong, sg, sd + ' 전 지역', s['ind'] + ' 상담', s['ind'] + ' 견적'])
    rows = ''.join(f'<tr><th>{E(a)}</th><td>{E(b)}</td></tr>' for a, b in s['rows'])
    faq = ''.join(f'<div><b>Q. {E(q)}</b><p>{E(a)}</p></div>' for q, a in s['faq'])
    pts = ''.join(f'<div><small>0{i + 1}</small>{E(p)}</div>' for i, p in enumerate(s['pts']))
    head = f'''<div class="bc">홈 › {E(sd)} › {E(sg)} › {E(dong)}</div><span class="bd">{E(sd)} {E(sg)} {E(dong)} {E(s["ind"])}</span><h1>{E(s["title"])}</h1>'''
    if s['type'] == '블로그':
        body = f'''{head}<p class="meta">{E(s["name"])} · 작성일 2026.11.○○</p><div class="art"><p>{E(s["lead"])}</p></div>{ban}
<h2>이 글에서 다루는 것</h2><div class="pts">{pts}</div><div class="art"><p>{E(dong)} 근처에서 {E(s["ind"])}{J(s["ind"], "을", "를")} 알아보는 분들이 가장 많이 묻는 내용부터 정리했습니다.</p></div>
<h2>서비스 구성</h2><table>{rows}</table><h2>자주 묻는 질문</h2><div class="faq">{faq}</div>'''
    elif s['type'] == '지역':
        body = f'''{head}<p class="ld">{E(s["lead"])}</p>{ban}<div class="box"><b>{E(dong)} {E(s["ind"])}</b> — {E(sg)} 전 지역 상담. 위치와 증상을 알려주시면 가능한 시간을 바로 안내합니다.</div>
<div class="pts">{pts}</div><h2>출동 지역</h2><div class="near">{near}</div><h2>작업 항목</h2><table>{rows}</table><h2>자주 묻는 질문</h2><div class="faq">{faq}</div>'''
    else:
        body = f'''{head}<p class="ld">{E(s["lead"])}</p>{ban}<div class="pts">{pts}</div><div class="box"><b>{E(s["ind"])} 상담</b> — 사진이나 상황을 보내주시면 작업 범위와 견적을 먼저 안내합니다.</div>
<h2>서비스 안내</h2><table>{rows}</table><h2>자주 묻는 질문</h2><div class="faq">{faq}</div>'''
    return f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>{E(s["title"])} (예시)</title><style>{root}{CSS}</style></head><body>
<div class="top">{E(sd)} {E(sg)} {E(s["ind"])} 상담 · 견적 먼저 안내</div>
<header class="hd"><div class="w"><a class="lg"><i></i>{E(s["name"])}</a><nav class="nv"><a>서비스 안내</a><a>작업 사례</a><a>출동 지역</a><a>자주 묻는 질문</a></nav><a class="tel">010-○○○○-○○○○</a></div></header>
<main class="w">{body}</main><footer class="ft w"><b>업종별 예시 페이지입니다.</b> 실제 업체가 아니며 상호·전화번호는 가렸습니다. 이런 페이지를 사장님 업종·지역마다 만들어 드립니다. <a href="/">제작 상담 →</a></footer><div class="bar"><a>전화 상담</a><a>카톡 상담</a><a>견적 문의</a></div><div class="ex">예시 화면</div></body></html>'''


PUB = os.path.join(ROOT, 'public')
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(type('Q', (http.server.SimpleHTTPRequestHandler,), {'log_message': lambda *a: None}), directory=PUB))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_port}'
meta = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome')
    pg = b.new_page(viewport={'width': 1280, 'height': 820})
    for s in S:
        d = os.path.join(OUT, s['id'])
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(page(s))
        pg.goto(f'{BASE}/sample/{s["id"]}/', wait_until='networkidle')
        pg.add_style_tag(content='.bar,.ex{display:none}')
        png = os.path.join(d, '_s.png')
        pg.screenshot(path=png)
        dst = os.path.join(OUT, 'thumb', s['id'] + '.jpg')
        Image.open(png).convert('RGB').resize((800, 513), Image.LANCZOS).save(dst, quality=78, optimize=True)
        os.remove(png)
        sd, sg, dong = s['reg']
        meta.append({'id': s['id'], 'href': f'/sample/{s["id"]}/', 'img': f'/sample/thumb/{s["id"]}.jpg', 'region': f'{sd} · {sg} · {dong}', 'title': f'{s["ind"]} {TYPE[s["type"]]} 페이지', 'type': TYPE[s['type']]})
        print(s['id'], os.path.getsize(dst) // 1024, 'KB')
    b.close()
srv.shutdown()
json.dump(meta, open(os.path.join(ROOT, 'data', 'samples.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
