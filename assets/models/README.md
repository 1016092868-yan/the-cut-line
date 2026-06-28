# 3D 模型目录

将 `.glb` 文件放在此目录下，游戏会自动加载。

## 命名规范

| 类型 | 文件名 | 示例 |
|------|--------|------|
| 角色 | `char-XX.glb` | `char-01.glb` (Average Joe) |
| 障碍物 | `obstacle-{type}.glb` | `obstacle-deadline.glb` |
| 道具 | `item-{name}.glb` | `item-cash-bill.glb` |

## 角色ID对照

| ID | 角色 | 文件名 |
|----|------|--------|
| 1 | Average Joe 普通人 | char-01.glb |
| 2 | Summa Cum Laude 学霸 | char-02.glb |
| 3 | College Athlete 运动员 | char-03.glb |
| 4 | Veteran 退伍军人 | char-04.glb |
| 5 | Frugal Minimalist 极简主义者 | char-05.glb |
| 6 | Union Worker 工会成员 | char-06.glb |
| 7-20 | (其余14个角色) | char-07.glb ~ char-20.glb |

## 模型规范

- 格式: glTF Binary (.glb)
- 三角面: 角色 1500-3000, 道具 300-800
- 朝向: 模型正面朝 +Z 方向（朝屏幕外）
- 原点: 模型脚底在 Y=0
- 高度: 角色约 2.0 单位
- 材质: 使用 Principled BSDF，贴图 512×512 或 1024×1024
- Blender 导出: File → Export → glTF 2.0 (.glb), 勾选 "Apply Modifiers"

## 注意

- 如果模型文件不存在，游戏会自动回退到程序化几何体
- 控制台会显示 `[Player3D] 使用GLB模型` 或 `[Player3D] 回退到程序化模型`
