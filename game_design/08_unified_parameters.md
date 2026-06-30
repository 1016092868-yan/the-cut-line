# 《斩杀线》统一参数表 v1.1

> 关键优化：所有角色参数+经济参数+斩杀线阈值+结局条件集中在一个文件
> 这是游戏的"唯一真相源"——所有其他文档引用此文件

---

## 一、全局基础参数

```json
{
  "game": {
    "total_months": 12,
    "starting_month": 10,
    "hours_per_month": 120,
    "work_hours_fixed": 60
  },
  "time_blocks": {
    "overtime": {"max_hours": 20, "income_multiplier": 1.5, "stamina_cost_per_hour": 3, "disabled_when_stamina_below_pct": 20},
    "social": {"max_hours": 15, "social_value_per_hour": 2},
    "learning": {"max_hours": 10, "education_value_per_hour": 3, "income_boost_per_10h_cumulative": 1.0, "income_boost_max": 10.0},
    "rest": {"max_hours": 20, "stamina_per_hour": 5, "efficiency_halved_when_stamina_above_pct": 90},
    "gray": {"max_hours": 15, "income_per_hour": 25, "risk_percent_per_hour": 3, "requires_prerequisite": "leo_first_contact"}
  },
  "active_actions": {
    "max_per_month": 1,
    "actions": {
      "contact_friend": {"cost_hours": 2, "from_block": "social", "success_rate": 0.70, "success_effect": "next_month_social_event"},
      "find_side_job": {"cost_hours": 5, "from_block": "any", "success_rate": 0.50, "success_effect": "unlock_extra_income_200_500"},
      "apply_loan": {"cost_hours": 2, "from_block": "any", "success_rate": 0.80, "success_effect": "loan_option", "fail_effect": "credit_score_-3"},
      "update_resume": {"cost_hours": 3, "from_block": "any", "success_rate": 0.60, "success_effect": "next_month_interview_event"},
      "contact_leo": {"cost_hours": 1, "from_block": "any", "success_rate": 0.60, "requires_prerequisite": "leo_first_contact"},
      "help_neighbor": {"cost_hours": 3, "from_block": "any", "success_rate": 0.90, "success_effect": "community_connection_+1"}
    }
  }
}
```

---

## 二、经济参数

```json
{
  "economy": {
    "late_fees": {"16_30_days": 25, "31_60_days": 50, "60_90_days": 100},
    "credit_score": {
      "initial_range": [600, 750],
      "effects": {
        "above_700": "normal_loan_rate",
        "600_700": "loan_rate_+2pct",
        "500_600": "loan_rate_+5pct_some_loans_unavailable",
        "below_500": "loans_unavailable_rental_restricted"
      }
    },
    "assets": {
      "southside_apartment": {"price": 40000, "down_payment": 5000, "loan": 35000, "monthly_maintenance": 300, "annual_appreciation": [0.03, 0.08], "trigger_event": "E-ASSET-01"},
      "midtown_townhouse": {"price": 120000, "down_payment": 15000, "loan": 105000, "monthly_maintenance": 600, "annual_appreciation": [0.05, 0.12], "trigger_event": "E-ASSET-02"},
      "northside_property": {"price": 350000, "down_payment": 40000, "loan": 310000, "monthly_maintenance": 1500, "annual_appreciation": [0.08, 0.20], "trigger_event": "E-ASSET-03"},
      "index_fund": {"min": 1000, "max": 20000, "monthly_maintenance": 0, "annual_return": [-0.05, 0.15], "trigger_event": "E-ASSET-04"},
      "startup_investment": {"min": 5000, "max": 50000, "monthly_maintenance": 0, "annual_return": [-1.0, 5.0], "trigger_event": "E-ASSET-05"}
    }
  }
}
```

---

## 三、斩杀线阈值

