// ============================================================
// levels.js — 关卡配置数据
// 基于关卡设计优化方案（World 1-5 全24关 + 趣味关）
// ============================================================

const LEVELS = {
  // ==================== World 1: First Steps ====================
  w1: {
    id: 1,
    name: "First Steps",
    nameCN: "初入社会",
    theme: "w1-green",
    scene: "🏫",
    color: "#4CAF50",
    params: {
      incomeBase: 120,       // $/s
      staminaMax: 100,
      negativeEventProb: 0.25,
      obstacleDensity: 0.5,
      collectibleDensity: 1.5,
      studentLoan: -40000,
      cutlineActive: ["stamina"]
    },
    levels: [
      {
        id: "1-1", name: "First Day", nameCN: "第一天",
        length: 1500, cycles: 3,
        objectiveType: "finish",
        victory: { operator: "AND", conditions: [{ type: "reach_finish" }] },
        specialRules: ["corporate_only", "no_switching", "no_net_worth_req"],
        difficulty: 1, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.25, s2: 0.35, s3: 0.40 }
      },
      {
        id: "1-2", name: "Two Paths", nameCN: "两条路",
        length: 2000, cycles: 4,
        objectiveType: "finish",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "net_worth", operator: ">=", value: 0 }
        ]},
        specialRules: ["corporate_and_startup", "no_switch_cooldown"],
        difficulty: 1, boss: false, checkpoint: false,
        unlocks: ["three_lanes"],
        segmentRatios: { s1: 0.25, s2: 0.35, s3: 0.40 }
      },
      {
        id: "1-3", name: "All Three Lanes", nameCN: "三道全开",
        length: 2500, cycles: 5,
        objectiveType: "lane",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "switch_count", operator: ">=", value: 2 }
        ]},
        specialRules: ["three_lanes_unlocked", "switch_cooldown_1000m"],
        difficulty: 2, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.30, s2: 0.35, s3: 0.35 }
      },
      {
        id: "1-4", name: "Collect or Perish", nameCN: "收集求生",
        length: 3000, cycles: 6,
        objectiveType: "collect",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "collect_count", item: "opportunity", operator: ">=", value: 3 }
        ]},
        specialRules: ["full_rules", "collectibles_intro", "light_obstacles"],
        difficulty: 2, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.30, s2: 0.35, s3: 0.35 }
      },
      {
        id: "1-5", name: "Graduation Day", nameCN: "毕业季",
        length: 3500, cycles: 7,
        objectiveType: "composite",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" },
          { operator: "OR", conditions: [
            { type: "net_worth", operator: ">=", value: 5000 },
            { type: "lane_usage_all", operator: ">=", value: 500 }
          ]}
        ]},
        specialRules: ["full_rules", "speed_boost_1.05x", "first_economic_pressure"],
        difficulty: 3, boss: true, checkpoint: false,
        unlocks: ["world_2", "characters_7_8"],
        segmentRatios: { s1: 0.30, s2: 0.35, s3: 0.35 }
      }
    ]
  },

  // ==================== World 2: The Hustle ====================
  w2: {
    id: 2,
    name: "The Hustle",
    nameCN: "奋斗爬升",
    theme: "w2-blue",
    scene: "🏙",
    color: "#2196F3",
    params: {
      incomeBase: 110,
      staminaMax: 100,
      negativeEventProb: 0.30,
      obstacleDensity: 0.9,
      collectibleDensity: 1.3,
      studentLoan: -50000,
      cutlineActive: ["stamina", "income"]
    },
    levels: [
      {
        id: "2-1", name: "Corporate Grind", nameCN: "企业磨炼",
        length: 3500, cycles: 7,
        objectiveType: "lane",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "lane_usage", lane: "corporate", operator: ">=", percent: 0.4 }
        ]},
        specialRules: ["force_corporate_1000m", "fitness_unlocked"],
        difficulty: 2, boss: false, checkpoint: false,
        unlocks: ["fitness_system"],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "2-2", name: "First Big Buy", nameCN: "首次大额消费",
        length: 4000, cycles: 8,
        objectiveType: "finish",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "net_worth", operator: ">=", value: 20000 },
          { type: "has_asset", asset: "car" }
        ]},
        specialRules: ["car_loan_unlocked", "income_cutline_active"],
        difficulty: 3, boss: false, checkpoint: false,
        unlocks: ["car_loan"],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "2-3", name: "The Ring", nameCN: "戒指",
        length: 4000, cycles: 8,
        objectiveType: "risk",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "stamina_above", operator: ">=", value: 30 }
        ]},
        specialRules: ["marriage_unlocked", "emotional_events"],
        difficulty: 3, boss: false, checkpoint: false,
        unlocks: ["marriage_system"],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "2-4", name: "Seven Year Itch", nameCN: "七年之痒",
        length: 4500, cycles: 9,
        objectiveType: "composite",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" },
          { operator: "OR", conditions: [
            { type: "net_worth", operator: ">=", value: 30000 },
            { type: "marital_status", value: "married" }
          ]}
        ]},
        specialRules: ["marriage_forced_trigger", "relationship_crisis", "asset_volatility"],
        difficulty: 4, boss: true, checkpoint: false,
        unlocks: ["world_3", "bonus_freedom", "bonus_iron_bowl"],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      }
    ]
  },

  // ==================== World 3: Settling Down ====================
  w3: {
    id: 3,
    name: "Settling Down",
    nameCN: "成家立业",
    theme: "w3-orange",
    scene: "🏡",
    color: "#FF9800",
    params: {
      incomeBase: 100,
      staminaMax: 95,
      negativeEventProb: 0.38,
      obstacleDensity: 1.2,
      collectibleDensity: 1.0,
      studentLoan: -55000,
      cutlineActive: ["stamina", "income", "asset"]
    },
    levels: [
      {
        id: "3-1", name: "Home Sweet Mortgage", nameCN: "甜蜜的房贷",
        length: 4500, cycles: 9,
        objectiveType: "finish",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "net_worth", operator: ">=", value: 50000 }
        ]},
        specialRules: ["housing_unlocked", "asset_cutline_active"],
        difficulty: 3, boss: false, checkpoint: false,
        unlocks: ["housing_system"],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "3-2", name: "Bundle of Joy", nameCN: "喜得贵子",
        length: 5000, cycles: 10,
        objectiveType: "collect",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "has_asset", asset: "house" },
          { type: "has_asset", asset: "child" }
        ]},
        specialRules: ["parenting_unlocked", "baby_obstacles"],
        difficulty: 3, boss: false, checkpoint: false,
        unlocks: ["parenting_system"],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "3-3", name: "Breather", nameCN: "喘息之机",
        length: 5000, cycles: 10,
        objectiveType: "lane",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "lane_usage", lane: "side_hustle", operator: ">=", percent: 0.5 }
        ]},
        specialRules: ["obstacles_reduced_30", "net_worth_req_reduced_50", "checkpoint_level"],
        difficulty: 3, boss: false, checkpoint: true,
        unlocks: [],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "3-4", name: "Debt Trap", nameCN: "债务陷阱",
        length: 5500, cycles: 11,
        objectiveType: "risk",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "trigger_event_count", event: "consumer_loan", operator: ">=", value: 3 }
        ]},
        specialRules: ["consumer_loan_unlocked", "consumer_loan_events_boost"],
        difficulty: 4, boss: false, checkpoint: false,
        unlocks: ["consumer_loan"],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "3-5", name: "Midlife Crossroads", nameCN: "中年十字路口",
        length: 5500, cycles: 11,
        objectiveType: "composite",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" },
          { operator: "OR", conditions: [
            { type: "net_worth", operator: ">=", value: 80000 },
            { type: "asset_count", operator: ">=", value: 4 }
          ]}
        ]},
        specialRules: ["midlife_crisis", "asset_volatility_50pct_s2"],
        difficulty: 5, boss: true, checkpoint: false,
        unlocks: ["world_4", "characters_9_10", "bonus_love", "bonus_family", "bonus_startup_gambler"],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      }
    ]
  },

  // ==================== World 4: The System ====================
  w4: {
    id: 4,
    name: "The System",
    nameCN: "系统博弈",
    theme: "w4-purple",
    scene: "🏦",
    color: "#9C27B0",
    params: {
      incomeBase: 95,
      staminaMax: 92,
      negativeEventProb: 0.45,
      obstacleDensity: 1.5,
      collectibleDensity: 0.8,
      studentLoan: -65000,
      cutlineActive: ["stamina", "income", "asset", "time"]
    },
    levels: [
      {
        id: "4-1", name: "Red Line Visible", nameCN: "红线可见",
        length: 5000, cycles: 10,
        objectiveType: "composite",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" },
          { operator: "OR", conditions: [
            { type: "net_worth", operator: ">=", value: 100000 },
            { type: "cutline_never_triggered" }
          ]}
        ]},
        specialRules: ["economic_stamina_cutline_linked", "time_cutline_active"],
        difficulty: 4, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "4-2", name: "Combo Master", nameCN: "连击大师",
        length: 5500, cycles: 11,
        objectiveType: "lane",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "lane_usage_all", operator: ">=", value: 1500 },
          { type: "max_combo", operator: ">=", value: 15 }
        ]},
        specialRules: ["combo_requirement", "time_cutline_active"],
        difficulty: 4, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "4-3", name: "Economic Winter", nameCN: "经济寒冬",
        length: 6000, cycles: 12,
        objectiveType: "risk",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "trigger_event", event: "economic_crisis", count: "survived" },
          { type: "net_worth_not_decreased" }
        ]},
        specialRules: ["economic_crisis", "income_minus_40_s2", "insurance_tutorial"],
        difficulty: 5, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "4-4", name: "Insurance Gambit", nameCN: "保险博弈",
        length: 6000, cycles: 12,
        objectiveType: "finish",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "net_worth", operator: ">=", value: 150000 },
          { type: "insurance_used", operator: "<=", value: 1 }
        ]},
        specialRules: ["all_cutlines_active", "insurance_tight"],
        difficulty: 5, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      },
      {
        id: "4-5", name: "System Crash", nameCN: "系统崩溃",
        length: 6500, cycles: 13,
        objectiveType: "composite",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" },
          { operator: "OR", conditions: [
            { type: "net_worth", operator: ">=", value: 200000 },
            { type: "counter_cycle_ops", operator: ">=", value: 2 }
          ]}
        ]},
        specialRules: ["economic_crisis_boss", "all_asset_volatility_50pct", "cutline_threshold_minus_20"],
        difficulty: 5, boss: true, checkpoint: false,
        unlocks: ["world_5", "characters_11_13", "bonus_finance", "bonus_slash", "bonus_dink"],
        segmentRatios: { s1: 0.30, s2: 0.40, s3: 0.30 }
      }
    ]
  },

  // ==================== World 5: The Cut Line ====================
  w5: {
    id: 5,
    name: "The Cut Line",
    nameCN: "斩杀线",
    theme: "w5-red",
    scene: "🔴",
    color: "#F44336",
    params: {
      incomeBase: 90,
      staminaMax: 90,
      negativeEventProb: 0.50,
      obstacleDensity: 1.7,
      collectibleDensity: 0.6,
      studentLoan: -75000,
      cutlineActive: ["stamina", "income", "asset", "time"]
    },
    levels: [
      {
        id: "5-1", name: "The Warning Signs", nameCN: "警告信号",
        length: 8000, cycles: 16,
        objectiveType: "composite",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" },
          { operator: "OR", conditions: [
            { type: "net_worth", operator: ">=", value: 300000 },
            { type: "lane_usage_all", operator: ">=", value: 2500 }
          ]}
        ]},
        specialRules: ["all_cutlines_standard", "cutline_pulse_500m"],
        difficulty: 5, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.25, s2: 0.40, s3: 0.35 }
      },
      {
        id: "5-2", name: "Minimal Switching", nameCN: "最少切换",
        length: 9000, cycles: 18,
        objectiveType: "lane",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "switch_count", operator: "<=", value: 5 }
        ]},
        specialRules: ["switch_penalty_doubled", "cooldown_2000m"],
        difficulty: 5, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.25, s2: 0.40, s3: 0.35 }
      },
      {
        id: "5-3", name: "Living on the Edge", nameCN: "刀尖上跳舞",
        length: 10000, cycles: 20,
        objectiveType: "risk",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "stamina_below", operator: "<=", value: 50 }
        ]},
        specialRules: ["stamina_recovery_minus_50", "midpoint_buff"],
        difficulty: 5, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.25, s2: 0.40, s3: 0.35 }
      },
      {
        id: "5-4", name: "Tightrope Walk", nameCN: "走钢丝",
        length: 11000, cycles: 22,
        objectiveType: "collect",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" }, { type: "collect_count", item: "any", operator: ">=", value: 10 },
          { type: "max_combo", operator: ">=", value: 20 }
        ]},
        specialRules: ["cutline_threshold_minus_30", "obstacle_density_2x"],
        difficulty: 5, boss: false, checkpoint: false,
        unlocks: [],
        segmentRatios: { s1: 0.20, s2: 0.45, s3: 0.35 }
      },
      {
        id: "5-5", name: "The Cut Line", nameCN: "斩杀线",
        length: 12000, cycles: 24,
        objectiveType: "composite",
        victory: { operator: "AND", conditions: [
          { type: "reach_finish" },
          { type: "net_worth", operator: ">=", value: 500000 },
          { type: "stamina_above", operator: ">=", value: 0 },
          { type: "lane_usage_all", operator: ">=", value: 3000 }
        ]},
        specialRules: ["ultimate_boss", "all_cutlines_tight", "random_lane_lock", "combo_2x_required"],
        difficulty: 5, boss: true, checkpoint: false,
        unlocks: ["bonus_workhorse", "challenge_modes", "hidden_skin", "credits"],
        segmentRatios: { s1: 0.20, s2: 0.45, s3: 0.35 }
      }
    ]
  }
};

