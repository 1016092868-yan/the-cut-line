"""
Blender 一键角色生成器 — The Cut Line
=====================================
用法：
  1. 打开 Blender 4.0+
  2. Scripting 工作区 → 粘贴此脚本 → Run Script
  3. 自动生成 6 个角色模型到 /tmp/cutline-models/
  4. 将 .glb 文件复制到项目的 assets/models/ 目录

生成内容：
  - 低多边形人体（头+身体+四肢）
  - 衣服（上衣+裤子+鞋）
  - 头发
  - 6 套不同配色
  - 每个模型约 1200-1800 三角面
  - 导出为 .glb 格式

手动微调建议：
  - 选择角色 → Tab 进入编辑模式 → 调整体型
  - 修改材质颜色 → Shading 工作区 → 调 Principled BSDF
  - 添加配饰 → 在 Object 模式添加几何体
"""

import bpy
import os
import math

# ============================================================
# 配置
# ============================================================
OUTPUT_DIR = "/tmp/cutline-models"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 6 套配色方案
COLOR_SCHEMES = [
    # (皮肤, 头发, 上衣, 裤子, 鞋子, 角色名)
    (0xFFCC80, 0x3E2723, 0x4488CC, 0x37474F, 0x2C2C2C, "char-01-average-joe"),
    (0xF5D0A9, 0x1A1A1A, 0x2E7D32, 0x263238, 0x3E2723, "char-02-summa-cum-laude"),
    (0xE0AC69, 0x4E342E, 0xC62828, 0x1B2631, 0x424242, "char-03-college-athlete"),
    (0xC68642, 0x212121, 0x6A1B9A, 0x212121, 0x111111, "char-04-veteran"),
    (0xFFE0BD, 0x5D4037, 0xE65100, 0x3E2723, 0x4E342E, "char-05-frugal-minimalist"),
    (0xD4A574, 0x1B1B1B, 0x37474F, 0x424242, 0x1A1A1A, "char-06-union-worker"),
]


def hex_to_rgb(hex_val):
    """将 0xRRGGBB 转为 (R, G, B) 0-1 范围"""
    return (
        ((hex_val >> 16) & 0xFF) / 255.0,
        ((hex_val >> 8) & 0xFF) / 255.0,
        (hex_val & 0xFF) / 255.0,
    )


def create_material(name, hex_color, roughness=0.5):
    """创建 Principled BSDF 材质"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*hex_to_rgb(hex_color), 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def clear_scene():
    """清空场景"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_confirm=False)
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat)


def add_subsurf(obj, levels=1):
    """添加 Subdivision Surface 修改器"""
    mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = levels
    mod.render_levels = levels
    bpy.ops.object.modifier_apply(modifier=mod.name)


