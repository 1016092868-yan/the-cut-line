# 《斩杀线》关卡优化 v1.1 — 角色差异 + 自适应难度 + 速查表 + JSON + 测试清单

---

## 一、补充15角色关键月份关卡差异

### 1.1 角色差异速查矩阵

以下覆盖全部20角色在关键月份的差异：

#### 2月「Leo's Knock」— 利奥首次接触（全部20角色）

| # | 角色 | 灰色吸引力 | 利奥台词核心 | 特殊选项 |
|:--:|------|:--------:|------------|----------|
| 1 | 马库斯 | 极高 | "你不是在生活——是在推迟死亡。" | - |
| 2 | 佐伊 | 高 | "Summa Cum Laude。送咖啡。" | - |
| 3 | 德里克 | 高 | "你的膝盖不行了。但你的手还行。" | - |
| 4 | 詹姆斯 | 低 | "军队教你纪律。这里教你灵活。" | 可拒绝且利奥不会再出现 |
| 5 | 艾玛 | 中 | "你不买东西。但你还是要付账单。" | 灰色收入以"匿名捐赠"形式出现 |
| 6 | 卡洛斯 | 中 | "工会保护不了所有人。我保护那些没人保护的。" | 如果接受→工会关系-10 |
| 7 | 安娜 | 极高 | "我有朋友——可以帮忙处理'文件'。" | 灰色=身份文件帮助 |
| 8 | 瑞秋 | 极高 | "两个孩子。一份收入。你自己算。" | - |
| 9 | 伊桑 | 低 | "你已经在自己干了。我只是——另一种自己干。" | 灰色=创业融资（替代灰色时间块） |
| 10 | 艾琳&马克 | 低 | "你们不需要我。但你们的朋友——可能需要。" | 利奥求助他们帮助别人 |
| 11 | 杰森 | 中 | "人脉是资产。我有一些人——你可以认识。" | 灰色=灰色人脉网络 |
| 12 | 凯瑟琳 | 低 | "博士。兼职讲师。你知道多少人博士毕业后开Uber吗？" | 学术尊严 vs 生存 |
| 13 | 奥斯卡 | 极高 | "夜班。我也有夜班的活儿。更安静。" | - |
| 14 | 卢娜 | 极高 | "你已经活在算法里了。再加一个算法——有什么区别？" | 灰色=灰色平台（替代现有零工平台） |
| 15 | 西蒙 | 低 | "你的身体有限制。我的活儿——不需要身体。" | 灰色=远程灰色工作 |
| 16 | 菲利克斯 | 中 | "你运气好。但运气会用完。我是——稳定的运气。" | - |
| 17 | 维多利亚 | 低 | "你有信托基金。但你也有期望。我帮你——绕过期望。" | 灰色=隐藏资产 |
| 18 | 特伦斯 | 极低 | "你不需要我。但你想知道'真实世界'是什么样的。" | 接受→触发特殊觉醒线 |
| 19 | 萨沙 | 中 | "你有粉丝。我可以帮你——变现。" | 灰色=灰色品牌合作 |
| 20 | 马库斯W | 中 | "你没有学历。但我有——另一种认证。" | 灰色=灰色技术项目 |

#### 4月Boss关「Tax Day」— 报税（全部20角色）