```json
{
  "cutline": {
    "economic": {
      "safe": {"threshold": 5000, "narrative": "银行App正常打开。信用卡还能用。", "effect": "none"},
      "warning": {"threshold": 0, "narrative": "你开始看账户余额了。", "effect": "none"},
      "danger": {"threshold": -5000, "narrative": "收到第一封催款信（白色）。", "effect": "loan_rate_+2pct"},
      "critical": {"threshold": -10000, "narrative": "催款信变成黄色。电话响了。", "effect": "loan_rate_+5pct_consumption_halved"},
      "triggered": {"threshold": null, "condition": "below_-10000_and_3_months_no_improvement", "narrative": "门上贴了通知。红色。", "effect": "consumption_disabled_collection_events_x2"},
      "recovery": "2_consecutive_months_improvement"
    },
    "stamina": {
      "safe": {"threshold": 70, "narrative": "睡醒有精神。不需要咖啡。", "effect": "none"},
      "warning": {"threshold": 40, "narrative": "早上需要两个闹钟。", "effect": "overtime_income_-10pct"},
      "danger": {"threshold": 10, "narrative": "失眠。腰背持续疼痛。", "effect": "overtime_income_-30pct_overtime_cap_-5h"},
      "critical": {"threshold": 5, "narrative": "爬楼梯喘气。", "effect": "overtime_disabled_work_income_-20pct"},
      "triggered": {"threshold": null, "condition": "below_5pct", "narrative": "无法起床。", "effect": "income_zero_forced_rest_2_months"},
      "recovery": "recover_to_25pct"
    },
    "social": {
      "safe": {"threshold": 60, "narrative": "手机有未读消息。有人约周末。", "effect": "none"},
      "warning": {"threshold": 30, "narrative": "消息回复变慢了。", "effect": "positive_social_event_-10pct"},
      "danger": {"threshold": 10, "narrative": "没有人主动联系。", "effect": "positive_social_event_-30pct_marriage_stress_+10pct"},
      "critical": {"threshold": 5, "narrative": "电话簿已读不回。", "effect": "mentor_events_disabled_divorce_risk_+20pct"},
      "triggered": {"threshold": null, "condition": "below_5pct_and_2_consecutive_negative_social", "narrative": "被社交圈排斥。", "effect": "social_block_effect_halved_marriage_auto_end"},
      "recovery": "2_consecutive_months_no_negative_social"
    },
    "existence": {
      "safe": {"threshold": 0, "narrative": "驾照在钱包里。医保卡有效。", "effect": "none"},
      "warning": {"threshold": 1, "narrative": "收到身份验证邮件。", "effect": "none"},
      "danger": {"threshold": 2, "narrative": "医保被暂停。驾照过期。", "effect": "medical_cost_x2"},
      "critical": {"threshold": 3, "narrative": "身份验证失败。", "effect": "medical_cost_x3_location_restricted"},
      "triggered": {"threshold": null, "condition": "all_files_expired", "narrative": "信件退回'查无此人'。", "effect": "formal_systems_unavailable"},
      "recovery": "renew_2_files_cost_500_2000"
    },
    "quad_trigger": "all_four_triggered -> game_over_ending_c"
  }
}
```

---

## 四、结局条件（v1.2 修复——对齐叙事设计4种结局+灰色永生）

```json
{
  "endings": {
    "victim": {"net_worth": "< 0", "label": "💀 Cut Line Victim", "narrative": "斩杀线追上了你。", "narrative_corresponds": "C·跌落"},
    "survivor": {"net_worth": ">= 0", "gray_total_hours": "< 30", "label": "🥉 Survivor", "narrative": "你活下来了。仅此而已。", "narrative_corresponds": "A·逃出生天(基线)"},
    "upper_middle": {"net_worth": ">= 20000", "assets": ">= 1", "gray_total_hours": "< 30", "label": "🥈 Upper Middle", "narrative": "你过得还不错。", "narrative_corresponds": "A·逃出生天(进阶)"},
    "elite": {"net_worth": ">= 80000", "assets": ">= 2", "cutline_triggers": 0, "gray_total_hours": "< 30", "label": "🥇 Elite", "narrative": "你赢了。但代价是什么？", "narrative_corresponds": "A·逃出生天(卓越)"},
    "gray_survivor": {"net_worth": ">= 0", "gray_total_hours": ">= 30", "label": "🕶 Gray Survivor", "narrative": "你活下来了。但你已经不是进入游戏时的那个人。", "narrative_corresponds": "B·灰色永生"},
    "awakened": {"net_worth": ">= 20000", "observer_events_completed": ">= 4", "npcs_helped": ">= 2", "label": "🔮 Awakened", "narrative": "现在你知道了。你要怎么做？", "narrative_corresponds": "D·觉醒"}
  },
  "ending_logic": {
    "step_1": "IF net_worth < 0 → victim",
    "step_2": "IF observer_events_completed >= 4 AND npcs_helped >= 2 AND net_worth >= 20000 → awakened",
    "step_3": "IF gray_total_hours >= 30 AND net_worth >= 0 → gray_survivor",
    "step_4": "IF net_worth >= 80000 AND assets >= 2 AND cutline_triggers == 0 AND gray_total_hours < 30 → elite",
    "step_5": "IF net_worth >= 20000 AND assets >= 1 AND gray_total_hours < 30 → upper_middle",
    "step_6": "ELSE → survivor"
  }
}
```

---

## 五、20角色完整参数表

