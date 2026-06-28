"""
Blender 角色生成器 v2 — The Cut Line
=====================================
使用 Skin Modifier 生成有肌肉曲线的真人比例人体，
而非简单几何体拼接。

用法：Blender 4.0+ Scripting 工作区 → Run Script
输出：/tmp/cutline-models/char-01.glb ~ char-06.glb
"""

import bpy
import os
import math

OUTPUT_DIR = "/tmp/cutline-models"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 6套配色
SCHEMES = [
    (0xFFCC80, 0x3E2723, 0x4488CC, 0x37474F, 0x2C2C2C, "char-01-average-joe"),
    (0xF5D0A9, 0x1A1A1A, 0x2E7D32, 0x263238, 0x3E2723, "char-02-summa-cum-laude"),
    (0xE0AC69, 0x4E342E, 0xC62828, 0x1B2631, 0x424242, "char-03-college-athlete"),
    (0xC68642, 0x212121, 0x6A1B9A, 0x212121, 0x111111, "char-04-veteran"),
    (0xFFE0BD, 0x5D4037, 0xE65100, 0x3E2723, 0x4E342E, "char-05-frugal-minimalist"),
    (0xD4A574, 0x1B1B1B, 0x37474F, 0x424242, 0x1A1A1A, "char-06-union-worker"),
]


def hex2rgb(h):
    return ((h >> 16 & 0xFF) / 255, (h >> 8 & 0xFF) / 255, (h & 0xFF) / 255)