| # | 角色 | 复杂度 | 额外时间 | 补税风险 | 特殊 |
|:--:|------|:------:|:------:|:------:|------|
| 1 | 马库斯 | 简单 | 0h | 低 | 标准 |
| 2 | 佐伊 | 复杂 | +4h | 高 | 三份1099 |
| 3 | 德里克 | 简单 | 0h | 低 | 标准 |
| 4 | 詹姆斯 | 简单 | 0h | 低 | VA福利免税 |
| 5 | 艾玛 | 简单 | 0h | 低 | 标准 |
| 6 | 卡洛斯 | 简单 | 0h | 低 | 工会会费可抵扣 |
| 7 | 安娜 | 复杂 | +4h | 中 | 现金收入申报困难 |
| 8 | 瑞秋 | 复杂 | +4h | 中 | 抚养费税务处理 |
| 9 | 伊桑 | 极复杂 | +8h | 不确定 | 创业亏损可能退税 |
| 10 | 艾琳&马克 | 复杂 | +4h | 高 | 联合报税 |
| 11 | 杰森 | 复杂 | +4h | 高 | 佣金收入 |
| 12 | 凯瑟琳 | 简单 | 0h | 低 | 标准 |
| 13 | 奥斯卡 | 简单 | 0h | 低 | 夜班补贴 |
| 14 | 卢娜 | 极复杂 | +8h | 极高 | 审计概率翻倍 |
| 15 | 西蒙 | 简单 | 0h | 低 | 远程工作抵扣 |
| 16 | 菲利克斯 | 简单 | 0h | 低 | 标准 |
| 17 | 维多利亚 | 复杂 | +4h | 高 | 信托+投资 |
| 18 | 特伦斯 | 复杂 | +4h | 极高 | 被动收入$3K-$8K补税 |
| 19 | 萨沙 | 复杂 | +4h | 高 | 自媒体收入 |
| 20 | 马库斯W | 简单 | 0h | 低 | 标准 |

#### 7月Boss关「Cut Line Approaching」— 斩杀线临界（全部20角色）

| # | 角色 | 最脆弱维度 | Boss事件表现 | 需要资源 |
|:--:|------|:--------:|------------|:------:|
| 1 | 马库斯 | 经济 | 净资产强制降至$0——驱逐风险 | $1,000-$3,000 |
| 2 | 佐伊 | 经济 | 学贷追索——父母房产风险 | $1,500-$3,000 |
| 3 | 德里克 | 体力 | 旧伤复发——膝盖手术 | $2,400+休息10h |
| 4 | 詹姆斯 | 社交 | PTSD触发——社交退缩 | 社交10h+VA支持 |
| 5 | 艾玛 | 社交 | 孤立危机——母亲联系她 | 社交5h+$200 |
| 6 | 卡洛斯 | 经济 | 工会罢工失败——收入中断 | $2,000+灰色或社区 |
| 7 | 安娜 | 存在 | ICE传闻——身份验证 | $1,500+律师 |
| 8 | 瑞秋 | 体力 | 过劳崩溃——无法工作 | 休息15h+找人照顾孩子 |
| 9 | 伊桑 | 经济 | 创业失败——资产归零 | $5,000或破产保护 |
| 10 | 艾琳&马克 | 存在 | 一方失业——双收入变单收入 | 调整预算+可能卖资产 |
| 11 | 杰森 | 社交 | 人脉背叛——关键联系人流失 | 重建社交网络 |
| 12 | 凯瑟琳 | 体力 | 慢性病恶化——需要治疗 | $3,000+休息20h |
| 13 | 奥斯卡 | 社交 | 彻底孤立——无人联系 | 社交10h+可能换工作 |
| 14 | 卢娜 | 经济 | 平台降权——收入骤降 | 寻找新平台 |
| 15 | 西蒙 | 体力 | 身体极限——需要辅助设备 | $5,000+保险 |
| 16 | 菲利克斯 | 经济 | 运气用尽——连续负面事件 | 社区求助 |
| 17 | 维多利亚 | 存在 | 信托条件触发——限制支出 | 重新谈判信托条款 |
| 18 | 特伦斯 | 职业 | 信托断供——净资产<$100K | 第一次自己赚钱 |
| 19 | 萨沙 | 社交 | 塌房危机——大规模掉粉 | $30K危机公关或接受 |
| 20 | 马库斯W | 社交 | 面试失败——学历歧视 | 继续自学或接受灰色 |

---

## 二、自适应难度系统

### 2.1 设计理念

关卡难度不是固定的——根据玩家前几个月的表现动态调整。

### 2.2 自适应参数

