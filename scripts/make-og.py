# make-og.py: branded 1200x630 share images for florra.net (run locally; output committed in assets/og/)
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
import json
W, H = 1200, 630
FOREST = (32, 44, 35); PAPER = (239, 233, 220); MUTED = (201, 204, 189); COPPER = (214, 120, 92)
FABLE = 'assets/fonts/fable-dust.ttf'
SANS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
def f(path, size): return ImageFont.truetype(path, size)
def shadow_text(img, xy, text, font, fill, blur=10, offset=(0, 6), alpha=170):
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    d.text((xy[0] + offset[0], xy[1] + offset[1]), text, font=font, fill=(0, 0, 0, alpha))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(img).text(xy, text, font=font, fill=fill)
def fit(text, path, size, maxw):
    while size > 20 and f(path, size).getlength(text) > maxw: size -= 2
    return f(path, size)

# site card
bg = ImageOps.fit(Image.open('assets/california-hills.jpg').convert('RGB'), (W, H))
img = Image.blend(bg, Image.new('RGB', (W, H), FOREST), 0.62).convert('RGBA')
grad = Image.linear_gradient('L').resize((W, H)); img.alpha_composite(Image.merge('RGBA', [Image.new('L', (W, H), c) for c in FOREST] + [grad.point(lambda v: int(v * .8))]))
try:
    rose = Image.open('assets/rose-botanical.png').convert('RGBA'); rose.thumbnail((520, 620)); img.alpha_composite(rose, (W - rose.width - 30, H - rose.height + 40))
except FileNotFoundError: pass
d = ImageDraw.Draw(img)
d.text((72, 92), 'CREATOR MANAGEMENT · BASED ONLINE', font=f(SANS, 22), fill=MUTED)
shadow_text(img, (66, 150), 'florra', f(FABLE, 190), PAPER, blur=14, offset=(0, 10))
shadow_text(img, (72, 400), 'a small roster, growing with purpose.', f(FABLE, 46), PAPER)
d.text((72, 500), 'Ridgeclub  ·  Ebril  ·  McKayla Maroney', font=f(SANS, 30), fill=PAPER)
d.text((72, 548), 'Maxwell Flohr  ·  max@florra.net', font=f(SANS, 24), fill=MUTED)
img.convert('RGB').save('assets/og/florra.jpg', quality=88)

# artist cards
for a in json.load(open('data/artists.json')):
    img = Image.new('RGBA', (W, H), FOREST + (255,))
    ph = Image.open('.' + a['img']).convert('RGB')
    px, py = [float(v.strip('%')) / 100 for v in a['pos'].split()]
    img.paste(ImageOps.fit(ph, (504, H), centering=(px, py)), (0, 0))
    x = 560; d = ImageDraw.Draw(img)
    d.text((x, 96), 'CREATOR MANAGEMENT · FLORRA', font=f(SANS, 22), fill=MUTED)
    shadow_text(img, (x - 4, 140), a['lower'], fit(a['lower'], FABLE, 120, W - x - 50), PAPER, blur=12, offset=(0, 8))
    shadow_text(img, (x, 300), 'management & contact', f(FABLE, 52), PAPER)
    d.line((x, 410, W - 60, 410), fill=(80, 92, 82), width=2)
    d.text((x, 438), 'Manager', font=f(SANS, 22), fill=MUTED)
    d.text((x + 170, 432), 'Maxwell Flohr, Florra', font=f(SANS, 30), fill=PAPER)
    d.text((x, 492), 'Contact', font=f(SANS, 22), fill=MUTED)
    d.text((x + 170, 486), 'max@florra.net', font=f(SANS, 30), fill=PAPER)
    if a.get('credit'): d.text((16, H - 34), 'photo: ' + a['credit'].lower(), font=f(SANS, 16), fill=PAPER)
    img.convert('RGB').save(f"assets/og/{a['slug']}.jpg", quality=88)
print('og images written')