def build_character(scheme, char_index):
    """
    构建一个低多边形角色
    结构：
      - 身体 (Cylinder → 编辑成人体)
      - 头部 (UV Sphere)
      - 头发 (UV Sphere 上半 + 缩放)
      - 手臂 ×2 (Cylinder)
      - 腿 ×2 (Cylinder)
      - 脚 ×2 (Cube)
    """
    skin, hair_c, top_c, bottom_c, shoe_c, char_name = scheme

    # --- 材质 ---
    skin_mat = create_material(f"skin_{char_index}", skin, 0.4)
    hair_mat = create_material(f"hair_{char_index}", hair_c, 0.6)
    top_mat = create_material(f"top_{char_index}", top_c, 0.5)
    bottom_mat = create_material(f"bottom_{char_index}", bottom_c, 0.5)
    shoe_mat = create_material(f"shoe_{char_index}", shoe_c, 0.4)

    # --- 身体 ---
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12, radius=0.28, depth=1.0,
        location=(0, 0, 1.25)
    )
    body = bpy.context.active_object
    body.name = "Body"
    body.data.materials.append(top_mat)

    # --- 头部 ---
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=14, ring_count=12, radius=0.26,
        location=(0, 0, 2.05)
    )
    head = bpy.context.active_object
    head.name = "Head"
    head.data.materials.append(skin_mat)

    # --- 头发 ---
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=12, ring_count=8, radius=0.28,
        location=(0, 0, 2.15)
    )
    hair = bpy.context.active_object
    hair.name = "Hair"
    hair.scale = (1.0, 0.4, 1.0)
    hair.data.materials.append(hair_mat)

    # --- 左臂 ---
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8, radius=0.07, depth=0.6,
        location=(-0.38, 0, 1.55)
    )
    left_arm = bpy.context.active_object
    left_arm.name = "LeftArm"
    left_arm.data.materials.append(top_mat)

    # --- 右臂 ---
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8, radius=0.07, depth=0.6,
        location=(0.38, 0, 1.55)
    )
    right_arm = bpy.context.active_object
    right_arm.name = "RightArm"
    right_arm.data.materials.append(top_mat)

    # --- 左手 ---
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=8, ring_count=6, radius=0.07,
        location=(-0.38, 0, 1.18)
    )
    left_hand = bpy.context.active_object
    left_hand.name = "LeftHand"
    left_hand.data.materials.append(skin_mat)

    # --- 右手 ---
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=8, ring_count=6, radius=0.07,
        location=(0.38, 0, 1.18)
    )
    right_hand = bpy.context.active_object
    right_hand.name = "RightHand"
    right_hand.data.materials.append(skin_mat)

    # --- 左腿 ---
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8, radius=0.09, depth=0.7,
        location=(-0.12, 0, 0.48)
    )
    left_leg = bpy.context.active_object
    left_leg.name = "LeftLeg"
    left_leg.data.materials.append(bottom_mat)

    # --- 右腿 ---
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8, radius=0.09, depth=0.7,
        location=(0.12, 0, 0.48)
    )
    right_leg = bpy.context.active_object
    right_leg.name = "RightLeg"
    right_leg.data.materials.append(bottom_mat)

    # --- 左脚 ---
    bpy.ops.mesh.primitive_cube_add(
        size=1, location=(-0.12, 0.06, 0.12)
    )
    left_foot = bpy.context.active_object
    left_foot.name = "LeftFoot"
    left_foot.scale = (0.16, 0.06, 0.22)
    left_foot.data.materials.append(shoe_mat)

    # --- 右脚 ---
    bpy.ops.mesh.primitive_cube_add(
        size=1, location=(0.12, 0.06, 0.12)
    )
    right_foot = bpy.context.active_object
    right_foot.name = "RightFoot"
    right_foot.scale = (0.16, 0.06, 0.22)
    right_foot.data.materials.append(shoe_mat)

    # --- 合并所有部件 ---
    bpy.ops.object.select_all(action='SELECT')
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()

    # --- 设置原点 ---
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOTTOM')

    # --- 重命名 ---
    body.name = char_name
    body.location = (0, 0, 0)

    # --- 导出 GLB ---
    output_path = os.path.join(OUTPUT_DIR, f"{char_name}.glb")
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_image_format='NONE',
    )
    print(f"  ✅ 导出: {output_path}")

    return body


# ============================================================
# 主流程
# ============================================================
print("=" * 60)
print("🎮 The Cut Line — Blender 角色生成器")
print("=" * 60)

for i, scheme in enumerate(COLOR_SCHEMES):
    char_name = scheme[5]
    print(f"\n[{i+1}/6] 生成 {char_name} ...")
    clear_scene()
    build_character(scheme, i + 1)

print(f"\n{'=' * 60}")
print(f"✅ 全部完成！6 个模型已导出到:")
print(f"   {OUTPUT_DIR}/")
print(f"\n📋 下一步:")
print(f"   1. 复制 .glb 文件到项目的 assets/models/ 目录")
print(f"   2. 在 Blender 中打开单个模型微调（可选）")
print(f"   3. 刷新浏览器查看效果")
print(f"{'=' * 60}")