```json
{
  "adaptive_difficulty": {
    "check_frequency": "每3个月评估一次",
    "evaluation_points": [3, 6, 9],
    
    "player_state_good": {
      "condition": "净资产>$10K AND 无斩杀线触发 AND 体力>60%",
      "adjustments": {
        "next_month_negative_event_multiplier": 1.2,
        "next_month_unexpected_expense_multiplier": 1.2,
        "next_month_bill_multiplier": 1.1,
        "narrative": "你做得不错。系统注意到了。它开始对你更'感兴趣'。"
      }
    },
    
    "player_state_struggling": {
      "condition": "净资产<$2K OR 有斩杀线触发 OR 体力<30%",
      "adjustments": {
        "next_month_negative_event_multiplier": 0.8,
        "next_month_unexpected_expense_multiplier": 0.7,
        "next_month_bill_multiplier": 0.9,
        "next_month_random_event_count": -1,
        "narrative": "命运似乎暂时放过了你。一个喘息。别浪费它。"
      }
    },
    
    "player_state_neutral": {
      "condition": "其他情况",
      "adjustments": "基准参数，不调整"
    }
  }
}
```

### 2.3 设计意图

- **做得好≠更容易**——系统对成功者更严苛（"富人税"隐喻）
- **做得差≠必死**——系统给挣扎者喘息空间（但不保证翻盘）
- **不适用于Boss关**——Boss关参数固定，不受自适应影响

---

## 三、12个月关卡参数速查表

| 月 | 类型 | 新解锁 | 滑块数 | 固定事件 | 随机事件数 | 负面概率× | 意外支出× | 账单倍率 | 斩杀线收紧 | Boss |
|:--:|:----:|--------|:-----:|----------|:--------:|:--------:|:--------:|:-------:|:--------:|:----:|
| 10 | 🟢教学 | 工作+休息 | 2 | 角色开场 | 1 | 0.7 | 0.5 | 1.0 | 0% | - |
| 11 | 🟢教学 | +加班 | 3 | 感恩节 | 1 | 0.7 | 0.5 | 1.1 | 0% | - |
| 12 | 🟢教学 | +社交 | 4 | 圣诞消费 | 2 | 0.8 | 0.7 | 1.25 | 0% | - |
| 1 | 🟢教学 | +学习 | 5 | 新年反思 | 2 | 0.8 | 0.7 | 1.0 | 0% | - |
| 2 | 🟡标准 | +灰色+主动 | 6 | 利奥接触 | 2 | 1.0 | 1.0 | 1.0 | 0% | - |
| 3 | 🟡标准 | +资产 | 6 | 关系裂痕+💍👶婚姻/育儿首次互动 | 3 | 1.1 | 1.1 | 1.05 | 0% | - |
| 4 | 🔴Boss | - | 6 | 报税日 | 3 | 1.5 | 1.5 | 1.3 | -10% | ✅清算 |
| 5 | 🟡标准 | - | 6 | 系统挤压+💍👶婚姻/育儿压力升级 | 3 | 1.1 | 1.2 | 1.05 | 0% | - |
| 6 | 🟠压力 | - | 6* | 年中评估+观测者① | 3 | 1.2 | 1.3 | 1.1 | -10% | - |
| 7 | 🔴Boss | - | 6 | 斩杀线扫描+观测者②③+💍👶婚姻/育儿峰值 | 2 | 1.5 | 1.5 | 1.2 | -20% | ✅临界 |
| 8 | 🟠压力 | - | 6** | 路线抉择 | 3 | 1.2 | 1.2 | 1.1 | 0% | - |
| 9 | 🔴Boss | - | 6 | 路线Boss | 2 | 1.5 | 1.5 | 1.3 | -20% | ✅锁定 |
| 10 | ⚪结算 | - | - | - | - | - | - | - | - | - |

*6月：加班上限-5h，休息效率-20%，社交最低2h
**8月：确认后不可调整时间块，主动行动效果翻倍

---

## 四、完整关卡配置JSON（12个月）

