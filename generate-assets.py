#!/usr/bin/env python3
"""程序化生成角色卡片和世界插画"""

import os, math
from PIL import Image, ImageDraw, ImageFont

CHAR_DIR = os.path.join(os.path.dirname(__file__), 'assets', 'characters')
WORLD_DIR = os.path.join(os.path.dirname(__file__), 'assets', 'worlds')
os.makedirs(CHAR_DIR, exist_ok=True)
os.makedirs(WORLD_DIR, exist_ok=True)

INK = '#1A1A2E'

chars = [
    ('01', 'average-joe', '普通人', 'Average Joe', '#FFCC80', '#5D4037', '#B0BEC5', '#E0E0E0', '🧑'),
    ('02', 'summa-cum-laude', '学霸', 'Summa Cum Laude', '#FFDBAC', '#1A1A1A', '#FFF9C4', '#FFF8E1', '🎓'),
    ('03', 'college-athlete', '运动员', 'College Athlete', '#8D5524', '#1A1A1A', '#4CAF50', '#E8F5E9', '🏋'),
    ('04', 'veteran', '退伍军人', 'Veteran', '#FFCC80', '#795548', '#546E7A', '#ECEFF1', '🇺🇸'),
    ('05', 'frugal-minimalist', '极简主义者', 'Frugal Minimalist', '#FFDBAC', '#8D6E63', '#EFEBE9', '#F5F5F5', '🧵'),
    ('06', 'union-worker', '工会成员', 'Union Worker', '#C68642', '#3E2723', '#1565C0', '#E3F2FD', '🛠'),
]

worlds = [
    ('w1', 'first-steps', '初入社会', 'First Steps', '#87CEEB', '#4CAF50', '🏫'),
    ('w2', 'the-hustle', '奋斗爬升', 'The Hustle', '#90CAF9', '#2196F3', '🏙'),
    ('w3', 'settling-down', '成家立业', 'Settling Down', '#FFCC80', '#FF9800', '🏡'),
    ('w4', 'the-system', '系统博弈', 'The System', '#7E57C2', '#9C27B0', '🏦'),
    ('w5', 'the-cut-line', '斩杀线', 'The Cut Line', '#B71C1C', '#F44336', '🔴'),
]


def draw_char_card(cid, slug, cn, en, skin, hair, shirt, bg, emoji):
    w, h = 512, 512
    img = Image.new('RGB', (w, h), bg)
    d = ImageDraw.Draw(img)

    # 粗黑边框
    d.rectangle([4, 4, w - 5, h - 5], outline=INK, width=8)

    cx, cy = w // 2, 180
    # 头发
    d.ellipse([cx - 84, cy - 100, cx + 84, cy + 20], fill=hair)
    # 脸
    d.ellipse([cx - 80, cy - 80, cx + 80, cy + 80], fill=skin, outline=INK, width=4)
    # 眼睛
    d.ellipse([cx - 43, cy - 30, cx - 7, cy + 2], fill='white', outline=INK, width=2)
    d.ellipse([cx + 7, cy - 30, cx + 43, cy + 2], fill='white', outline=INK, width=2)
    d.ellipse([cx - 30, cy - 18, cx - 14, cy - 2], fill=INK)
    d.ellipse([cx + 14, cy - 18, cx + 30, cy - 2], fill=INK)
    # 嘴
    d.arc([cx - 20, cy + 10, cx + 20, cy + 50], start=10, end=170, fill=INK, width=3)
    # 身体
    d.rectangle([cx - 60, cy + 90, cx + 60, cy + 190], fill=shirt, outline=INK, width=4)

    # 文字
    try:
        f_cn = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 28)
        f_en = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 18)
    except:
        f_cn = ImageFont.load_default()
        f_en = ImageFont.load_default()

    d.text((cx, 430), cn, fill=INK, font=f_cn, anchor='mt')
    d.text((cx, 465), en, fill=INK, font=f_en, anchor='mt')
    d.text((cx, 500), emoji, fill=INK, font=f_en, anchor='mt')

    path = os.path.join(CHAR_DIR, f'char-{cid}-{slug}.png')
    img.save(path)
    print(f'  ✅ char-{cid}: {cn}')


def draw_world_card(wid, slug, cn, en, sky, ground, emoji):
    w, h = 800, 400
    img = Image.new('RGB', (w, h), sky)
    d = ImageDraw.Draw(img)

    # 渐变（用色块模拟）
    for y in range(h):
        r = int((1 - y / h) * 0)
        g = int((1 - y / h) * 0)
        b = int((1 - y / h) * 30)
        d.line([(0, y), (w, y)], fill=f'#{r:02x}{g:02x}{b:02x}')

    # 建筑剪影
    import random
    random.seed(wid)
    for i in range(15):
        bx = i * 55 + random.randint(0, 10)
        bh = 60 + random.randint(0, 150)
        bw = 30 + random.randint(0, 40)
        d.rectangle([bx, h - 80 - bh, bx + bw, h - 80], fill=INK)

    # 地面
    d.rectangle([0, h - 30, w, h], fill=INK)
    # 边框
    d.rectangle([3, 3, w - 4, h - 4], outline=INK, width=6)

    try:
        f_cn = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 36)
        f_en = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 20)
    except:
        f_cn = ImageFont.load_default()
        f_en = ImageFont.load_default()

    d.text((w // 2, 50), cn, fill='white', font=f_cn, anchor='mt')
    d.text((w // 2, 90), en, fill='white', font=f_en, anchor='mt')
    d.text((w // 2, 160), emoji, fill='white', font=f_cn, anchor='mt')

    path = os.path.join(WORLD_DIR, f'world-{wid}-{slug}.png')
    img.save(path)
    print(f'  ✅ world-{wid}: {cn}')


if __name__ == '__main__':
    print('Generating character cards...')
    for c in chars:
        draw_char_card(*c)

    print('Generating world illustrations...')
    for w in worlds:
        draw_world_card(*w)

    print(f'\n🎨 Done!')
    print(f'   Characters: {CHAR_DIR}/')
    print(f'   Worlds: {WORLD_DIR}/')
