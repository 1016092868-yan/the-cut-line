// ============================================================
// characters.js — 20角色数据表
// 基于 GDD v5.0 + 最终设计决策书
// ============================================================

const CHARACTERS = [
  // ============ 新手角色 (1-6)：初始解锁 ============
  {
    id: 1, name: "Average Joe", nameCN: "普通人",
    tagline: "标准开局，无任何修饰。真正的普通人 — 不靠天赋，全靠选择。",
    taglineCN: "标准开局，无任何修饰",
    tier: "beginner",
    stats: { sta: "B", soc: "B", edu: "B", wlth: "B", car: "B" },
    cash: 5000, loan: -40000, staminaMax: 100, incomeMult: 1.0,
    trait: "no_modifier",
    traitName: "普通人",
    traitDesc: "无任何修饰 —— 纯标准体验",
    traitDescCN: "无任何修饰 —— 纯标准体验",
    emoji: "🧑",
    skin: "avg-joe",
    events: {}
  },
  {
    id: 2, name: "Summa Cum Laude", nameCN: "学霸毕业生",
    tagline: "知识改变命运，学贷轻如鸿毛。",
    taglineCN: "知识改变命运",
    tier: "beginner",
    stats: { sta: "C", soc: "B", edu: "S", wlth: "B", car: "A" },
    cash: 8000, loan: -10000, staminaMax: 85, incomeMult: 1.25,
    trait: "knowledge_dividend",
    traitName: "知识红利",
    traitDesc: "培训费 -50%；职业认证效果 ×2；学贷利率 -1%",
    traitDescCN: "培训费减半；认证效果翻倍",
    emoji: "🎓",
    skin: "summa",
    events: {}
  },
  {
    id: 3, name: "College Athlete", nameCN: "大学运动员",
    tagline: "铁打的身体，流水的 deadline。",
    taglineCN: "铁打的身体",
    tier: "beginner",
    stats: { sta: "S", soc: "B", edu: "C", wlth: "B", car: "C" },
    cash: 3000, loan: -40000, staminaMax: 140, incomeMult: 0.85,
    trait: "iron_body",
    traitName: "铁人",
    traitDesc: "体力上限 +40；体力恢复 +0.2/sec；免疫 Burnout 障碍；健身费 -30%",
    traitDescCN: "体力上限+40；恢复+0.2；免疫过劳",
    emoji: "🏋",
    skin: "athlete",
    events: {}
  },
  {
    id: 4, name: "Veteran", nameCN: "退伍军人",
    tagline: "GI Bill 在手，学贷全免。",
    taglineCN: "学贷全免",
    tier: "beginner",
    stats: { sta: "A", soc: "C", edu: "A", wlth: "B", car: "C" },
    cash: 15000, loan: 0, staminaMax: 120, incomeMult: 0.85,
    trait: "gi_bill",
    traitName: "GI Bill",
    traitDesc: "学贷全免 + 健康保险免费；体力消耗 -10%；裁员后收入恢复时间 ×1.5",
    traitDescCN: "学贷全免+健康险免费；体力消耗-10%",
    emoji: "🇺🇸",
    skin: "veteran",
    events: {}
  },
  {
    id: 5, name: "Frugal Minimalist", nameCN: "极简主义者",
    tagline: "花得少，活得久。",
    taglineCN: "花得少活得久",
    tier: "beginner",
    stats: { sta: "B", soc: "B", edu: "C", wlth: "S", car: "B" },
    cash: 25000, loan: -10000, staminaMax: 100, incomeMult: 0.9,
    trait: "minimalist",
    traitName: "极简主义",
    traitDesc: "所有消费打 7 折；禁消费贷；连续 3 周期零消费 → +$5,000；资产贬值概率 -50%",
    traitDescCN: "消费7折；禁消费贷；零消费奖励",
    emoji: "🧵",
    skin: "frugal",
    events: {}
  },
  {
    id: 6, name: "Union Worker", nameCN: "工会成员",
    tagline: "团结就是力量，裁员也不怕。",
    taglineCN: "团结就是力量",
    tier: "beginner",
    stats: { sta: "A", soc: "B", edu: "B", wlth: "B", car: "A" },
    cash: 8000, loan: -35000, staminaMax: 115, incomeMult: 1.1,
    trait: "union_protection",
    traitName: "工会保护",
    traitDesc: "裁员伤害 -50%；升职概率 +10%；每周期 Corporate 跑道额外 +$200",
    traitDescCN: "裁员减半；升职+10%；工会津贴",
    emoji: "🛠",
    skin: "union",
    events: {}
  },

  // ============ 进阶角色 (7-13)：W1通关解锁 ============
  {
    id: 7, name: "Immigrant Dreamer", nameCN: "移民追梦人",
    tagline: "克服的每一个困难都让你更强。",
    taglineCN: "越挫越强",
    tier: "advanced",
    stats: { sta: "S", soc: "B", edu: "B", wlth: "C", car: "A" },
    cash: 2000, loan: -60000, staminaMax: 125, incomeMult: 1.2,
    trait: "cultural_adaptation",
    traitName: "文化适应",
    traitDesc: "S1 负面事件 +15%；每次克服负面 → 收入永久 +2%；S3 正面事件 ×1.5",
    traitDescCN: "S1更难但越挫越强；S3红利",
    emoji: "🌍",
    skin: "immigrant",
    unlockLXP: 200,
    events: {}
  },
  {
    id: 8, name: "Single Parent", nameCN: "单亲家长",
    tagline: "为母则刚，孩子是铠甲。",
    taglineCN: "为母则刚",
    tier: "advanced",
    stats: { sta: "S", soc: "B", edu: "B", wlth: "C", car: "C" },
    cash: 3000, loan: -30000, staminaMax: 140, incomeMult: 0.7,
    trait: "mother_armor",
    traitName: "为母则刚",
    traitDesc: "开局自带 1 孩；无需结婚即可育儿；育儿支出 -20%；每孩 +1 次重大事件豁免",
    traitDescCN: "自带1孩；育儿支出-20%；事件豁免",
    emoji: "🍼",
    skin: "single-parent",
    unlockLXP: 200,
    events: {}
  },
  {
    id: 9, name: "College Dropout", nameCN: "辍学创业者",
    tagline: "不破不立，破产只是新的开始。",
    taglineCN: "不破不立",
    tier: "advanced",
    stats: { sta: "B", soc: "B", edu: "D", wlth: "B", car: "S" },
    cash: 15000, loan: -5000, staminaMax: 100, incomeMult: 1.5,
    trait: "startup_only",
    traitName: "不破不立",
    traitDesc: "仅可 Startup 跑道；IPO 概率翻倍；破产 ≠ Game Over（归零+信用降级）",
    traitDescCN: "仅Startup跑道；IPO翻倍；破产可续",
    emoji: "🚀",
    skin: "dropout",
    unlockLXP: 500,
    events: {}
  },
  {
    id: 10, name: "DINK Couple", nameCN: "丁克夫妇",
    tagline: "二人世界，精致生活。",
    taglineCN: "精致二人世界",
    tier: "advanced",
    stats: { sta: "C", soc: "S", edu: "B", wlth: "A", car: "B" },
    cash: 30000, loan: -50000, staminaMax: 90, incomeMult: 1.4,
    trait: "dink_life",
    traitName: "丁克人生",
    traitDesc: "开局已婚（免费）；终身禁育；双收入 +15%；可花 $20K 买完美闪避",
    traitDescCN: "开局已婚；禁育；双收入；完美闪避",
    emoji: "💼",
    skin: "dink",
    unlockLXP: 500,
    events: {}
  },
  {
    id: 11, name: "The Networker", nameCN: "人脉大师",
    tagline: "你的人脉就是你的净资产。",
    taglineCN: "人脉即资产",
    tier: "advanced",
    stats: { sta: "B", soc: "S", edu: "C", wlth: "B", car: "B" },
    cash: 10000, loan: -40000, staminaMax: 95, incomeMult: 1.1,
    trait: "network_effect",
    traitName: "人脉变现",
    traitDesc: "婚礼费用 -$15K；贵人事件 ×2；每 2000m 获 $3K~$8K；裁员自动猎头",
    traitDescCN: "婚礼便宜；贵人翻倍；定期人脉收入",
    emoji: "🤝",
    skin: "networker",
    unlockLXP: 1000,
    events: {}
  },
  {
    id: 12, name: "PhD Holder", nameCN: "博士学者",
    tagline: "十年寒窗，八十万学贷——值。",
    taglineCN: "学历天花板",
    tier: "advanced",
    stats: { sta: "D", soc: "B", edu: "S", wlth: "C", car: "A" },
    cash: 2000, loan: -80000, staminaMax: 70, incomeMult: 1.35,
    trait: "academic_elite",
    traitName: "学历天花板",
    traitDesc: "学贷最重但培训效果 ×3；认证不限次数；被动收入 +20%；体力消耗 +15%",
    traitDescCN: "学贷最重；培训×3；被动+20%；体力差",
    emoji: "🎓",
    skin: "phd",
    unlockLXP: 1000,
    events: {}
  },
  {
    id: 13, name: "Night Shift Worker", nameCN: "夜班打工人",
    tagline: "你在别人睡觉时奔跑。",
    taglineCN: "昼夜颠倒",
    tier: "advanced",
    stats: { sta: "A", soc: "D", edu: "B", wlth: "B", car: "B" },
    cash: 6000, loan: -30000, staminaMax: 130, incomeMult: 1.05,
    trait: "night_owl",
    traitName: "昼夜颠倒",
    traitDesc: "前 50% 赛道体力消耗 ×1.3，后 50% 恢复 ×2；健康险 ×1.5；S3 +$500/周期",
    traitDescCN: "先难后易；后50%恢复翻倍",
    emoji: "🌙",
    skin: "night-shift",
    unlockLXP: 1000,
    events: {}
  },

  // ============ 高手角色 (14-20)：W3通关解锁 ============
  {
    id: 14, name: "Gig Economy", nameCN: "零工之王",
    tagline: "没有固定工资，只有无限可能。",
    taglineCN: "零工之王",
    tier: "expert",
    stats: { sta: "B", soc: "C", edu: "B", wlth: "D", car: "S" },
    cash: 500, loan: 0, staminaMax: 100, incomeMult: 0, // random
    trait: "gig_random",
    traitName: "零工经济",
    traitDesc: "收入每 500m 随机重掷（$60~$200/s）；禁所有贷款；消费 6 折；禁用 Corporate",
    traitDescCN: "收入随机；禁贷；消费6折",
    emoji: "🎰",
    skin: "gig",
    unlockLXP: 2000,
    events: {}
  },
  {
    id: 15, name: "Disabled Pro", nameCN: "残障专业人士",
    tagline: "钢铁意志，不可摧毁。",
    taglineCN: "钢铁意志",
    tier: "expert",
    stats: { sta: "D", soc: "B", edu: "A", wlth: "B", car: "A" },
    cash: 8000, loan: -40000, staminaMax: 65, incomeMult: 1.3,
    trait: "iron_will",
    traitName: "钢铁意志",
    traitDesc: "体力上限 -35；免疫 Burnout+生病；收入不受经济周期影响；克服障碍永久 +2 体力",
    traitDescCN: "体力少但免疫疾病；收入稳定",
    emoji: "🏥",
    skin: "disabled",
    unlockLXP: 2000,
    events: {}
  },
  {
    id: 16, name: "Lucky Charm", nameCN: "幸运星",
    tagline: "运气也是一种能力。",
    taglineCN: "运气也是实力",
    tier: "expert",
    stats: { sta: "B", soc: "A", edu: "B", wlth: "B", car: "B" },
    cash: 5000, loan: -40000, staminaMax: 100, incomeMult: 1.05,
    trait: "gambler_intuition",
    traitName: "赌徒直觉",
    traitDesc: "中性事件 → 正面；负面伤害 +30%；运气守恒：避 1 次负面获 $2K",
    traitDescCN: "中性变正面；负面更痛；运气守恒",
    emoji: "🍀",
    skin: "lucky",
    unlockLXP: 2000,
    events: {}
  },
  {
    id: 17, name: "Legacy Run", nameCN: "轮回者",
    tagline: "前世经验，今生财富。",
    taglineCN: "前世今生",
    tier: "expert",
    stats: { sta: "B", soc: "B", edu: "B", wlth: "B", car: "B" },
    cash: 0, loan: 0, staminaMax: 100, incomeMult: 1.0,
    trait: "reincarnation",
    traitName: "轮回",
    traitDesc: "继承上局净资产 12%（含负债）；Perfect Win → 现金 ×2；破产 → 学贷 ×3",
    traitDescCN: "继承上局12%资产；前世记忆",
    emoji: "👻",
    skin: "legacy",
    unlockLXP: 3500,
    events: {}
  },
  {
    id: 18, name: "Trust Fund Baby", nameCN: "富二代",
    tagline: "生在终点线，但你还是要跑。",
    taglineCN: "生在终点线",
    tier: "expert",
    stats: { sta: "D", soc: "B", edu: "C", wlth: "S", car: "C" },
    cash: 200000, loan: 0, staminaMax: 75, incomeMult: 0.7,
    trait: "trust_fund",
    traitName: "坐吃山空",
    traitDesc: "$200K 开局；收入 -30%；资产 8 折；每 2000m -$8K 奢侈消费；<$100K 断供",
    traitDescCN: "200K开局；自动奢侈消费；防断供",
    emoji: "💰",
    skin: "trust-fund",
    unlockLXP: 3500,
    events: {}
  },
  {
    id: 19, name: "Influencer", nameCN: "网红博主",
    tagline: "点赞不能还房贷，但品牌合作可以。",
    taglineCN: "流量变现",
    tier: "expert",
    stats: { sta: "B", soc: "S", edu: "B", wlth: "A", car: "B" },
    cash: 20000, loan: -20000, staminaMax: 90, incomeMult: 0, // fluctuates
    trait: "traffic_monetize",
    traitName: "流量变现",
    traitDesc: "收入 0.8~1.6x 波动；每 1500m 品牌合作 $5~15K；5% 塌房（$30K 公关）",
    traitDescCN: "收入波动；品牌合作；塌房风险",
    emoji: "📱",
    skin: "influencer",
    unlockLXP: 3500,
    events: {}
  },
  {
    id: 20, name: "Self-Taught Genius", nameCN: "自学天才",
    tagline: "没有学位，没有债务，没有问题。",
    taglineCN: "野路子天才",
    tier: "expert",
    stats: { sta: "B", soc: "D", edu: "A", wlth: "B", car: "S" },
    cash: 5000, loan: -5000, staminaMax: 95, incomeMult: 1.3,
    trait: "self_taught",
    traitName: "自学成才",
    traitDesc: "学贷极低；不可购认证；每次碰撞后永久 +1% 收入（上限 30%）；深夜自学 +2%/-5 体力",
    traitDescCN: "学贷极低；碰撞变强；深夜自学",
    emoji: "🔧",
    skin: "genius",
    unlockLXP: 3500,
    events: {}
  }
];

