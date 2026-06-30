// 游戏全局配置 —— 唯一真相源，对齐统一参数表v1.2

export const GAME_CONFIG = {
  totalMonths: 12,
  startingMonth: 10, // 10月
  hoursPerMonth: 120,
  workHoursFixed: 60,
} as const;

export const TIME_BLOCKS = {
  work: { maxHours: 60, fixed: true },
  overtime: {
    maxHours: 20,
    incomeMultiplier: 1.5,
    staminaCostPerHour: 3,
    disabledWhenStaminaBelowPct: 20,
  },
  social: { maxHours: 15, socialValuePerHour: 2 },
  learning: {
    maxHours: 10,
    educationValuePerHour: 3,
    incomeBoostPer10h: 1.0,
    incomeBoostMax: 10.0,
  },
  rest: {
    maxHours: 20,
    staminaPerHour: 5,
    efficiencyHalvedWhenStaminaAbovePct: 90,
  },
  gray: {
    maxHours: 15,
    incomePerHour: 25,
    riskPercentPerHour: 3,
    requiresPrerequisite: 'leo_first_contact' as const,
  },
} as const;

export const LATE_FEES = {
  days_16_30: 25,
  days_31_60: 50,
  days_60_90: 100,
} as const;

// 斩杀线阈值（百分比或金额）
export const CUTLINE_THRESHOLDS = {
  economic: { safe: 5000, warning: 0, danger: -5000, critical: -10000 },
  stamina: { safe: 70, warning: 40, danger: 10, critical: 5 },
  social: { safe: 60, warning: 30, danger: 10, critical: 5 },
  existence: { safe: 0, warning: 1, danger: 2, critical: 3 },
} as const;

export type CutlineStatus = 'safe' | 'warning' | 'danger' | 'critical' | 'triggered';

// 结局判定逻辑
export const ENDINGS = {
  victim: { netWorth: '< 0', label: '💀 Cut Line Victim', narrative: '斩杀线追上了你。' },
  survivor: { netWorth: '>= 0', grayTotalHours: '< 30', label: '🥉 Survivor', narrative: '你活下来了。仅此而已。' },
  upper_middle: { netWorth: '>= 20000', assets: '>= 1', grayTotalHours: '< 30', label: '🥈 Upper Middle', narrative: '你过得还不错。' },
  elite: { netWorth: '>= 80000', assets: '>= 2', cutlineTriggers: 0, grayTotalHours: '< 30', label: '🥇 Elite', narrative: '你赢了。但代价是什么？' },
  gray_survivor: { netWorth: '>= 0', grayTotalHours: '>= 30', label: '🕶 Gray Survivor', narrative: '你活下来了。但你已经不是进入游戏时的那个人。' },
  awakened: { netWorth: '>= 20000', observerEvents: '>= 4', npcsHelped: '>= 2', label: '🔮 Awakened', narrative: '现在你知道了。你要怎么做？' },
} as const;

export type EndingType = keyof typeof ENDINGS;