// ==================== 趣味关卡 ====================
const BONUS_LEVELS = [
  {
    id: "b1", name: "Freedom's Price", nameCN: "自由诚可贵",
    length: 4000, cycles: 8, netWorthGoal: 80000,
    unlockWorld: 2,
    rules: "零工经济：收入 ±200% 波动，无固定工资，靠收集品和 Combo 存活",
    rulesCN: "零工经济：收入剧烈波动",
    difficulty: 3, emoji: "🕊"
  },
  {
    id: "b2", name: "Iron Rice Bowl", nameCN: "铁饭碗",
    length: 5000, cycles: 10, netWorthGoal: 100000,
    unlockWorld: 2,
    rules: "体制内：仅 Corporate 跑道，障碍 -50%，收入上限锁定 $150/s",
    rulesCN: "仅Corporate跑道；低风险低回报",
    difficulty: 3, emoji: "🏛"
  },
  {
    id: "b3", name: "Love Eternal", nameCN: "真爱常伴",
    length: 5000, cycles: 10, netWorthGoal: 150000,
    unlockWorld: 3,
    rules: "双人决策：每周期伴侣选择，选对收益 ×2，选错双损",
    rulesCN: "双人决策机制",
    difficulty: 4, emoji: "💕"
  },
  {
    id: "b4", name: "Full House", nameCN: "家有儿女",
    length: 5500, cycles: 11, netWorthGoal: 250000,
    unlockWorld: 3,
    rules: "成长系统：孩子每 1000m 成长一级，成本递增但被动收入递增",
    rulesCN: "孩子成长系统",
    difficulty: 4, emoji: "🏠"
  },
  {
    id: "b5", name: "Startup Gambler", nameCN: "创业赌徒",
    length: 6000, cycles: 12, netWorthGoal: 300000,
    unlockWorld: 3,
    rules: "融资轮：仅 Startup，每 1000m 融资（成功 ×2 / 失败 -50%）",
    rulesCN: "仅Startup；融资轮机制",
    difficulty: 4, emoji: "🚀"
  },
  {
    id: "b6", name: "Wolf of Wall Street", nameCN: "金融从业者",
    length: 6000, cycles: 12, netWorthGoal: 500000,
    unlockWorld: 4,
    rules: "信息不对称：提前 1 周期看到经济事件，资产波动 ×3",
    rulesCN: "提前看到事件；资产波动3倍",
    difficulty: 5, emoji: "📊"
  },
  {
    id: "b7", name: "Slash Life", nameCN: "斜杠人生",
    length: 7000, cycles: 14, netWorthGoal: 400000,
    unlockWorld: 4,
    rules: "强制轮转：三跑道必须轮流切换，切换后首周期收入 +50%",
    rulesCN: "三跑道强制轮转",
    difficulty: 5, emoji: "🔀"
  },
  {
    id: "b8", name: "DINK Royale", nameCN: "丁克贵族",
    length: 7000, cycles: 14, netWorthGoal: 400000,
    unlockWorld: 4,
    rules: "自由代价：体力消耗 -30%，但无婚姻/育儿被动收入",
    rulesCN: "轻松但无家庭被动收入",
    difficulty: 4, emoji: "👑"
  },
  {
    id: "b9", name: "Workhorse Life", nameCN: "牛马一生",
    length: 10000, cycles: 20, netWorthGoal: 800000,
    unlockWorld: 5,
    rules: "996 福报：周期长度 +50%，超时收入 ×3，体力消耗 ×2",
    rulesCN: "996机制；超时高回报",
    difficulty: 5, emoji: "🐂"
  }
];

