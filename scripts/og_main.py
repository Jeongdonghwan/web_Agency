"""메인 썸네일(og:image, 1200×630) 두 장 — 본 사이트(public/og/main.jpg)와 포춘마케팅(public/og/main-fortune.jpg).
카톡·네이버 미리보기는 가운데를 잘라 보여 주므로 글자는 가운데 넓이 안에 둔다.

  python -I -X utf8 scripts/og_main.py
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
B = r'C:\Windows\Fonts\malgunbd.ttf'
R = r'C:\Windows\Fonts\malgun.ttf'


def make(path, bg, hi, brand, sub, chip_bg, chip_fg):
    im = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(im)
    f1, f2, f3, fb = ImageFont.truetype(B, 92), ImageFont.truetype(B, 92), ImageFont.truetype(R, 34), ImageFont.truetype(B, 34)
    lines = [('사장님, 내 업체를', '#ffffff', f1), ('전국에 홍보하세요!', hi, f2)]
    y = 150
    for t, c, f in lines:
        w = d.textlength(t, font=f)
        d.text(((W - w) / 2, y), t, font=f, fill=c)
        y += 118
    w = d.textlength(sub, font=f3)
    d.text(((W - w) / 2, y + 22), sub, font=f3, fill='#c9d6e6')
    bw = d.textlength(brand, font=fb) + 56
    x0, y0 = (W - bw) / 2, 500
    d.rounded_rectangle((x0, y0, x0 + bw, y0 + 62), radius=31, fill=chip_bg)
    d.text((x0 + 28, y0 + 9), brand, font=fb, fill=chip_fg)
    im.save(path, quality=88, optimize=True)
    print(path)


make('public/og/main.jpg', '#0b1a33', '#6ea0ff', 'JD8 홈페이지·웹문서', '지역·키워드 검색 페이지 제작 · 네이버·구글 직접 등록', '#1f5cff', '#ffffff')
make('public/og/main-fortune.jpg', '#0c2a22', '#ffe14a', '포춘마케팅', '지역·키워드 검색 페이지 제작 · 클릭당 광고비 0원', '#ffe14a', '#14221c')
