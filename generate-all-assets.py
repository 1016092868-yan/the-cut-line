#!/usr/bin/env python3
"""
批量生成游戏图像资产
- 20个角色卡片（精细PvZ漫画风格）
- 5个世界场景插画
- 5个收集品图标
- 6个障碍物图标
- UI装饰元素
"""

import os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = os.path.dirname(__file__)
CHAR_DIR = os.path.join(BASE, 'assets', 'characters')
WORLD_DIR = os.path.join(BASE, 'assets', 'worlds')
ITEM_DIR = os.path.join(BASE, 'assets', 'items')
UI_DIR = os.path.join(BASE, 'assets', 'ui')

for d in [CHAR_DIR, WORLD_DIR, ITEM_DIR, UI_DIR]:
    os.makedirs(d, exist_ok=True)

INK = '#1A1A2E'
WHITE = '#FFFFFF'
GOLD = '#FFD700'

# 字体
try:
    FONT_CN = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 28)
    FONT_CN_SM = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 18)
    FONT_CN_LG = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 36)
    FONT_EN = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 16)
    FONT_EN_SM = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 12)
except:
    FONT_CN = FONT_CN_SM = FONT_CN_LG = FONT_EN = FONT_EN_SM = ImageFont.load_default()

# ============================================================
# 工具函数
# ============================================================

def thick_rect(draw, xy, fill=None, outline=INK, width=6):
    """粗边框矩形"""
    draw.rectangle(xy, fill=fill, outline=outline, width=width)

def draw_face(draw, cx, cy, skin, hair, expression='neutral'):
    """绘制漫画风格面部"""
    # 头发（后层）
    draw.ellipse([cx-86, cy-102, cx+86, cy+22], fill=hair)
    # 脸
    draw.ellipse([cx-80, cy-80, cx+80, cy+80], fill=skin, outline=INK, width=4)
    # 眼睛
    draw.ellipse([cx-45, cy-32, cx-5, cy+0], fill=WHITE, outline=INK, width=2)
    draw.ellipse([cx+5, cy-32, cx+45, cy+0], fill=WHITE, outline=INK, width=2)
    draw.ellipse([cx-32, cy-20, cx-14, cy-2], fill=INK)
    draw.ellipse([cx+14, cy-20, cx+32, cy-2], fill=INK)
    # 眉毛
    draw.line([cx-46, cy-42, cx-24, cy-38], fill=INK, width=3)
    draw.line([cx+24, cy-38, cx+46, cy-42], fill=INK, width=3)
    # 嘴
    if expression == 'smile':
        draw.arc([cx-22, cy+12, cx+22, cy+52], start=10, end=170, fill=INK, width=3)
    elif expression == 'tired':
        draw.arc([cx-18, cy+20, cx+18, cy+48], start=0, end=180, fill=INK, width=3)
    elif expression == 'determined':
        draw.line([cx-18, cy+38, cx+18, cy+38], fill=INK, width=3)
    elif expression == 'confident':
        draw.arc([cx-22, cy+8, cx+22, cy+48], start=20, end=160, fill=INK, width=3)
    else:
        draw.arc([cx-20, cy+18, cx+20, cy+48], start=5, end=175, fill=INK, width=3)

def draw_body(draw, cx, cy, color, style='standard', accent=None):
    """绘制身体"""
    if style == 'standard':
        draw.rectangle([cx-55, cy, cx+55, cy+90], fill=color, outline=INK, width=4)
        # 领口V形
        draw.line([cx-20, cy, cx, cy+25], fill=INK, width=2)
        draw.line([cx+20, cy, cx, cy+25], fill=INK, width=2)
    elif style == 'suit':
        draw.rectangle([cx-55, cy, cx+55, cy+90], fill=color, outline=INK, width=4)
        # 领带
        draw.polygon([cx-5, cy, cx+5, cy, cx+2, cy+40, cx-2, cy+40], fill='#CC3333', outline=INK)
    elif style == 'hoodie':
        draw.rectangle([cx-55, cy, cx+55, cy+90], fill=color, outline=INK, width=4)
        # 兜帽线（用ellipse模拟）
        draw.ellipse([cx-50, cy-20, cx+50, cy+30], fill=None, outline=INK, width=3)
    elif style == 'labcoat':
        draw.rectangle([cx-55, cy, cx+55, cy+90], fill=WHITE, outline=INK, width=4)
        # 口袋
        draw.rectangle([cx-40, cy+40, cx-20, cy+60], outline=INK, width=2)
        draw.rectangle([cx+20, cy+40, cx+40, cy+60], outline=INK, width=2)
    elif style == 'athletic':
        draw.rectangle([cx-55, cy, cx+55, cy+90], fill=color, outline=INK, width=4)
        # 号码
        draw.text((cx, cy+35), '42', fill=INK, font=FONT_CN_SM, anchor='mm')

