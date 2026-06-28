"""
Blender 道具 & 障碍物生成器 — The Cut Line
===========================================
用法：同角色脚本，在 Blender Scripting 工作区运行。
生成 6 个障碍物 + 5 个道具 .glb 模型。
"""

import bpy
import os
import math

OUTPUT_DIR = "/tmp/cutline-models"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 障碍物颜色方案
OBSTACLE_COLORS = {
    "barrier":     (0xFDD835, "obstacle-barrier"),      # 黄色路障
    "deadline":    (0xE53935, "obstacle-deadline"),      # 红色截止日期
    "toxic-boss":  (0xFF6F00, "obstacle-toxic-boss"),    # 橙色有毒老板
    "burnout":     (0xFF1744, "obstacle-burnout"),       # 深红过劳
    "market-crash":(0x880E4F, "obstacle-market-crash"),  # 紫红市场崩盘
    "sick-wave":   (0x00C853, "obstacle-sick-wave"),     # 绿色疾病
}

ITEM_COLORS = {
    "cash-bill":     (0x4CAF50, "item-cash-bill"),       # 绿色钞票
    "energy-drink":  (0x1565C0, "item-energy-drink"),    # 蓝色能量饮料
    "shield-token":  (0xFFD700, "item-shield-token"),    # 金色护盾
    "skill-book":    (0xC62828, "item-skill-book"),      # 红色技能书
    "stock-option":  (0x6A1B9A, "item-stock-option"),    # 紫色股票
}


def hex_to_rgb(hex_val):
    return (
        ((hex_val >> 16) & 0xFF) / 255.0,
        ((hex_val >> 8) & 0xFF) / 255.0,
        (hex_val & 0xFF) / 255.0,
    )


def create_material(name, hex_color, roughness=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*hex_to_rgb(hex_color), 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_confirm=False)
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat)


def export_obj(obj, filename):
    output_path = os.path.join(OUTPUT_DIR, filename)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_image_format='NONE',
    )
    print(f"  ✅ {filename}")


def build_barrier():
    """路障 — 低矮横杆"""
    mat = create_material("barrier", OBSTACLE_COLORS["barrier"][0])
    # 横杆
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.15))
    bar = bpy.context.active_object
    bar.scale = (1.8, 0.15, 0.25)
    bar.data.materials.append(mat)
    # 支架
    for sx in [-1.4, 1.4]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sx, 0, 0.3))
        leg = bpy.context.active_object
        leg.scale = (0.08, 0.08, 0.3)
        leg.data.materials.append(mat)
        bar.select_set(True)
        leg.select_set(True)
    bpy.context.view_layer.objects.active = bar
    bpy.ops.object.join()
    bar.name = "barrier"
    export_obj(bar, "obstacle-barrier.glb")


def build_deadline():
    """截止日期 — 文件堆"""
    mat = create_material("deadline", OBSTACLE_COLORS["deadline"][0])
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.3))
    main = bpy.context.active_object
    main.scale = (0.8, 0.3, 0.5)
    main.data.materials.append(mat)
    # 文件层
    for i, (sx, sy, sz) in enumerate([
        (0.75, 0.35, 0.45), (0.7, 0.4, 0.4), (0.78, 0.45, 0.42)
    ]):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.02*i, 0.01*i, 0.32 + i*0.07))
        layer = bpy.context.active_object
        layer.scale = (sx, 0.04, sz)
        layer.data.materials.append(mat)
        main.select_set(True)
        layer.select_set(True)
    bpy.context.view_layer.objects.active = main
    bpy.ops.object.join()
    export_obj(main, "obstacle-deadline.glb")


def build_toxic_boss():
    """有毒老板 — 人形柱体"""
    mat = create_material("boss", OBSTACLE_COLORS["toxic-boss"][0])
    skin_mat = create_material("boss_face", 0xFFCC80)
    # 身体
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.22, depth=1.2, location=(0, 0, 0.6))
    body = bpy.context.active_object
    body.data.materials.append(mat)
    # 头
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.18, location=(0, 0, 1.25))
    head = bpy.context.active_object
    head.data.materials.append(skin_mat)
    body.select_set(True)
    head.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    export_obj(body, "obstacle-toxic-boss.glb")


def build_burnout():
    """过劳 — 燃烧球体"""
    mat = create_material("burnout", OBSTACLE_COLORS["burnout"][0])
    bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.45, location=(0, 0, 0.5))
    obj = bpy.context.active_object
    obj.data.materials.append(mat)
    # 火焰尖刺
    for i in range(6):
        angle = i * math.pi / 3
        x = math.cos(angle) * 0.35
        y = math.sin(angle) * 0.35
        bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.08, depth=0.25, location=(x, y, 0.8))
        spike = bpy.context.active_object
        spike.data.materials.append(mat)
        obj.select_set(True)
        spike.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.join()
    export_obj(obj, "obstacle-burnout.glb")