// 属性档位效果
const STAT_EFFECTS = {
  sta: {
    S: { staminaBonus: 40, recoveryBonus: 0.4 },
    A: { staminaBonus: 20, recoveryBonus: 0.2 },
    B: { staminaBonus: 0, recoveryBonus: 0 },
    C: { staminaBonus: -15, recoveryBonus: -0.1 },
    D: { staminaBonus: -30, recoveryBonus: -0.2 }
  },
  soc: {
    S: { weddingDiscount: 15000, divorceRate: 0.02, mentorBonus: 0.25 },
    A: { weddingDiscount: 5000, divorceRate: 0.035, mentorBonus: 0.10 },
    B: { weddingDiscount: 0, divorceRate: 0.05, mentorBonus: 0 },
    C: { weddingDiscount: -5000, divorceRate: 0.07, mentorBonus: -0.50 },
    D: { weddingDiscount: -10000, divorceRate: 0.10, mentorBonus: -1.0 }
  },
  edu: {
    S: { loanReduction: 30000, incomeBonus: 0.25, trainingDiscount: 0.50 },
    A: { loanReduction: 15000, incomeBonus: 0.10, trainingDiscount: 0.25 },
    B: { loanReduction: 0, incomeBonus: 0, trainingDiscount: 0 },
    C: { loanReduction: -20000, incomeBonus: -0.10, trainingDiscount: -0.25 },
    D: { loanReduction: -40000, incomeBonus: -0.20, trainingDiscount: -0.50 }
  },
  wlth: {
    S: { cashBonus: 195000, assetDiscount: 0.20, loanRateReduction: 0.02 },
    A: { cashBonus: 75000, assetDiscount: 0.10, loanRateReduction: 0.01 },
    B: { cashBonus: 0, assetDiscount: 0, loanRateReduction: 0 },
    C: { cashBonus: -3000, assetDiscount: -0.10, loanRateReduction: -0.02 },
    D: { cashBonus: -4500, assetDiscount: -0.30, loanRateReduction: -0.04 }
  },
  car: {
    S: { incomeMultBonus: 0.5, lanesOpen: 3, passiveBonus: 0.50 },
    A: { incomeMultBonus: 0.2, lanesOpen: 2, passiveBonus: 0.20 },
    B: { incomeMultBonus: 0, lanesOpen: 3, passiveBonus: 0 },
    C: { incomeMultBonus: -0.2, lanesOpen: 2, passiveBonus: -0.20 },
    D: { incomeMultBonus: -0.4, lanesOpen: 1, passiveBonus: -0.50 }
  }
};