# ============================================================
# 1. 角色卡片（20个）
# ============================================================

CHARACTERS = [
    # id, slug, cn, en, skin, hair, shirt, bg, expression, body_style, emoji
    ('01', 'average-joe', '普通人', 'Average Joe', '#FFCC80', '#5D4037', '#B0BEC5', '#ECEFF1', 'neutral', 'standard', '🧑'),
    ('02', 'summa-cum-laude', '学霸毕业生', 'Summa Cum Laude', '#FFDBAC', '#1A1A1A', '#FFF9C4', '#FFF8E1', 'confident', 'standard', '🎓'),
    ('03', 'college-athlete', '大学运动员', 'College Athlete', '#8D5524', '#1A1A1A', '#4CAF50', '#E8F5E9', 'confident', 'athletic', '🏋'),
    ('04', 'veteran', '退伍军人', 'Veteran', '#FFCC80', '#795548', '#546E7A', '#ECEFF1', 'determined', 'suit', '🇺🇸'),
    ('05', 'frugal-minimalist', '极简主义者', 'Frugal Minimalist', '#FFDBAC', '#8D6E63', '#EFEBE9', '#F5F5F5', 'neutral', 'standard', '🧵'),
    ('06', 'union-worker', '工会成员', 'Union Worker', '#C68642', '#3E2723', '#1565C0', '#E3F2FD', 'determined', 'standard', '🛠'),
    ('07', 'immigrant-dreamer', '移民追梦人', 'Immigrant Dreamer', '#C68642', '#1A1A1A', '#FF5722', '#FFF3E0', 'determined', 'standard', '🌍'),
    ('08', 'single-parent', '单亲家长', 'Single Parent', '#FFCC80', '#4E342E', '#E91E63', '#FCE4EC', 'tired', 'standard', '🍼'),
    ('09', 'college-dropout', '辍学创业者', 'College Dropout', '#FFDBAC', '#FF9800', '#424242', '#FAFAFA', 'confident', 'hoodie', '🚀'),
    ('10', 'dink-couple', '丁克夫妇', 'DINK Couple', '#FFCC80', '#3E2723', '#9C27B0', '#F3E5F5', 'smile', 'suit', '💼'),
    ('11', 'the-networker', '人脉大师', 'The Networker', '#C68642', '#1A1A1A', '#00BCD4', '#E0F7FA', 'smile', 'suit', '🤝'),
    ('12', 'phd-holder', '博士学者', 'PhD Holder', '#FFDBAC', '#5D4037', '#FFFFFF', '#FFFDE7', 'tired', 'labcoat', '🎓'),
    ('13', 'night-shift-worker', '夜班打工人', 'Night Shift Worker', '#FFCC80', '#263238', '#37474F', '#263238', 'tired', 'standard', '🌙'),
    ('14', 'gig-economy', '零工之王', 'Gig Economy', '#8D5524', '#1A1A1A', '#FF6F00', '#FFF8E1', 'determined', 'hoodie', '🎰'),
    ('15', 'disabled-pro', '残障专业人士', 'Disabled Pro', '#FFCC80', '#4E342E', '#1A237E', '#E8EAF6', 'determined', 'suit', '🏥'),
    ('16', 'lucky-charm', '幸运星', 'Lucky Charm', '#FFDBAC', '#F9A825', '#2E7D32', '#E8F5E9', 'smile', 'standard', '🍀'),
    ('17', 'legacy-run', '轮回者', 'Legacy Run', '#E0E0E0', '#9E9E9E', '#B0BEC5', '#ECEFF1', 'neutral', 'standard', '👻'),
    ('18', 'trust-fund-baby', '富二代', 'Trust Fund Baby', '#FFCC80', '#FFD54F', '#FFF176', '#FFFDE7', 'smile', 'suit', '💰'),
    ('19', 'influencer', '网红博主', 'Influencer', '#FFDBAC', '#E91E63', '#FF4081', '#FCE4EC', 'smile', 'standard', '📱'),
    ('20', 'self-taught-genius', '自学天才', 'Self-Taught Genius', '#C68642', '#1A1A1A', '#FF9800', '#FFF3E0', 'confident', 'hoodie', '🔧'),
]