def mkmat(name, hex_color, rough=0.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*hex2rgb(hex_color), 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    return mat


def clear_all():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for m in bpy.data.materials:
        bpy.data.materials.remove(m)
    for mesh in bpy.data.meshes:
        bpy.data.meshes.remove(mesh)


def build_body(scheme):
    """
    用单顶点链 + Skin Modifier 构建人体。
    原理：每个顶点代表一个关节位置，Skin Modifier
    自动在顶点周围生成可变半径的蒙皮网格。
    """
    skin, hair_c, top_c, bottom_c, shoe_c, name = scheme

    # === 材质 ===
    skin_mat = mkmat("skin", skin, 0.35)
    hair_mat = mkmat("hair", hair_c, 0.55)
    top_mat = mkmat("top", top_c, 0.45)
    bottom_mat = mkmat("bottom", bottom_c, 0.5)
    shoe_mat = mkmat("shoe", shoe_c, 0.4)

    # === 身体：顶点链（从脚底到头顶） ===
    # 每个顶点的 Y 坐标和对应的蒙皮半径
    body_verts = [
        (0, 0, 0),       # 0: 脚底
        (0, 0, 0.05),    # 1: 脚踝
        (0, 0, 0.45),    # 2: 膝盖
        (0, 0, 0.85),    # 3: 髋部
        (0, 0, 1.15),    # 4: 腰部
        (0, 0, 1.40),    # 5: 胸部
        (0, 0, 1.60),    # 6: 肩膀
        (0, 0, 1.80),    # 7: 颈部
        (0, 0, 2.05),    # 8: 头顶
    ]

    # 每个顶点对应的蒙皮半径（X 和 Y 方向分别控制宽度和厚度）
    body_radii = [
        (0.10, 0.22),  # 脚
        (0.08, 0.18),  # 脚踝
        (0.09, 0.18),  # 膝盖
        (0.13, 0.18),  # 髋部
        (0.12, 0.16),  # 腰部
        (0.14, 0.16),  # 胸部
        (0.15, 0.14),  # 肩膀
        (0.07, 0.10),  # 颈部
        (0.10, 0.12),  # 头顶
    ]

    # 创建身体网格
    body_mesh = bpy.data.meshes.new("BodyMesh")
    body_obj = bpy.data.objects.new("Body", body_mesh)
    bpy.context.collection.objects.link(body_obj)

    body_mesh.from_pydata(body_verts, [], [[i, i+1] for i in range(len(body_verts)-1)])
    body_mesh.update()

    # 添加 Skin Modifier
    bpy.context.view_layer.objects.active = body_obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')

    # 设置每个顶点的蒙皮半径
    bm = bmesh.from_edit_mesh(body_mesh)
    for i, v in enumerate(bm.verts):
        v.select = True
    bm.select_flush(True)
    bpy.ops.object.mode_set(mode='OBJECT')

    skin_mod = body_obj.modifiers.new("Skin", 'SKIN')
    # 为每个顶点设置独立半径
    for i, v in enumerate(body_obj.data.skin_vertices[0].data):
        rx, ry = body_radii[i] if i < len(body_radii) else (0.1, 0.15)
        v.radius = (rx, ry)

    # Subdivision Surface 平滑
    subd = body_obj.modifiers.new("Subdiv", 'SUBSURF')
    subd.levels = 2
    subd.render_levels = 2

    # 应用修改器
    bpy.ops.object.modifier_apply(modifier="Skin")
    bpy.ops.object.modifier_apply(modifier="Subdiv")

    body_obj.data.materials.append(top_mat)

    # === 头部 ===
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=16, ring_count=14, radius=0.22,
        location=(0, 0, 2.05)
    )
    head = bpy.context.active_object
    head.name = "Head"
    # 稍微拉长头部
    head.scale = (1.0, 0.92, 0.95)
    bpy.ops.object.transform_apply(scale=True)
    head.data.materials.append(skin_mat)

    # === 头发 ===
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=14, ring_count=10, radius=0.24,
        location=(0, 0, 2.15)
    )
    hair = bpy.context.active_object
    hair.name = "Hair"
    hair.scale = (1.05, 0.35, 1.05)
    bpy.ops.object.transform_apply(scale=True)
    hair.data.materials.append(hair_mat)

    # === 手臂：顶点链 ===
    for side, sx in [("Left", -1), ("Right", 1)]:
        arm_verts = [
            (sx * 0.30, 0, 1.60),   # 肩
            (sx * 0.45, 0, 1.42),   # 肘
            (sx * 0.55, 0, 1.15),   # 腕
            (sx * 0.55, 0, 1.05),   # 手
        ]
        arm_mesh = bpy.data.meshes.new(f"{side}ArmMesh")
        arm_obj = bpy.data.objects.new(f"{side}Arm", arm_mesh)
        bpy.context.collection.objects.link(arm_obj)
        arm_mesh.from_pydata(arm_verts, [], [[0,1],[1,2],[2,3]])
        arm_mesh.update()
        bpy.context.view_layer.objects.active = arm_obj

        arm_skin = arm_obj.modifiers.new("Skin", 'SKIN')
        radii = [(0.06,0.06), (0.05,0.05), (0.04,0.04), (0.04,0.04)]
        for i, v in enumerate(arm_obj.data.skin_vertices[0].data):
            rx, ry = radii[i] if i < len(radii) else (0.04, 0.04)
            v.radius = (rx, ry)
        arm_subd = arm_obj.modifiers.new("Subdiv", 'SUBSURF')
        arm_subd.levels = 2
        bpy.ops.object.modifier_apply(modifier="Skin")
        bpy.ops.object.modifier_apply(modifier="Subdiv")
        arm_obj.data.materials.append(top_mat)

    # === 腿：顶点链 ===
    for side, sx in [("Left", -1), ("Right", 1)]:
        leg_verts = [
            (sx * 0.10, 0, 0.85),   # 髋
            (sx * 0.10, 0, 0.45),   # 膝
            (sx * 0.10, 0, 0.08),   # 踝
            (sx * 0.10, 0.06, 0),   # 脚底
        ]
        leg_mesh = bpy.data.meshes.new(f"{side}LegMesh")
        leg_obj = bpy.data.objects.new(f"{side}Leg", leg_mesh)
        bpy.context.collection.objects.link(leg_obj)
        leg_mesh.from_pydata(leg_verts, [], [[0,1],[1,2],[2,3]])
        leg_mesh.update()
        bpy.context.view_layer.objects.active = leg_obj

        leg_skin = leg_obj.modifiers.new("Skin", 'SKIN')
        lradii = [(0.09,0.10), (0.08,0.09), (0.06,0.10), (0.06,0.18)]
        for i, v in enumerate(leg_obj.data.skin_vertices[0].data):
            rx, ry = lradii[i] if i < len(lradii) else (0.06, 0.10)
            v.radius = (rx, ry)
        leg_subd = leg_obj.modifiers.new("Subdiv", 'SUBSURF')
        leg_subd.levels = 2
        bpy.ops.object.modifier_apply(modifier="Skin")
        bpy.ops.object.modifier_apply(modifier="Subdiv")
        leg_obj.data.materials.append(bottom_mat)

    # === 合并所有部件 ===
    bpy.ops.object.select_all(action='SELECT')
    bpy.context.view_layer.objects.active = body_obj
    bpy.ops.object.join()

    # === 原点到底部 ===
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    body_obj.location.z -= body_obj.dimensions.z / 2

    # === 导出 ===
    path = os.path.join(OUTPUT_DIR, f"{name}.glb")
    bpy.ops.object.select_all(action='DESELECT')
    body_obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB',
        use_selection=True, export_apply=True,
        export_image_format='NONE',
    )
    print(f"  ✅ {name}.glb ({int(len(body_obj.data.polygons))} 面)")
    return body_obj


# ============================================================
print("=" * 55)
print("🎮 The Cut Line — 角色生成器 v2 (Skin Modifier)")
print("=" * 55)

# 需要 bmesh 来设置蒙皮半径
import bmesh

for i, scheme in enumerate(SCHEMES):
    name = scheme[5]
    print(f"\n[{i+1}/6] {name}")
    clear_all()
    build_body(scheme)

print(f"\n{'=' * 55}")
print(f"✅ 完成！导出到 {OUTPUT_DIR}/")
print(f"{'=' * 55}")