// 获取已解锁的角色列表
function getUnlockedCharacters(totalLXP) {
  return CHARACTERS.filter(c => !c.unlockLXP || c.unlockLXP <= totalLXP);
}

// 随机选3个角色
function pickRandomCharacters(totalLXP, count = 3) {
  const unlocked = getUnlockedCharacters(totalLXP);
  const shuffled = [...unlocked].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 获取角色完整属性（含五维加成）
function getCharacterFullStats(char) {
  const sta = STAT_EFFECTS.sta[char.stats.sta];
  const soc = STAT_EFFECTS.soc[char.stats.soc];
  const edu = STAT_EFFECTS.edu[char.stats.edu];
  const wlth = STAT_EFFECTS.wlth[char.stats.wlth];
  const car = STAT_EFFECTS.car[char.stats.car];

  return {
    staminaMax: char.staminaMax + sta.staminaBonus,
    staminaRecovery: 0.6 + sta.recoveryBonus, // base 0.6
    weddingCost: 15000 - soc.weddingDiscount,
    divorceRate: soc.divorceRate,
    mentorChance: 0.15 + soc.mentorBonus,
    studentLoan: char.loan + edu.loanReduction,
    baseIncomeMult: char.incomeMult + edu.incomeBonus + car.incomeMultBonus,
    trainingCostMult: 1.0 - edu.trainingDiscount,
    cash: char.cash + wlth.cashBonus,
    assetPriceMult: 1.0 - wlth.assetDiscount,
    loanRateMod: wlth.loanRateReduction,
    lanesOpen: car.lanesOpen,
    passiveIncomeMult: 1.0 + car.passiveBonus
  };
}
