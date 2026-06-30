// 12个月关卡配置 —— 对齐关卡设计v1.1

import { GAME_CONFIG } from './gameConfig';

export type LevelType = 'tutorial' | 'standard' | 'pressure' | 'boss' | 'settlement';

export interface LevelConfig {
  month: number;
  monthName: string;
  type: LevelType;
  narrativeTheme: string;
  unlockedBlocks: string[];
  sliderCount: number;
  fixedEvents: string[];
  randomPool: string[];
  randomCount: number;
  negProb: number;
  expenseProb: number;
  billMult: number;
  cutlineMod: number;
  boss?: string;
  specialRules: string[];
}

export const LEVELS: LevelConfig[] = [
  {
    month: 10, monthName: '10月', type: 'tutorial',
    narrativeTheme: '序章——日常崩塌',
    unlockedBlocks: ['work', 'rest'], sliderCount: 2,
    fixedEvents: ['character_intro'],
    randomPool: ['E-N01', 'E-P01', 'E-NU01'], randomCount: 1,
    negProb: 0.7, expenseProb: 0.5, billMult: 1.0, cutlineMod: 0,
    specialRules: ['first_time_guide', 'preview_next_month'],
  },
  {
    month: 11, monthName: '11月', type: 'tutorial',
    narrativeTheme: '感恩节——社交压力',
    unlockedBlocks: ['work', 'rest', 'overtime'], sliderCount: 3,
    fixedEvents: ['E-S01'],
    randomPool: ['E-N01', 'E-P01', 'E-NU04'], randomCount: 1,
    negProb: 0.7, expenseProb: 0.5, billMult: 1.1, cutlineMod: 0,
    specialRules: ['overtime_highlight', 'preview_next_month'],
  },
  {
    month: 12, monthName: '12月', type: 'tutorial',
    narrativeTheme: '圣诞节——消费危机',
    unlockedBlocks: ['work', 'rest', 'overtime', 'social'], sliderCount: 4,
    fixedEvents: ['E-S02'],
    randomPool: ['E-P01', 'E-N01', 'E-NU01'], randomCount: 2,
    negProb: 0.8, expenseProb: 0.7, billMult: 1.25, cutlineMod: 0,
    specialRules: ['first_social_event', 'year_end_review'],
  },
  {
    month: 1, monthName: '1月', type: 'tutorial',
    narrativeTheme: '新年——喘息',
    unlockedBlocks: ['work', 'rest', 'overtime', 'social', 'learning'], sliderCount: 5,
    fixedEvents: ['E-S03'],
    randomPool: ['E-P03', 'E-P01', 'E-NU05'], randomCount: 2,
    negProb: 0.8, expenseProb: 0.7, billMult: 1.0, cutlineMod: 0,
    specialRules: ['breather_month', 'leo_preview'],
  },
  {
    month: 2, monthName: '2月', type: 'standard',
    narrativeTheme: '利奥敲门——灰色经济的诱惑',
    unlockedBlocks: ['work', 'rest', 'overtime', 'social', 'learning', 'gray', 'active'], sliderCount: 6,
    fixedEvents: ['leo_first_contact'],
    randomPool: ['E-P02', 'E-P04', 'E-NU04'], randomCount: 2,
    negProb: 1.0, expenseProb: 1.0, billMult: 1.0, cutlineMod: 0,
    specialRules: ['gray_unlock_conditional', 'active_action_first_use'],
  },
  {
    month: 3, monthName: '3月', type: 'standard',
    narrativeTheme: '关系裂痕——斩杀线第一次逼近',
    unlockedBlocks: ['work', 'rest', 'overtime', 'social', 'learning', 'gray', 'active', 'assets'], sliderCount: 6,
    fixedEvents: ['E-N03', 'E-ASSET-01'],
    randomPool: ['E-N01', 'E-P03', 'E-N04', 'E-NU02', 'E-CH01-01', 'E-CH02-01', 'E-CH03-01', 'E-CH04-01', 'E-CH05-01', 'E-CH06-01'], randomCount: 3,
    negProb: 1.1, expenseProb: 1.1, billMult: 1.05, cutlineMod: 0,
    specialRules: ['relationship_crack', 'first_system_letter', 'asset_unlock'],
  },
  {
    month: 4, monthName: '4月', type: 'boss',
    narrativeTheme: '报税日——清算（第一高潮）',
    unlockedBlocks: ['all'], sliderCount: 6,
    fixedEvents: ['E-S04_boss'],
    randomPool: ['E-H01', 'E-N04', 'E-P01', 'E-CH09-01', 'E-CH11-01', 'E-CH18-01'], randomCount: 3,
    negProb: 1.5, expenseProb: 1.5, billMult: 1.3, cutlineMod: -10,
    boss: 'boss_tax_day',
    specialRules: ['boss_unskippable', 'tax_prep_4h'],
  },
  {
    month: 5, monthName: '5月', type: 'standard',
    narrativeTheme: '系统全面挤压',
    unlockedBlocks: ['all'], sliderCount: 6,
    fixedEvents: ['system_pressure'],
    randomPool: ['E-N06', 'E-H01', 'E-N05', 'E-P06', 'E-CH01-02', 'E-CH03-01'], randomCount: 3,
    negProb: 1.1, expenseProb: 1.2, billMult: 1.05, cutlineMod: 0,
    specialRules: ['vulnerability_targeted'],
  },
  {
    month: 6, monthName: '6月', type: 'pressure',
    narrativeTheme: '年中倦怠——关键决策节点',
    unlockedBlocks: ['all'], sliderCount: 6,
    fixedEvents: ['E-S05', 'midyear_review'],
    randomPool: ['E-H03', 'E-N06', 'E-G01', 'E-P06', 'E-OB01', 'E-CH12-01', 'E-CH13-01', 'E-CH14-01'], randomCount: 3,
    negProb: 1.2, expenseProb: 1.3, billMult: 1.1, cutlineMod: -10,
    specialRules: ['overtime_cap_minus_5h', 'rest_efficiency_minus_20pct', 'social_min_2h'],
  },
  {
    month: 7, monthName: '7月', type: 'boss',
    narrativeTheme: '斩杀线临界（第二高潮）',
    unlockedBlocks: ['all'], sliderCount: 6,
    fixedEvents: ['cutline_scan_boss', 'E-OB02'],
    randomPool: ['E-H01', 'E-H03', 'E-P07'], randomCount: 2,
    negProb: 1.5, expenseProb: 1.5, billMult: 1.2, cutlineMod: -20,
    boss: 'boss_cutline_approaching',
    specialRules: ['boss_unskippable', 'vulnerability_forced_to_danger', 'observer_climax'],
  },
  {
    month: 8, monthName: '8月', type: 'pressure',
    narrativeTheme: '最终抉择——路线分叉',
    unlockedBlocks: ['all'], sliderCount: 6,
    fixedEvents: ['route_choice'],
    randomPool: ['E-H01', 'E-G02', 'E-P07', 'E-N07', 'E-CH15-01', 'E-CH16-01', 'E-CH17-01', 'E-CH19-01'], randomCount: 3,
    negProb: 1.2, expenseProb: 1.2, billMult: 1.1, cutlineMod: 0,
    specialRules: ['allocation_locked_after_confirm', 'active_action_double_effect', 'route_irreversible'],
  },
  {
    month: 9, monthName: '9月', type: 'boss',
    narrativeTheme: '结局锁定（第三高潮）',
    unlockedBlocks: ['all'], sliderCount: 6,
    fixedEvents: ['route_boss'],
    randomPool: ['route_specific'], randomCount: 2,
    negProb: 1.5, expenseProb: 1.5, billMult: 1.3, cutlineMod: -20,
    boss: 'boss_lock_in',
    specialRules: ['boss_unskippable', 'route_specific_boss', 'ending_grade_determined'],
  },
  {
    month: 10, monthName: '10月', type: 'settlement',
    narrativeTheme: '结局——幸存',
    unlockedBlocks: [], sliderCount: 0,
    fixedEvents: [], randomPool: [], randomCount: 0,
    negProb: 0, expenseProb: 0, billMult: 0, cutlineMod: 0,
    specialRules: ['ending_presentation', 'lxp_settlement', 'asset_revaluation'],
  },
];

export function getLevel(monthIndex: number): LevelConfig {
  return LEVELS[monthIndex] ?? LEVELS[0];
}