def build_market_crash():
    """市场崩盘 — 破碎方块"""
    mat = create_material("crash", OBSTACLE_COLORS["market-crash"][0])
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.35))
    main = bpy.context.active_object
    main.scale = (0.55, 0.55, 0.35)
    main.data.materials.append(mat)
    # 裂缝线（用小块模拟）
    for dx, dy, dz in [(0.3, 0.2, 0.02), (-0.25, -0.3, 0.02), (0.1, -0.15, 0.02)]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(dx, dy, 0.35 + dz))
        frag = bpy.context.active_object
        frag.scale = (0.12, 0.05, 0.02)
        frag.data.materials.append(mat)
        main.select_set(True)
        frag.select_set(True)
    bpy.context.view_layer.objects.active = main
    bpy.ops.object.join()
    export_obj(main, "obstacle-market-crash.glb")


def build_sick_wave():
    """疾病 — 病毒球体"""
    mat = create_material("sick", OBSTACLE_COLORS["sick-wave"][0])
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=10, radius=0.4, location=(0, 0, 0.45))
    obj = bpy.context.active_object
    obj.data.materials.append(mat)
    # 病毒突起
    for i in range(8):
        phi = (1 + math.sqrt(5)) / 2
        theta = i * 2.4
        px = math.cos(theta) * 0.3
        py = math.sin(theta) * 0.3
        pz = 0.45 + (i % 3 - 1) * 0.2
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.04, depth=0.12, location=(px, py, pz))
        spike = bpy.context.active_object
        spike.data.materials.append(mat)
        obj.select_set(True)
        spike.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.join()
    export_obj(obj, "obstacle-sick-wave.glb")


# ===== 道具 =====

def build_cash_bill():
    """钞票"""
    mat = create_material("cash", ITEM_COLORS["cash-bill"][0])
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.08))
    obj = bpy.context.active_object
    obj.scale = (0.55, 0.04, 0.25)
    obj.data.materials.append(mat)
    export_obj(obj, "item-cash-bill.glb")


def build_energy_drink():
    """能量饮料罐"""
    mat = create_material("drink", ITEM_COLORS["energy-drink"][0])
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.1, depth=0.35, location=(0, 0, 0.18))
    obj = bpy.context.active_object
    obj.data.materials.append(mat)
    export_obj(obj, "item-energy-drink.glb")


def build_shield_token():
    """护盾令牌"""
    mat = create_material("shield", ITEM_COLORS["shield-token"][0])
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.18, depth=0.04, location=(0, 0, 0.02))
    obj = bpy.context.active_object
    obj.data.materials.append(mat)
    # 星形标记
    bpy.ops.mesh.primitive_cylinder_add(vertices=5, radius=0.08, depth=0.05, location=(0, 0, 0.05))
    star = bpy.context.active_object
    star.data.materials.append(mat)
    obj.select_set(True)
    star.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.join()
    export_obj(obj, "item-shield-token.glb")


def build_skill_book():
    """技能书"""
    mat = create_material("book", ITEM_COLORS["skill-book"][0])
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.06))
    obj = bpy.context.active_object
    obj.scale = (0.25, 0.04, 0.3)
    obj.data.materials.append(mat)
    export_obj(obj, "item-skill-book.glb")


def build_stock_option():
    """股票期权"""
    mat = create_material("stock", ITEM_COLORS["stock-option"][0])
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.06))
    obj = bpy.context.active_object
    obj.scale = (0.22, 0.03, 0.28)
    obj.data.materials.append(mat)
    # 向上箭头
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.06, depth=0.12, location=(0, 0.04, 0.12))
    arrow = bpy.context.active_object
    arrow.data.materials.append(mat)
    obj.select_set(True)
    arrow.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.join()
    export_obj(obj, "item-stock-option.glb")


# ============================================================
print("=" * 60)
print("🎮 The Cut Line — 道具/障碍物生成器")
print("=" * 60)

# 障碍物
print("\n📦 障碍物:")
builders = [
    ("路障", build_barrier),
    ("截止日期", build_deadline),
    ("有毒老板", build_toxic_boss),
    ("过劳", build_burnout),
    ("市场崩盘", build_market_crash),
    ("疾病", build_sick_wave),
]
for name, fn in builders:
    print(f"  [{name}]")
    clear_scene()
    fn()

# 道具
print("\n🎒 道具:")
items = [
    ("钞票", build_cash_bill),
    ("能量饮料", build_energy_drink),
    ("护盾令牌", build_shield_token),
    ("技能书", build_skill_book),
    ("股票期权", build_stock_option),
]
for name, fn in items:
    print(f"  [{name}]")
    clear_scene()
    fn()

print(f"\n{'=' * 60}")
print(f"✅ 全部完成！11 个模型已导出到: {OUTPUT_DIR}/")
print(f"{'=' * 60}")