```json
{
  "game": "The Cut Line",
  "total_months": 12,
  "levels": [
    {
      "month": 10, "type": "tutorial", "name": "First Month",
      "unlocks": ["work","rest"], "slider_count": 2,
      "fixed_events": ["E-CHxx-01"], "random_pool": ["E-N01_lite","E-P01_lite","E-NU01"], "random_count": 1,
      "neg_prob": 0.7, "expense_prob": 0.5, "bill_mult": 1.0, "cutline_mod": 0,
      "boss": null, "special_rules": ["first_time_guide"]
    },
    {
      "month": 11, "type": "tutorial", "name": "Thanksgiving",
      "unlocks": ["work","rest","overtime"], "slider_count": 3,
      "fixed_events": ["E-S01"], "random_pool": ["E-N01","E-P01","E-NU04"], "random_count": 1,
      "neg_prob": 0.7, "expense_prob": 0.5, "bill_mult": 1.1, "cutline_mod": 0,
      "boss": null, "special_rules": ["overtime_highlight_guide"]
    },
    {
      "month": 12, "type": "tutorial", "name": "Christmas",
      "unlocks": ["work","rest","overtime","social"], "slider_count": 4,
      "fixed_events": ["E-S02"], "random_pool": ["E-P01","E-N01","E-N03_lowprob","E-NU01"], "random_count": 2,
      "neg_prob": 0.8, "expense_prob": 0.7, "bill_mult": 1.25, "cutline_mod": 0,
      "boss": null, "special_rules": ["first_social_experience","year_end_review"]
    },
    {
      "month": 1, "type": "tutorial", "name": "New Year",
      "unlocks": ["work","rest","overtime","social","learning"], "slider_count": 5,
      "fixed_events": ["E-S03"], "random_pool": ["E-P03","E-P01","E-N05_lowprob","E-NU05"], "random_count": 2,
      "neg_prob": 0.8, "expense_prob": 0.7, "bill_mult": 1.0, "cutline_mod": 0,
      "boss": null, "special_rules": ["breather_month","leo_preview"]
    },
    {
      "month": 2, "type": "standard", "name": "Leo's Knock",
      "unlocks": ["all_time_blocks","active_actions"], "slider_count": 6,
      "fixed_events": ["leo_first_contact"], "random_pool": ["E-P02","E-P04","E-N02_conditional","E-NU04"], "random_count": 2,
      "neg_prob": 1.0, "expense_prob": 1.0, "bill_mult": 1.0, "cutline_mod": 0,
      "boss": null, "special_rules": ["gray_unlock_conditional","active_action_first_use"]
    },
    {
      "month": 3, "type": "standard", "name": "Cracks",
      "unlocks": ["all_time_blocks","active_actions","assets_conditional"], "slider_count": 6,
      "fixed_events": ["E-N03","E-ASSET-01_conditional","E-MAR-01_conditional","E-KID-01_conditional"], "random_pool": ["E-N01","E-P03","E-N04","E-NU02"], "random_count": 3,
      "neg_prob": 1.1, "expense_prob": 1.1, "bill_mult": 1.05, "cutline_mod": 0,
      "boss": null, "special_rules": ["relationship_crack","first_system_letter","asset_unlock","marriage_kid_first_interaction"]
    },
    {
      "month": 4, "type": "boss", "name": "Tax Day",
      "unlocks": ["all"], "slider_count": 6,
      "fixed_events": ["E-S04_boss"], "random_pool": ["E-H01_conditional","E-N04","E-P01_lowprob"], "random_count": 3,
      "neg_prob": 1.5, "expense_prob": 1.5, "bill_mult": 1.3, "cutline_mod": -10,
      "boss": {"id":"boss_tax_day","phases":3,"chain_position":1,"theme":"清算"},
      "special_rules": ["boss_unskippable","tax_prep_4h_required","refund_40_payment_55_audit_5"]
    },
    {
      "month": 5, "type": "standard", "name": "System Pressure",
      "unlocks": ["all"], "slider_count": 6,
      "fixed_events": ["system_pressure_vulnerability_based","E-MAR-02_conditional","E-KID-02_conditional"], "random_pool": ["E-N06","E-H01_conditional","E-N05","E-P06"], "random_count": 3,
      "neg_prob": 1.1, "expense_prob": 1.2, "bill_mult": 1.05, "cutline_mod": 0,
      "boss": null, "special_rules": ["vulnerability_targeted","post_boss_aftershock","marriage_kid_pressure_escalation"]
    },
    {
      "month": 6, "type": "pressure", "name": "Midyear Crisis",
      "unlocks": ["all"], "slider_count": 6,
      "fixed_events": ["E-S05_conditional","E-OB01_conditional","midyear_review"], "random_pool": ["E-H03","E-N06","E-G01","E-P06"], "random_count": 3,
      "neg_prob": 1.2, "expense_prob": 1.3, "bill_mult": 1.1, "cutline_mod": -10,
      "boss": null, "special_rules": ["overtime_cap_minus_5h","rest_efficiency_minus_20pct","social_min_2h"]
    },
    {
      "month": 7, "type": "boss", "name": "Cut Line Approaching",
      "unlocks": ["all"], "slider_count": 6,
      "fixed_events": ["cutline_scan_boss","E-OB02_conditional","E-OB03_conditional","E-MAR-03_conditional","E-KID-03_conditional"], "random_pool": ["E-H01","E-H03","E-MAR-03_conditional","E-KID-03_conditional"], "random_count": 2,
      "neg_prob": 1.5, "expense_prob": 1.5, "bill_mult": 1.2, "cutline_mod": -20,
      "boss": {"id":"boss_cutline_approaching","phases":3,"chain_position":2,"theme":"临界"},
      "special_rules": ["boss_unskippable","vulnerability_forced_to_danger","observer_climax","marriage_kid_peak_pressure"]
    },
    {
      "month": 8, "type": "pressure", "name": "Final Choice",
      "unlocks": ["all"], "slider_count": 6,
      "fixed_events": ["route_choice"], "random_pool": ["E-H01","E-G02","E-P07","E-N07"], "random_count": 3,
      "neg_prob": 1.2, "expense_prob": 1.2, "bill_mult": 1.1, "cutline_mod": 0,
      "boss": null, "special_rules": ["allocation_locked_after_confirm","active_action_double_effect","route_irreversible"]
    },
    {
      "month": 9, "type": "boss", "name": "Lock-in",
      "unlocks": ["all"], "slider_count": 6,
      "fixed_events": ["route_boss"], "random_pool": ["route_specific_pool"], "random_count": 2,
      "neg_prob": 1.5, "expense_prob": 1.5, "bill_mult": 1.3, "cutline_mod": -20,
      "boss": {"id":"boss_lock_in","phases":2,"chain_position":3,"theme":"锁定"},
      "special_rules": ["boss_unskippable","route_specific_boss","ending_grade_determined"]
    },
    {
      "month": 10, "type": "settlement", "name": "The End",
      "unlocks": [], "slider_count": 0,
      "fixed_events": [], "random_pool": [], "random_count": 0,
      "neg_prob": 0, "expense_prob": 0, "bill_mult": 0, "cutline_mod": 0,
      "boss": null, "special_rules": ["ending_presentation","lxp_settlement","asset_revaluation","observer_letter_3_conditional"]
    }
  ],
  "adaptive_difficulty": {
    "enabled": true,
    "evaluation_points": [3, 6, 9],
    "excluded_months": [4, 7, 9, 10]
  }
}
```