def generate_character_card(cid, slug, cn, en, skin, hair, shirt, bg, expr, body_style, emoji):
    w, h = 512, 640
    img = Image.new('RGB', (w, h), bg)
    d = ImageDraw.Draw(img)

    # 背景纹理
    for i in range(200):
        x, y = random.randint(0, w), random.randint(0, h)
        d.rectangle([x, y, x+2, y+2], fill=(0, 0, 0, 8))

    # 粗黑边框
    thick_rect(d, [6, 6, w-7, h-7], width=10)

    # 顶部色条
    d.rectangle([6, 6, w-7, 50], fill=shirt)

    # 角色名标签
    d.rectangle([20, 14, 200, 42], fill=INK)
    d.text((30, 28), cn, fill=GOLD, font=FONT_CN_SM)

    # 头部
    cx, cy = w//2, 200
    draw_face(d, cx, cy, skin, hair, expr)

    # 身体
    draw_body(d, cx, cy+90, shirt, body_style)

    # 腿部
    d.rectangle([cx-45, cy+180, cx-5, cy+260], fill='#37474F', outline=INK, width=3)
    d.rectangle([cx+5, cy+180, cx+45, cy+260], fill='#37474F', outline=INK, width=3)

    # 鞋子
    d.rectangle([cx-50, cy+258, cx-5, cy+275], fill='#212121', outline=INK, width=2)
    d.rectangle([cx+5, cy+258, cx+50, cy+275], fill='#212121', outline=INK, width=2)

    # 底部信息栏
    d.rectangle([6, h-100, w-7, h-7], fill=INK)
    d.text((w//2, h-70), cn, fill=WHITE, font=FONT_CN, anchor='mt')
    d.text((w//2, h-35), en, fill='#AAA', font=FONT_EN, anchor='mt')

    # emoji水印
    d.text((w-60, 60), emoji, fill=(0, 0, 0, 20), font=ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 48))

    path = os.path.join(CHAR_DIR, f'char-{cid}-{slug}.png')
    img.save(path, quality=90)
    return path

# ============================================================
# 2. 世界场景插画（5个）
# ============================================================

WORLDS = [
    ('w1', 'first-steps', '初入社会', 'First Steps', '#87CEEB', '#4CAF50', '#A5D6A7',
     ['🏫钟楼', '🌳树木', '🚶学生', '📚书本']),
    ('w2', 'the-hustle', '奋斗爬升', 'The Hustle', '#90CAF9', '#2196F3', '#BBDEFB',
     ['🏙摩天楼', '🚕出租车', '💼公文包', '☕咖啡']),
    ('w3', 'settling-down', '成家立业', 'Settling Down', '#FFCC80', '#FF9800', '#FFE0B2',
     ['🏡别墅', '🌅日落', '🚗SUV', '👨‍👩‍👧家庭']),
    ('w4', 'the-system', '系统博弈', 'The System', '#7E57C2', '#9C27B0', '#D1C4E9',
     ['🏦银行', '📉下跌', '🌧阴雨', '💻屏幕']),
    ('w5', 'the-cut-line', '斩杀线', 'The Cut Line', '#B71C1C', '#F44336', '#EF9A9A',
     ['🔴激光', '💀骷髅', '⏰倒计时', '🏃奔跑']),
]

def generate_world_card(wid, slug, cn, en, sky, ground, accent, icons):
    w, h = 800, 400
    img = Image.new('RGB', (w, h), sky)
    d = ImageDraw.Draw(img)

    # 天空渐变
    for y in range(h):
        r = int(0 + (y/h)*40)
        g = int(0 + (y/h)*20)
        b = int(0 + (y/h)*50)
        d.line([(0, y), (w, y)], fill=(r, g, b))

    # 太阳/月亮
    if wid in ('w1', 'w2', 'w3'):
        d.ellipse([w-150, 30, w-50, 130], fill='#FFF9C4', outline=None)
        d.ellipse([w-140, 40, w-60, 120], fill='#FFEB3B')
    elif wid == 'w4':
        d.ellipse([w-120, 50, w-60, 110], fill='#E1BEE7', outline=None)

    # 建筑剪影
    random.seed(wid)
    for i in range(18):
        bx = i * 48 + random.randint(-5, 10)
        bh = 50 + random.randint(0, 180)
        bw = 25 + random.randint(10, 40)
        # 窗户
        d.rectangle([bx, h-80-bh, bx+bw, h-80], fill=INK)
        for wy in range(h-80-bh+8, h-85, 15):
            for wx in range(bx+5, bx+bw-5, 10):
                if random.random() > 0.3:
                    d.rectangle([wx, wy, wx+4, wy+5], fill='#FFEB3B' if wid != 'w5' else '#FF1744')

    # 地面
    d.rectangle([0, h-30, w, h], fill=INK)

    # 斩杀线特效（W5）
    if wid == 'w5':
        for x in range(w-60, w, 2):
            alpha = int(200 * (x - w + 60) / 60)
            d.line([(x, 0), (x, h)], fill=(255, 0, 0, alpha), width=3)

    # 粗黑边框
    thick_rect(d, [4, 4, w-5, h-5], width=8)

    # 标题
    d.text((w//2, 45), f'{cn} · {en}', fill=WHITE, font=FONT_CN_LG, anchor='mt',
           stroke_width=3, stroke_fill=INK)

    # 图标
    for i, icon in enumerate(icons):
        d.text((50 + i*100, h-60), icon, fill=WHITE, font=FONT_CN_LG, anchor='mt')

    path = os.path.join(WORLD_DIR, f'world-{wid}-{slug}.png')
    img.save(path, quality=90)
    return path

# ============================================================
# 3. 道具/收集品图标（128x128）
# ============================================================

ITEMS = [
    ('cash-bill', '现金', 'Cash', '#4CAF50', '#2E7D32', '💵'),
    ('energy-drink', '能量饮料', 'Energy', '#1565C0', '#42A5F5', '⚡'),
    ('stock-option', '股票期权', 'Stock Option', '#F9A825', '#FFD54F', '📈'),
    ('shield-token', '护盾', 'Shield', '#78909C', '#CFD8DC', '🛡'),
    ('skill-book', '技能书', 'Skill Book', '#7B1FA2', '#CE93D8', '🎓'),
]

def generate_item_icon(slug, cn, en, color1, color2, emoji):
    w, h = 128, 128
    img = Image.new('RGBA', (w, h), (0,0,0,0))
    d = ImageDraw.Draw(img)

    # 圆形背景
    d.ellipse([4, 4, w-5, h-5], fill=color1, outline=INK, width=4)
    d.ellipse([12, 12, w-13, h-13], fill=color2)

    # emoji
    try:
        big_font = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 52)
    except:
        big_font = ImageFont.load_default()
    d.text((w//2, h//2+5), emoji, fill=INK, font=big_font, anchor='mm')

    # 标签
    try:
        tiny = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 11)
    except:
        tiny = ImageFont.load_default()
    d.text((w//2, h-14), cn, fill=INK, font=tiny, anchor='mt')

    path = os.path.join(ITEM_DIR, f'item-{slug}.png')
    img.save(path, quality=90)
    return path

# ============================================================
# 4. 障碍物图标（128x128）
# ============================================================

OBSTACLES = [
    ('deadline', '截止日', 'Deadline', '#F5F5F0', '#E0E0E0', '🚧'),
    ('toxic-boss', '烂老板', 'Toxic Boss', '#C62828', '#EF9A9A', '👔'),
    ('traffic-jam', '堵车', 'Traffic', '#FF8F00', '#FFE082', '🚗'),
    ('burnout', '过劳', 'Burnout', '#212121', '#616161', '💻'),
    ('market-crash', '崩盘', 'Crash', '#D32F2F', '#FFCDD2', '📉'),
    ('sick-wave', '流感', 'Sick Wave', '#388E3C', '#A5D6A7', '🦠'),
]

def generate_obstacle_icon(slug, cn, en, color1, color2, emoji):
    w, h = 128, 128
    img = Image.new('RGBA', (w, h), (0,0,0,0))
    d = ImageDraw.Draw(img)

    # 菱形背景
    cx, cy = w//2, h//2
    r = 50
    d.polygon([(cx, cy-r), (cx+r, cy), (cx, cy+r), (cx-r, cy)], fill=color1, outline=INK, width=4)
    d.polygon([(cx, cy-r+8), (cx+r-8, cy), (cx, cy+r-8), (cx-r+8, cy)], fill=color2)

    try:
        big_font = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 44)
    except:
        big_font = ImageFont.load_default()
    d.text((cx, cy+5), emoji, fill=INK, font=big_font, anchor='mm')

    try:
        tiny = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 11)
    except:
        tiny = ImageFont.load_default()
    d.text((cx, h-10), cn, fill=INK, font=tiny, anchor='mt')

    path = os.path.join(ITEM_DIR, f'obstacle-{slug}.png')
    img.save(path, quality=90)
    return path

# ============================================================
# 5. UI装饰元素
# ============================================================

def generate_ui_elements():
    """生成UI装饰"""
    # 金币图标
    w, h = 64, 64
    coin = Image.new('RGBA', (w, h), (0,0,0,0))
    d = ImageDraw.Draw(coin)
    d.ellipse([2, 2, w-3, h-3], fill='#FFD700', outline=INK, width=3)
    d.ellipse([10, 10, w-11, h-11], fill='#FFA000')
    try:
        f = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc', 24)
    except:
        f = ImageFont.load_default()
    d.text((w//2, h//2+2), '$', fill=INK, font=f, anchor='mm')
    coin.save(os.path.join(UI_DIR, 'coin-icon.png'))

    # 斩杀线标志
    w, h = 128, 64
    cut = Image.new('RGBA', (w, h), (0,0,0,0))
    d = ImageDraw.Draw(cut)
    d.rectangle([4, h//2-12, w-5, h//2+12], fill='#1A1A2E')
    for x in range(8, w-8, 12):
        d.rectangle([x, h//2-8, x+6, h//2+8], fill='#FF1744')
    cut.save(os.path.join(UI_DIR, 'cutline-badge.png'))

    # 按钮背景
    w, h = 256, 64
    btn = Image.new('RGBA', (w, h), (0,0,0,0))
    d = ImageDraw.Draw(btn)
    d.rounded_rectangle([2, 2, w-3, h-3], radius=12, fill=WHITE, outline=INK, width=4)
    btn.save(os.path.join(UI_DIR, 'btn-bg.png'))

    btn_red = Image.new('RGBA', (w, h), (0,0,0,0))
    d = ImageDraw.Draw(btn_red)
    d.rounded_rectangle([2, 2, w-3, h-3], radius=12, fill='#FF1744', outline=INK, width=4)
    btn_red.save(os.path.join(UI_DIR, 'btn-bg-red.png'))

    btn_gold = Image.new('RGBA', (w, h), (0,0,0,0))
    d = ImageDraw.Draw(btn_gold)
    d.rounded_rectangle([2, 2, w-3, h-3], radius=12, fill='#FFD700', outline=INK, width=4)
    btn_gold.save(os.path.join(UI_DIR, 'btn-bg-gold.png'))

    print('  ✅ UI elements: coin, cutline badge, button backgrounds')

# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print('='*50)
    print('Generating Character Cards (20)...')
    for c in CHARACTERS:
        path = generate_character_card(*c)
        print(f'  ✅ {c[0]}: {c[2]}')

    print('\nGenerating World Illustrations (5)...')
    for w in WORLDS:
        path = generate_world_card(*w)
        print(f'  ✅ {w[0]}: {w[2]}')

    print('\nGenerating Item Icons (5)...')
    for item in ITEMS:
        path = generate_item_icon(*item)
        print(f'  ✅ {item[0]}')

    print('\nGenerating Obstacle Icons (6)...')
    for obs in OBSTACLES:
        path = generate_obstacle_icon(*obs)
        print(f'  ✅ {obs[0]}')

    print('\nGenerating UI Elements...')
    generate_ui_elements()

    print(f'\n🎨 All assets generated!')
    print(f'   Characters: {CHAR_DIR}/ ({len(CHARACTERS)} files)')
    print(f'   Worlds:     {WORLD_DIR}/ ({len(WORLDS)} files)')
    print(f'   Items:      {ITEM_DIR}/ ({len(ITEMS)+len(OBSTACLES)} files)')
    print(f'   UI:         {UI_DIR}/')