// ==================== 辅助函数 ====================

// 获取世界
function getWorld(worldId) {
  const key = 'w' + worldId;
  return LEVELS[key] || null;
}

// 获取关卡
function getLevel(worldId, levelIndex) {
  const world = getWorld(worldId);
  if (!world || levelIndex < 0 || levelIndex >= world.levels.length) return null;
  return world.levels[levelIndex];
}

// 获取自适应赛段比例
function getSegmentRatios(length) {
  if (length <= 2000) return { s1: 0.25, s2: 0.35, s3: 0.40 };
  if (length <= 4000) return { s1: 0.30, s2: 0.35, s3: 0.35 };
  if (length <= 8000) return { s1: 0.30, s2: 0.40, s3: 0.30 };
  if (length <= 10000) return { s1: 0.25, s2: 0.40, s3: 0.35 };
  return { s1: 0.20, s2: 0.45, s3: 0.35 };
}

// 计算赛段边界（对齐500m周期）
function calcSegmentBoundaries(length) {
  const ratios = getSegmentRatios(length);
  const cycles = Math.round(length / 500);
  const s1End = Math.round(cycles * ratios.s1) * 500;
  const s2End = Math.round(cycles * (ratios.s1 + ratios.s2)) * 500;
  return {
    s1: s1End,
    s2: s2End - s1End,
    s3: length - s2End,
    s1Pct: ratios.s1,
    s2Pct: ratios.s2,
    s3Pct: ratios.s3
  };
}