---

## 五、关卡测试清单

每个关卡上线前必须通过以下验证：

### 通用验证
- [ ] 胜利条件在数值上可达（马库斯保守策略应100%通过10月-3月）
- [ ] 固定事件100%触发，无遗漏
- [ ] 随机事件池事件数≥配置的随机事件数×2（确保有足够变化）
- [ ] 时间块约束与系统解锁状态一致
- [ ] 斩杀线阈值收紧参数在结算时正确应用

### 教学关验证（10/11/12/1月）
- [ ] 首次操作引导文本在正确时机显示
- [ ] 新解锁的时间块有视觉提示（闪烁/高亮）
- [ ] 结算时正确显示下月预告
- [ ] 玩家可以在不阅读任何外部教程的情况下完成操作

### Boss关验证（4/7/9月）
- [ ] Boss事件不可跳过
- [ ] Boss事件多阶段按顺序触发
- [ ] Boss全屏演出效果正确显示
- [ ] Boss事件后果正确反映在后续月份

### 角色差异验证
- [ ] 每个角色在2月的利奥台词与Voice Pillars一致
- [ ] 每个角色在4月的报税复杂度与角色职业背景一致
- [ ] 每个角色在7月的最脆弱维度与角色参数表一致

### 自适应难度验证
- [ ] 3月/6月/9月结算时正确评估玩家状态
- [ ] "做得好"的收紧参数在下月正确应用
- [ ] "做得差"的喘息参数在下月正确应用
- [ ] Boss关不受自适应影响