| # | 角色 | 💪 | 🤝 | 🎓 | 💰 | 💼 | 时薪 | 起始现金 | 学贷 | 房租 | 育儿 | 保险 | 其他支出 | 月总支出 | 加班上限 | 社交上限 | 学习倍率 | 休息倍率 | 灰色 | 斩杀线脆弱维度 |
|:--:|------|:--:|:--:|:--:|:--:|:--:|:-----:|:------:|:-----:|:----:|:----:|:----:|:------:|:------:|:------:|:------:|:------:|:------:|:--:|:------------:|
| 1 | 马库斯·陈 | B | B | B | B | B | $36.67 | $3,000 | $0 | $850 | $500 | $0 | $520 | $1,870 | 20h | 15h | 1x | 1x | 可用 | 经济 |
| 2 | 佐伊·威尔逊 | C | B | S | B | A | $35.78 | $2,000 | -$10K | $650 | $0 | $0 | $300 | $1,870 | 15h | 15h | 2x | 1x | 可用 | 经济 |
| 3 | 德里克·约翰逊 | S | B | C | C | C | $30.00 | $1,500 | -$40K | $550 | $0 | $0 | $250 | $1,350 | 10h | 15h | 1x | 1.5x | 可用 | 体力 |
| 4 | 詹姆斯·米勒 | A | C | C | B | B | $46.67 | $8,000 | $0 | $700 | $0 | $0 | $400 | $1,600 | 20h | 10h | 1x | 1x | 不可用 | 社交 |
| 5 | 艾玛·刘易斯 | B | C | B | B | B | $35.00 | $5,000 | -$35K | $350 | $0 | $0 | $200 | $950 | 15h | 10h | 1x | 1x | 可用 | 社交 |
| 6 | 卡洛斯·罗德里格斯 | A | B | B | B | A | $50.00 | $4,000 | -$35K | $900 | $400 | $0 | $500 | $2,400 | 20h | 15h | 1x | 1x | 可用 | 经济 |
| 7 | 安娜·瓦斯奎兹 | A | C | B | D | B | $26.67 | $1,000 | $0 | $500 | $0 | $0 | $700 | $1,200 | 20h | 10h | 1x | 1x | 可用 | 存在 |
| 8 | 瑞秋·汤普森 | A | B | B | C | B | $40.00 | $2,000 | -$50K | $850 | $400 | $0 | $350 | $2,100 | 15h | 10h | 1x | 1x | 可用 | 体力 |
| 9 | 伊桑·布莱克 | B | B | D | C | A | $0* | $5,000 | -$5K | $400 | $0 | $0 | $300 | $1,200 | 0h | 10h | 1.5x | 1x | 60h | 经济 |
| 10 | 艾琳&马克 | B | A | A | A | A | $62.50 | $25,000 | -$60K | $2,000 | $0 | $500 | $1,500 | $4,500 | 15h | 20h | 1.2x | 1x | 不可用 | 存在 |
| 11 | 杰森·杨 | C | S | B | B | A | $66.67 | $10,000 | -$60K | $1,800 | $0 | $300 | $900 | $3,500 | 10h | 20h | 1x | 0.8x | 可用 | 社交 |
| 12 | 凯瑟琳·帕克 | D | C | S | D | A | $30.00 | $1,000 | -$80K | $650 | $0 | $0 | $250 | $1,700 | 5h | 10h | 3x | 0.5x | 不可用 | 体力 |
| 13 | 奥斯卡·里维拉 | A | D | C | C | B | $43.33 | $3,000 | -$30K | $500 | $0 | $0 | $600 | $1,800 | 20h | 5h | 1x | 1.2x | 可用 | 社交 |
| 14 | 卢娜·马丁内斯 | B | C | C | D | A | 随机 | $500 | -$20K | $450 | $0 | $0 | $450 | $1,400 | 20h | 10h | 1x | 1x | 可用 | 经济 |
| 15 | 西蒙·阿德耶米 | D | B | A | B | A | $75.00 | $15,000 | -$35K | $1,200 | $0 | $400 | $800 | $2,800 | 10h | 15h | 1.5x | 0.8x | 不可用 | 体力 |
| 16 | 菲利克斯·贝尔 | B | B | B | B | B | $33.33 | $3,000 | -$40K | $650 | $0 | $0 | $550 | $1,800 | 15h | 15h | 1x | 1x | 可用 | 经济 |
| 17 | 维多利亚·斯特林 | B | B | B | A | B | $58.33 | $50,000 | $0 | $1,500 | $0 | $300 | $500 | $2,500 | 15h | 15h | 1x | 1x | 不可用 | 存在 |
| 18 | 特伦斯·阿姆斯特朗 | C | B | B | S | D | $0** | $200,000 | $0 | $2,500 | $0 | $400 | $2,100 | $5,000 | 0h | 20h | 1x | 1.5x | 不可用 | 职业 |
| 19 | 萨沙·林 | C | A | C | B | B | $33.33 | $15,000 | -$25K | $1,500 | $0 | $200 | $1,300 | $3,500 | 10h | 20h | 1x | 0.8x | 可用 | 社交 |
| 20 | 马库斯·韦斯特 | B | D | D | C | S | $41.67 | $3,000 | $0 | $350 | $0 | $0 | $250 | $1,000 | 20h | 5h | 2x | 1x | 可用 | 社交 |

*伊桑：工作收入$0，但灰色上限60h（替代工作），灰色收入$25/h
**特伦斯：工作收入$0，被动收入来自信托基金（$800/月），自动奢侈消费$5,000/月，净资产<$100K断供
卢娜：时薪随机$15-$45/h，每月重掷
